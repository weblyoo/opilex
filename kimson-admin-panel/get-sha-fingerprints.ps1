# PowerShell script to get SHA fingerprints for Android app
# Run this from the project root directory

Write-Host "🔍 Getting SHA Fingerprints for Android App..." -ForegroundColor Cyan
Write-Host ""

# Change to android directory
if (Test-Path "android") {
    Set-Location android
    
    Write-Host "📦 Running Gradle signing report..." -ForegroundColor Yellow
    Write-Host ""
    
    # Run gradlew signingReport
    if (Test-Path "gradlew.bat") {
        .\gradlew.bat signingReport
    } else {
        Write-Host "❌ gradlew.bat not found!" -ForegroundColor Red
        Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Check the output above for SHA-1 and SHA-256 fingerprints." -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy the SHA-1 fingerprint (looks like: A1:B2:C3:...)" -ForegroundColor White
    Write-Host "2. Copy the SHA-256 fingerprint (looks like: AA:BB:CC:...)" -ForegroundColor White
    Write-Host "3. Go to Firebase Console → Project Settings → Your Android App" -ForegroundColor White
    Write-Host "4. Add both fingerprints under 'SHA certificate fingerprints'" -ForegroundColor White
    Write-Host "5. Rebuild and reinstall the APK" -ForegroundColor White
    Write-Host ""
    
    Set-Location ..
} else {
    Write-Host "ERROR: android directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
}

