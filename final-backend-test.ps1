#!/usr/bin/env pwsh

# Color-coded output
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$CYAN = "`e[36m"
$BOLD = "`e[1m"
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
$successCount = 0

# ========== STEP 1: Health Check ==========
Write-Host "`n$BOLD$YELLOW========== STEP 1: HEALTH CHECK ==========$RESET`n"
try {
    $healthResponse = Invoke-RestMethod -Uri "$BASE_URL/actuator/health" -Method Get -TimeoutSec 5
    Write-Host "$GREEN✅ Backend is healthy - Status: $($healthResponse.status)$RESET`n"
} catch {
    Write-Host "$RED❌ Health check failed: $_$RESET"
    exit 1
}

# ========== STEP 2: Admin Login ==========
Write-Host "$BOLD$YELLOW========== STEP 2: AUTHENTICATION ==========$RESET`n"
Write-Host "Logging in as admin..."
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
        Write-Host "$GREEN✅ Admin authenticated$RESET`n"
    } else {
        Write-Host "$RED❌ Login failed: $($loginResponse.message)$RESET"
        exit 1
    }
} catch {
    Write-Host "$RED❌ Login error: $_$RESET"
    exit 1
}

# ========== STEP 3: Test 4 Previously Broken Endpoints ==========
Write-Host "$BOLD$YELLOW========== STEP 3: TESTING 4 PREVIOUSLY BROKEN ENDPOINTS ==========$RESET`n"

# TEST 1: GET /api/accounts
Write-Host "Test 1/4: GET /api/accounts (was returning 500)`n"
try {
    $accountsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/accounts" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminAccessToken" } -TimeoutSec 5 -ErrorAction Stop
    
    if ($accountsResponse.success -eq $true) {
        $accountCount = $accountsResponse.data.content.Count
        $firstAccountNumber = $accountsResponse.data.content[0].accountNumber
        
        Write-Host "$GREEN✅ FIXED$RESET"
        Write-Host "  HTTP Status: 200"
        Write-Host "  Response: success=true, contains $accountCount accounts"
        Write-Host "  Sample account number: $firstAccountNumber"
        $testResults += @{ Test = "POST /api/accounts"; Status = "✅"; Code = 200; Details = "Returned $accountCount accounts" }
        $successCount += 1
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN$RESET"
    Write-Host "  HTTP Status: $code"
    $testResults += @{ Test = "GET /api/accounts"; Status = "❌"; Code = $code; Details = "Failed to retrieve accounts" }
}
Write-Host ""

# TEST 2: GET /api/cards (with accountNumber parameter)
Write-Host "Test 2/4: GET /api/cards (was returning 500)`n"
try {
    # Need to get an account number first
    $accountsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/accounts" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminAccessToken" } -TimeoutSec 5
    
    $accountNumber = $accountsResponse.data.content[0].accountNumber
    
    $cardsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/cards?accountNumber=$accountNumber" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminAccessToken" } -TimeoutSec 5 -ErrorAction Stop
    
    if ($cardsResponse.success -eq $true) {
        $cardCount = $cardsResponse.data.Count
        Write-Host "$GREEN✅ FIXED$RESET"
        Write-Host "  HTTP Status: 200"
        Write-Host "  Response: success=true, contains $cardCount cards"
        $testResults += @{ Test = "GET /api/cards"; Status = "✅"; Code = 200; Details = "Returned $cardCount cards" }
        $successCount += 1
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN$RESET"
    Write-Host "  HTTP Status: $code"
    Write-Host "  Error: $($_.Exception.Message)"
    $testResults += @{ Test = "GET /api/cards"; Status = "❌"; Code = $code; Details = $_.Exception.Message }
}
Write-Host ""

