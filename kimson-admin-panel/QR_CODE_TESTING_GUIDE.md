# 🔌 Kimson Wire QR Code Testing Guide

## 📱 How to Test QR Code Authentication

### **Step 1: Generate Test QR Codes**
1. Open `generate-test-qr.html` in your web browser
2. Click "Generate QR Code" buttons for different test scenarios
3. Print the QR codes or display them on another device

### **Step 2: Test in Kimson App**
1. **Open Kimson App** → Login → Dashboard
2. **Navigate to Scan**: 
   - Tap the **"Scan Now"** button (bottom center), OR
   - Tap **"Authenticate"** button in Money Transfer section
3. **Choose Scan Mode**:
   - **📱 Scan QR Code**: Use camera to scan QR codes
   - **⌨️ Enter Manually**: Type the JSON data manually

### **Step 3: Test Different Scenarios**

## ✅ **Valid Wire QR Codes** (Should Work)

### **Premium Copper Wire - 100m**
- **Points**: 50
- **Expected Result**: ✅ Success, +50 points
- **Message**: "Authentic Wire Verified!"

### **Heavy Duty Copper Wire - 200m**
- **Points**: 100  
- **Expected Result**: ✅ Success, +100 points
- **Message**: "Authentic Wire Verified!"

### **Industrial Grade Wire - 500m**
- **Points**: 250
- **Expected Result**: ✅ Success, +250 points
- **Message**: "Authentic Wire Verified!"

## 🎉 **Promotional QR Codes** (Bonus Points)

### **Double Points Promotion**
- **Base Points**: 50, **Bonus**: 50 (2x total = 100)
- **Expected Result**: ✅ Success, +100 points
- **Message**: Shows bonus points and promotion details

### **New Product Launch Bonus**
- **Base Points**: 200, **Bonus**: 50 (Total = 250)
- **Expected Result**: ✅ Success, +250 points
- **Message**: Shows bonus points and launch promotion

## ❌ **Invalid QR Codes** (Should Fail)

### **Already Scanned Wire**
- **Expected Result**: ⚠️ "Already Used" error
- **Message**: "This wire has already been scanned by another user"

### **Expired Product**
- **Expected Result**: ⏰ "Expired Wire" error  
- **Message**: "This wire has expired and is no longer valid"

### **Invalid Product ID**
- **Expected Result**: ❌ "Invalid Wire" error
- **Message**: "This wire is invalid or not verified"

## 🔧 **Testing Checklist**

### **QR Code Scanning**
- [ ] Camera permission granted
- [ ] QR code appears in scan frame
- [ ] Scanning animation works
- [ ] Success/error messages display correctly

### **Manual Entry**
- [ ] Copy JSON data from QR generator
- [ ] Paste into manual input field
- [ ] Verify button processes correctly
- [ ] Success/error messages display correctly

### **Points System**
- [ ] Points added to user balance
- [ ] Dashboard shows updated balance
- [ ] Rewards screen reflects new points
- [ ] Bonus points calculated correctly

### **Error Handling**
- [ ] Already scanned wire shows appropriate error
- [ ] Expired wire shows appropriate error
- [ ] Invalid wire shows appropriate error
- [ ] Network timeout handled gracefully

## 📊 **Expected JSON Data Format**

### **Valid Wire Example**
```json
{
  "productId": "KIMSON-WIRE-2024-001",
  "batchId": "BATCH-A001",
  "manufacturingDate": "2024-09-15",
  "wireType": "Premium Copper",
  "length": "100 meters",
  "voltage": "240V",
  "verified": true,
  "rewardPoints": 50
}
```

### **Promotional Wire Example**
```json
{
  "productId": "KIMSON-WIRE-2024-007",
  "batchId": "BATCH-PROMO-001",
  "manufacturingDate": "2024-09-22",
  "wireType": "Premium Copper",
  "length": "100 meters",
  "voltage": "240V",
  "verified": true,
  "rewardPoints": 100,
  "promotion": "Double Points Week",
  "promotionCode": "DOUBLE24"
}
```

### **Used Wire Example**
```json
{
  "productId": "KIMSON-WIRE-2024-006",
  "batchId": "BATCH-E001",
  "manufacturingDate": "2024-08-15",
  "wireType": "Premium Copper",
  "length": "100 meters",
  "voltage": "240V",
  "verified": true,
  "alreadyScanned": true,
  "scannedBy": "user123",
  "scannedDate": "2024-09-01"
}
```

## 🚀 **Quick Test Commands**

### **Manual Entry Test Codes**
Copy these JSON strings for manual testing:

**Valid Wire (50 points):**
```
{"productId":"KIMSON-WIRE-2024-001","batchId":"BATCH-A001","manufacturingDate":"2024-09-15","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"rewardPoints":50}
```

**Promotional Wire (100 points + bonus):**
```
{"productId":"KIMSON-WIRE-2024-007","batchId":"BATCH-PROMO-001","manufacturingDate":"2024-09-22","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"rewardPoints":100,"promotion":"Double Points Week","promotionCode":"DOUBLE24"}
```

**Already Used Wire (should fail):**
```
{"productId":"KIMSON-WIRE-2024-006","batchId":"BATCH-E001","manufacturingDate":"2024-08-15","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"alreadyScanned":true,"scannedBy":"user123","scannedDate":"2024-09-01"}
```

## 📱 **App Navigation Flow**

1. **Login** → Dashboard
2. **Tap "Scan Now"** (bottom) OR **"Authenticate"** (Money Transfer section)
3. **Choose Mode**: QR Scan OR Manual Entry
4. **Scan/Enter Code** → Wait for verification
5. **View Results** → Points added or error message
6. **Navigate**: View Rewards OR Scan Another

## 🔍 **Troubleshooting**

### **Camera Issues**
- Ensure camera permissions are granted
- Try manual entry mode as fallback
- Check device camera functionality

### **QR Code Not Scanning**
- Ensure good lighting
- Hold QR code steady in scan frame
- Try different QR code sizes
- Use manual entry for testing

### **Points Not Updating**
- Check user authentication
- Verify mock service is working
- Refresh dashboard to see updated balance

---

**Happy Testing! 🎉**

The QR code authentication system is now fully functional with comprehensive error handling and bonus point support!
