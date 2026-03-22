
# Final Comprehensive Admin Endpoints Test
# Testing all 4 critical endpoints for college presentation demo

$baseUrl = "http://localhost:8080"
$adminUsername = "admin"
$adminPassword = "password"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL COMPREHENSIVE ADMIN ENDPOINTS TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# STEP 1: LOGIN
Write-Host "STEP 1: Authentication" -ForegroundColor Yellow
Write-Host "Attempting login as admin..." -ForegroundColor Gray

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body (@{usernameOrEmail = $adminUsername; password = $adminPassword} | ConvertTo-Json) `
        -UseBasicParsing -ErrorAction Stop

    $loginData = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginData.data.accessToken
    
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($accessToken.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 2: Testing All 4 Critical Endpoints" -ForegroundColor Yellow
Write-Host ""

$testResults = @()
$passCount = 0

# TEST 1: GET /api/admin/reports/dashboard
Write-Host "TEST 1: GET /api/admin/reports/dashboard" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/reports/dashboard" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $accessToken"; "Content-Type" = "application/json"} `
        -UseBasicParsing -ErrorAction Stop
    
    $status = $response.StatusCode
    Write-Host "✅ PASS - HTTP Status: $status" -ForegroundColor Green
    $testResults += @{
        Name = "/api/admin/reports/dashboard"
        Status = "PASS ✅"
        HttpStatus = $status
        Details = ""
    }
    $passCount++
} catch {
    $status = $_.Exception.Response.StatusCode.Value
    $errorMsg = $_
    Write-Host "❌ FAIL - HTTP Status: $status" -ForegroundColor Red
    Write-Host "   Error: $errorMsg" -ForegroundColor Gray
    $testResults += @{
        Name = "/api/admin/reports/dashboard"
        Status = "FAIL ❌"
        HttpStatus = $status
        Details = "$errorMsg"
    }
}

Write-Host ""

# TEST 2: GET /api/admin/reports/daily-volume
Write-Host "TEST 2: GET /api/admin/reports/daily-volume" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/reports/daily-volume" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $accessToken"; "Content-Type" = "application/json"} `
        -UseBasicParsing -ErrorAction Stop
    
    $status = $response.StatusCode
    Write-Host "✅ PASS - HTTP Status: $status" -ForegroundColor Green
    $testResults += @{
        Name = "/api/admin/reports/daily-volume"
        Status = "PASS ✅"
        HttpStatus = $status
        Details = ""
    }
    $passCount++
} catch {
    $status = $_.Exception.Response.StatusCode.Value
    $errorMsg = $_
    Write-Host "❌ FAIL - HTTP Status: $status" -ForegroundColor Red
    Write-Host "   Error: $errorMsg" -ForegroundColor Gray
    $testResults += @{
        Name = "/api/admin/reports/daily-volume"
        Status = "FAIL ❌"
        HttpStatus = $status
        Details = "$errorMsg"
    }
}

Write-Host ""

# TEST 3: GET /api/admin/employees (NEWLY FIXED)
Write-Host "TEST 3: GET /api/admin/employees (NEWLY FIXED)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/employees" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $accessToken"; "Content-Type" = "application/json"} `
        -UseBasicParsing -ErrorAction Stop
    
    $status = $response.StatusCode
    $data = $response.Content | ConvertFrom-Json
    
    # Handle both array and object responses
    $employeeCount = 0
    if ($data -is [System.Object[]]) {
        $employeeCount = $data.Count
    } elseif ($data.employees -is [System.Object[]]) {
        $employeeCount = $data.employees.Count
    } elseif ($data -is [System.Collections.Hashtable] -and $data.data) {
        $employeeCount = $data.data.Count
    } elseif ($data -is [PSCustomObject] -and $data.PSObject.Properties) {
        # Try to find array property with employee data
        foreach ($prop in $data.PSObject.Properties) {
            if ($prop.Value -is [System.Object[]]) {
                $employeeCount = $prop.Value.Count
                break
            }
        }
    }
    
    Write-Host "✅ PASS - HTTP Status: $status | Employee Count: $employeeCount" -ForegroundColor Green
    $testResults += @{
        Name = "/api/admin/employees"
        Status = "PASS ✅"
        HttpStatus = $status
        Details = "Employees: $employeeCount"
    }
    $passCount++
} catch {
    $status = $_.Exception.Response.StatusCode.Value
    $errorMsg = $_
    Write-Host "❌ FAIL - HTTP Status: $status" -ForegroundColor Red
    Write-Host "   Error: $errorMsg" -ForegroundColor Gray
    $testResults += @{
        Name = "/api/admin/employees"
        Status = "FAIL ❌"
        HttpStatus = $status
        Details = "$errorMsg"
    }
}

