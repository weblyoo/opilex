# PowerShell script to build APK locally by copying to shorter path
# This avoids Windows path length limitations

Write-Host "🔨 Building APK Locally" -ForegroundColor Cyan
Write-Host ""

$sourcePath = $PSScriptRoot
$buildPath = "C:\kimson\KimsonApp"

Write-Host "Source: $sourcePath" -ForegroundColor Yellow
Write-Host "Build Location: $buildPath" -ForegroundColor Yellow
Write-Host ""

# Create build directory if it doesn't exist
if (-not (Test-Path $buildPath)) {
    Write-Host "Creating build directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $buildPath -Force | Out-Null
}

# Copy project files (excluding node_modules, .expo, build folders for faster copy)
Write-Host "Copying project files to shorter path..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

$excludeDirs = @('node_modules', '.expo', 'android\app\build', 'android\build', 'android\.gradle', 'dist', 'temp_apk', '.git')

# Copy only essential files for build
robocopy $sourcePath $buildPath /E /XD node_modules .expo android\app\build android\build android\.gradle dist temp_apk .git /R:3 /W:5 /NP /NFL /NDL | Out-Null

# Copy node_modules (needed for build but can take time)
Write-Host "Copying node_modules..." -ForegroundColor Yellow
robocopy "$sourcePath\node_modules" "$buildPath\node_modules" /E /R:3 /W:5 /NP /NFL /NDL | Out-Null

Write-Host ""
Write-Host "✅ Files copied!" -ForegroundColor Green
Write-Host ""

# Change to build directory and build
Write-Host "Building APK..." -ForegroundColor Yellow
Set-Location "$buildPath\android"

# Build APK
& .\gradlew.bat assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    $apkPath = "$buildPath\android\app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "APK Location: $apkPath" -ForegroundColor Cyan
        Write-Host "APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can now copy this APK to your device!" -ForegroundColor Green
        
        # Copy APK back to original location
        $targetApk = "$sourcePath\app-release.apk"
        Copy-Item $apkPath $targetApk -Force
        Write-Host ""
        Write-Host "✅ APK also copied to: $targetApk" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}

# Return to original directory
Set-Location $sourcePath
