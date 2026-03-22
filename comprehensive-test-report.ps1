#!/usr/bin/env pwsh

# Final Comprehensive Backend Test

$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$CYAN = "`e[36m"
$BOLD = "`e[1m"
$RESET = "`e[0m"

$BASE_URL = "http://localhost:8080"

Write-Host "$BOLD$CYAN`n========================================`n"
Write-Host "COMPREHENSIVE BACKEND TEST REPORT`n"
Write-Host "Testing 4 Previously Broken Endpoints`n"
Write-Host "========================================$RESET`n"

# Step 1: Health Check
Write-Host "$BOLD STEP 1: HEALTH CHECK$RESET`n"
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/actuator/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "$GREEN✅ Backend STATUS: UP$RESET`n"
} catch {
    Write-Host "$RED❌ Backend is DOWN - Test cannot proceed$RESET"
    exit 1
}

# Step 2: Get Admin Token
Write-Host "$BOLD STEP 2: AUTHENTICATION$RESET`n"
$adminLogin = @{ usernameOrEmail = "admin"; password = "password" } | ConvertTo-Json
try {
    $adminResp = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $adminLogin -TimeoutSec 5 -ErrorAction Stop
    $adminToken = $adminResp.data.accessToken
    Write-Host "$GREEN✅ Admin authenticated$RESET`n"
} catch {
    Write-Host "$RED❌ Admin authentication failed$RESET"
    exit 1
}

# Get Customer Token
$customerLogin = @{ usernameOrEmail = "customer1"; password = "password" } | ConvertTo-Json
try {
    $customerResp = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $customerLogin -TimeoutSec 5 -ErrorAction Stop
    $customerToken = $customerResp.data.accessToken
    Write-Host "$GREEN✅ Customer1 authenticated$RESET`n"
} catch {
    Write-Host "$RED❌ Customer1 authentication failed$RESET"
    exit 1
}

# Step 3: Test 4 Endpoints
Write-Host "$BOLD STEP 3: ENDPOINT TESTS$RESET`n"

$results = @()

