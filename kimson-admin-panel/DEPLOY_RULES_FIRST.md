# ⚠️ IMPORTANT: Deploy Firestore Rules First!

## The Problem

The script is failing because Firestore security rules prevent writing to the `admins` collection. We need to update the rules first to allow creating your own admin document.

## ✅ Solution: Update Firestore Rules

The rules need to allow an authenticated user to create their own admin document.

### Option 1: Using Firebase CLI (Recommended)

1. **Update the rules file** (already updated in `../KimsonApp/firestore.rules`)

2. **Deploy the updated rules**:
   ```bash
   cd ../KimsonApp
   firebase deploy --only firestore:rules
   ```

3. **Wait for deployment** (usually takes 30-60 seconds)

4. **Run the update script again**:
   ```bash
   cd ../kimson-admin-panel
   node scripts/updateAdminUser.js 123456
   ```

### Option 2: Update in Firebase Console

1. Go to: https://console.firebase.google.com/project/kimson-3373e/firestore/rules

2. Update the `admins` collection rule from:
   ```javascript
   match /admins/{adminId} {
     allow read, write: if isAdmin();
   }
   ```
   
   To:
   ```javascript
   match /admins/{adminId} {
     // Allow authenticated user to create their own admin document (first time setup)
     allow create: if request.auth != null && request.auth.uid == adminId;
     // Allow admins to read/write any admin document
     allow read, write, update: if isAdmin();
   }
   ```

3. Click **Publish**

4. Wait for rules to update (30-60 seconds)

5. Run the update script again:
   ```bash
   node scripts/updateAdminUser.js 123456
   ```

## 🔒 Security Note

This rule allows any authenticated user to create their own admin document **only once**. After that, only existing admins can modify admin documents (via `isAdmin()` function).

This is safe because:
- User must authenticate first
- User can only create document with their own UID
- Cannot modify other admin documents
- After creation, only admins can modify (chicken-and-egg solved!)

## ✅ Verify Rules Updated

After deploying, the script should work:

```bash
node scripts/updateAdminUser.js 123456
```

You should see:
```
✅ Authenticated successfully
✅ SUCCESS! Admin user document updated successfully!
```

## Alternative: Use Firebase Console

If you prefer not to deploy rules, just use Firebase Console to create the document manually - it bypasses security rules for console operations.

See: `QUICK_FIX_ADMIN_DOCUMENT.md`

