#!/usr/bin/env pwsh

$BASE_URL = "http://localhost:8080"

Write-Host "Testing /api/customers/me to capture error details...`n"

$loginBody = @{
    usernameOrEmail = "customer1"
    password = "password"
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post `
    -ContentType "application/json" -Body $loginBody -TimeoutSec 5

$token = $loginResp.data.accessToken

# Use WebRequest to capture detailed error information
$url = "$BASE_URL/api/customers/me"
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $request = [System.Net.HttpWebRequest]::Create($url)
    $request.Method = "GET"
    $request.Headers.Add("Authorization", "Bearer $token")
    
    $response = $request.GetResponse()
    $stream = $response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($stream)
    $body = $reader.ReadToEnd()
    $reader.Dispose()
    
    Write-Host "✅ Success"
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Body: $body"
} catch {
    Write-Host "Request failed"
    $ex = $_.Exception
    
    if ($ex.Response) {
        $status = $ex.Response.StatusCode
        Write-Host "Status Code: $status"
        
        $stream = $ex.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($stream)
        $errorBody = $reader.ReadToEnd()
        $reader.Dispose()
        
        Write-Host "Error Response Body:`n$errorBody"
    } else {
        Write-Host "Error: $($ex.Message)"
    }
}
