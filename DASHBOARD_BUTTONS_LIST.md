# 📋 Complete List of Dashboard Buttons & Menu Options

## 🎯 Main Dashboard Buttons (3 Rows)

### **Row 1 - Top Row** (4 buttons)
1. **Ledger** 📜
   - Icon: `history`
   - Route: `Ledger` → Navigates to Ledger Screen
   - Shows transaction history

2. **Redeem Point** 🎁
   - Icon: `gift-box`
   - Route: `RedeemPoints` → Navigates to Redeem Points Screen
   - Allows users to redeem reward points

3. **Refer** 👥
   - Icon: `share`
   - Action: Opens Refer & Earn flow
   - Navigates to `ReferAndEarn` screen

4. **Wallet** 💰
   - Icon: `wallet`
   - Route: `Wallet` → Navigates to Wallet Screen
   - Shows wallet balance and transactions

---

### **Row 2 - Middle Row** (4 buttons)
5. **Authenticate** 🔐
   - Icon: `authenticate`
   - Route: `WireAuthentication` → Navigates to Wire Authentication Screen
   - QR code scanning for wire authentication

6. **Add Account** 🏦
   - Icon: `bank`
   - Route: `AddAccount` → Navigates to Add Bank Account Screen
   - Add/edit bank account details

7. **Purchase** 🛒
   - Icon: `purchase-history`
   - Route: `Rewards` → Navigates to Rewards/Purchase History Screen
   - View purchase history and rewards

8. **Transactions** 📊
   - Icon: `history`
   - Action: Navigates to `Wallet` screen
   - Shows transaction history

---

### **Row 3 - Bottom Row** (4 buttons)
9. **Notification** 🔔
   - Icon: `bell`
   - Action: Opens Notification Drawer
   - Shows unread notification count badge
   - Displays notification list

10. **Social** 🌐
    - Icon: `social-media`
    - Route: `SocialMedia` → Navigates to Social Media Screen
    - Links to social media platforms

11. **Price List** 💲
    - Icon: `price-list`
    - Action: Navigates to `PriceList` screen
    - View product pricing

12. **Products** 📦
    - Icon: `product-catalogue`
    - Route: `ProductCatalog` → Navigates to Product Catalog Screen
    - Browse product catalog

---

## 🎯 Additional Dashboard Features

### **Leadership & Tutorial Section** (2 buttons)
13. **Leadership** 🏆
    - Icon: `leadership-board`
    - Route: `LeadershipBoard` → Navigates to Leadership Board Screen
    - Shows user rankings and leaderboard

14. **Tutorial** 📚
    - Icon: `watch-tutorial`
    - Route: `Tutorial` → Navigates to Tutorial Screen
    - App usage guide and tutorials

---

### **KYC Banner** (Conditional)
15. **Complete KYC** ✅
    - Icon: `scan`
    - Route: `KYC` → Navigates to KYC Verification Screen
    - Only shows if `user.kycVerified === false`
    - Prompts users to complete KYC verification

---

### **Fixed Scan Button** (Bottom Center)
16. **Scan Now** 📷
    - Icon: `scan`
    - Position: Fixed at bottom center
    - Route: `WireAuthentication` → Navigates to Wire Authentication Screen
    - Has scroll animation (shrinks on scroll)
    - Main action button for quick QR scanning

---

## 🍔 Hamburger Menu (Drawer) Options

Opens from the **hamburger menu icon** (☰) in the top-left corner:

### **Profile Header**
- User Name Display
- Phone Number Display
- Edit Button (Settings icon) → Navigates to `Profile`

---

### **Menu Items** (8 options)
1. **Help & Support** 🆘
   - Icon: `support`
   - Route: `HelpSupport` → Navigates to Help & Support Screen

2. **Bank A/c & UPI Settings** 🏦
   - Icon: `bank`
   - Route: `AddAccount` → Navigates to Add Account Screen

3. **Profile Settings** ⚙️
   - Icon: `settings`
   - Route: `Profile` → Navigates to Profile Screen

4. **Refer & Earn** 💰
   - Icon: `add-account`
   - Route: `ReferAndEarn` → Navigates to Refer & Earn Screen

5. **Follow & Subscribe** 📱
   - Icon: `social-media`
   - Route: `SocialMedia` → Navigates to Social Media Screen

6. **Change Language** 🌍
   - Icon: `globe`
   - Action: Shows alert (Coming Soon)
   - Will allow language selection

7. **Dark Mode** 🌙/☀️
   - Icon: `moon` (when light mode) / `sun` (when dark mode)
   - Action: Toggles dark/light theme
   - Has toggle switch indicator

8. **About Us** ℹ️
   - Icon: `info`
   - Route: `About` → Navigates to About Screen

---

### **Footer Menu Item**
9. **Logout** 🚪
   - Icon: `log-out`
   - Action: Shows confirmation alert
   - Signs out user and navigates to `Splash` screen

---

## 🔔 Notification Drawer

Opens from the **bell icon** (🔔) in the top-right corner:

- Shows list of notifications
- Unread count badge
- Mark as read functionality
- Clear all notifications
- Clickable notifications (navigate to related screens)

---

## 📱 Header Elements

1. **Hamburger Menu** (☰)
   - Top-left corner
   - Opens side drawer menu

2. **Title**: "KIMSON"
   - Center of header

3. **Notification Bell** (🔔)
   - Top-right corner
   - Opens notification drawer
   - Shows unread badge count

---

## 📊 Summary

### **Total Dashboard Buttons: 16**
- Main grid buttons: **12** (3 rows × 4 columns)
- Leadership & Tutorial: **2**
- KYC Banner: **1** (conditional)
- Scan Now button: **1** (fixed bottom)

### **Total Menu Options: 9**
- Profile header actions: **1** (Edit)
- Menu items: **8** (including logout)

### **Total Navigation Screens Accessible from Dashboard:**
1. Ledger
2. RedeemPoints
3. ReferAndEarn
4. Wallet
5. WireAuthentication
6. AddAccount
7. Rewards
8. SocialMedia
9. PriceList
10. ProductCatalog
11. LeadershipBoard
12. Tutorial
13. KYC
14. Profile
15. HelpSupport
16. About

---

**Last Updated:** Based on `DashboardScreen.tsx` implementation

