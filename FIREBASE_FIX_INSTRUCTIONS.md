# 🔥 Firebase Permission Error - Fix Instructions

## Error: `PERMISSION_DENIED: Missing or insufficient permissions`

This error occurs because **Firestore security rules haven't been deployed yet**. The Firebase connection is working, but the database requires security rules to allow operations.

## ✅ Quick Fix (5 minutes)

### Step 1: Deploy Firestore Security Rules

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Sign in with your Google account
   - Select project: **kimson-3373e**

2. **Navigate to Firestore Rules**
   - Click on **Firestore Database** in the left menu
   - Click on the **Rules** tab (at the top)

3. **Deploy the Rules**
   - Open `firestore-rules.txt` in this project
   - Copy the entire content (starting from `rules_version = '2';`)
   - Paste it into the Firebase Console Rules editor
   - Click **Publish**

### Step 2: Enable Phone Authentication

1. **Go to Authentication**
   - In Firebase Console, click **Authentication** in the left menu
   - Click **Sign-in method** tab

2. **Enable Phone Provider**
   - Find **Phone** in the providers list
   - Click on it and toggle **Enable**
   - Click **Save**

3. **Configure for Production**
   - For production, you'll need to add SHA fingerprints (Android) or configure bundle ID (iOS)

### Step 3: Test Again

Run the test:
```bash
node test-firebase.js
```

You should now see:
```
✅ Firestore connection successful!
```

## 📋 Security Rules (Copy from firestore-rules.txt)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Wire authentications - users can create and read their own
    match /wireAuthentications/{authId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Rewards - users can read their own
    match /rewards/{rewardId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Transactions - users can create and read their own
    match /transactions/{transactionId} {
      allow create, read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🔍 Alternative: Test Mode (Temporary)

If you want to test quickly without deploying rules first, you can temporarily use test mode:

**⚠️ WARNING: Only for development/testing. NEVER use in production!**

In Firebase Console > Firestore > Rules, use this temporary rule:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Then deploy the proper rules from `firestore-rules.txt` before going to production!

## 📞 Need Help?

- **Firebase Console**: https://console.firebase.google.com/project/kimson-3373e
- **Firestore Rules Docs**: https://firebase.google.com/docs/firestore/security/get-started
- **Phone Auth Setup**: https://firebase.google.com/docs/auth/web/phone-auth

## ✅ Verification Checklist

After completing the steps above:

- [ ] Firestore rules deployed
- [ ] Phone authentication enabled
- [ ] Test script runs without permission errors
- [ ] Can read from Firestore
- [ ] Can write to Firestore (with authentication)

## 🚀 After Fixing

Once the rules are deployed, your app will be able to:
- ✅ Authenticate users with phone numbers
- ✅ Store user data in Firestore
- ✅ Record wire authentications
- ✅ Track rewards and transactions

The mock authentication in the app will continue to work during development, but you can now also test with real Firebase authentication!
