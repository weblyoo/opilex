# 🔧 Fix: Firebase Storage Unknown Error

## ❌ Error Message
```
Firebase Storage: An unknown error occurred, please check the error payload for server response. (storage/unknown)
```

## 🔍 Root Cause
Firebase Storage **has not been initialized** in your Firebase project yet. The bucket doesn't exist, so the Storage API returns an unknown error.

## ✅ Solution: Initialize Firebase Storage

### Step 1: Open Firebase Console

**Click this link:**
👉 [https://console.firebase.google.com/project/opilex-2a79f/storage](https://console.firebase.google.com/project/opilex-2a79f/storage)

### Step 2: Initialize Storage

1. **Click "Get Started"** button
2. **⚠️ IMPORTANT: Select Location**
   - Choose: **"us-central1"** (Iowa)
   - ✅ Supports no-cost tier (5 GB free)
   - ⚠️ Location **cannot be changed later**
3. **Storage Class:** Select **"Standard"**
4. **Click "Done"**
5. **Wait 1-2 minutes** for propagation

### Step 3: Update Bucket Name (If Needed)

After Storage is initialized, Firebase creates a default bucket. Check:

1. In Firebase Console → Storage, note the bucket name
2. If it's NOT `opilex-2a79f-storage`, update `src/config/firebase.ts`:

```typescript
// If default bucket is: opilex-2a79f.firebasestorage.app
storageBucket: "opilex-2a79f.firebasestorage.app"

// OR if you created custom bucket: opilex-2a79f-storage
storageBucket: "opilex-2a79f-storage"
```

### Step 4: Deploy Storage Rules

After Storage is ready, deploy the security rules:

```bash
firebase deploy --only storage
```

Or use the auto-deploy script:

```bash
node scripts/checkAndDeployStorage.js
```

## ✅ Verification

After setup, verify:

1. **Check Storage in Console:**
   - Go to: https://console.firebase.google.com/project/opilex-2a79f/storage
   - You should see a bucket created

2. **Test Upload:**
   - Navigate to `/price-list` in admin panel
   - Try uploading an image
   - Should work without errors

3. **Check Rules:**
   ```bash
   firebase storage:rules:get
   ```

## 🎯 Quick Fix Commands

```bash
# 1. After initializing Storage in Console, deploy rules:
firebase deploy --only storage

# 2. Or use the auto-check script:
node scripts/checkAndDeployStorage.js

# 3. Verify it's working:
firebase storage:rules:get
```

## 💡 Why This Happens

- Firebase Storage requires manual initialization in Console
- The bucket must be created before you can deploy rules or use Storage
- The `storage/unknown` error means Storage service doesn't exist yet

## ✅ After Setup

Once Storage is initialized and rules are deployed:
- ✅ Price List page can upload images and PDFs
- ✅ Product Catalog page can upload images and PDFs
- ✅ Documents Display page will show uploaded files
- ✅ Mobile app can fetch files from Storage

---

**Next Step:** Go to Firebase Console and click "Get Started" to initialize Storage! 🚀


