# 📋 Complete Dashboard Buttons List

## 🎯 Electrician Dashboard Buttons (12 buttons)

### Row 1 (3 buttons)
1. **Add Account** 🏦
   - Icon: `bank`
   - Route: `AddAccount`
   - Purpose: Add/edit bank account details

2. **Wallet** 💰
   - Icon: `wallet`
   - Route: `Wallet`
   - Purpose: View wallet balance and transactions

3. **Redeem UPI** 🎁
   - Icon: `gift-box`
   - Route: `RedeemPoints`
   - Purpose: Redeem reward points

### Row 2 (3 buttons)
4. **Purchase History** 🛒
   - Icon: `purchase-history`
   - Route: `Rewards`
   - Purpose: View purchase history and rewards

5. **Transaction** 📊
   - Icon: `history`
   - Action: Navigates to `Wallet` screen
   - Purpose: View transaction history

6. **Catalogs** 📦
   - Icon: `product-catalogue`
   - Route: `ProductCatalog`
   - Purpose: Browse product catalog

### Row 3 (3 buttons)
7. **Authenticate** 🔐
   - Icon: `authenticate`
   - Route: `WireAuthentication`
   - Purpose: QR code scanning for wire authentication

8. **Refer** 👥
   - Icon: `share`
   - Action: Opens Refer & Earn flow
   - Purpose: Refer friends and earn rewards

9. **Social Media** 🌐
   - Icon: `social-media`
   - Route: `SocialMedia`
   - Purpose: Links to social media platforms

### Row 4 (3 buttons)
10. **Leadership** 🏆
    - Icon: `leadership-board`
    - Route: `LeadershipBoard`
    - Purpose: View leadership rankings

11. **Tutorial** 📚
    - Icon: `watch-tutorial`
    - Route: `Tutorial`
    - Purpose: Watch tutorial videos

12. **QR Scan** 📷
    - Icon: `scan`
    - Route: `WireAuthentication`
    - Purpose: Scan QR codes for authentication

---

## 🏪 Dealer Dashboard Buttons (15 buttons)

### Row 1 (3 buttons)
1. **Price List** 💲
   - Icon: `price-list`
   - Route: `PriceList`
   - Purpose: View product pricing

2. **Catalogs** 📦
   - Icon: `product-catalogue`
   - Route: `ProductCatalog`
   - Purpose: Browse product catalog

3. **Authenticate** 🔐
   - Icon: `authenticate`
   - Route: `WireAuthentication`
   - Purpose: QR code scanning for wire authentication

### Row 2 (3 buttons)
4. **Refer** 👥
   - Icon: `share`
   - Action: Opens Refer & Earn flow
   - Purpose: Refer friends and earn rewards

5. **Ledger** 📜
   - Icon: `history`
   - Route: `Ledger`
   - Purpose: View transaction ledger (Dealer-specific)

6. **Social Media** 🌐
   - Icon: `social-media`
   - Route: `SocialMedia`
   - Purpose: Links to social media platforms

### Row 3 (3 buttons)
7. **Leadership** 🏆
   - Icon: `leadership-board`
   - Route: `LeadershipBoard`
   - Purpose: View leadership rankings

8. **Tutorial** 📚
   - Icon: `watch-tutorial`
   - Route: `Tutorial`
   - Purpose: Watch tutorial videos

9. **QR Scan** 📷
   - Icon: `scan`
   - Route: `WireAuthentication`
   - Purpose: Scan QR codes for authentication

### Row 4 (3 buttons)
10. **Add Account** 🏦
    - Icon: `bank`
    - Route: `AddAccount`
    - Purpose: Add/edit bank account details

11. **Wallet** 💰
    - Icon: `wallet`
    - Route: `Wallet`
    - Purpose: View wallet balance and transactions

12. **Redeem UPI** 🎁
    - Icon: `gift-box`
    - Route: `RedeemPoints`
    - Purpose: Redeem reward points

### Row 5 (3 buttons)
13. **Purchase History** 🛒
    - Icon: `purchase-history`
    - Route: `Rewards`
    - Purpose: View purchase history and rewards

14. **Transaction** 📊
    - Icon: `history`
    - Action: Navigates to `Wallet` screen
    - Purpose: View transaction history

15. **Schemes** 🎯
    - Icon: `gift-box` (or custom scheme icon)
    - Route: `Schemes`
    - Purpose: View available schemes and offers (Dealer-specific)

---

## 📊 Summary

### Electrician Dashboard
- **Total Buttons**: 12
- **Layout**: 4 rows × 3 columns
- **Unique Features**: Standard user features, no Ledger or Schemes

### Dealer Dashboard
- **Total Buttons**: 15
- **Layout**: 5 rows × 3 columns
- **Unique Features**: 
  - **Ledger** (Row 2, Button 5) - Dealer-specific transaction ledger
  - **Schemes** (Row 5, Button 15) - Dealer-specific schemes and offers
  - **Price List** (Row 1, Button 1) - Priority button for dealers

### Key Differences
1. **Dealer has 3 extra buttons**: Price List, Ledger, Schemes
2. **Dealer button order**: Price List and Ledger are prioritized
3. **Electrician**: Standard 12-button layout without dealer-specific features

---

## 🔍 Button Detection Logic

The dashboard determines which buttons to show based on:
```typescript
const isDealer = currentUserType === 'dealer';
const allButtons = isDealer ? dealerButtons : electricianButtons;
```

Where `currentUserType` is fetched from Firestore to ensure accuracy.

---

**Last Updated**: Based on `DashboardScreen.tsx` implementation
**File Location**: `KimsonApp/src/screens/DashboardScreen.tsx`
