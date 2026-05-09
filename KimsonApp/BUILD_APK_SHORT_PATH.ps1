    # Build APK from shorter path (C:\kimson\KimsonApp)
# This avoids Windows path length limitations

Write-Host "🔨 Building APK from Short Path" -ForegroundColor Cyan
Write-Host ""

$shortPath = "C:\kimson\KimsonApp\android"

if (-not (Test-Path $shortPath)) {
    Write-Host "❌ Error: $shortPath not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please copy your project to C:\kimson\KimsonApp first." -ForegroundColor Yellow
    Write-Host "The project has already been copied - checking if build directory exists..." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Building from: $shortPath" -ForegroundColor Green
Write-Host ""
Write-Host "Building APK with crash fixes..." -ForegroundColor Yellow
Write-Host "This will take 2-5 minutes..." -ForegroundColor Cyan
Write-Host ""

Set-Location $shortPath

# Build APK
& .\gradlew.bat assembleRelease

if ($LASTEXITCODE -eq 0) {
    $apkPath = "$shortPath\app\build\outputs\apk\release\app-release.apk"
    
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        Write-Host ""
        Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "APK Location: $($apk.FullName)" -ForegroundColor Cyan
        Write-Host "APK Size: $([math]::Round($apk.Length / 1MB, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        
        # Copy APK to original project location
        $originalPath = "C:\Users\info\OneDrive\Desktop\kimson\kimson\app\KimsonApp"
        if (Test-Path $originalPath) {
            $targetApk = "$originalPath\app-release.apk"
            Copy-Item $apkPath $targetApk -Force
            Write-Host "✅ APK also copied to: $targetApk" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "📱 This APK includes all crash fixes:" -ForegroundColor Yellow
        Write-Host "   - ProGuard rules for Firebase, Expo, React Native" -ForegroundColor White
        Write-Host "   - Improved error handling" -ForegroundColor White
        Write-Host "   - ErrorBoundary component" -ForegroundColor White
        Write-Host "   - Minification disabled" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}

Set-Location "C:\Users\info\OneDrive\Desktop\kimson\kimson\app\KimsonApp"