Write-Host ""

# TEST 4: GET /api/customers (NEWLY FIXED)
Write-Host "TEST 4: GET /api/customers (NEWLY FIXED)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/customers" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $accessToken"; "Content-Type" = "application/json"} `
        -UseBasicParsing -ErrorAction Stop
    
    $status = $response.StatusCode
    $data = $response.Content | ConvertFrom-Json
    
    # Handle both array and object responses
    $customerCount = 0
    if ($data -is [System.Object[]]) {
        $customerCount = $data.Count
    } elseif ($data.customers -is [System.Object[]]) {
        $customerCount = $data.customers.Count
    } elseif ($data -is [System.Collections.Hashtable] -and $data.data) {
        $customerCount = $data.data.Count
    } elseif ($data -is [PSCustomObject] -and $data.PSObject.Properties) {
        # Try to find array property with customer data
        foreach ($prop in $data.PSObject.Properties) {
            if ($prop.Value -is [System.Object[]]) {
                $customerCount = $prop.Value.Count
                break
            }
        }
    }
    
    Write-Host "✅ PASS - HTTP Status: $status | Customer Count: $customerCount" -ForegroundColor Green
    $testResults += @{
        Name = "/api/customers"
        Status = "PASS ✅"
        HttpStatus = $status
        Details = "Customers: $customerCount"
    }
    $passCount++
} catch {
    $status = $_.Exception.Response.StatusCode.Value
    $errorMsg = $_
    Write-Host "❌ FAIL - HTTP Status: $status" -ForegroundColor Red
    Write-Host "   Error: $errorMsg" -ForegroundColor Gray
    $testResults += @{
        Name = "/api/customers"
        Status = "FAIL ❌"
        HttpStatus = $status
        Details = "$errorMsg"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 3: Summary & Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total PASS Tests: $passCount / 4" -ForegroundColor Cyan
Write-Host ""

# Table format
Write-Host "Endpoint Status Summary:" -ForegroundColor Yellow
Write-Host ""
$testResults | Format-Table -Property @(
    @{Label = "Endpoint"; Expression = {$_.Name}; Width = 40},
    @{Label = "Status"; Expression = {$_.Status}; Width = 12},
    @{Label = "HTTP Code"; Expression = {$_.HttpStatus}; Width = 10},
    @{Label = "Details"; Expression = {$_.Details}; Width = 30}
) -AutoSize

Write-Host ""

# Final verdict
if ($passCount -eq 4) {
    Write-Host "✅ 100% OPERATIONAL - ALL ADMIN ENDPOINTS WORKING" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host "Ready for college presentation demo!" -ForegroundColor Green
} else {
    Write-Host "⚠️  PARTIAL SUCCESS: $passCount/4 endpoints operational" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Failed endpoints:" -ForegroundColor Yellow
    $testResults | Where-Object {$_.Status -like "*FAIL*"} | ForEach-Object {
        Write-Host "  - $($_.Name) (HTTP $($_.HttpStatus))" -ForegroundColor Red
        if ($_.Details) {
            Write-Host "    Details: $($_.Details)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
