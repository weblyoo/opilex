# Script to capture native Android errors (String cannot be cast to Boolean)
# Run this while the app is running to see native errors

Write-Host ""
Write-Host "Capturing Native Android Errors..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Clear logcat
adb logcat -c

Write-Host "Logcat cleared. Now open your app..." -ForegroundColor Green
Write-Host ""
Write-Host "Watching for errors..." -ForegroundColor Cyan
Write-Host ""

# Filter for the specific error and React Native errors
adb logcat | Select-String -Pattern 'String cannot be cast|ClassCastException|setProperty|ViewManager|ReactNative|AndroidRuntime' -Context 5
