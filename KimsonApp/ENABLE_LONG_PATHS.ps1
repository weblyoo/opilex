# PowerShell script to enable long path support in Windows
# Must be run as Administrator

Write-Host "🔧 Enabling Windows Long Path Support" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  This script requires Administrator privileges!" -ForegroundColor Yellow
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Please run PowerShell as Administrator and try again." -ForegroundColor Red
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Enable long paths via registry
Write-Host "Setting registry value..." -ForegroundColor Yellow
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force | Out-Null

Write-Host ""
Write-Host "✅ Long path support enabled!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  You may need to restart your computer for changes to take effect." -ForegroundColor Yellow
Write-Host ""
Write-Host "After restarting, you can build your Android APK without path length issues." -ForegroundColor Cyan
