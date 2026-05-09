# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Kimson App is a React Native mobile application (Expo/TypeScript) for authenticating Kimson wire purchases via QR code scanning and earning reward points. The app supports phone-based authentication (OTP), KYC verification, multi-language support (English, Hindi, Marathi, Gujarati), and a black-and-white themed UI design.

**Firebase Project**: `kimson-3373e`  
**Bundle ID**: `com.kimson.wireauth`

## Common Commands

### Development
```bash
# Start development server
npm start

# Run on Android (emulator or physical device)
npm run android

# Run on iOS simulator
npm run ios

# Run on web
npm run web
```

### Building for Production
```bash
# Build development APK
npx expo run:android

# Build production APK with EAS
eas build --platform android

# Build iOS
eas build --platform ios
```

### Firebase
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Test Firebase connection
node test-firebase.js
```

**Note**: Firebase CLI and deployment operations use project ID `kimson-3373e` (configured in `.firebaserc`).

## Architecture & Structure

### Core Architecture Pattern
The app uses a **Context-based state management** pattern with React Contexts for cross-cutting concerns:

- **AuthContext** (`src/contexts/AuthContext.tsx`): Manages authentication state, phone OTP flow, user profile, and Firebase authentication
- **ThemeContext** (`src/contexts/ThemeContext.tsx`): Manages theme mode (dark/light) with persistent storage

Both contexts wrap the entire app in `App.tsx` via `<ThemeProvider>` and `<AuthProvider>`, making theme and auth state available globally.

### Navigation Flow
Stack-based navigation (`@react-navigation/stack`) with authentication-gated routes:

1. **Pre-auth flow**: Splash → Language Selection → Welcome → Login → OTP Verification → Registration Type → Registration Details → KYC → GST Verification (dealers only)
2. **Post-auth flow**: Dashboard (main hub) → Feature screens (Wire Authentication, Rewards, Wallet, Profile, etc.)

All routes are defined in `src/navigation/AppNavigator.tsx`. The `AuthContext` determines initial route based on user authentication state.

### Authentication Architecture
**Dual-mode authentication system**:
- **Web**: Uses `RecaptchaVerifier` from Firebase Auth
- **Android/iOS**: Uses `PhoneAuthProvider.verifyPhoneNumber()` or Firebase REST API fallback with `appVerificationDisabledForTesting` for development

The `AuthContext` (`sendOTP`, `verifyOTP`) handles platform-specific logic. On successful OTP verification:
1. Creates/loads user document in Firestore (`users` collection)
2. Stores auth token and user data in AsyncStorage
3. Updates `user` state, triggering navigation to Dashboard

**Important**: SHA-1 and SHA-256 fingerprints must be configured in Firebase Console for Android OTP to work in production.

### Firebase Services Layer
Firestore operations are abstracted in `src/services/firestore.ts`:
- **Collections**: `users`, `wireAuthentications`, `rewards`, `transactions`
- **Services**: `userService`, `wireAuthService`, `rewardService`, `transactionService`, `analyticsService`

Each service provides CRUD operations with proper error handling and Firestore timestamps.

### Wire Authentication Flow
1. User scans QR code via `expo-camera` or enters code manually
2. Code validated (must start with `KIMSON_` and be >10 chars)
3. Check if code already authenticated (no duplicate redemptions)
4. Create authentication record in `wireAuthentications` collection
5. Award points to user (default 50 points per authentication)
6. Create reward record in `rewards` collection
7. Update user's `rewardPoints` field

### Development Mode vs Production
The app runs with **Sandbox API integration** (fully working) with automatic fallback:

- **Mock Auth** (`src/services/mockAuth.ts`): Accepts any phone/OTP for testing
- **Sandbox KYC** (`src/services/sandboxKYC.ts`): ✅ Working with correct OKYC format
- **Mock KYC** (`src/services/mockKYC.ts`): Automatic fallback for errors
- **Local Storage**: User data stored in AsyncStorage

**KYC Integration Status**:
- ✅ Sandbox OKYC API fully integrated and working
- ✅ Correct request format: `@entity`, `consent: 'Y'`, `reason` fields
- ✅ Using LIVE key for production environment
- ✅ Automatic Mock KYC fallback on API failures
- ✅ Production-ready for real Aadhaar verification

To switch to production:
1. Enable Firebase Phone Authentication in Firebase Console
2. Enable KYC permissions in Sandbox Dashboard (see `SANDBOX_API_FIX_GUIDE.md`)
3. Uncomment real service imports in screens (see `DEVELOPMENT_SETUP.md`)
4. Replace mock auth calls with real Firebase operations
5. Configure SHA fingerprints for Android

### Theme System
**Strictly black-and-white design** with two modes:
- **Dark theme** (default): Black background, white text/borders
- **Light theme**: White background, black text/borders

Theme switching persists to AsyncStorage and updates the entire UI reactively. Colors defined in `src/contexts/ThemeContext.tsx` with overlay and shadow variants for depth.

### Custom Components
Key reusable components in `src/components/`:
- **Button.tsx**: Themed button with press states
- **Input.tsx**: Themed text input with validation
- **Header.tsx**: Screen headers with back navigation and actions
- **Icon.tsx**: Large custom icon component with 70+ icon definitions
- **QRCodeScanner.tsx**: Camera-based QR scanning wrapper
- **ImageSlider.tsx**: Auto-scrolling banner carousel
- **NotificationDrawer.tsx**: Slide-out notification panel

### Type Definitions
All TypeScript types centralized in `src/types/index.ts`:
- `User`: User profile structure with KYC, points, registration details
- `WireAuthentication`: Wire scan record with product info
- `Reward`: Point transaction record
- `KYCVerification`: Aadhaar verification data
- `RootStackParamList`: Navigation route params (strongly typed)

## Important Development Notes

### Firebase Configuration
**Never commit real Firebase API keys**. The current `src/config/firebase.ts` contains hardcoded keys for the `kimson-3373e` project. For team development, move to environment variables:

```typescript
// Use expo-constants for env vars:
import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.firebaseApiKey;
```

### Phone Authentication Troubleshooting
Common issues:
1. **"MISSING_CLIENT_IDENTIFIER"**: SHA fingerprints not added to Firebase Console or not propagated (wait 5-10 min)
2. **"CAPTCHA required"**: App verification not configured (add SHA fingerprints)
3. **"OPERATION_NOT_ALLOWED"**: Phone auth provider not enabled in Firebase Console

See `FIREBASE_AUTH_ERROR_FIXES.md` for detailed solutions.

### Testing QR Codes
Valid test QR codes (must start with `KIMSON_`):
- `KIMSON_WIRE_BATCH001_2024`
- `KIMSON_WIRE_BATCH002_2024`
- `KIMSON_COPPER_TEST_2024`

Generate more codes using `generate-test-qr.html` or see `DUMMY_QR_CODES.md` for 40+ test codes.

### Firestore Security Rules
Rules deployed via `firebase deploy --only firestore:rules`. Current rules enforce:
- All reads/writes require authentication
- Users can only access their own documents
- Wire authentications and rewards are user-scoped

### Platform-Specific Code
The app uses `Platform.OS` checks for web vs native differences:
- **Web**: Requires `RecaptchaVerifier` setup for phone auth
- **Android**: Needs SHA fingerprints and may use REST API fallback
- **iOS**: Standard Firebase phone auth flow

### Fonts
Custom fonts loaded in `App.tsx`:
- **Ubuntu**: Light, Regular, Medium, Bold (from `@expo-google-fonts/ubuntu`)
- **Briller**: Bold, Black (custom TTF files in `assets/fonts/`)

Font loading happens in `App.tsx` before splash screen hides.

## Code Patterns to Follow

### Error Handling
Use centralized error handler in `src/utils/firebaseErrorHandler.ts`:
```typescript
import { getFirebaseErrorMessage, logFirebaseError } from '../utils/firebaseErrorHandler';

