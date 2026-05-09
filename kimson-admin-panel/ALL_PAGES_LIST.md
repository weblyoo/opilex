# Complete List of All Pages/Screens in Kimson App

## Overview
This document contains a complete list of all pages/screens available in the Kimson application.

---

## Total Pages: 27

---

## 🔐 Authentication & Onboarding Flow (7 pages)

1. **Splash Screen** (`SplashScreen.tsx`)
   - Route: `Splash`
   - Initial screen shown when app launches
   - Displays app logo and branding

2. **Language Selection Screen** (`LanguageSelectionScreen.tsx`)
   - Route: `LanguageSelection`
   - Allows users to select preferred language (English, Hindi, Marathi, Gujarati)
   - First screen after splash

3. **Welcome Screen** (`WelcomeScreen.tsx`)
   - Route: `Welcome`
   - Welcome message and introduction to the app
   - "Get Started" button to proceed

4. **Login Screen** (`LoginScreen.tsx`)
   - Route: `Login`
   - Phone number input for OTP login
   - Displays "Welcome to kimson" text

5. **OTP Verification Screen** (`OTPVerificationScreen.tsx`)
   - Route: `OTPVerification`
   - Parameters: `{ phoneNumber: string, verificationId: string }`
   - Verifies OTP code sent to user's phone

6. **Registration Type Screen** (`RegistrationTypeScreen.tsx`)
   - Route: `RegistrationType`
   - Allows users to select registration type (Electrician or Dealer)

7. **Registration Details Screen** (`RegistrationDetailsScreen.tsx`)
   - Route: `RegistrationDetails`
   - Parameters: `{ userType: 'electrician' | 'dealer' }`
   - Collects user registration details based on selected type

8. **Registration Screen** (`RegistrationScreen.tsx`)
   - Route: `Registration`
   - Final registration step to complete user account setup

---

## ✅ Verification & Compliance (2 pages)

9. **KYC Screen** (`KYCScreen.tsx`)
   - Route: `KYC`
   - Know Your Customer (KYC) verification
   - Identity verification process

10. **GST Verification Screen** (`GSTVerificationScreen.tsx`)
    - Route: `GSTVerification`
    - GST number verification for dealers
    - Tax compliance verification

---

## 🏠 Main App Screens (15 pages)

11. **Dashboard Screen** (`DashboardScreen.tsx`)
    - Route: `Dashboard`
    - Main hub after login
    - Shows different buttons based on user type (Electrician/Dealer)
    - Contains sliders, buttons, and quick actions
    - Fixed "Scan Now" button at bottom

12. **Profile Screen** (`ProfileScreen.tsx`)
    - Route: `Profile`
    - User profile information
    - Edit profile details
    - Account settings

13. **Wallet Screen** (`WalletScreen.tsx`)
    - Route: `Wallet`
    - Digital wallet functionality
    - Balance display and transaction history

14. **Add Account Screen** (`AddAccountScreen.tsx`)
    - Route: `AddAccount`
    - Add bank account for payments
    - Manage linked accounts

15. **Rewards Screen** (`RewardsScreen.tsx`)
    - Route: `Rewards`
    - View rewards and points
    - Purchase history
    - Points redemption options

16. **Redeem Points Screen** (`RedeemPointsScreen.tsx`)
    - Route: `RedeemPoints`
    - Redeem accumulated points
    - UPI redemption options
    - Points to cash conversion

17. **Wire Authentication Screen** (`WireAuthenticationScreen.tsx`)
    - Route: `WireAuthentication`
    - QR code scanning for wire authentication
    - Product verification
    - Authenticity check

---

## 💼 Business & Trading Screens (4 pages)

18. **Schemes Screen** (`SchemesScreen.tsx`)
    - Route: `Schemes`
    - Available schemes and offers
    - Dealer-specific schemes
    - Special promotions

19. **Price List Screen** (`PriceListScreen.tsx`)
    - Route: `PriceList`
    - Product pricing information
    - Dealer pricing details
    - Price catalog

20. **Product Catalog Screen** (`ProductCatalogScreen.tsx`)
    - Route: `ProductCatalog`
    - Browse product catalog
    - Product details and specifications
    - Available for both Electrician and Dealer

