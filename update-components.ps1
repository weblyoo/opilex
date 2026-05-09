$path = "c:\Users\info\OneDrive\Desktop\Opilex\src\components\UserDetailModal.tsx"
$c = Get-Content $path -Raw
$c = $c -replace 'bg-black/50', 'bg-[#111111]/70'
$c = $c -replace 'bg-black/30', 'bg-[#1A1A1A]/50'
$c = $c -replace 'border-white/20', 'border-white/10'
$c = $c -replace 'focus:border-white', 'focus:border-[#E31E24]'
$c = $c -replace 'focus:ring-white/20', 'focus:ring-[#E31E24]/20'
$c = $c -replace 'hover:border-white/20', 'hover:border-[#E31E24]/30'
Set-Content $path $c -NoNewline
Write-Host "Updated UserDetailModal.tsx"

# Also update ConfirmDialog, ErrorBoundary, Header, NotificationDrawer
$components = @('ConfirmDialog.tsx', 'ErrorBoundary.tsx', 'Header.tsx', 'NotificationDrawer.tsx')
foreach ($f in $components) {
  $p = "c:\Users\info\OneDrive\Desktop\Opilex\src\components\$f"
  if (Test-Path $p) {
    $content = Get-Content $p -Raw
    $content = $content -replace 'bg-black(?!/)', 'bg-[#111111]'
    $content = $content -replace 'border-white/20', 'border-white/10'
    $content = $content -replace 'from-black/90 to-black/70', 'from-[#1A1A1A] to-[#111111]'
    $content = $content -replace 'from-white/10 to-white/5', 'from-[#E31E24]/10 to-[#E31E24]/5'
    $content = $content -replace "bg-white text-black", "bg-[#E31E24] text-white"
    $content = $content -replace 'hover:bg-white hover:text-black', 'hover:bg-[#E31E24] hover:text-white'
    Set-Content $p $content -NoNewline
    Write-Host "Updated: $f"
  }
}
