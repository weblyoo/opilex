# 🚀 Firebase Setup - START HERE

## Quick Setup (3 Steps)

### Step 1: Login to Firebase
Open PowerShell/Terminal in this folder and run:
```bash
firebase login
```
This will open your browser. Log in with your Google account that has access to the Firebase project.

### Step 2: Deploy Rules
After logging in, run:
```bash
firebase deploy --only firestore:rules
```

### Step 3: Test
Verify everything works:
```bash
node test-firebase.js
```

## ✅ That's It!

If you see "✅ Firestore connection successful!" - you're done!

## 🎯 Alternative: Use Setup Script

**Windows PowerShell:**
```powershell
.\setup-firebase.bat
```

## 📋 What Gets Created

- `firebase.json` - Firebase configuration ✅
- `.firebaserc` - Project ID (opilex-2a79f) ✅
- `firestore.rules` - Security rules ready to deploy ✅

## 🔧 Manual Option

If you prefer to deploy rules manually:
1. Go to: https://console.firebase.google.com/project/opilex-2a79f/firestore/rules
2. Copy contents from `firestore.rules`
3. Paste in Firebase Console
4. Click "Publish"

## 💡 Need Help?

See `FIREBASE_MCP_SETUP.md` for detailed instructions.
