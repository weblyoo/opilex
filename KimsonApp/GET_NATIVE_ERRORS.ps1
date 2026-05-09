# Get Native Android Errors from Logcat
# This script helps capture native errors that don't show in JavaScript console

Write-Host "`n=== Native Error Capture Script ===" -ForegroundColor Cyan
Write-Host "This will capture native Android errors from logcat`n" -ForegroundColor Yellow

# Check if adb is available
$adbCheck = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbCheck) {
    Write-Host "ERROR: adb (Android Debug Bridge) not found!" -ForegroundColor Red
    Write-Host "Please install Android SDK Platform Tools" -ForegroundColor Yellow
    Write-Host "Download from: https://developer.android.com/studio/releases/platform-tools" -ForegroundColor Yellow
    exit 1
}

# Check device connection
Write-Host "Checking for connected devices..." -ForegroundColor Cyan
$devices = adb devices
if ($devices -match "device$") {
    Write-Host "✓ Device connected`n" -ForegroundColor Green
} else {
    Write-Host "✗ No device connected or device not authorized" -ForegroundColor Red
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Connect your Android device via USB" -ForegroundColor White
    Write-Host "  2. Enable USB debugging on your device" -ForegroundColor White
    Write-Host "  3. Authorize the computer when prompted`n" -ForegroundColor White
    exit 1
}

# Clear logcat
Write-Host "Clearing logcat buffer..." -ForegroundColor Cyan
adb logcat -c
Write-Host "✓ Logcat cleared`n" -ForegroundColor Green

# Instructions
Write-Host "Now capturing errors..." -ForegroundColor Cyan
Write-Host "The script will filter for:" -ForegroundColor Yellow
Write-Host "  - String cannot be cast to Boolean" -ForegroundColor White
Write-Host "  - java.lang.String" -ForegroundColor White
Write-Host "  - java.lang.Boolean" -ForegroundColor White
Write-Host "  - ReactNative errors" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop capturing`n" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

# Capture errors with filtering
adb logcat | Select-String -Pattern "String cannot be cast|java\.lang\.String|java\.lang\.Boolean|ReactNative|FATAL|AndroidRuntime" -Context 5,5
