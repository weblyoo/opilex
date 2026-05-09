# Firebase Setup Guide for Kimson Admin Panel

This document outlines the Firebase configuration and setup for the admin panel.

## ✅ Current Setup Status

- ✅ Firebase Project: `kimson-3373e`
- ✅ Web App: Configured and active
- ✅ Firestore Security Rules: Created and validated
- ✅ Storage Security Rules: Created and validated
- ✅ Firestore Indexes: Configured
- ✅ Firebase Configuration Files: Created

## 📁 Configuration Files

### Created Files

1. **`firebase.json`** - Main Firebase project configuration
2. **`.firebaserc`** - Project aliases configuration
3. **`firestore.rules`** - Firestore security rules
4. **`storage.rules`** - Firebase Storage security rules
5. **`firestore.indexes.json`** - Firestore composite indexes

### Environment Variables

The Firebase config now supports environment variables. Create a `.env` file (see `.env.example`):

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=kimson-3373e.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kimson-3373e
VITE_FIREBASE_STORAGE_BUCKET=kimson-3373e.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1002505057634
VITE_FIREBASE_APP_ID=1:1002505057634:web:fe5a29d0d3945c850ae83b
VITE_FIREBASE_MEASUREMENT_ID=G-40Z3KKDR4Y
```

## 🔐 Security Rules

### Firestore Rules

- **Admins**: Only authenticated admins (users in `admins` collection) can manage data
- **Users**: Can read/write their own data, admins can access all
- **Wire Authentications**: Users can create, read own. Admins can read all
- **Rewards**: Users can read own, only admins can write
- **Transactions**: Users can create/read own, only admins can update
- **Sliders**: Readable by all authenticated users, writable only by admins
- **Settings**: Readable by all, writable only by admins

### Storage Rules

- **Sliders**: Max 10MB, image files only, admins can upload, authenticated users can read
- **Documents**: Max 50MB, PDF files only, admins can upload, authenticated users can read

## 📊 Firestore Indexes

The following composite indexes are configured:

1. `users` - Order by `createdAt` descending
2. `wireAuthentications` - Order by `authenticatedAt` descending
3. `wireAuthentications` - Where `userId` + Order by `authenticatedAt` descending
4. `rewards` - Order by `createdAt` descending
5. `rewards` - Where `userId` + Order by `createdAt` descending
6. `transactions` - Order by `requestedAt` descending
7. `transactions` - Where `status` + Order by `requestedAt` descending
8. `transactions` - Order by `createdAt` descending
9. `sliders/{kind}/items` - Order by `order` ascending

## 🔑 Firebase Authentication Setup

### Required: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `kimson-3373e`
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### Create Admin User

After enabling Email/Password auth, create an admin user:

```bash
# Option 1: Use the provided script
node scripts/createAdmin.js

# Option 2: Create manually in Firebase Console
# 1. Go to Authentication > Users
# 2. Click "Add user"
# 3. Enter email and password
# 4. Create user
# 5. Go to Firestore > admins collection
# 6. Create document with user's UID
# 7. Add fields: { role: "admin", email: "user@example.com" }
```

## 🚀 Deployment

### Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy both
firebase deploy --only firestore,storage
```

### Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### Deploy Hosting (Optional)

```bash
# Build the app first
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 📝 Firebase Collections

### Required Collections

1. **`admins`** - Admin user records
   - Document ID: User UID
   - Fields: `role`, `email`, `name`, `createdAt`

2. **`users`** - Regular app users
   - Fields: `phoneNumber`, `name`, `rewardPoints`, `createdAt`

3. **`wireAuthentications`** - Wire authentication records
   - Fields: `userId`, `authenticatedAt`

4. **`rewards`** - Reward transactions
   - Fields: `userId`, `points`, `type`, `description`, `createdAt`

5. **`transactions`** - Withdrawal transactions
   - Fields: `userId`, `amount`, `status`, `requestedAt`, `processedAt`

6. **`sliders/{kind}/items`** - Slider items (tips/offers)
   - Fields: `title`, `subtitle`, `imageUrl`, `order`, `active`, `createdAt`

7. **`settings/documents/{kind}`** - Document settings
   - Fields: `title`, `url`, `updatedAt`

## 🔍 Verification Checklist

- [ ] Firebase project is active
- [ ] Web app is registered
- [ ] Email/Password authentication is enabled
- [ ] At least one admin user exists in Firestore `admins` collection
- [ ] Firestore security rules are deployed
- [ ] Storage security rules are deployed
- [ ] Firestore indexes are created/deployed
- [ ] Environment variables are set (optional but recommended)
- [ ] Admin panel can connect and authenticate

## 🛠️ Troubleshooting

### Admin Login Issues

1. Verify user exists in Firebase Authentication
2. Verify user document exists in `admins` collection with correct UID
3. Check Firestore rules allow admin access
4. Check browser console for errors

### Index Errors

If you see "index required" errors:
1. Go to Firebase Console > Firestore > Indexes
2. Check if indexes are building (may take a few minutes)
3. Or deploy indexes: `firebase deploy --only firestore:indexes`

### Storage Upload Issues

1. Verify Storage rules are deployed
2. Check file size limits (10MB for images, 50MB for PDFs)
3. Verify user is authenticated as admin
4. Check file type matches rules (images for sliders, PDFs for documents)

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/project/kimson-3373e)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)

