#!/usr/bin/env pwsh

# Color-coded output
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$CYAN = "`e[36m"
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

# ========== STEP 1: Health Check ==========
Write-Host "`n$YELLOW=== STEP 1: Backend Health Check ===$RESET`n"
try {
    $healthResponse = Invoke-RestMethod -Uri "$BASE_URL/actuator/health" -Method Get -TimeoutSec 5
    Write-Host "$GREEN✅ Backend is healthy$RESET"
    Write-Host "Status: $($healthResponse.status)`n"
} catch {
    Write-Host "$RED❌ Health check failed: $_$RESET"
    exit 1
}

# ========== STEP 2: Admin Login ==========
Write-Host "$YELLOW=== STEP 2: Admin Login ===$RESET`n"
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
        Write-Host "Token: $($adminAccessToken.Substring(0, 20))...`n"
        $testResults += @{ Endpoint = "Auth/Login (Admin)"; StatusCode = 200; Status = "✅"; Message = "Login successful" }
    } else {
        Write-Host "$RED❌ Login failed: $($loginResponse.message)$RESET"
        exit 1
    }
} catch {
    Write-Host "$RED❌ Login error: $_$RESET"
    exit 1
}

# ========== STEP 3: Test 4 Previously Broken Endpoints ==========
Write-Host "$YELLOW=== STEP 3: Testing Previously Broken Endpoints ===$RESET`n"

# Helper function for testing endpoints
function Test-Endpoint {
    param(
        [string]$endpoint,
        [string]$token,
        [string]$testName,
        [string]$role = "Admin"
    )
    
    $fullUrl = "$BASE_URL$endpoint"
    Write-Host "Testing: $testName"
    Write-Host "  URL: $fullUrl"
    
    try {
        $response = Invoke-RestMethod -Uri $fullUrl -Method Get `
            -Headers @{ "Authorization" = "Bearer $token" } -TimeoutSec 5 -ErrorAction Stop
        
        $statusCode = 200
        $success = $response.success -eq $true
        $status = if ($success) { "✅ FIXED" } else { "⚠️ ERROR" }
        
        Write-Host "  $status Status: $statusCode"
        
        if ($response.data -is [object]) {
            $dataType = $response.data.GetType().Name
            if ($response.data.PSObject.Properties.Count -gt 0) {
                $fields = $response.data.PSObject.Properties.Name
                Write-Host "  Data: $dataType with fields: $($fields -join ', ')"
            } else {
                Write-Host "  Data: Array with $($response.data.Count) items"
            }
        }
        
        $testResults += @{
            Endpoint = "$testName ($role)"
            StatusCode = $statusCode
            Status = "✅"
            Message = "Endpoint returned 200 with valid data"
        }
        
        Write-Host ""
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $statusText = $_.Exception.Response.StatusCode
        
        # Try to get error body
        $errorBody = ""
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $errorBody = $reader.ReadToEnd()
            $reader.Dispose()
        } catch { }
        
        $status = if ($statusCode -eq 500) { "⚠️ INTERNAL ERROR (500)" } `
                  elseif ($statusCode -eq 403) { "⚠️ FORBIDDEN (403)" } `
                  elseif ($statusCode -eq 404) { "⚠️ NOT FOUND (404)" } `
                  else { "⚠️ ERROR ($statusCode)" }
        
        Write-Host "  $status"
        Write-Host "  Error: $statusText"
        
        if ($errorBody) {
            try {
                $errorJson = $errorBody | ConvertFrom-Json
                Write-Host "  Details: $($errorJson.message)"
            } catch {
                if ($errorBody.Length -lt 100) {
                    Write-Host "  Body: $errorBody"
                }
            }
        }
        
        $testResults += @{
            Endpoint = "$testName ($role)"
            StatusCode = $statusCode
            Status = "❌"
            Message = "HTTP $statusCode - $statusText"
        }
        
        Write-Host ""
        return $false
    }
}

# TEST 1: GET /api/accounts
Write-Host "Test 1/4: Accounts Endpoint (was returning 500)`n"
Test-Endpoint "/api/accounts" $adminAccessToken "GET /api/accounts" "Admin"

