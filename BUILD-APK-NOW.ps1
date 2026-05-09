# Kimson App - Build APK with Icon
# Run this script to build APK that shows your app icon

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  KIMSON APP - Build APK with Icon" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app icon IS configured correctly!" -ForegroundColor Green
Write-Host "Expo Go cannot show custom icons - you need APK!" -ForegroundColor Yellow
Write-Host ""

# Navigate to KimsonApp directory
Set-Location -Path "C:\Users\aarch\Desktop\kimson\app\KimsonApp"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Step 1: Installing EAS CLI..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
npm install -g eas-cli

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Step 2: Building APK..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You will be prompted to login to Expo." -ForegroundColor Green
Write-Host "After login, the build will start automatically." -ForegroundColor Green
Write-Host ""

# Build APK
eas build --profile production --platform android

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BUILD COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Download the APK from the link above" -ForegroundColor Yellow
Write-Host "2. Transfer to your Android device" -ForegroundColor Yellow
Write-Host "3. Install the APK" -ForegroundColor Yellow
Write-Host "4. Your app icon will appear on home screen!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"

