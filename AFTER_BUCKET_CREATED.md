# After Creating Storage Bucket - Next Steps

## ✅ Step 1: Verify Bucket Created

After creating the bucket in Google Cloud Console, wait 2-3 minutes, then run:

```bash
node scripts/setupStorage.js
```

Expected output:
```
✅ Firebase Storage is initialized and working!
```

## ✅ Step 2: Auto-Deploy Rules

Once Storage is verified, run:

```bash
node scripts/checkAndDeployStorage.js
```

This will:
- ✅ Verify Storage is ready
- ✅ Automatically deploy storage rules
- ✅ Confirm everything is working

## ✅ Step 3: Test Pages

After deployment, test your admin panel:
1. Navigate to: `/price-list`
2. Navigate to: `/product-catalog`
3. Try uploading an image or PDF

## 🎯 Quick Command

Just run this one command after creating bucket:

```bash
node scripts/checkAndDeployStorage.js
```

It does everything automatically!

