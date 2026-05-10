# Fix: Domain Verification Error for Storage Bucket

## ❌ Problem
Error: "To create a bucket named opilex-2a79f.firebasestorage.app, you must verify that you're authorized to use that domain name."

## ✅ Solution: Use Different Bucket Name

The `.firebasestorage.app` domain requires verification. Instead, create a regular Cloud Storage bucket.

### Option 1: Create Regular Bucket (Recommended)

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/storage/browser?project=opilex-2a79f

2. **Click "Create Bucket"**

3. **Use this name instead:**
   ```
   Name: opilex-2a79f-storage
   (or any name without .firebasestorage.app)
   ```

4. **Configure:**
   ```
   Location type: Single region
   Location: us-central1 (Iowa)
   Storage class: Standard
   Access control: Fine-grained
   ```

5. **Click "Create"**

6. **Update Firebase Config:**
   After creating, update your Firebase config to use this bucket name.

### Option 2: Let Firebase Auto-Create Bucket

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/opilex-2a79f/storage

2. **Click "Get Started"**

3. **Select location: us-central1**

4. **Firebase will automatically create the bucket with correct domain**

If this still gives errors, use Option 1.

### Option 3: Use Default Bucket Name Format

Create bucket with format: `PROJECT_ID.appspot.com`

```
Name: opilex-2a79f.appspot.com
Location: us-central1
```

This is the old format but still works.

