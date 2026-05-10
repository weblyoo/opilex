# QR Code Generator System with User Type Validation - Analysis & Design

## Overview
This document outlines the design for a QR code generator system that creates separate QR codes for Electricians and Dealers, with validation to ensure QR codes can only be scanned by the matching user type.

## Current System Analysis

### Existing QR Code System
1. **Admin Panel**: `src/pages/GenerateRewardQR.tsx`
   - Generates reward QR codes
   - Stores QR codes in Firestore `rewardQRCodes` collection
   - QR code data structure:
     ```json
     {
       "type": "opilex_reward",
       "rewardId": "REWARD-{timestamp}-{random}",
       "points": number,
       "description": string,
       "createdAt": ISO string
     }
     ```

2. **Firestore Structure** (`rewardQRCodes` collection):
   ```typescript
   {
     rewardId: string;
     points: number;
     description: string;
     used: boolean;
     usedBy: string | null;
     usedAt: Timestamp | null;
     createdAt: Timestamp;
     createdBy: string; // admin user ID
   }
   ```

3. **Mobile App Scanning**: `src/screens/WireAuthenticationScreen.tsx`
   - Scans QR codes via `QRCodeScanner` component
   - Processes reward QR codes in `processRewardQR` function
   - Validates QR code exists and is unused
   - Awards points and marks QR code as used

4. **User Type System**:
   - Users have `userType: 'electrician' | 'dealer'` field
   - Set during registration in `RegistrationDetailsScreen.tsx`
   - Used throughout app to show/hide features (e.g., Dashboard buttons, Ledger GST section)

## Requirements

### Functional Requirements
1. **QR Code Generation (Admin Panel)**:
   - Admin must select user type (Electrician or Dealer) when generating QR code
   - QR code must be tagged with the selected user type
   - QR code data must include user type information

2. **QR Code Validation (Mobile App)**:
   - When scanning QR code, validate user type matches QR code type
   - Electrician QR codes can only be scanned by Electricians
   - Dealer QR codes can only be scanned by Dealers
   - Show appropriate error message if user type doesn't match

3. **Security**:
   - Ensure validation happens on both client and server side (Firestore rules)
   - Prevent unauthorized access to QR codes
   - Track which user type scanned which QR code

### Non-Functional Requirements
1. **User Experience**:
   - Clear error messages when QR code type doesn't match
   - Smooth scanning experience
   - Visual indication of QR code type (optional: in admin panel)

2. **Data Integrity**:
   - Ensure user type is stored correctly in Firestore
   - Maintain backward compatibility (optional: handle old QR codes without userType)

## Proposed Solution

### 1. Database Schema Update

**Firestore `rewardQRCodes` collection** - Add `userType` field:
```typescript
{
  rewardId: string;
  points: number;
  description: string;
  userType: 'electrician' | 'dealer'; // NEW FIELD
  used: boolean;
  usedBy: string | null;
  usedAt: Timestamp | null;
  createdAt: Timestamp;
  createdBy: string;
}
```

### 2. QR Code Data Structure Update

**Embedded QR Code JSON** - Add `userType` field:
```json
{
  "type": "opilex_reward",
  "rewardId": "REWARD-{timestamp}-{random}",
  "points": number,
  "description": string,
  "userType": "electrician" | "dealer", // NEW FIELD
  "createdAt": ISO string
}
```

### 3. Admin Panel Updates (`src/pages/GenerateRewardQR.tsx`)

**Changes Required**:
1. Add user type selection dropdown/radio buttons
2. Include `userType` in QR code data JSON
3. Store `userType` in Firestore document
4. Update UI to show selected user type
5. Add visual indicators (e.g., "Electrician QR Code" or "Dealer QR Code")

**UI Components**:
- Radio buttons or dropdown for user type selection
- Clear labels: "Electrician" and "Dealer"
- Required field validation

### 4. Mobile App Updates (`src/screens/WireAuthenticationScreen.tsx`)

**Changes Required**:
1. Extract `userType` from scanned QR code data
2. Validate user type matches current user's user type
3. Show error message if types don't match
4. Only proceed with reward processing if types match

