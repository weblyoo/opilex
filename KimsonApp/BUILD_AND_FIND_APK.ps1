# Build APK and Show Location
# This script builds the APK and shows you exactly where it is

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "debug"
)

Write-Host "`n=== Building APK ===" -ForegroundColor Cyan
Write-Host "Build Type: $BuildType`n" -ForegroundColor Yellow

# Navigate to android directory
$androidDir = Join-Path $PSScriptRoot "android"
if (-not (Test-Path $androidDir)) {
    Write-Host "ERROR: android directory not found!" -ForegroundColor Red
    exit 1
}

Push-Location $androidDir

try {
    # Build the APK
    if ($BuildType -eq "debug") {
        Write-Host "Building Debug APK..." -ForegroundColor Cyan
        & .\gradlew.bat assembleDebug
    } else {
        Write-Host "Building Release APK..." -ForegroundColor Cyan
        & .\gradlew.bat assembleRelease
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Build failed!" -ForegroundColor Red
        exit 1
    }

    # Determine APK path
    if ($BuildType -eq "debug") {
        $apkPath = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
    } else {
        $apkPath = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
    }

    Write-Host "`n✅ Build successful!`n" -ForegroundColor Green
    Write-Host "=== APK Location ===" -ForegroundColor Cyan
    Write-Host "Full Path:" -ForegroundColor Yellow
    Write-Host "  $apkPath" -ForegroundColor White
    
    if (Test-Path $apkPath) {
        $apkInfo = Get-Item $apkPath
        Write-Host "`nFile Info:" -ForegroundColor Yellow
        Write-Host "  Size: $([math]::Round($apkInfo.Length / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "  Modified: $($apkInfo.LastWriteTime)" -ForegroundColor White
        
        Write-Host "`n📱 APK is ready to install!" -ForegroundColor Green
        Write-Host "`nTo install on connected device:" -ForegroundColor Cyan
        Write-Host "  adb install `"$apkPath`"" -ForegroundColor White
        
        Write-Host "`nTo open in File Explorer:" -ForegroundColor Cyan
        Write-Host "  explorer /select,`"$apkPath`"" -ForegroundColor White
    } else {
        Write-Host "`n⚠️  APK file not found at expected location!" -ForegroundColor Yellow
        Write-Host "Expected: $apkPath" -ForegroundColor White
    }

} finally {
    Pop-Location
}
