# Fix: Storage Domain Verification Issue

## ❌ Problem
Error: "To create a bucket named opilex-2a79f.firebasestorage.app, you must verify that you're authorized to use that domain name."

## ✅ Solution: Use Regular Bucket Name

Create a bucket with a **regular name** (without `.firebasestorage.app`) to avoid domain verification.

### Step 1: Create Bucket in Google Cloud Console

1. **Open Google Cloud Console:**
   https://console.cloud.google.com/storage/browser?project=opilex-2a79f

2. **Click "Create Bucket"**

3. **Use this name (IMPORTANT - no .firebasestorage.app):**
   ```
   Name: opilex-2a79f-storage
   ```
   ⚠️ **DO NOT use** `opilex-2a79f.firebasestorage.app` - that requires verification

4. **Configure:**
   ```
   Location type: Single region
   Location: us-central1 (Iowa)
   Storage class: Standard
   Access control: Fine-grained
   (Leave all other defaults)
   ```

5. **Click "Create"**

### Step 2: Update Firebase Config

After creating the bucket, update your Firebase config to use the new bucket name:

**Edit `src/config/firebase.ts`:**

Change this line:
```typescript
storageBucket: "opilex-2a79f.firebasestorage.app",
```

To:
```typescript
storageBucket: "opilex-2a79f-storage",
```

Or run this script:
```bash
node scripts/updateFirebaseConfigForBucket.js opilex-2a79f-storage
```

### Step 3: Deploy Storage Rules

After updating config:

```bash
firebase deploy --only storage
```

### Step 4: Verify

```bash
node scripts/setupStorage.js
```

## ✅ Alternative Bucket Names

If `opilex-2a79f-storage` is taken, use any of these:
- `opilex-storage`
- `opilex-2a79f-app-storage`
- `opilex-2a79f-bucket`
- Any name without `.firebasestorage.app` or special domains

## 🎯 Quick Commands

After creating bucket in Google Cloud Console:

```bash
# Update Firebase config
node scripts/updateFirebaseConfigForBucket.js opilex-2a79f-storage

# Deploy rules
firebase deploy --only storage

# Verify
node scripts/setupStorage.js
```

## ✅ Done!

Your Storage will work with the regular bucket name. The `.firebasestorage.app` domain is optional - Firebase works with any valid Cloud Storage bucket name.

