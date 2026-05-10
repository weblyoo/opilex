# Firebase Setup Instructions for Opilex App

## ✅ Current Status
Firebase is **successfully connected** and all services are properly initialized:
- ✅ Firebase App
- ✅ Firebase Authentication  
- ✅ Firestore Database
- ✅ Firebase Functions
- ✅ Firebase Analytics

## 🔧 Required Setup Steps

### 1. Deploy Firestore Security Rules
The security rules are ready in `firestore-rules.txt`. You need to deploy them to your Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `opilex-2a79f`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents from `firestore-rules.txt` and paste them
5. Click **Publish**

### 2. Enable Authentication Methods
Currently, the app is configured for phone authentication:

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Phone** authentication
3. Add your app's domains to the authorized domains list

### 3. Configure Phone Authentication for React Native

For production phone authentication, you'll need to:

#### For Android:
1. Add SHA-1 and SHA-256 fingerprints to your Firebase project
2. Download the updated `google-services.json`
3. Install additional dependencies:
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/auth
   ```

#### For iOS:
1. Download the updated `GoogleService-Info.plist`
2. Install additional dependencies (same as Android)

### 4. Test Firebase Connection
Run the test script to verify everything is working:
```bash
node test-firebase-simple.js
```

## 📱 Current App Configuration

### Firebase Configuration
The app is configured with your Firebase project:
- **Project ID**: opilex-2a79f
- **Auth Domain**: opilex-2a79f.firebaseapp.com
- **API Key**: AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c

### Features Ready
- ✅ User registration and authentication
- ✅ Firestore data operations
- ✅ Wire authentication system
- ✅ Reward points system
- ✅ User profile management

### Mock Authentication
For development purposes, there's a mock authentication system in `src/services/mockAuth.ts` that you can use while setting up phone authentication.

## 🚀 Next Steps

1. **Deploy Firestore Rules** (Required for data operations)
2. **Enable Phone Authentication** (Required for user login)
3. **Configure platform-specific setup** for production
4. **Test the app** with real authentication

## 🔍 Troubleshooting

If you encounter permission errors:
1. Check that Firestore rules are deployed
2. Ensure authentication is enabled
3. Verify that users are properly authenticated before accessing data

## 📞 Support
If you need help with any of these steps, the Firebase documentation provides detailed guides for each platform and authentication method.
