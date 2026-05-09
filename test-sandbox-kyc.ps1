# Sandbox KYC API Test Script (PowerShell)
# 
# This script tests the Sandbox API authentication and KYC endpoints
# to diagnose the "Insufficient privilege" error.
# 
# Run with: .\test-sandbox-kyc.ps1

$ErrorActionPreference = "Stop"

# Sandbox API Configuration
$BASE_URL = "https://api.sandbox.co.in"
$API_KEY = "key_test_8d548e4b104b454bbcefe09d1fbbb4a7"
$API_SECRET = "secret_test_007adeaa9a304513a1e7a9de7ee475dc"
$TEST_AADHAAR = "123456789012"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 Sandbox KYC API Test Suite" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Base URL: $BASE_URL"
Write-Host "  API Key: $($API_KEY.Substring(0, 20))..."
Write-Host "  Test Aadhaar: $($TEST_AADHAAR.Substring(0, 4))****$($TEST_AADHAAR.Substring(8))"
Write-Host ""

# Step 1: Test Authentication
Write-Host "🔐 Testing Authentication..." -ForegroundColor Yellow
Write-Host ""

$authHeaders = @{
    "Content-Type" = "application/json"
    "x-api-key" = $API_KEY
    "x-api-secret" = $API_SECRET
}

try {
    $authResponse = Invoke-RestMethod -Uri "$BASE_URL/authenticate" `
        -Method Post `
        -Headers $authHeaders `
        -ErrorAction Stop

    if ($authResponse.access_token) {
        Write-Host "✅ Authentication SUCCESS" -ForegroundColor Green
        Write-Host "Access Token: $($authResponse.access_token.Substring(0, 20))..."
        Write-Host "Token Expires In: $($authResponse.expires_in) seconds"
        Write-Host ""
        
        $accessToken = $authResponse.access_token
    } else {
        Write-Host "❌ No access_token in response" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Authentication FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Step 2: Test KYC OTP Generation
Write-Host "📱 Testing KYC OTP Generation..." -ForegroundColor Yellow
Write-Host ""

$kycHeaders = @{
    "Content-Type" = "application/json"
    "x-api-key" = $API_KEY
    "x-api-secret" = $API_SECRET
    "Authorization" = "Bearer $accessToken"
    "x-api-version" = "2.0"
}

$kycBody = @{
    aadhaar_number = $TEST_AADHAAR
    consent = $true
} | ConvertTo-Json

Write-Host "Request URL: $BASE_URL/kyc/aadhaar/offline/otp"
Write-Host "Request Body: $($kycBody -replace $TEST_AADHAAR, $($TEST_AADHAAR.Substring(0, 4) + '****' + $TEST_AADHAAR.Substring(8)))"
Write-Host ""

try {
    $kycResponse = Invoke-RestMethod -Uri "$BASE_URL/kyc/aadhaar/offline/otp" `
        -Method Post `
        -Headers $kycHeaders `
        -Body $kycBody `
        -ErrorAction Stop

    Write-Host "✅ KYC OTP Generation SUCCESS" -ForegroundColor Green
    Write-Host "Request ID: $($kycResponse.request_id)" -ForegroundColor Green
    Write-Host "Message: $($kycResponse.message)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Full Response:" -ForegroundColor Cyan
    Write-Host ($kycResponse | ConvertTo-Json -Depth 10)
    
} catch {
    Write-Host "❌ KYC OTP Generation FAILED" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "🔴 ERROR: 403 Forbidden - Insufficient Privilege" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 This means:" -ForegroundColor Yellow
        Write-Host "   1. Your API key can authenticate ✓" -ForegroundColor Green
        Write-Host "   2. Your API key does NOT have KYC permissions ✗" -ForegroundColor Red
        Write-Host "   3. You need to enable KYC services in Sandbox Dashboard" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📝 Next Steps:" -ForegroundColor Yellow
        Write-Host "   1. Log in to https://developer.sandbox.co.in/" -ForegroundColor White
        Write-Host "   2. Go to API Keys section" -ForegroundColor White
        Write-Host "   3. Enable KYC permissions for your API key" -ForegroundColor White
        Write-Host "   4. Check if your subscription includes KYC services" -ForegroundColor White
        Write-Host "   5. Wait 5-10 minutes for changes to propagate" -ForegroundColor White
        Write-Host ""
    } elseif ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "🔴 ERROR: 401 Unauthorized" -ForegroundColor Red
        Write-Host "Authentication token might be invalid or expired" -ForegroundColor Yellow
    } elseif ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "🔴 ERROR: 400 Bad Request" -ForegroundColor Red
        Write-Host "Request format might be incorrect" -ForegroundColor Yellow
    } else {
        Write-Host "🔴 ERROR: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response:" -ForegroundColor Cyan
        try {
            $errorObj = $responseBody | ConvertFrom-Json
            Write-Host ($errorObj | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
            if ($errorObj.transaction_id) {
                Write-Host ""
                Write-Host "💡 Transaction ID: $($errorObj.transaction_id)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host $responseBody -ForegroundColor Cyan
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Test Complete" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

