# Test Admin API Endpoints After Backend Rebuild
# College Demo - Critical Testing

$baseUrl = "http://localhost:8080"
$adminUsername = "admin"
$adminPassword = "password"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADMIN ENDPOINTS TEST - BACKEND REBUILD" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# STEP 1: LOGIN AND GET TOKEN
Write-Host "STEP 1: Logging in as admin..." -ForegroundColor Yellow
try {
    $loginUrl = "$baseUrl/api/auth/login"
    $loginBody = @{
        username = $adminUsername
        password = $adminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri $loginUrl -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $accessToken = $loginData.accessToken

    if ($accessToken) {
        Write-Host "LOGIN SUCCESSFUL" -ForegroundColor Green
        Write-Host "   Token: $($accessToken.Substring(0, 30))..." -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "LOGIN FAILED - No token received" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "LOGIN ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Create headers with token
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

# STEP 2: TEST ALL 4 ADMIN ENDPOINTS
Write-Host "STEP 2: Testing All 4 Admin Endpoints`n" -ForegroundColor Yellow

# TEST 1: Dashboard Reports
Write-Host "TEST 1: GET /api/admin/reports/dashboard" -ForegroundColor Cyan
Write-Host "-------------------------------------------"
try {
    $dashboardUrl = "$baseUrl/api/admin/reports/dashboard"
    $response = Invoke-WebRequest -Uri $dashboardUrl -Method GET -Headers $headers -ErrorAction Stop
    $statusCode = $response.StatusCode
    $data = $response.Content | ConvertFrom-Json

    Write-Host "Status: $statusCode OK" -ForegroundColor Green
    
    if ($data.totalCustomers) {
        Write-Host "   - totalCustomers: $($data.totalCustomers)" -ForegroundColor Gray
    }
    if ($data.totalActiveAccounts) {
        Write-Host "   - totalActiveAccounts: $($data.totalActiveAccounts)" -ForegroundColor Gray
    }
    if ($data.dormantAccounts) {
        Write-Host "   - dormantAccounts: $($data.dormantAccounts)" -ForegroundColor Gray
    }
    
    Write-Host "Result: PASS`n" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Result: FAIL`n" -ForegroundColor Red
}

# TEST 2: Daily Volume Reports
Write-Host "TEST 2: GET /api/admin/reports/daily-volume" -ForegroundColor Cyan
Write-Host "-------------------------------------------"
try {
    $volumeUrl = "$baseUrl/api/admin/reports/daily-volume"
    $response = Invoke-WebRequest -Uri $volumeUrl -Method GET -Headers $headers -ErrorAction Stop
    $statusCode = $response.StatusCode
    $data = $response.Content | ConvertFrom-Json

    Write-Host "Status: $statusCode OK" -ForegroundColor Green
    Write-Host "   Response received with transaction data" -ForegroundColor Gray
    Write-Host "Result: PASS`n" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Result: FAIL`n" -ForegroundColor Red
}

# TEST 3: Employees (NEW ENDPOINT)
Write-Host "TEST 3: GET /api/admin/employees (NEW ENDPOINT)" -ForegroundColor Cyan
Write-Host "-------------------------------------------"
try {
    $employeesUrl = "$baseUrl/api/admin/employees"
    $response = Invoke-WebRequest -Uri $employeesUrl -Method GET -Headers $headers -ErrorAction Stop
    $statusCode = $response.StatusCode
    $data = $response.Content | ConvertFrom-Json

    Write-Host "Status: $statusCode OK" -ForegroundColor Green
    
    if ($data.success -eq $true) {
        Write-Host "   Response structure: OK (success: true)" -ForegroundColor Green
        
        if ($data.data -and $data.data.content) {
            $employeeCount = $data.data.content.Count
            Write-Host "   Total Employees: $employeeCount" -ForegroundColor Cyan
            
            if ($employeeCount -gt 0) {
                Write-Host "   Sample Employee: $($data.data.content[0].name)" -ForegroundColor Gray
            }
        }
        
        Write-Host "Result: PASS`n" -ForegroundColor Green
    } else {
        Write-Host "   Response structure issue" -ForegroundColor Red
        Write-Host "Result: FAIL`n" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Result: FAIL`n" -ForegroundColor Red
}

# TEST 4: Customers
Write-Host "TEST 4: GET /api/customers" -ForegroundColor Cyan
Write-Host "-------------------------------------------"
try {
    $customersUrl = "$baseUrl/api/customers"
    $response = Invoke-WebRequest -Uri $customersUrl -Method GET -Headers $headers -ErrorAction Stop
    $statusCode = $response.StatusCode
    $data = $response.Content | ConvertFrom-Json

    Write-Host "Status: $statusCode OK" -ForegroundColor Green
    
    if ($data.success -eq $true) {
        Write-Host "   Response structure: OK (success: true)" -ForegroundColor Green
        
        if ($data.data -and $data.data.content) {
            $customerCount = $data.data.content.Count
            Write-Host "   Total Customers: $customerCount" -ForegroundColor Cyan
            
            if ($customerCount -gt 0) {
                Write-Host "   Sample Customer: $($data.data.content[0].firstName) $($data.data.content[0].lastName)" -ForegroundColor Gray
            }
        }
        
        Write-Host "Result: PASS`n" -ForegroundColor Green
    } else {
        Write-Host "   Response structure issue" -ForegroundColor Red
        Write-Host "Result: FAIL`n" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Result: FAIL`n" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
