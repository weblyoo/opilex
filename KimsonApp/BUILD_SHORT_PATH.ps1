# Build APK using shorter path to avoid Windows 260 character limit
# This script copies the project to C:\kimson and builds there

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "release"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building APK (Short Path Workaround)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$source = "C:\Users\info\OneDrive\Desktop\kimson\kimson\app\KimsonApp"
$dest = "C:\kimson"

Write-Host "Step 1: Copy updated code to short path..." -ForegroundColor Yellow
Write-Host "  Source: $source" -ForegroundColor Gray
Write-Host "  Destination: $dest" -ForegroundColor Gray
Write-Host ""

# Remove existing build directory so we get fresh updated code
if (Test-Path $dest) {
    Write-Host "Removing existing $dest to copy latest code..." -ForegroundColor Cyan
    Remove-Item -Path $dest -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Copy project - exclude only build artifacts (keep node_modules for faster build)
Write-Host "Copying project to $dest..." -ForegroundColor Cyan
$excludeDirs = "android\app\build android\build android\.gradle android\app\.cxx dist temp_apk"
robocopy $source $dest /E /XD $excludeDirs /R:3 /W:5 /NP /NFL /NDL | Out-Null

# Copy/sync node_modules (needed for build)
if (Test-Path "$source\node_modules") {
    Write-Host "Copying node_modules (this may take a few minutes)..." -ForegroundColor Cyan
    robocopy "$source\node_modules" "$dest\node_modules" /E /R:3 /W:5 /NP /NFL /NDL | Out-Null
}

Write-Host "[OK] Updated code copied to $dest" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Building APK..." -ForegroundColor Yellow
Write-Host ""

Set-Location "$dest\android"

# Stop Gradle daemons
Write-Host "Stopping Gradle daemons..." -ForegroundColor Cyan
& .\gradlew.bat --stop 2>&1 | Out-Null
Start-Sleep -Seconds 3

# Clean
Write-Host "Cleaning build..." -ForegroundColor Cyan
& .\gradlew.bat clean --no-daemon 2>&1 | Out-Null

# Build
Write-Host "Building release APK..." -ForegroundColor Cyan
$env:NODE_ENV = "production"
& .\gradlew.bat assembleRelease --no-daemon

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    $apkPath = "$dest\android\app\build\outputs\apk\release\app-release.apk"
    
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        Write-Host "APK Details:" -ForegroundColor Cyan
        Write-Host "  Location: $($apk.FullName)" -ForegroundColor White
        Write-Host "  Size: $([math]::Round($apk.Length / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "  Build Time: $($apk.LastWriteTime)" -ForegroundColor White
        Write-Host ""
        
        # Copy APK back to original project
        $targetApk = "$source\app-release.apk"
        Copy-Item $apkPath $targetApk -Force
        Write-Host "[OK] APK copied to: $targetApk" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  BUILD FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above." -ForegroundColor Yellow
}

Set-Location $source