21. **Coupons Screen** (`CouponsScreen.tsx`)
    - Route: `Coupons`
    - Available coupons and discounts
    - Coupon redemption

---

## 📊 Financial & Records (2 pages)

22. **Ledger Screen** (`LedgerScreen.tsx`)
    - Route: `Ledger`
    - Dealer-specific ledger
    - Account statements
    - Financial records

23. **Gold Screen** (`GoldScreen.tsx`)
    - Route: `Gold`
    - Gold-related services
    - Gold trading/investment features

---

## 🎯 Engagement & Support Screens (5 pages)

24. **Social Media Screen** (`SocialMediaScreen.tsx`)
    - Route: `SocialMedia`
    - Social media links and follow options
    - Connect on social platforms

25. **Leadership Board Screen** (`LeadershipBoardScreen.tsx`)
    - Route: `LeadershipBoard`
    - Leaderboard rankings
    - Top performers
    - Achievement display

26. **Tutorial Screen** (`TutorialScreen.tsx`)
    - Route: `Tutorial`
    - App tutorials and guides
    - How-to videos and instructions

27. **Help & Support Screen** (`HelpSupportScreen.tsx`)
    - Route: `HelpSupport`
    - Customer support options
    - FAQs and help articles
    - Contact support

---

## 📍 Location & Information (2 pages)

28. **Store Locator Screen** (`StoreLocatorScreen.tsx`)
    - Route: `StoreLocator`
    - Find nearby stores
    - Store locations on map
    - Contact store information

29. **About Screen** (`AboutScreen.tsx`)
    - Route: `About`
    - About the app
    - Company information
    - App version and details

---

## 📝 Refer & Earn (1 page)

30. **Refer and Earn Screen** (`ReferAndEarnScreen.tsx`)
    - Route: `ReferAndEarn`
    - Referral program
    - Share referral code
    - Earn rewards for referrals

---

## Summary by Category

| Category | Count | Pages |
|----------|-------|-------|
| **Authentication & Onboarding** | 8 | Splash, LanguageSelection, Welcome, Login, OTPVerification, RegistrationType, RegistrationDetails, Registration |
| **Verification & Compliance** | 2 | KYC, GSTVerification |
| **Main App** | 1 | Dashboard |
| **User Management** | 2 | Profile, AddAccount |
| **Financial** | 3 | Wallet, Rewards, RedeemPoints |
| **Business & Trading** | 4 | Schemes, PriceList, ProductCatalog, Coupons |
| **Financial Records** | 2 | Ledger, Gold |
| **Engagement** | 4 | SocialMedia, LeadershipBoard, Tutorial, HelpSupport |
| **Information** | 2 | StoreLocator, About |
| **Referral** | 1 | ReferAndEarn |
| **Core Feature** | 1 | WireAuthentication |
| **TOTAL** | **30** | |

---

## Navigation Flow

### Initial Flow:
1. Splash → LanguageSelection → Welcome → Login → OTPVerification

### Registration Flow:
2. RegistrationType → RegistrationDetails → Registration → KYC → (Optional) GSTVerification

### Main App Flow:
3. Dashboard → (Various screens based on button selection)

---

## User Type Specific Screens

### Electrician (12 buttons):
- Add Account, Wallet, Redeem UPI, Purchase History, Transaction, Catalogs, Authenticate, Refer, Social Media, Leadership, Tutorial, QR Scan

### Dealer (15 buttons):
- Add Account, Wallet, Redeem UPI, Purchase History, Transaction, Scheme, Price List, Catalogs, Authenticate, Refer, Ledger, Social Media, Leadership, Tutorial, QR Scan

---

## Notes

- All screens support internationalization (i18n) with 4 languages: English, Hindi, Marathi, Gujarati
- Theme support: Dark mode and Light mode
- Screens are organized by functional categories
- Dashboard is the main hub after authentication
- Some screens are user-type specific (e.g., Ledger, Schemes for Dealers only)

---

**Last Updated:** Based on current navigation configuration and screen files
**Total Screens:** 30 pages/screens
