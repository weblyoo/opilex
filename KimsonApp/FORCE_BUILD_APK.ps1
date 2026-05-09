# Force Build APK Script - Aggressively handles file locks
# This script forcefully releases file locks and builds the APK

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "release"
)

Write-Host "Force Building APK with File Lock Resolution" -ForegroundColor Cyan
Write-Host ""

# Use the directory where the script is located
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$buildPath = $scriptPath
$androidPath = "$buildPath\android"

if (-not (Test-Path $androidPath)) {
    Write-Host "ERROR: $androidPath not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Stopping ALL Gradle and Java processes..." -ForegroundColor Yellow

# Stop all Gradle daemons
Set-Location $androidPath
& .\gradlew.bat --stop 2>&1 | Out-Null
Start-Sleep -Seconds 3

# Kill ALL Java processes (more aggressive)
$allJava = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($allJava) {
    Write-Host "Stopping all Java processes..." -ForegroundColor Yellow
    $allJava | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5
}

# Kill any node processes that might be holding file handles
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Stopping Node processes..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "[OK] All processes stopped" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Aggressively cleaning locked directories..." -ForegroundColor Yellow

# Wait longer for file handles to release
Start-Sleep -Seconds 5

# Function to force remove directory with multiple retries
function Force-RemoveDirectory {
    param([string]$Path, [int]$MaxRetries = 10)
    
    if (-not (Test-Path $Path)) {
        return $true
    }
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            # Try to remove files individually first
            Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
                Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
            
            # Then remove the directory
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            return $true
        } catch {
            if ($i -lt $MaxRetries) {
                Write-Host "  Retry $i/$MaxRetries for $Path..." -ForegroundColor Yellow
                Start-Sleep -Seconds 3
            } else {
                Write-Host "  [WARN] Could not remove $Path after $MaxRetries attempts" -ForegroundColor Yellow
                return $false
            }
        }
    }
    return $false
}

# Clean the problematic merged_res directory first
$mergedResPath = "$androidPath\app\build\intermediates\merged_res"
if (Test-Path $mergedResPath) {
    Write-Host "Force removing merged_res directory..." -ForegroundColor Cyan
    Force-RemoveDirectory -Path $mergedResPath -MaxRetries 10
}

# Clean other build directories
$cleanDirs = @(
    "$androidPath\app\.cxx",
    "$androidPath\app\build",
    "$androidPath\build",
    "$androidPath\.gradle"
)

foreach ($dir in $cleanDirs) {
    if (Test-Path $dir) {
        Write-Host "Cleaning $dir..." -ForegroundColor Cyan
        Force-RemoveDirectory -Path $dir -MaxRetries 5
    }
}

Write-Host "[OK] Directories cleaned" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Running Gradle clean..." -ForegroundColor Yellow

Set-Location $androidPath
& .\gradlew.bat clean --no-daemon 2>&1 | Out-Null

Write-Host "[OK] Gradle clean completed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Building APK ($BuildType)..." -ForegroundColor Yellow
Write-Host "This will take 3-5 minutes..." -ForegroundColor Cyan
Write-Host ""

# Build with retry logic
$buildSuccess = $false
$maxBuildRetries = 2

for ($retry = 1; $retry -le $maxBuildRetries; $retry++) {
    if ($retry -gt 1) {
        Write-Host "Retry attempt $retry of $maxBuildRetries..." -ForegroundColor Yellow
        Write-Host "Cleaning merged_res again..." -ForegroundColor Yellow
        if (Test-Path $mergedResPath) {
            Force-RemoveDirectory -Path $mergedResPath -MaxRetries 5
        }
        Start-Sleep -Seconds 3
    }
    
    if ($BuildType -eq "debug") {
        & .\gradlew.bat assembleDebug --no-daemon
    } else {
        $env:NODE_ENV = "production"
        & .\gradlew.bat assembleRelease --no-daemon
    }
    
    if ($LASTEXITCODE -eq 0) {
        $buildSuccess = $true
        break
    } else {
        Write-Host "[WARN] Build failed, will retry..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if ($buildSuccess) {
    Write-Host ""
    Write-Host "[SUCCESS] BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    
    if ($BuildType -eq "debug") {
        $apkPath = "$androidPath\app\build\outputs\apk\debug\app-debug.apk"
    } else {
        $apkPath = "$androidPath\app\build\outputs\apk\release\app-release.apk"
    }
    
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        Write-Host "APK Location: $($apk.FullName)" -ForegroundColor Cyan
        Write-Host "APK Size: $([math]::Round($apk.Length / 1MB, 2)) MB" -ForegroundColor Cyan
        Write-Host "Build Time: $($apk.LastWriteTime)" -ForegroundColor Cyan
        Write-Host ""
        
        # Copy APK to project root for easy access
        $targetApk = "$buildPath\app-$BuildType.apk"
        Copy-Item $apkPath $targetApk -Force
        Write-Host "[OK] APK copied to: $targetApk" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "[ERROR] BUILD FAILED after $maxBuildRetries attempts" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "  1. Close all file explorers and IDEs" -ForegroundColor White
    Write-Host "  2. Restart your computer" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    exit 1
}

Set-Location $buildPath
