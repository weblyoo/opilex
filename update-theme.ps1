$files = @(
  'Authentications.tsx',
  'Rewards.tsx',
  'Transactions.tsx',
  'Analytics.tsx',
  'Settings.tsx',
  'GenerateRewardQR.tsx',
  'QRCodeLabels.tsx',
  'Sliders.tsx',
  'Documents.tsx',
  'DocumentsDisplay.tsx',
  'Ledger.tsx',
  'PriceList.tsx',
  'ProductCatalog.tsx',
  'Users.tsx',
  'Schemes.tsx'
)

foreach ($f in $files) {
  $path = "c:\Users\info\OneDrive\Desktop\Opilex\src\pages\$f"
  $content = Get-Content $path -Raw
  
  # Replace background colors
  $content = $content -replace 'bg-black(?!/)', 'bg-[#111111]'
  $content = $content -replace 'bg-gradient-to-br from-black via-black to-gray-900', 'bg-gradient-to-br from-[#111111] via-[#111111] to-[#0F0F0F]'
  
  # Replace border colors
  $content = $content -replace 'border-white/20', 'border-white/10'
  
  # Replace card backgrounds
  $content = $content -replace 'from-black/90 to-black/70', 'from-[#1A1A1A] to-[#111111]'
  
  # Replace table header gradients
  $content = $content -replace 'from-white/10 to-white/5', 'from-[#E31E24]/10 to-[#E31E24]/5'
  
  # Replace button active states
  $content = $content -replace "bg-white text-black", "bg-[#E31E24] text-white"
  
  # Replace button hover states  
  $content = $content -replace 'hover:bg-white hover:text-black', 'hover:bg-[#E31E24] hover:text-white'
  
  Set-Content $path $content -NoNewline
  Write-Host "Updated: $f"
}
