# Comprehensive APK Build Fix Script
# Fixes file locks, build order issues, and Windows path problems

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "release"
)

Write-Host "Fixing Build Issues and Building APK" -ForegroundColor Cyan
Write-Host ""

$buildPath = "C:\kimson-app"
$androidPath = "$buildPath\android"

if (-not (Test-Path $androidPath)) {
    Write-Host "ERROR: $androidPath not found!" -ForegroundColor Red
    Write-Host "Please ensure the project is copied to C:\kimson-app" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Stopping Gradle daemons and Java processes..." -ForegroundColor Yellow

# Stop Gradle daemons
try {
    Set-Location $androidPath
    & .\gradlew.bat --stop 2>&1 | Out-Null
    Write-Host "[OK] Gradle daemons stopped" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Could not stop Gradle daemons (may not be running)" -ForegroundColor Yellow
}

# Kill any remaining Java processes related to build
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*gradle*" -or $_.Path -like "*android*"
}

if ($javaProcesses) {
    Write-Host "Stopping Java build processes..." -ForegroundColor Yellow
    $javaProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "[OK] Java processes stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Cleaning build directories and releasing file locks..." -ForegroundColor Yellow

# Wait a moment for file handles to release
Start-Sleep -Seconds 3

# Clean build directories
$cleanDirs = @(
    "$androidPath\app\.cxx",
    "$androidPath\app\build",
    "$androidPath\build",
    "$androidPath\.gradle",
    "$buildPath\node_modules\react-native-reanimated\android\.cxx",
    "$buildPath\node_modules\react-native-reanimated\android\build",
    "$buildPath\node_modules\react-native-worklets\android\.cxx",
    "$buildPath\node_modules\react-native-worklets\android\build"
)

foreach ($dir in $cleanDirs) {
    if (Test-Path $dir) {
        try {
            # Try to remove with retries
            $retries = 3
            $retryCount = 0
            $removed = $false
            
            while ($retryCount -lt $retries -and -not $removed) {
                try {
                    Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
                    $removed = $true
                } catch {
                    $retryCount++
                    if ($retryCount -lt $retries) {
                        Write-Host "  Retrying removal of $dir (attempt $retryCount/$retries)..." -ForegroundColor Yellow
                        Start-Sleep -Seconds 2
                    } else {
                        Write-Host "  [WARN] Could not remove $dir (may be locked)" -ForegroundColor Yellow
                    }
                }
            }
        } catch {
            Write-Host "  [WARN] Could not remove $dir" -ForegroundColor Yellow
        }
    }
}

Write-Host "[OK] Build directories cleaned" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Running Gradle clean..." -ForegroundColor Yellow

Set-Location $androidPath
& .\gradlew.bat clean --no-daemon 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARN] Gradle clean had warnings, continuing..." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Gradle clean completed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Building native dependencies in correct order..." -ForegroundColor Yellow

# Build react-native-worklets first (dependency for reanimated)
Write-Host "  Building react-native-worklets..." -ForegroundColor Cyan
& .\gradlew.bat :react-native-worklets:buildCMakeRelWithDebInfo[arm64-v8a][worklets] --no-daemon 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] react-native-worklets build had issues, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] react-native-worklets built" -ForegroundColor Green
}

# Build react-native-reanimated (depends on worklets)
Write-Host "  Building react-native-reanimated..." -ForegroundColor Cyan
& .\gradlew.bat :react-native-reanimated:buildCMakeRelWithDebInfo[arm64-v8a][reanimated] --no-daemon 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] react-native-reanimated build had issues, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] react-native-reanimated built" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 5: Building APK ($BuildType)..." -ForegroundColor Yellow
Write-Host "This will take 3-5 minutes..." -ForegroundColor Cyan
Write-Host ""

if ($BuildType -eq "debug") {
    & .\gradlew.bat assembleDebug --no-daemon
} else {
    $env:NODE_ENV = "production"
    & .\gradlew.bat assembleRelease --no-daemon
}

if ($LASTEXITCODE -eq 0) {
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
        
        # Copy APK to original project location
        $originalPath = "C:\Users\info\OneDrive\Desktop\kimson\kimson\app\KimsonApp"
        if (Test-Path $originalPath) {
            $targetApk = "$originalPath\app-$BuildType.apk"
            Copy-Item $apkPath $targetApk -Force
            Write-Host "[OK] APK also copied to: $targetApk" -ForegroundColor Green
        }
    } else {
        Write-Host "[WARN] APK file not found at expected location" -ForegroundColor Yellow
        Write-Host "Searching for APK files..." -ForegroundColor Yellow
        Get-ChildItem "$androidPath\app\build\outputs\apk" -Recurse -Filter "*.apk" -ErrorAction SilentlyContinue | 
            Select-Object FullName, Length, LastWriteTime | Format-Table
    }
} else {
    Write-Host ""
    Write-Host "[ERROR] BUILD FAILED" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  1. Ensure all file handles are closed" -ForegroundColor White
    Write-Host "  2. Try running this script again" -ForegroundColor White
    Write-Host "  3. Check that react-native-worklets is properly installed" -ForegroundColor White
    exit 1
}

Set-Location "C:\Users\info\OneDrive\Desktop\kimson\kimson\app\KimsonApp"
