#!/usr/bin/env pwsh

# Test /api/customers/me with customer1  role
$BASE_URL = "http://localhost:8080"

$loginBody = @{
    usernameOrEmail = "customer1"
    password = "password"
} | ConvertTo-Json

Write-Host "Logging in as customer1..."
try {
    $loginResp = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $loginBody -TimeoutSec 5
    
    $token = $loginResp.data.accessToken
    $roles = $loginResp.data.roles
    
    Write-Host "Login successful`n"
    Write-Host "Roles: $roles`n"
    
    # Test /api/customers/me
    Write-Host "Testing /api/customers/me..."
    try {
        $custResp = Invoke-RestMethod -Uri "$BASE_URL/api/customers/me" -Method Get `
            -Headers @{ "Authorization" = "Bearer $token" } -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "✅ Success!`n"
        Write-Host "Response: $(ConvertTo-Json $custResp | Out-String)"
    } catch {
        $code = $_.Exception.Response.StatusCode.Value__
        Write-Host "❌ Failed with HTTP $code`n"
        
        # Try to get error body
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Response:`n$errorBody"
        } catch { }
    }
    
    # Test /api/transfers/recent
    Write-Host "`nTesting /api/transfers/recent..."
    try {
        $txnResp = Invoke-RestMethod -Uri "$BASE_URL/api/transfers/recent" -Method Get `
            -Headers @{ "Authorization" = "Bearer $token" } -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "✅ Success!`n"
        Write-Host "Count: $($txnResp.data.Count) transfers returned"
    } catch {
        $code = $_.Exception.Response.StatusCode.Value__
        Write-Host "❌ Failed with HTTP $code`n"
        
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Response:`n$errorBody"
        } catch { }
    }
    
} catch {
    Write-Host "Login failed: $_"
}
