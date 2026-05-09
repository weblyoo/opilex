# Kimson App - Development Setup

## 🔧 Current Development Mode

The app is currently configured for **development/testing mode** using mock services instead of real Firebase operations.

### Mock Services Active

- ✅ **Authentication**: Using `mockAuthService` for OTP/login simulation
- ✅ **User Management**: Local storage with AsyncStorage
- ✅ **Wire Authentication**: Mock validation and point rewards
- ✅ **Dashboard Data**: Mock recent activities and rewards

### How to Test

#### 1. Complete Authentication Flow
```
Login Phone: Any 10-digit number (e.g., 9876543210)
OTP: Any 6 digits (e.g., 123456)
Registration: Choose Electrician or Retailer
KYC Aadhar: Any 12 digits (e.g., 123456789012)
KYC OTP: Any 6 digits (e.g., 654321)
```

#### 2. Wire Authentication Testing
```
Valid Codes (will succeed):
- KIMSON_WIRE_BATCH001_2024
- KIMSON_WIRE_BATCH002_2024
- KIMSON_COPPER_TEST_2024

Invalid Codes (will fail):
- FAKE_WIRE_123
- OLD_BATCH_2020
- Any code not starting with "KIMSON_"
```

#### 3. Expected Results
- **After KYC**: 100 welcome bonus points
- **After Wire Auth**: +50 points per successful authentication
- **Dashboard**: Shows mock recent activities

### Switch to Production

To enable real Firebase services, update these files:

#### 1. DashboardScreen.tsx
```typescript
// Uncomment these lines:
// import { wireAuthService, rewardService } from '../services/firestore';

// In loadDashboardData(), uncomment:
// const authentications = await wireAuthService.getUserAuthentications(user.id);
// const rewards = await rewardService.getUserRewards(user.id);
```

#### 2. WireAuthenticationScreen.tsx
```typescript
// Uncomment:
// import { wireAuthService, analyticsService } from '../services/firestore';

// Replace mock authentication with:
// const authentication = await wireAuthService.authenticateWire(user.id, code);
```

#### 3. AuthContext.tsx
```typescript
// Enable real Firebase auth in sendOTP and verifyOTP methods
```

## 🔥 Firebase Setup Required for Production

1. **Authentication**: Enable Phone provider in Firebase Console
2. **Firestore**: Apply security rules from `firestore-rules.txt`
3. **Collections**: Create `users`, `wireAuthentications`, `rewards`, `transactions`

## 📱 Current App Status

- ✅ **Fully Functional UI/UX**
- ✅ **Complete Authentication Flow**
- ✅ **Wire Scanning & Authentication**
- ✅ **Points & Rewards System**
- ✅ **User Profile Management**
- ✅ **Black & White Theme**
- ✅ **Multi-language Support Structure**

The app is production-ready in terms of UI/UX and can be easily switched to real Firebase services when ready for deployment.