# TEST 3: GET /api/customers/me
Write-Host "Test 3/4: GET /api/customers/me (was returning 500)`n"
try {
    $customerResponse = Invoke-RestMethod -Uri "$BASE_URL/api/customers/me" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminAccessToken" } -TimeoutSec 5 -ErrorAction Stop
    
    if ($customerResponse.success -eq $true) {
        $custName = "$($customerResponse.data.firstName) $($customerResponse.data.lastName)"
        Write-Host "$GREEN✅ FIXED$RESET"
        Write-Host "  HTTP Status: 200"
        Write-Host "  Response: success=true, customer=$custName"
        $testResults += @{ Test = "GET /api/customers/me"; Status = "✅"; Code = 200; Details = "Returned customer: $custName" }
        $successCount += 1
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN (HTTP $code)$RESET"
    Write-Host "  Error: $($_.Exception.Message)"
    $testResults += @{ Test = "GET /api/customers/me"; Status = "❌"; Code = $code; Details = $_.Exception.Message }
}
Write-Host ""

# TEST 4: GET /api/transfers/recent
Write-Host "Test 4/4: GET /api/transfers/recent (was returning 500)`n"
try {
    $transfersResponse = Invoke-RestMethod -Uri "$BASE_URL/api/transfers/recent" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminAccessToken" } -TimeoutSec 5 -ErrorAction Stop
    
    if ($transfersResponse.success -eq $true) {
        $transferCount = $transfersResponse.data.Count
        Write-Host "$GREEN✅ FIXED$RESET"
        Write-Host "  HTTP Status: 200"
        Write-Host "  Response: success=true, contains $transferCount transfers"
        $testResults += @{ Test = "GET /api/transfers/recent"; Status = "✅"; Code = 200; Details = "Returned $transferCount transfers" }
        $successCount += 1
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN (HTTP $code)$RESET"
    Write-Host "  Error: $($_.Exception.Message)"
    $testResults += @{ Test = "GET /api/transfers/recent"; Status = "❌"; Code = $code; Details = $_.Exception.Message }
}
Write-Host ""

# ========== STEP 4: Test with Other Roles ==========
Write-Host "$BOLD$YELLOW========== STEP 4: TESTING WITH OTHER USER ROLES ==========$RESET`n"

# Manager1 login and test
Write-Host "Testing with Manager1 role..."
$manager1LoginBody = @{
    usernameOrEmail = $manager1Username
    password = $manager1Password
} | ConvertTo-Json

try {
    $manager1Response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $manager1LoginBody -TimeoutSec 5
    
    if ($manager1Response.success) {
        $manager1Token = $manager1Response.data.accessToken
        Write-Host "$GREEN✅ Manager1 authenticated$RESET`n"
        
        # Test /api/customers/me with manager
        try {
            $custMeResponse = Invoke-RestMethod -Uri "$BASE_URL/api/customers/me" -Method Get `
                -Headers @{ "Authorization" = "Bearer $manager1Token" } -TimeoutSec 5 -ErrorAction Stop
            Write-Host "  ✅ Manager1 - /api/customers/me: 200$RESET"
        } catch {
            $code = $_.Exception.Response.StatusCode.Value__
            Write-Host "  ❌ Manager1 - /api/customers/me: $code$RESET"
        }
        
        # Test /api/accounts with manager
        try {
            $acctResponse = Invoke-RestMethod -Uri "$BASE_URL/api/accounts" -Method Get `
                -Headers @{ "Authorization" = "Bearer $manager1Token" } -TimeoutSec 5 -ErrorAction Stop
            Write-Host "  ✅ Manager1 - /api/accounts: 200$RESET"
        } catch {
            $code = $_.Exception.Response.StatusCode.Value__
            Write-Host "  ❌ Manager1 - /api/accounts: $code$RESET"
        }
    }
} catch {
    Write-Host "$RED❌ Manager1 login failed$RESET"
}
Write-Host ""

# Customer1 login and test
Write-Host "Testing with Customer1 role..."
$customer1LoginBody = @{
    usernameOrEmail = $customer1Username
    password = $customer1Password
} | ConvertTo-Json

try {
    $customer1Response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $customer1LoginBody -TimeoutSec 5
    
    if ($customer1Response.success) {
        $customer1Token = $customer1Response.data.accessToken
        Write-Host "$GREEN✅ Customer1 authenticated$RESET`n"
        
        # Get customer's account for cards test
        try {
            $custAcctResponse = Invoke-RestMethod -Uri "$BASE_URL/api/accounts" -Method Get `
                -Headers @{ "Authorization" = "Bearer $customer1Token" } -TimeoutSec 5
            $custAccountNumber = $custAcctResponse.data.content[0].accountNumber
            
            # Test /api/cards with customer
            try {
                $cardsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/cards?accountNumber=$custAccountNumber" -Method Get `
                    -Headers @{ "Authorization" = "Bearer $customer1Token" } -TimeoutSec 5 -ErrorAction Stop
                Write-Host "  ✅ Customer1 - /api/cards: 200$RESET"
            } catch {
                $code = $_.Exception.Response.StatusCode.Value__
                Write-Host "  ❌ Customer1 - /api/cards: $code$RESET"
            }
        } catch {
            Write-Host "  ⚠️  Could not get customer accounts"
        }
        
        # Test /api/transfers/recent with customer
        try {
            $txnResponse = Invoke-RestMethod -Uri "$BASE_URL/api/transfers/recent" -Method Get `
                -Headers @{ "Authorization" = "Bearer $customer1Token" } -TimeoutSec 5 -ErrorAction Stop
            Write-Host "  ✅ Customer1 - /api/transfers/recent: 200$RESET"
        } catch {
            $code = $_.Exception.Response.StatusCode.Value__
            Write-Host "  ❌ Customer1 - /api/transfers/recent: $code$RESET"
        }
    }
} catch {
    Write-Host "$RED❌ Customer1 login failed$RESET"
}
Write-Host ""

# ========== STEP 5: Summary Report ==========
Write-Host "$BOLD$YELLOW========== STEP 5: SUMMARY REPORT ==========$RESET`n"

if ($successCount -eq 4) {
    Write-Host "$GREEN$BOLD✅ 100% OPERATIONAL - ALL 4 ENDPOINTS FIXED AND WORKING$RESET`n"
} elseif ($successCount -eq 0) {
    Write-Host "$RED$BOLD❌ 0% OPERATIONAL - ALL ENDPOINTS STILL BROKEN$RESET`n"
} else {
    Write-Host "$YELLOW$BOLD⚠️ PARTIAL OPERATIONAL - $successCount/4 endpoints fixed$RESET`n"
}

Write-Host "$CYAN=== Core Endpoint Test Results ===$RESET`n"
$testResults | Format-Table -AutoSize

exit 0
