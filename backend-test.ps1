#!/usr/bin/env pwsh

# Color-coded output
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$RESET = "`e[0m"

# Configuration
$BASE_URL = "http://localhost:8080"
$adminUsername = "admin"
$adminPassword = "password"
$manager1Username = "manager1"
$manager1Password = "password"
$customer1Username = "customer1"
$customer1Password = "password"

$testResults = @()

function Add-TestResult {
    param(
        [string]$endpoint,
        [int]$statusCode,
        [string]$status,
        [string]$message
    )
    $testResults += @{
        Endpoint = $endpoint
        StatusCode = $statusCode
        Status = $status
        Message = $message
    }
}

# ========== STEP 1: Health Check ==========
Write-Host "`n$YELLOW=== STEP 1: Backend Health Check ===$RESET`n"
try {
    $healthResponse = Invoke-RestMethod -Uri "$BASE_URL/actuator/health" -Method Get -TimeoutSec 5
    Write-Host "$GREEN✅ Backend is healthy$RESET"
    Write-Host "Status: $($healthResponse.status)"
    Write-Host "DB Status: $($healthResponse.components.db.status)"
} catch {
    Write-Host "$RED❌ Health check failed: $_$RESET"
    exit 1
}

# ========== STEP 2: Admin Login ==========
Write-Host "`n$YELLOW=== STEP 2: Admin Login ===$RESET`n"
$adminLoginBody = @{
    usernameOrEmail = $adminUsername
    password = $adminPassword
} | ConvertTo-Json

$adminAccessToken = $null
try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $adminLoginBody -TimeoutSec 5
    
    if ($loginResponse.success) {
        $adminAccessToken = $loginResponse.data.accessToken
        Write-Host "$GREEN✅ Admin login successful$RESET"
        Write-Host "Token acquired: $($adminAccessToken.Substring(0, 20))..."
        Add-TestResult "Auth/Login (admin)" 200 "✅ PASSED" "Login successful"
    } else {
        Write-Host "$RED❌ Login failed: $($loginResponse.message)$RESET"
        exit 1
    }
} catch {
    Write-Host "$RED❌ Login error: $_$RESET"
    exit 1
}

# ========== STEP 3: Test 4 Previously Broken Endpoints ==========
Write-Host "`n$YELLOW=== STEP 3: Testing Previously Broken Endpoints ===$RESET`n"

# Helper function for testing endpoints
function Test-Endpoint {
    param(
        [string]$endpoint,
        [string]$token,
        [string]$testName
    )
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL$endpoint" -Method Get `
            -Headers @{ "Authorization" = "Bearer $token" } -TimeoutSec 5
        
        $status = if ($response -and $response.success -eq $true) { "✅" } else { "⚠️" }
        $statusCode = 200
        
        Write-Host "$status $testName"
        Write-Host "   Status: $statusCode"
        Write-Host "   Data fields: $(($response.data | Get-Member -MemberType NoteProperty).Name -join ', ')"
        
        Add-TestResult $testName $statusCode "✅ PASSED" "Endpoint returned 200 with data"
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "$RED⚠️ $testName$RESET"
        Write-Host "   Status: $statusCode"
        Write-Host "   Error: $($_.Exception.Message)"
        
        Add-TestResult $testName $statusCode "❌ FAILED" $_.Exception.Message
        return $false
    }
}

# TEST 1: GET /api/accounts
Write-Host "`nTest 1: GET /api/accounts"
Test-Endpoint "/api/accounts" $adminAccessToken "GET /api/accounts"

# TEST 2: GET /api/cards
Write-Host "`nTest 2: GET /api/cards"
Test-Endpoint "/api/cards" $adminAccessToken "GET /api/cards"

# TEST 3: GET /api/customers/me
Write-Host "`nTest 3: GET /api/customers/me"
Test-Endpoint "/api/customers/me" $adminAccessToken "GET /api/customers/me"

# TEST 4: GET /api/transfers/recent
Write-Host "`nTest 4: GET /api/transfers/recent"
Test-Endpoint "/api/transfers/recent" $adminAccessToken "GET /api/transfers/recent"

# ========== STEP 4: Test with Other Roles ==========
Write-Host "`n$YELLOW=== STEP 4: Testing with Other User Roles ===$RESET`n"

# Manager1 login
Write-Host "Manager1 login..."
$manager1LoginBody = @{
    usernameOrEmail = $manager1Username
    password = $manager1Password
} | ConvertTo-Json

try {
    $manager1Response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $manager1LoginBody -TimeoutSec 5
    
    if ($manager1Response.success) {
        $manager1Token = $manager1Response.data.accessToken
        Write-Host "$GREEN✅ Manager1 login successful$RESET"
        
        # Test manager endpoints
        Write-Host "`nManager1 - Testing endpoints:"
        Write-Host "Test 3a: GET /api/customers/me"
        Test-Endpoint "/api/customers/me" $manager1Token "GET /api/customers/me (Manager1)"
        
        Write-Host "`nTest 1a: GET /api/accounts"
        Test-Endpoint "/api/accounts" $manager1Token "GET /api/accounts (Manager1)"
    }
} catch {
    Write-Host "$RED❌ Manager1 login failed: $_$RESET"
}

# Customer1 login
Write-Host "`n`nCustomer1 login..."
$customer1LoginBody = @{
    usernameOrEmail = $customer1Username
    password = $customer1Password
} | ConvertTo-Json

try {
    $customer1Response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $customer1LoginBody -TimeoutSec 5
    
    if ($customer1Response.success) {
        $customer1Token = $customer1Response.data.accessToken
        Write-Host "$GREEN✅ Customer1 login successful$RESET"
        
        # Test customer endpoints
        Write-Host "`nCustomer1 - Testing endpoints:"
        Write-Host "Test 2b: GET /api/cards"
        Test-Endpoint "/api/cards" $customer1Token "GET /api/cards (Customer1)"
        
        Write-Host "`nTest 4b: GET /api/transfers/recent"
        Test-Endpoint "/api/transfers/recent" $customer1Token "GET /api/transfers/recent (Customer1)"
    }
} catch {
    Write-Host "$RED❌ Customer1 login failed: $_$RESET"
}

# ========== STEP 5: Summary Report ==========
Write-Host "`n$YELLOW========== TEST SUMMARY ==========$RESET`n"

$passCount = ($testResults | Where-Object { $_.Status -eq "✅ PASSED" }).Count
$totalCount = $testResults.Count

Write-Host "Tests Passed: $passCount / $totalCount"

if ($passCount -eq 0) {
    Write-Host "$RED`n❌ ALL TESTS FAILED$RESET"
} elseif ($passCount -eq $totalCount) {
    Write-Host "$GREEN`n✅ 100% OPERATIONAL - ALL TESTS PASSED$RESET"
} else {
    Write-Host "$YELLOW`n⚠️ PARTIAL OPERATIONAL - $passCount/$totalCount tests passed$RESET"
}

Write-Host "`n$YELLOW=== Detailed Results ===$RESET`n"
$testResults | Format-Table -AutoSize -Property @(
    'Endpoint',
    'StatusCode',
    'Status',
    'Message'
)

exit 0