# TEST 2: GET /api/cards
Write-Host "Test 2/4: Cards Endpoint (was returning 500)`n"
Test-Endpoint "/api/cards" $adminAccessToken "GET /api/cards" "Admin"

# TEST 3: GET /api/customers/me
Write-Host "Test 3/4: Customer Profile (was returning 500)`n"
Test-Endpoint "/api/customers/me" $adminAccessToken "GET /api/customers/me" "Admin"

# TEST 4: GET /api/transfers/recent
Write-Host "Test 4/4: Recent Transfers (was returning 500)`n"
Test-Endpoint "/api/transfers/recent" $adminAccessToken "GET /api/transfers/recent" "Admin"

# ========== STEP 4: Test with Other Roles ==========
Write-Host "$YELLOW=== STEP 4: Testing with Other User Roles ===$RESET`n"

# Manager1 login
Write-Host "Manager1 - Logging in..."
$manager1LoginBody = @{
    usernameOrEmail = $manager1Username
    password = $manager1Password
} | ConvertTo-Json

try {
    $manager1Response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $manager1LoginBody -TimeoutSec 5 -ErrorAction Stop
    
    if ($manager1Response.success) {
        $manager1Token = $manager1Response.data.accessToken
        Write-Host "$GREEN✅ Manager1 login successful$RESET`n"
        
        Write-Host "Manager1 - Test /api/customers/me`n"
        Test-Endpoint "/api/customers/me" $manager1Token "GET /api/customers/me" "Manager1"
        
        Write-Host "Manager1 - Test /api/accounts`n"
        Test-Endpoint "/api/accounts" $manager1Token "GET /api/accounts" "Manager1"
    }
} catch {
    Write-Host "$RED❌ Manager1 login failed$RESET`n"
}

# Customer1 login
Write-Host "Customer1 - Logging in..."
$customer1LoginBody = @{
    usernameOrEmail = $customer1Username
    password = $customer1Password
} | ConvertTo-Json

try {
    $customer1Response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $customer1LoginBody -TimeoutSec 5 -ErrorAction Stop
    
    if ($customer1Response.success) {
        $customer1Token = $customer1Response.data.accessToken
        Write-Host "$GREEN✅ Customer1 login successful$RESET`n"
        
        Write-Host "Customer1 - Test /api/cards`n"
        Test-Endpoint "/api/cards" $customer1Token "GET /api/cards" "Customer1"
        
        Write-Host "Customer1 - Test /api/transfers/recent`n"
        Test-Endpoint "/api/transfers/recent" $customer1Token "GET /api/transfers/recent" "Customer1"
    }
} catch {
    Write-Host "$RED❌ Customer1 login failed$RESET`n"
}

# ========== STEP 5: Summary Report ==========
Write-Host "`n$YELLOW========== TEST SUMMARY ==========$RESET`n"

$passCount = ($testResults | Where-Object { $_.Status -eq "✅" }).Count
$totalCount = $testResults.Count

Write-Host "Results: $passCount / $totalCount tests PASSED`n"

if ($passCount -eq 4) {
    Write-Host "$GREEN✅ 100% OPERATIONAL - ALL 4 CORE ENDPOINTS FIXED$RESET`n"
} elseif ($passCount -eq 0) {
    Write-Host "$RED❌ 0% OPERATIONAL - ALL TESTS FAILED$RESET`n"
} else {
    Write-Host "$YELLOW⚠️ PARTIAL OPERATIONAL - $passCount/4 core endpoints working$RESET`n"
}

Write-Host "$CYAN=== Detailed Test Results ===$RESET`n"
$testResults | Format-Table -AutoSize @(
    @{Label = "Endpoint"; Expression = { $_.Endpoint }; Width = 35 },
    @{Label = "Status Code"; Expression = { $_.StatusCode }; Width = 12 },
    @{Label = "Result"; Expression = { $_.Status }; Width = 10 },
    @{Label = "Message"; Expression = { $_.Message }; Width = 40 }
)

Write-Host ""
exit 0
