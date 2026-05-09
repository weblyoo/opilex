# Build Debug APK with Fresh Bundle (includes updated splash screen)
# This ensures the JavaScript bundle is regenerated with latest changes

Write-Host "🔨 Building Debug APK with Fresh Bundle" -ForegroundColor Cyan
Write-Host "This will include the updated splash screen`n" -ForegroundColor Yellow

$shortPath = "C:\kimson\KimsonApp"
$originalPath = "C:\Users\info\OneDrive\Desktop\kimson\kimson\app\KimsonApp"

# Step 1: Copy latest splash screen to short path
Write-Host "Step 1: Copying latest splash screen..." -ForegroundColor Cyan
Copy-Item "$originalPath\src\screens\SplashScreen.tsx" "$shortPath\src\screens\SplashScreen.tsx" -Force
Write-Host "✓ Splash screen updated in short path`n" -ForegroundColor Green

# Step 2: Clear bundle cache
Write-Host "Step 2: Clearing bundle cache..." -ForegroundColor Cyan
Remove-Item -Path "$shortPath\android\app\build\generated\assets\createBundleDebugJsAndAssets" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$shortPath\android\app\build\intermediates\sourcemaps\react\debug" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✓ Bundle cache cleared`n" -ForegroundColor Green

# Step 3: Build APK
Write-Host "Step 3: Building debug APK..." -ForegroundColor Cyan
Write-Host "This will take 3-5 minutes...`n" -ForegroundColor Yellow

Set-Location "$shortPath\android"
& .\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    $apkPath = "$shortPath\android\app\build\outputs\apk\debug\app-debug.apk"
    
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        Write-Host ""
        Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "APK Location (short path):" -ForegroundColor Cyan
        Write-Host "  $($apk.FullName)" -ForegroundColor White
        Write-Host ""
        Write-Host "APK Size: $([math]::Round($apk.Length / 1MB, 2)) MB" -ForegroundColor Cyan
        Write-Host "Modified: $($apk.LastWriteTime)" -ForegroundColor Gray
        Write-Host ""
        
        # Copy APK to original project location
        $targetPath = "$originalPath\android\app\build\outputs\apk\debug\app-debug.apk"
        $targetDir = Split-Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item $apkPath $targetPath -Force
        Write-Host "✅ APK also copied to:" -ForegroundColor Green
        Write-Host "  $targetPath" -ForegroundColor White
        Write-Host ""
        Write-Host "📱 This APK includes:" -ForegroundColor Yellow
        Write-Host "   - Updated splash screen (restored to 12 hours ago)" -ForegroundColor White
        Write-Host "   - Font size: 50, Letter spacing: 0" -ForegroundColor White
        Write-Host "   - Container height: 60" -ForegroundColor White
        Write-Host "   - All crash fixes" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}

Set-Location $originalPath