try {
  // operation
} catch (error: any) {
  logFirebaseError('operationName', error, { context: 'data' });
  const message = getFirebaseErrorMessage(error);
  throw new Error(message);
}
```

### Navigation
Use strongly-typed navigation props:
```typescript
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ScreenName'>;

interface Props {
  navigation: ScreenNavigationProp;
}
```

### Context Usage
Always use context hooks with error checking:
```typescript
const { user, loading } = useAuth(); // Throws if outside AuthProvider
const { theme, isDark } = useTheme(); // Throws if outside ThemeProvider
```

### Async Storage
Use utility functions in `src/utils/storage.ts`:
```typescript
import { getUserData, setUserData, getUserToken, setUserToken, clearStorage } from '../utils/storage';

// Get user
const user = await getUserData();

// Save user
await setUserData(userData);
```

### Firestore Timestamps
Always use `serverTimestamp()` for consistency:
```typescript
import { serverTimestamp } from 'firebase/firestore';

await setDoc(doc(db, 'users', userId), {
  ...data,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
```

## Screen Organization

The app has **30+ screens** organized by feature:

- **Auth screens**: Language selection, welcome, login, OTP, registration type/details, KYC, GST verification
- **Main screens**: Dashboard (hub), wire authentication, rewards, wallet, profile
- **Feature screens**: Tutorial, ledger, price list, product catalog, schemes, coupons, gold rewards, store locator, leadership board, refer & earn, help & support, about, social media, add account

Dashboard uses an 8-button grid layout for quick access to core features.

## Firebase Collections Schema

### `users`
```typescript
{
  id: string;              // Firebase Auth UID
  phoneNumber: string;     // +91XXXXXXXXXX
  name?: string;
  userType: 'electrician' | 'dealer';
  kycVerified: boolean;
  language: 'en' | 'hi' | 'mr' | 'gu';
  rewardPoints: number;
  createdAt: Timestamp;
  // Additional fields for registration
}
```

### `wireAuthentications`
```typescript
{
  userId: string;
  qrCode: string;          // Scanned code
  authenticatedAt: Timestamp;
  rewardPoints: number;    // Points awarded
  productInfo: {
    type: string;
    batch: string;
    manufacturingDate: Date;
  };
}
```

### `rewards`
```typescript
{
  userId: string;
  points: number;
  type: 'wire_authentication' | 'bonus' | 'referral';
  description: string;
  createdAt: Timestamp;
}
```

### `transactions`
```typescript
{
  userId: string;
  type: 'withdrawal' | 'redemption';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  requestedAt: Timestamp;
}
```

## Known Issues & Workarounds

### Issue: Sandbox API Insufficient Permissions
**Status**: ✅ FIXED with automatic mock fallback

The Sandbox test API key doesn't have KYC permissions enabled. The app now automatically falls back to Mock KYC when receiving 403 errors, allowing development to continue. To use real Sandbox API, enable KYC permissions in Sandbox Dashboard.

See `SANDBOX_API_FIX_GUIDE.md` for details.

### Issue: Mock Auth Service Import
`AuthContext.tsx` line 486 references `mockAuthService.getCurrentUser()` but doesn't import it. This is intentional for development mode. In production, replace with real Firestore calls.

### Issue: Windows Path Handling
The codebase contains many Windows-style paths in markdown docs. When working cross-platform, be aware of path separator differences.

### Issue: Expo New Architecture
`app.json` has `"newArchEnabled": true` for React Native's new architecture. If experiencing crashes, set to `false`.

## Additional Resources

- **Firebase Setup**: See `FIREBASE_SETUP_COMPLETE.md` for full Firebase configuration guide
- **Mobile OTP Setup**: See `MOBILE_OTP_SETUP_GUIDE.md` for phone authentication setup
- **APK Build Guide**: See `APK_BUILD_GUIDE.md` for production build instructions
- **Admin Panel**: See `ADMIN_PANEL_SETUP_GUIDE.md` for admin web interface setup (separate repo)

## Project-Specific Conventions

- **Always use TypeScript**: No plain JS files in `src/`
- **Theme-aware styling**: All components must use `useTheme()` hook for colors
- **AsyncStorage keys**: Prefix with `@kimson_` (e.g., `@kimson_user_data`)
- **Console logging**: Use descriptive prefixes with emojis (✅, ❌, ⚠️, 📤, 📥) for visibility
- **Firebase operations**: Always include try-catch with user-friendly error messages
- **Form validation**: Use validators from `src/utils/validators.ts` for phone numbers, Aadhaar, etc.

## When Making Changes

### Authentication Changes
If modifying auth flow, test both web and mobile platforms. Web requires reCAPTCHA setup; mobile requires SHA fingerprint configuration.

### UI/Theme Changes
Always test in both dark and light themes. Run `toggleTheme()` to verify colors, borders, and text remain visible.

### Firestore Changes
Update security rules in `firestore.rules` when adding new collections. Deploy rules before deploying app changes.

### Navigation Changes
Update `RootStackParamList` type in `src/types/index.ts` when adding/removing screens. TypeScript will enforce correct route params everywhere.

### Screen Development
New screens should:
1. Import and use `useTheme()` for styling
2. Use `useAuth()` to access user state
3. Define navigation prop type from `RootStackParamList`
4. Include `<Header>` component for consistent navigation
5. Wrap in `<SafeAreaView>` for proper spacing on notched devices
