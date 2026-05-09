# Opilex App

A React Native app built with Expo for authenticating Opilex wire purchases and earning rewards.

## Features

- **User Authentication**: Phone number and OTP-based authentication
- **Multi-language Support**: English, Hindi, Marathi, and Gujarati
- **Wire Authentication**: QR code scanning and manual code entry
- **Rewards System**: Earn points for authentic wire verification
- **Wallet**: Convert points to cash and track transactions
- **KYC Integration**: Aadhar-based verification
- **User Profiles**: Manage account information and preferences

## Technologies Used

- **Frontend**: Expo (React Native) with TypeScript
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Navigation**: React Navigation 6
- **UI Theme**: Black and white minimalist design

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for device testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OpilexApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication (Phone provider)
   - Create a Firestore database
   - Download the config and update `src/config/firebase.ts`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press 'a' for Android emulator, 'i' for iOS simulator

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   └── Input.tsx
├── config/             # Configuration files
│   ├── firebase.ts
│   └── theme.ts
├── navigation/         # Navigation setup
│   └── AppNavigator.tsx
├── screens/           # App screens
│   ├── SplashScreen.tsx
│   ├── LanguageSelectionScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── OTPVerificationScreen.tsx
│   ├── RegistrationScreen.tsx
│   ├── KYCScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── WireAuthenticationScreen.tsx
│   ├── RewardsScreen.tsx
│   ├── WalletScreen.tsx
│   └── ProfileScreen.tsx
└── types/             # TypeScript type definitions
    └── index.ts
```

## App Flow

1. **Splash Screen** → **Language Selection** → **Welcome**
2. **Login** → **OTP Verification**
3. **Registration** (for new users) → **KYC Verification**
4. **Dashboard** (main app interface)

## Key Features Implementation

### Authentication Flow
- Phone number input with validation
- OTP verification using Firebase Auth
- User registration with role selection (Electrician/Retailer)
- KYC verification with Aadhar integration

### Wire Authentication
- QR code scanning using expo-camera
- Manual code entry option
- Real-time verification with reward points
- Authentication history tracking

### Rewards & Wallet
- Points accumulation system
- Cash conversion functionality
- Transaction history
- Withdrawal requests

### Dashboard
- 8-button grid layout as specified
- Banners for offers and updates
- Quick access to all major features
- Recent activity display

## Design System

The app follows a strict black and white color scheme:
- **Background**: Black (#000000)
- **Text**: White (#FFFFFF)
- **Accents**: Gray (#808080)
- **Borders**: White (#FFFFFF)

## Build & Deployment

### Development Build
```bash
npx expo build:android
npx expo build:ios
```

### Production Build
```bash
eas build --platform android
eas build --platform ios
```

### App Store Deployment
1. Configure app.json with proper metadata
2. Generate app icons and splash screens
3. Build production version
4. Submit to Google Play Store and Apple App Store

## Environment Variables

Create a `.env` file in the root directory:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary and confidential. All rights reserved.