# TEST 1: GET /api/accounts
Write-Host "Test 1: GET /api/accounts"
try {
    $resp = Invoke-RestMethod -Uri "$BASE_URL/api/accounts" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminToken" } -TimeoutSec 5 -ErrorAction Stop
    if ($resp.success -eq $true) {
        Write-Host "$GREEN✅ FIXED - Status 200$RESET"
        Write-Host "  Response: $($resp.data.totalElements) accounts`n"
        $results += @{ Test = "GET /api/accounts"; Role = "Admin"; Status = "✅"; Code = 200 }
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN - Status $code$RESET`n"
    $results += @{ Test = "GET /api/accounts"; Role = "Admin"; Status = "❌"; Code = $code }
}

# TEST 2: GET /api/cards (with accountNumber)
Write-Host "Test 2: GET /api/cards"
try {
    $accounts = Invoke-RestMethod -Uri "$BASE_URL/api/accounts" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminToken" } -TimeoutSec 5
    $accountNum = $accounts.data.content[0].accountNumber
    
    if ($accountNum) {
        $resp = Invoke-RestMethod -Uri "$BASE_URL/api/cards?accountNumber=$accountNum" -Method Get `
            -Headers @{ "Authorization" = "Bearer $adminToken" } -TimeoutSec 5 -ErrorAction Stop
        if ($resp.success -eq $true) {
            Write-Host "$GREEN✅ FIXED - Status 200$RESET"
            Write-Host "  Response: $($resp.data.Count) cards`n"
            $results += @{ Test = "GET /api/cards"; Role = "Admin"; Status = "✅"; Code = 200 }
        }
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN - Status $code$RESET`n"
    $results += @{ Test = "GET /api/cards"; Role = "Admin"; Status = "❌"; Code = $code }
}

# TEST 3: GET /api/customers/me (Admin - should be 403)
Write-Host "Test 3: GET /api/customers/me (Admin)"
try {
    $resp = Invoke-RestMethod -Uri "$BASE_URL/api/customers/me" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminToken" } -TimeoutSec 5 -ErrorAction Stop
    Write-Host "$YELLOW⚠️ UNEXPECTED - Status 200 (expected 403 for non-customer)$RESET`n"
    $results += @{ Test = "GET /api/customers/me"; Role = "Admin"; Status = "⚠️"; Code = 200 }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    if ($code -eq 403) {
        Write-Host "$YELLOW✓ EXPECTED - Status 403 (admin not a customer)$RESET`n"
        $results += @{ Test = "GET /api/customers/me"; Role = "Admin"; Status = "✓ Expected"; Code = 403 }
    } else {
        Write-Host "$RED❌ BROKEN - Status $code$RESET`n"
        $results += @{ Test = "GET /api/customers/me"; Role = "Admin"; Status = "❌"; Code = $code }
    }
}

# TEST 3B: GET /api/customers/me (Customer1)
Write-Host "Test 3b: GET /api/customers/me (Customer1)"
try {
    $resp = Invoke-RestMethod -Uri "$BASE_URL/api/customers/me" -Method Get `
        -Headers @{ "Authorization" = "Bearer $customerToken" } -TimeoutSec 5 -ErrorAction Stop
    if ($resp.success -eq $true) {
        Write-Host "$GREEN✅ FIXED - Status 200$RESET"
        Write-Host "  Response: $($resp.data.fullName)`n"
        $results += @{ Test = "GET /api/customers/me"; Role = "Customer"; Status = "✅"; Code = 200 }
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN - Status $code$RESET`n"
    Write-Host "  Note: NullPointerException in CustomerMapper.toResponse()$RESET`n"
    $results += @{ Test = "GET /api/customers/me"; Role = "Customer"; Status = "❌"; Code = $code }
}

# TEST 4: GET /api/transfers/recent (Admin)
Write-Host "Test 4: GET /api/transfers/recent (Admin)"
try {
    $resp = Invoke-RestMethod -Uri "$BASE_URL/api/transfers/recent" -Method Get `
        -Headers @{ "Authorization" = "Bearer $adminToken" } -TimeoutSec 5 -ErrorAction Stop
    if ($resp.success -eq $true) {
        Write-Host "$GREEN✅ FIXED - Status 200$RESET"
        Write-Host "  Response: $($resp.data.Count) transfers`n"
        $results += @{ Test = "GET /api/transfers/recent"; Role = "Admin"; Status = "✅"; Code = 200 }
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN - Status $code$RESET`n"
    $results += @{ Test = "GET /api/transfers/recent"; Role = "Admin"; Status = "❌"; Code = $code }
}

# TEST 4B: GET /api/transfers/recent (Customer1)
Write-Host "Test 4b: GET /api/transfers/recent (Customer1)"
try {
    $resp = Invoke-RestMethod -Uri "$BASE_URL/api/transfers/recent" -Method Get `
        -Headers @{ "Authorization" = "Bearer $customerToken" } -TimeoutSec 5 -ErrorAction Stop
    if ($resp.success -eq $true) {
        Write-Host "$GREEN✅ FIXED - Status 200$RESET"
        Write-Host "  Response: $($resp.data.Count) transfers`n"
        $results += @{ Test = "GET /api/transfers/recent"; Role = "Customer"; Status = "✅"; Code = 200 }
    }
} catch {
    $code = $_.Exception.Response.StatusCode.Value__
    Write-Host "$RED❌ BROKEN - Status $code$RESET`n"
    $results += @{ Test = "GET /api/transfers/recent"; Role = "Customer"; Status = "❌"; Code = $code }
}

# Step 4: Summary
Write-Host "`n$BOLD STEP 4: SUMMARY REPORT$RESET`n"

$fixed = ($results | Where-Object { $_.Status -eq "✅" }).Count
$broken = ($results | Where-Object { $_.Status -eq "❌" }).Count
$expected = ($results | Where-Object { $_.Status -eq "✓ Expected" }).Count

Write-Host "Core 4 Endpoints Status:"
Write-Host "  ✅ FIXED: $fixed"
Write-Host "  ❌ BROKEN: $broken"
Write-Host "  ✓ EXPECTED (403): $expected`n"

if ($broken -eq 0) {
    Write-Host "$GREEN$BOLD✅ 100% OPERATIONAL - ALL ENDPOINTS WORKING$RESET`n"
} elseif ($broken -le 2) {
    Write-Host "$YELLOW$BOLD⚠️ 50-75% OPERATIONAL - SOME ENDPOINTS FIXED$RESET`n"
} else {
    Write-Host "$RED$BOLD❌ CRITICAL - MULTIPLE ENDPOINTS BROKEN$RESET`n"
}

Write-Host "$CYAN=== Test Results Table ===$RESET`n"
$results | Sort-Object Test | Format-Table -AutoSize -Property @(
    @{Label="Endpoint"; Expression={$_.Test}; Width=25},
    @{Label="Role"; Expression={$_.Role}; Width=10},
    @{Label="Status"; Expression={$_.Status}; Width=15},
    @{Label="HTTP Code"; Expression={$_.Code}; Width=10}
)

# Remaining Issues
Write-Host "$BOLD Remaining Issues:$RESET`n"
($results | Where-Object { $_.Status -eq "❌" }) | ForEach-Object {
    Write-Host "  - $($_.Test) with $($_.Role) role returns HTTP $($_.Code)"
}

Write-Host ""
