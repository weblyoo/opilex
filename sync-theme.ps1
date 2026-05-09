$src = "c:\Users\info\OneDrive\Desktop\Opilex\src"
$dst = "c:\Users\info\OneDrive\Desktop\Opilex\kimson-admin-panel\src"

# Copy components
$components = @('Login.tsx', 'Sidebar.tsx', 'Layout.tsx', 'Logo.tsx', 'StatsCard.tsx', 'Modal.tsx', 'UserDetailModal.tsx', 'ConfirmDialog.tsx')
foreach ($f in $components) {
  $srcFile = "$src\components\$f"
  $dstFile = "$dst\components\$f"
  if (Test-Path $srcFile) {
    Copy-Item -Path $srcFile -Destination $dstFile -Force
    Write-Host "Copied: components\$f"
  }
}

# Copy pages
$pages = @('Dashboard.tsx', 'Authentications.tsx', 'Rewards.tsx', 'Transactions.tsx', 'Analytics.tsx', 'Settings.tsx', 'GenerateRewardQR.tsx', 'QRCodeLabels.tsx', 'Sliders.tsx', 'Documents.tsx', 'DocumentsDisplay.tsx', 'Ledger.tsx', 'PriceList.tsx', 'ProductCatalog.tsx', 'Users.tsx', 'Schemes.tsx')
foreach ($f in $pages) {
  $srcFile = "$src\pages\$f"
  $dstFile = "$dst\pages\$f"
  if (Test-Path $srcFile) {
    Copy-Item -Path $srcFile -Destination $dstFile -Force
    Write-Host "Copied: pages\$f"
  }
}

# Copy CSS
Copy-Item -Path "$src\index.css" -Destination "$dst\index.css" -Force
Write-Host "Copied: index.css"
Copy-Item -Path "$src\App.css" -Destination "$dst\App.css" -Force
Write-Host "Copied: App.css"

# Copy config
Copy-Item -Path "$src\config\theme.ts" -Destination "$dst\config\theme.ts" -Force
Write-Host "Copied: config\theme.ts"

# Copy Opilex logo to public
$pubSrc = "c:\Users\info\OneDrive\Desktop\Opilex\public\Opilex-Logo.png"
$pubDst = "c:\Users\info\OneDrive\Desktop\Opilex\kimson-admin-panel\public\Opilex-Logo.png"
Copy-Item -Path $pubSrc -Destination $pubDst -Force
Write-Host "Copied: public\Opilex-Logo.png"

# Copy tailwind config
Copy-Item -Path "c:\Users\info\OneDrive\Desktop\Opilex\tailwind.config.js" -Destination "c:\Users\info\OneDrive\Desktop\Opilex\kimson-admin-panel\tailwind.config.js" -Force
Write-Host "Copied: tailwind.config.js"

Write-Host "`nAll files synced to kimson-admin-panel!"
