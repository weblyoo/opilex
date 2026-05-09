# Build Android APK using Gradle
# This may take 5-10 minutes on first build

Write-Host "`n🔨 Building Android APK..." -ForegroundColor Cyan
Write-Host "This will take 5-10 minutes on first build`n" -ForegroundColor Yellow

# Navigate to android directory
Set-Location android

# Build release APK
Write-Host "Running Gradle build..." -ForegroundColor Green
.\gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "`n📦 APK Location:" -ForegroundColor Cyan
    Write-Host "android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor White
    Write-Host "`n📱 Install command:" -ForegroundColor Cyan
    Write-Host "adb install -r app\build\outputs\apk\release\app-release.apk" -ForegroundColor White
} else {
    Write-Host "`n❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}

# Return to root directory
Set-Location ..
