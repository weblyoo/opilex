# Build APK Script - Copy project first, then build
# This ensures latest code is used

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "release"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APK Build Process" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$source = "c:\Users\info\OneDrive\Desktop\kimson\kimson\app\KimsonApp"
$dest = "C:\kimson-app"

Write-Host "Step 1: Copying project to build directory..." -ForegroundColor Yellow
Write-Host "  Source: $source" -ForegroundColor Gray
Write-Host "  Destination: $dest" -ForegroundColor Gray
Write-Host ""

if (Test-Path $dest) {
    Write-Host "Removing existing build directory..." -ForegroundColor Yellow
    Remove-Item -Path $dest -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "Copying files (excluding build artifacts)..." -ForegroundColor Cyan
Copy-Item -Path $source -Destination $dest -Recurse -Force -Exclude @("node_modules", ".git", "android\app\build", "android\build", "android\.gradle", "android\app\.cxx") -ErrorAction SilentlyContinue

# Also copy node_modules if it exists (for faster builds)
if (Test-Path "$source\node_modules") {
    Write-Host "Copying node_modules (this may take a while)..." -ForegroundColor Cyan
    Copy-Item -Path "$source\node_modules" -Destination "$dest\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

# Ensure FORCE_BUILD_APK.ps1 is copied
if (Test-Path "$source\FORCE_BUILD_APK.ps1") {
    Write-Host "Copying build script..." -ForegroundColor Cyan
    Copy-Item -Path "$source\FORCE_BUILD_APK.ps1" -Destination "$dest\FORCE_BUILD_APK.ps1" -Force -ErrorAction SilentlyContinue
}

Write-Host "[OK] Copy completed!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Building APK..." -ForegroundColor Yellow
Write-Host ""

Set-Location $dest

# Verify script exists, if not use source script
if (Test-Path ".\FORCE_BUILD_APK.ps1") {
    Write-Host "Using build script from copied directory..." -ForegroundColor Cyan
    .\FORCE_BUILD_APK.ps1 -BuildType $BuildType
} elseif (Test-Path "$source\FORCE_BUILD_APK.ps1") {
    Write-Host "Using build script from source directory..." -ForegroundColor Cyan
    & "$source\FORCE_BUILD_APK.ps1" -BuildType $BuildType
} else {
    Write-Host "[ERROR] FORCE_BUILD_APK.ps1 not found!" -ForegroundColor Red
    Write-Host "Running direct Gradle build instead..." -ForegroundColor Yellow
    
    # Fallback: Direct Gradle build
    Write-Host "Stopping Gradle daemons..." -ForegroundColor Yellow
    Set-Location "$dest\android"
    & .\gradlew.bat --stop 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    
    Write-Host "Cleaning..." -ForegroundColor Yellow
    & .\gradlew.bat clean --no-daemon 2>&1 | Out-Null
    
    Write-Host "Building APK..." -ForegroundColor Yellow
    $env:NODE_ENV = "production"
    & .\gradlew.bat assembleRelease --no-daemon
}

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    $apkPath = "C:\kimson-app\android\app\build\outputs\apk\$BuildType\app-$BuildType.apk"
    
    if (Test-Path $apkPath) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        
        $apk = Get-Item $apkPath
        Write-Host "APK Details:" -ForegroundColor Cyan
        Write-Host "  Location: $($apk.FullName)" -ForegroundColor White
        Write-Host "  Size: $([math]::Round($apk.Length / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "  Build Time: $($apk.LastWriteTime)" -ForegroundColor White
        Write-Host ""
        
        # Copy APK back to original project
        $targetApk = "$source\app-$BuildType.apk"
        Copy-Item $apkPath $targetApk -Force
        Write-Host "[OK] APK copied to: $targetApk" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  BUILD FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
}

Set-Location $source
