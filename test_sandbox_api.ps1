# Sandbox API Test Script (PowerShell)
# Ready-to-run cURL commands for testing Sandbox KYC API
# 
# Usage:
#   .\test_sandbox_api.ps1

# =============================================================================
# CONFIGURATION - Update these with your API credentials
# =============================================================================

# ⚠️ IMPORTANT: Test credentials MUST use test environment URL
# Production credentials MUST use production environment URL
# Verify the correct environment URL with Sandbox documentation or support
$BASE_URL = "https://api.sandbox.co.in"  # ⚠️ Verify this is correct for test environment
$API_KEY = "key_test_8d548e4b104b454bbcefe09d1fbbb4a7"
$API_SECRET = "secret_test_007adeaa9a304513a1e7a9de7ee475dc"
$API_VERSION = "2.0"

# Test Aadhaar number (replace with actual test number if available)
$AADHAAR_NUMBER = "123456789012"

# =============================================================================
# STEP 1: AUTHENTICATE
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Authenticating with Sandbox API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
    
    Write-Host "Response:" -ForegroundColor Yellow
    $authResponse | ConvertTo-Json -Depth 10
    Write-Host ""
    
    $ACCESS_TOKEN = $authResponse.access_token
    
    if (-not $ACCESS_TOKEN) {
        Write-Host "❌ Authentication failed!" -ForegroundColor Red
        Write-Host "Please check your API credentials."
        exit 1
    }
    
    Write-Host "✅ Authentication successful!" -ForegroundColor Green
    Write-Host "Access Token: $($ACCESS_TOKEN.Substring(0, [Math]::Min(50, $ACCESS_TOKEN.Length)))..."
    Write-Host ""
} catch {
    Write-Host "❌ Authentication error!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# =============================================================================
# STEP 2: GENERATE AADHAAR OTP
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Generating Aadhaar OTP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$userAadhaar = Read-Host "Enter 12-digit Aadhaar number (or press Enter to use default)"
if ($userAadhaar) {
    $AADHAAR_NUMBER = $userAadhaar
}

$otpBody = @{
    aadhaar_number = $AADHAAR_NUMBER
    consent = $true
} | ConvertTo-Json

$otpHeaders = @{
    "Content-Type" = "application/json"
    "x-api-key" = $API_KEY
    "x-api-secret" = $API_SECRET
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "x-api-version" = $API_VERSION
}

try {
    $otpResponse = Invoke-RestMethod -Uri "$BASE_URL/kyc/aadhaar/offline/otp" `
        -Method Post `
        -Headers $otpHeaders `
        -Body $otpBody `
        -ErrorAction Stop
    
    Write-Host "Response:" -ForegroundColor Yellow
    $otpResponse | ConvertTo-Json -Depth 10
    Write-Host ""
    
    $REQUEST_ID = $otpResponse.request_id
    
    if (-not $REQUEST_ID) {
        Write-Host "❌ OTP generation failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ OTP generated successfully!" -ForegroundColor Green
    Write-Host "Request ID: $REQUEST_ID"
    Write-Host ""
} catch {
    Write-Host "❌ OTP generation error!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
    exit 1
}

# =============================================================================
# STEP 3: VERIFY AADHAAR OTP
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Verifying Aadhaar OTP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$otp = Read-Host "Enter 6-digit OTP received on mobile"

$verifyBody = @{
    request_id = $REQUEST_ID
    otp = $otp
} | ConvertTo-Json

$verifyHeaders = @{
    "Content-Type" = "application/json"
    "x-api-key" = $API_KEY
    "x-api-secret" = $API_SECRET
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "x-api-version" = $API_VERSION
}

try {
    $verifyResponse = Invoke-RestMethod -Uri "$BASE_URL/kyc/aadhaar/offline/verify" `
        -Method Post `
        -Headers $verifyHeaders `
        -Body $verifyBody `
        -ErrorAction Stop
    
    Write-Host "Response:" -ForegroundColor Yellow
    $verifyResponse | ConvertTo-Json -Depth 10
    Write-Host ""
    
    if ($verifyResponse.verified -eq $true) {
        Write-Host "✅ Aadhaar verification successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Aadhaar Data:" -ForegroundColor Cyan
        $verifyResponse.aadhaar_data | ConvertTo-Json -Depth 10
    } else {
        Write-Host "❌ Aadhaar verification failed!" -ForegroundColor Red
        if ($verifyResponse.message) {
            Write-Host "Error: $($verifyResponse.message)"
        } elseif ($verifyResponse.error) {
            Write-Host "Error: $($verifyResponse.error)"
        }
    }
} catch {
    Write-Host "❌ OTP verification error!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

