# Quick build script - simpler approach
# Builds directly from shorter path if available

Write-Host "🔨 Quick APK Build" -ForegroundColor Cyan
Write-Host ""

$currentPath = $PSScriptRoot
$shortPath = "C:\kimson\KimsonApp"

# Check if we're already in a short path
if ($currentPath.Length -lt 100) {
    Write-Host "✓ Path is short enough, building directly..." -ForegroundColor Green
    Set-Location "$currentPath\android"
    & .\gradlew.bat assembleRelease
    Set-Location $currentPath
    exit
}

# Otherwise, check if short path version exists
if (Test-Path "$shortPath\android") {
    Write-Host "Building from: $shortPath" -ForegroundColor Yellow
    Set-Location "$shortPath\android"
    & .\gradlew.bat assembleRelease
    
    if ($LASTEXITCODE -eq 0) {
        $apkPath = "$shortPath\android\app\build\outputs\apk\release\app-release.apk"
        if (Test-Path $apkPath) {
            Write-Host ""
            Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
            Write-Host "APK: $apkPath" -ForegroundColor Cyan
            
            # Copy to current location
            Copy-Item $apkPath "$currentPath\app-release.apk" -Force
            Write-Host "✅ APK copied to: $currentPath\app-release.apk" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ Short path not found: $shortPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run BUILD_LOCAL_APK.ps1 first to set up the build environment" -ForegroundColor Yellow
}

Set-Location $currentPath
