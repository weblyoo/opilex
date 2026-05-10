# Quick Firebase Storage Setup

## ⚠️ Current Issue
Your data location doesn't support no-cost Storage buckets. You need to select a compatible region.

## ✅ Quick Fix (2 minutes)

### Step 1: Initialize Storage with Correct Location

1. **Open this link:**
   [Firebase Storage Setup](https://console.firebase.google.com/project/opilex-3373e/storage)

2. **Click "Get Started"**

3. **Select Location:**
   - Choose: **us-central1** (Iowa)
   - ✅ This region supports the no-cost tier
   - ⚠️ Location cannot be changed later

4. **Storage Class:**
   - Select: **Standard** (default)

5. **Click "Done"**

### Step 2: Deploy Storage Rules

After Storage is initialized, run:

```bash
firebase deploy --only storage
```

## ✅ Done!

Your Storage is now ready. The Price List and Product Catalog pages will work.

## 🎯 Why us-central1?

- ✅ Supports no-cost tier (5 GB free)
- ✅ Good performance globally
- ✅ Most cost-effective
- ✅ Widely used and reliable

## 📋 Alternative Regions

If you prefer a different region:
- **us-east1** (South Carolina)
- **us-west1** (Oregon)
- **europe-west1** (Belgium)
- **asia-east1** (Taiwan)

All of these support the no-cost tier.

## ❓ Need Help?

See `STORAGE_LOCATION_GUIDE.md` for detailed instructions.

