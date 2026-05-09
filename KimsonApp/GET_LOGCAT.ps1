# Script to get crash logs from Android device
# Make sure your device is connected via USB and USB debugging is enabled

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Crash Log Collector" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if adb is available
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbPath) {
    Write-Host "ERROR: ADB (Android Debug Bridge) not found!" -ForegroundColor Red
    Write-Host "Please install Android SDK Platform Tools or add it to PATH" -ForegroundColor Yellow
    Write-Host "Download from: https://developer.android.com/studio/releases/platform-tools" -ForegroundColor Yellow
    exit 1
}

# Check if device is connected
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
$devices = & adb devices
if ($devices.Count -lt 3) {
    Write-Host "ERROR: No Android device found!" -ForegroundColor Red
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Connect your device via USB" -ForegroundColor Yellow
    Write-Host "2. Enable USB Debugging in Developer Options" -ForegroundColor Yellow
    Write-Host "3. Accept the USB debugging prompt on your device" -ForegroundColor Yellow
    exit 1
}

Write-Host "Device found!`n" -ForegroundColor Green

# Clear previous logs
Write-Host "Clearing previous logcat..." -ForegroundColor Yellow
& adb logcat -c

Write-Host "`nPlease now:" -ForegroundColor Cyan
Write-Host "1. Open the app on your device" -ForegroundColor White
Write-Host "2. Wait for it to crash (or attempt to open)" -ForegroundColor White
Write-Host "3. Wait 5 seconds" -ForegroundColor White
Write-Host "`nCollecting crash logs..." -ForegroundColor Yellow

# Collect logs
$logFile = "crash_log_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
& adb logcat -d > $logFile

Write-Host "`n✅ Logs saved to: $logFile" -ForegroundColor Green
Write-Host "`nFiltering for errors..." -ForegroundColor Yellow

# Show filtered errors
Write-Host "`n=== CRITICAL ERRORS ===" -ForegroundColor Red
Get-Content $logFile | Select-String -Pattern "FATAL|AndroidRuntime|Exception|Error" -Context 3 | Select-Object -First 50

Write-Host "`n`n=== APP-SPECIFIC ERRORS ===" -ForegroundColor Yellow
Get-Content $logFile | Select-String -Pattern "com.kimson.wireauth|ReactNative|JS" -Context 2 | Select-Object -First 30

Write-Host "`n`nFull log saved to: $logFile" -ForegroundColor Cyan
Write-Host "Please share the filtered errors above, or the full log file if needed." -ForegroundColor White
