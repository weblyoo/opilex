# 🔥 Firebase MCP Setup Guide

## What is Firebase MCP?
Firebase MCP (Model Context Protocol) setup refers to configuring Firebase for automated deployment and management using CLI tools.

## ✅ Quick Setup (Automated)

### Option 1: Run Setup Script (Recommended)

**Windows:**
```bash
setup-firebase.bat
```

**Linux/Mac:**
```bash
chmod +x setup-firebase.sh
./setup-firebase.sh
```

### Option 2: Manual Setup

#### Step 1: Login to Firebase
```bash
firebase login
```
This will open a browser window for authentication.

#### Step 2: Verify Project
```bash
firebase use opilex-3373e
```

#### Step 3: Deploy Rules
```bash
firebase deploy --only firestore:rules
```

#### Step 4: Test Connection
```bash
node test-firebase.js
```

## 📋 Project Structure

```
OpilexApp/
├── firebase.json          # Firebase configuration
├── .firebaserc            # Project ID configuration
├── firestore.rules        # Security rules (deployable)
├── firestore-rules.txt    # Original rules (reference)
├── deploy-firebase-rules.js  # Deployment script
├── setup-firebase.bat     # Windows setup script
└── setup-firebase.sh      # Linux/Mac setup script
```

## 🔧 Configuration Files

### `firebase.json`
```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

### `.firebaserc`
```json
{
  "projects": {
    "default": "opilex-3373e"
  }
}
```

### `firestore.rules`
Contains the security rules that will be deployed to Firebase.

## 🚀 Deployment Commands

### Deploy Rules Only
```bash
firebase deploy --only firestore:rules
```

### Deploy Everything
```bash
firebase deploy
```

### Check Deployment Status
```bash
firebase deploy --only firestore:rules --dry-run
```

## 📊 Verification

After deployment, test your setup:

```bash
node test-firebase.js
```

Expected output:
```
✅ Firebase App: Connected
✅ Firebase Auth: Connected
✅ Firestore: Connected
```

## 🔍 Troubleshooting

### Issue: "No authorized accounts"
**Solution:** Run `firebase login`

### Issue: "Project not found"
**Solution:** Verify project ID in `.firebaserc` matches Firebase Console

### Issue: "Permission denied"
**Solution:** 
1. Check you're logged in: `firebase login:list`
2. Verify project access in Firebase Console
3. Ensure you have Owner/Editor role

### Issue: Rules not updating
**Solution:**
1. Clear Firebase cache: `firebase cache:clear`
2. Redeploy: `firebase deploy --only firestore:rules --force`

## 📝 Next Steps After Setup

1. **Enable Phone Authentication**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Phone provider

2. **Test Authentication**
   - Update `src/contexts/AuthContext.tsx` to use real Firebase auth
   - Replace mock authentication

3. **Configure Security Rules**
   - Review `firestore.rules` for production needs
   - Update as needed for your use case

## 🔐 Security Notes

- Rules require user authentication (`request.auth != null`)
- Users can only access their own data
- Test collection is open for development (remove in production)

## 📞 Support

- **Firebase Console**: https://console.firebase.google.com/project/opilex-3373e
- **Firebase CLI Docs**: https://firebase.google.com/docs/cli
- **Firestore Rules**: https://firebase.google.com/docs/firestore/security/get-started

## ✅ Setup Checklist

- [ ] Firebase CLI installed
- [ ] Logged in to Firebase
- [ ] Project configured (`.firebaserc`)
- [ ] Rules file created (`firestore.rules`)
- [ ] Rules deployed successfully
- [ ] Test connection passes
- [ ] Phone authentication enabled
- [ ] App using real Firebase (not mock)

## 🎉 Success Indicators

When setup is complete, you should be able to:
- ✅ Deploy rules without errors
- ✅ Run `test-firebase.js` successfully
- ✅ Connect to Firestore from your app
- ✅ Authenticate users with phone numbers
- ✅ Store and retrieve data securely
