# Quick Admin Setup Guide

## Current Situation
- ✅ User `admin@kimson.com` exists in Firebase Authentication
- ❌ User is NOT in Firestore `admins` collection
- User ID: `LnDHQWN8uQaQQPKCBpCLvNXDWgu1`

## Solution Options

### Option 1: Use Script with Password (Recommended)

If you know the password for `admin@kimson.com`:

```bash
# Use the addExistingAdmin script
node scripts/addExistingAdmin.js admin@kimson.com <your-password>
```

This will:
1. Sign in with your credentials
2. Add your user to the `admins` collection
3. Set your role as `superAdmin`

### Option 2: Manual Setup in Firebase Console (Easiest)

1. Go to [Firebase Console - Firestore](https://console.firebase.google.com/project/kimson-3373e/firestore)
2. Click on **"admins"** collection (create it if it doesn't exist)
3. Click **"Add document"**
4. Set **Document ID** to: `LnDHQWN8uQaQQPKCBpCLvNXDWgu1`
5. Add the following fields:

```json
{
  "email": "admin@kimson.com",
  "role": "superAdmin",
  "name": "Admin User",
  "permissions": [
    "users",
    "authentications",
    "rewards",
    "transactions",
    "sliders",
    "documents",
    "analytics",
    "settings"
  ],
  "createdAt": [Click "Timestamp" and select "Server timestamp"],
  "updatedAt": [Click "Timestamp" and select "Server timestamp"]
}
```

6. Click **"Save"**

### Option 3: Reset Password and Use Script

If you don't remember the password:

1. Go to [Firebase Console - Authentication](https://console.firebase.google.com/project/kimson-3373e/authentication/users)
2. Find `admin@kimson.com`
3. Click the three dots menu → **"Reset password"**
4. Send password reset email
5. Reset your password
6. Then use Option 1 with the new password

## Verification

After setup, verify:

1. Go to [Firestore Console](https://console.firebase.google.com/project/kimson-3373e/firestore/data/~2Fadmins~2FLnDHQWN8uQaQQPKCBpCLvNXDWgu1)
2. You should see the admin document with all fields

## Login

Once set up, you can login to the admin panel:

- **URL**: http://localhost:5173/login (or your deployed URL)
- **Email**: admin@kimson.com
- **Password**: Your Firebase Auth password

## Troubleshooting

### "Permission denied" error
- Make sure Firestore security rules are deployed:
  ```bash
  firebase deploy --only firestore:rules
  ```

### "User not found" error
- Verify the user exists in Firebase Authentication
- Check the email is correct: `admin@kimson.com`

### Still can't login
- Check browser console for errors
- Verify Firestore rules allow admin access
- Ensure the `admins` collection exists and has your UID

## Need Help?

Check `FIREBASE_SETUP.md` for detailed Firebase configuration guide.

