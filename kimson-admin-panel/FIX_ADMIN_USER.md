# 🔧 Fix Admin User Document

## Quick Fix

You need to ensure the admin user document in Firestore matches this exact structure:

```json
{
  "email": "superadmin@opilex.com",
  "role": "superAdmin",
  "name": "Admin User",
  "permissions": ["users", "authentications", "rewards", "transactions"],
  "createdAt": [server timestamp]
}
```

## ✅ Method 1: Using Firebase Console (EASIEST - Recommended)

**No authentication needed!** Just manually create/update in Firebase Console.

See: `QUICK_FIX_ADMIN_DOCUMENT.md` for step-by-step instructions.

**Quick Steps:**
1. Go to: https://console.firebase.google.com/project/opilex-2a79f/firestore
2. Open `admins` collection
3. Create/update document ID: `0GpunGg9R7NaLpsXZNfwyz2KfZd2`
4. Add fields: email, role, name, permissions, createdAt
5. Save

## ✅ Method 2: Using Script (Requires Password)

Run the update script with your password:

```bash
cd opilex-admin-panel
node scripts/updateAdminUser.js YourPassword
```

**Note**: Replace `YourPassword` with the actual Firebase Auth password.

This will:
1. Authenticate with Firebase
2. Update the admin document automatically

## ✅ Method 3: Using Firebase Console (Detailed Steps)

See detailed step-by-step instructions in: `scripts/fixAdminUserFirebaseConsole.md`

**Quick Steps:**
1. Go to: https://console.firebase.google.com/project/opilex-2a79f/firestore
2. Open `admins` collection
3. Find/create document with ID: `0GpunGg9R7NaLpsXZNfwyz2KfZd2`
4. Add fields:
   - `email`: "superadmin@opilex.com" (string)
   - `role`: "superAdmin" (string)
   - `name`: "Admin User" (string)
   - `permissions`: ["users", "authentications", "rewards", "transactions"] (array)
   - `createdAt`: [server timestamp] (timestamp)
5. Save

## ✅ Method 3: Using create-admin.html

1. Open `create-admin.html` in your browser
2. This will create both Auth user and Firestore document correctly

## ⚠️ Important Notes

- **Document ID** must match Firebase Auth UID exactly: `0GpunGg9R7NaLpsXZNfwyz2KfZd2`
- **Field names** are case-sensitive
- **Permissions** must be an array, not a string
- **createdAt** should be a server timestamp (not a regular timestamp)

## Verify

After fixing, verify:

1. Document exists in `admins` collection
2. All fields match the structure above
3. Document ID matches UID exactly
4. Try logging in: http://localhost:5173

## Still Not Working?

1. Check browser console (F12) for errors
2. Verify Email/Password auth is enabled
3. Check Firebase Auth user exists
4. Ensure Firestore rules allow admin access

