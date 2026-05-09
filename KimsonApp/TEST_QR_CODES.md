# Test QR Codes for Kimson App

## How to Test QR Code Scanning

### **Simple Test Codes (Use these in Manual Entry or Create QR Codes)**

✅ **Valid Codes** (should pass authentication):
```
KIMSON_WIRE_BATCH001_2024
KIMSON_WIRE_BATCH002_2024
KIMSON_WIRE_BATCH003_2024
KIMSON_WIRE_PREMIUM_2024
KIMSON_COPPER_BATCH123_2024
```

❌ **Invalid Codes** (should fail authentication):
```
INVALID_CODE_123
FAKE_WIRE_2024
OLD_WIRE_2020
KIMSON_USED_ALREADY
```

### **JSON Format QR Codes (Advanced Testing)**

✅ **Valid Wire Products**:
```json
{"productId":"KIMSON-WIRE-2024-001","batchId":"BATCH-A001","manufacturingDate":"2024-09-15","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"rewardPoints":50}

{"productId":"KIMSON-WIRE-2024-003","batchId":"BATCH-B001","manufacturingDate":"2024-09-20","wireType":"Heavy Duty Copper","length":"200 meters","voltage":"440V","verified":true,"rewardPoints":100}

{"productId":"KIMSON-WIRE-2024-005","batchId":"BATCH-D001","manufacturingDate":"2024-09-25","wireType":"Industrial Grade","length":"500 meters","voltage":"1000V","verified":true,"rewardPoints":250}
```

🎉 **Promotional Codes**:
```json
{"productId":"KIMSON-WIRE-2024-007","batchId":"BATCH-PROMO-001","manufacturingDate":"2024-09-22","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"rewardPoints":100,"promotion":"Double Points Week","promotionCode":"DOUBLE24"}

{"productId":"KIMSON-WIRE-2024-008","batchId":"BATCH-BONUS-001","manufacturingDate":"2024-09-23","wireType":"Industrial Grade","length":"300 meters","voltage":"440V","verified":true,"rewardPoints":200,"bonus":50,"bonusReason":"New Product Launch"}
```

❌ **Error Scenarios**:
```json
{"productId":"KIMSON-WIRE-2024-006","batchId":"BATCH-E001","manufacturingDate":"2024-08-15","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"alreadyScanned":true,"scannedBy":"user123","scannedDate":"2024-09-01"}

{"productId":"KIMSON-WIRE-2023-001","batchId":"BATCH-OLD-001","manufacturingDate":"2023-01-15","wireType":"Standard Copper","length":"100 meters","voltage":"240V","verified":false,"expired":true}

{"productId":"FAKE-WIRE-001","batchId":"INVALID-BATCH","manufacturingDate":"2024-09-01","wireType":"Unknown","length":"50 meters","voltage":"240V","verified":false,"error":"Invalid product ID"}
```

## Testing Steps

### **1. Test Manual Entry**
- Go to Dashboard → Scan Wire
- Select "Enter Manually"
- Try each test code above
- Valid codes should give 50 points
- Invalid codes should show error

### **2. Test QR Scanner**
- Go to Dashboard → Scan Wire  
- Select "Scan QR Code"
- Grant camera permission
- Create QR codes from the valid codes above using any QR generator
- Scan them with the app

### **3. Create Test QR Codes**
Use any online QR code generator:
- https://qr-code-generator.com/
- https://www.qr-code-generator.com/
- Create QR codes with the test codes above

### **4. Expected Behavior**

**Valid Wire Authentication:**
- ✅ Success message
- 🎁 +50 points added
- 📊 Dashboard shows updated points
- 📋 Recent activity shows new authentication

**Invalid Wire Authentication:**
- ❌ Error message
- 💡 Helpful suggestions
- 🔄 Option to try again

## Development Notes

- **Phone Auth**: Currently simulated (SMS won't work in development)
- **Wire Validation**: Based on code format starting with "KIMSON_"
- **Points**: Automatically added to user account
- **Real-time Updates**: Dashboard refreshes after authentication

## Production Setup

For production, you'll need:
1. Real SMS provider setup in Firebase
2. Actual Kimson wire code format
3. Backend API for wire validation
4. Real product database integration
