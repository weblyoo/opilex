# Fix Windows Path Length Limitation
# This script enables long path support in Windows and configures the build

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fixing Windows Path Length Issue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: Not running as administrator!" -ForegroundColor Yellow
    Write-Host "Long path support requires administrator privileges." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Run PowerShell as Administrator and run this script again" -ForegroundColor Cyan
    Write-Host "Option 2: Use the workaround by building in a shorter path" -ForegroundColor Cyan
    Write-Host ""
    
    # Use workaround: configure CMake to use shorter paths
    Write-Host "Applying workaround: Configuring CMake to use shorter paths..." -ForegroundColor Yellow
    
    $gradleProps = "android\gradle.properties"
    if (Test-Path $gradleProps) {
        $content = Get-Content $gradleProps -Raw
        if ($content -notmatch "android\.build\.cacheDir") {
            Add-Content $gradleProps "`n# Use shorter build cache path to avoid Windows path length limits`nandroid.build.cacheDir=C:\\.gradle\cache"
            Write-Host "[OK] Added shorter cache path to gradle.properties" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "Workaround applied. You can now try building again." -ForegroundColor Green
    Write-Host "If it still fails, run this script as Administrator to enable long paths." -ForegroundColor Yellow
    exit 0
}

Write-Host "Running as Administrator - Enabling long path support..." -ForegroundColor Green
Write-Host ""

# Enable long path support via registry
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
$regValue = "LongPathsEnabled"

try {
    $currentValue = Get-ItemProperty -Path $regPath -Name $regValue -ErrorAction SilentlyContinue
    
    if ($currentValue.LongPathsEnabled -eq 1) {
        Write-Host "[OK] Long path support is already enabled!" -ForegroundColor Green
    } else {
        Write-Host "Enabling long path support..." -ForegroundColor Yellow
        Set-ItemProperty -Path $regPath -Name $regValue -Value 1 -Type DWord
        Write-Host "[OK] Long path support enabled!" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: You need to restart your computer for this to take effect." -ForegroundColor Yellow
        Write-Host "After restart, the build should work without path length issues." -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Failed to enable long path support: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Use group policy (requires Windows 10 1607+)
    try {
        $gpoPath = "HKLM:\SYSTEM\CurrentControlSet\Policies"
        if (-not (Test-Path "$gpoPath\LongPathsEnabled")) {
            New-Item -Path $gpoPath -Name "LongPathsEnabled" -Force | Out-Null
        }
        Set-ItemProperty -Path "$gpoPath\LongPathsEnabled" -Name "LongPathsEnabled" -Value 1 -Type DWord
        Write-Host "[OK] Long path support enabled via Group Policy!" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Could not enable long path support automatically." -ForegroundColor Red
        Write-Host ""
        Write-Host "Manual steps:" -ForegroundColor Yellow
        Write-Host "1. Open Registry Editor (regedit.exe)" -ForegroundColor White
        Write-Host "2. Navigate to: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem" -ForegroundColor White
        Write-Host "3. Find or create DWORD: LongPathsEnabled" -ForegroundColor White
        Write-Host "4. Set value to: 1" -ForegroundColor White
        Write-Host "5. Restart your computer" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Also configuring build to use shorter intermediate paths..." -ForegroundColor Yellow

# Configure Gradle to use shorter paths
$gradleProps = "android\gradle.properties"
if (Test-Path $gradleProps) {
    $content = Get-Content $gradleProps -Raw
    if ($content -notmatch "android\.build\.cacheDir") {
        Add-Content $gradleProps "`n# Use shorter build cache path to avoid Windows path length limits`nandroid.build.cacheDir=C:\\.gradle\cache"
        Write-Host "[OK] Added shorter cache path to gradle.properties" -ForegroundColor Green
    } else {
        Write-Host "[OK] Cache path already configured" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. If long paths were enabled, RESTART YOUR COMPUTER" -ForegroundColor Yellow
Write-Host "2. After restart, try building the APK again" -ForegroundColor Yellow
Write-Host ""
