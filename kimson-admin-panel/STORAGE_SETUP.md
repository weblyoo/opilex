# Firebase Storage Setup

## Issue
Firebase Storage needs to be initialized before deploying storage rules.

## ⚠️ IMPORTANT: Location Selection

**Your current data location doesn't support no-cost Storage buckets.**

You must choose a compatible region. See **STORAGE_LOCATION_GUIDE.md** for detailed instructions.

### Recommended Region: **us-central1** (Iowa)

## Steps to Fix

### 1. Initialize Firebase Storage

1. Go to [Firebase Console - Storage](https://console.firebase.google.com/project/opilex-2a79f/storage)
2. Click **"Get Started"** or **"Create bucket"**
3. **⚠️ CRITICAL:** Choose location: **us-central1** (Iowa) or another compatible region
   - ✅ Recommended: **us-central1** (supports no-cost tier)
   - ✅ Also supported: **us-east1**, **us-west1**, **europe-west1**, **asia-east1**
   - ❌ Avoid: Some regions don't support no-cost tier
4. Storage Class: Select **"Standard"**
5. Click **"Done"**

### 2. Deploy Storage Rules

After Storage is initialized, run:

```bash
firebase deploy --only storage
```

Or deploy all rules at once:

```bash
firebase deploy --only firestore:rules,storage
```

## Current Storage Rules

The `storage.rules` file includes:
- ✅ Slider images (10MB limit)
- ✅ Document PDFs (50MB limit)  
- ✅ Document images (10MB limit) - for Price List and Product Catalog

## Verification

After setup, verify in Firebase Console:
1. Go to Storage section
2. Check that buckets are created
3. Try uploading a file from the admin panel

## Troubleshooting

### "Storage not initialized" error
- Make sure you've completed step 1 above
- Wait a few minutes after initialization for services to propagate

### "Permission denied" errors
- Verify storage rules are deployed
- Check that you're logged in as admin
- Verify admin document exists in Firestore `admins` collection