**Error Messages**:
- "This QR code is for [Electrician/Dealer] users only. You are registered as [Electrician/Dealer]."
- "Invalid QR code type"

### 5. Firestore Security Rules Update (`firestore.rules`)

**Current Rule**:
```javascript
match /rewardQRCodes/{qrId} {
  allow read: if request.auth != null;
  allow create: if isAdmin();
  allow update: if request.auth != null && 
                     (request.resource.data.used == true && 
                      request.resource.data.usedBy == request.auth.uid);
}
```

**Proposed Update** (Optional - for additional server-side validation):
- Keep current rules (client-side validation is sufficient for this use case)
- Consider adding validation in Cloud Functions if needed in future

### 6. Backward Compatibility

**Consideration**: What about existing QR codes without `userType` field?

**Options**:
1. **Strict**: Reject old QR codes (require userType)
2. **Permissive**: Allow old QR codes to be scanned by any user type (default to allow all)

**Recommendation**: Start with strict validation (reject old QR codes) since this is a new feature. Old QR codes should be regenerated with user type.

## Implementation Plan

### Phase 1: Database Schema Update
1. Add `userType` field to existing QR codes (optional migration)
2. Update Firestore structure documentation

### Phase 2: Admin Panel Implementation
1. Update `GenerateRewardQR.tsx` component
2. Add user type selection UI
3. Update QR code generation logic
4. Update QR code data JSON structure
5. Test QR code generation

### Phase 3: Mobile App Implementation
1. Update `WireAuthenticationScreen.tsx`
2. Add user type validation in `processRewardQR` function
3. Add error handling and user-friendly messages
4. Test scanning with different user types

### Phase 4: Testing
1. Generate Electrician QR code, scan with Electrician account (should work)
2. Generate Electrician QR code, scan with Dealer account (should fail)
3. Generate Dealer QR code, scan with Dealer account (should work)
4. Generate Dealer QR code, scan with Electrician account (should fail)
5. Test edge cases (missing userType, invalid data, etc.)

## Files to Modify

1. **Admin Panel**:
   - `src/pages/GenerateRewardQR.tsx` - Add user type selection and update generation logic

2. **Mobile App**:
   - `src/screens/WireAuthenticationScreen.tsx` - Add user type validation in `processRewardQR` function

3. **Documentation**:
   - Update any relevant documentation files

## Security Considerations

1. **Client-Side Validation**: Validation happens in mobile app (can be bypassed)
2. **Server-Side Validation**: Firestore rules can provide additional security
3. **QR Code Tampering**: QR codes can be modified, but rewardId validation in Firestore prevents unauthorized use
4. **Recommendation**: Current approach (client-side validation + Firestore `used` flag) is sufficient for this use case

## User Experience Flow

### Admin Generating QR Code:
1. Admin opens "Generate Reward QR Code" page
2. Admin selects user type (Electrician or Dealer)
3. Admin enters points and description
4. Admin clicks "Generate QR Code"
5. QR code is generated with embedded user type
6. QR code is stored in Firestore with user type
7. Admin can download QR code

### User Scanning QR Code:
1. User opens "Wire Authentication" screen in mobile app
2. User scans QR code
3. App validates QR code format and structure
4. App checks if QR code user type matches user's user type
5. If match: Process reward and award points
6. If no match: Show error message and prevent reward
7. If already used: Show "Already Used" message

## Success Criteria

1. ✅ Admin can generate QR codes for specific user types
2. ✅ QR codes contain user type information
3. ✅ Electrician QR codes can only be scanned by Electricians
4. ✅ Dealer QR codes can only be scanned by Dealers
5. ✅ Appropriate error messages are shown
6. ✅ User experience is smooth and intuitive
7. ✅ System is secure and prevents unauthorized access

## Next Steps

1. Review and approve this analysis
2. Implement Phase 1 (if needed)
3. Implement Phase 2 (Admin Panel)
4. Implement Phase 3 (Mobile App)
5. Test thoroughly
6. Deploy to production
