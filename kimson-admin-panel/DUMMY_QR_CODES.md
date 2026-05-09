# Kimson App - Dummy QR Codes for Testing

## Overview
This file contains dummy QR code data for testing the wire authentication functionality in the Kimson app.

## QR Code Format
Each QR code contains JSON data with wire product information:

```json
{
  "productId": "KIMSON-WIRE-XXXX",
  "batchId": "BATCH-XXXX",
  "manufacturingDate": "2024-XX-XX",
  "wireType": "TYPE",
  "length": "XXX meters",
  "voltage": "XXX V",
  "verified": true/false
}
```

## Test QR Codes

### 1. Valid Wire Authentication QR Codes

#### Premium Copper Wire - 100m
```
QR Code Data: {"productId":"KIMSON-WIRE-2024-001","batchId":"BATCH-A001","manufacturingDate":"2024-09-15","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"rewardPoints":50}
```

#### Standard Aluminum Wire - 50m
```
QR Code Data: {"productId":"KIMSON-WIRE-2024-002","batchId":"BATCH-A002","manufacturingDate":"2024-09-10","wireType":"Standard Aluminum","length":"50 meters","voltage":"120V","verified":true,"rewardPoints":25}
```

#### Heavy Duty Copper Wire - 200m
```
QR Code Data: {"productId":"KIMSON-WIRE-2024-003","batchId":"BATCH-B001","manufacturingDate":"2024-09-20","wireType":"Heavy Duty Copper","length":"200 meters","voltage":"440V","verified":true,"rewardPoints":100}
```

#### Flexible Cable - 25m
```
QR Code Data: {"productId":"KIMSON-WIRE-2024-004","batchId":"BATCH-C001","manufacturingDate":"2024-09-18","wireType":"Flexible Cable","length":"25 meters","voltage":"240V","verified":true,"rewardPoints":30}
```

#### Industrial Grade Wire - 500m
```
QR Code Data: {"productId":"KIMSON-WIRE-2024-005","batchId":"BATCH-D001","manufacturingDate":"2024-09-25","wireType":"Industrial Grade","length":"500 meters","voltage":"1000V","verified":true,"rewardPoints":250}
```

### 2. Already Scanned QR Codes

#### Previously Authenticated Wire
```
QR Code Data: {"productId":"KIMSON-WIRE-2024-006","batchId":"BATCH-E001","manufacturingDate":"2024-08-15","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"alreadyScanned":true,"scannedBy":"user123","scannedDate":"2024-09-01"}
```

### 3. Invalid/Expired QR Codes

#### Expired Product
```
QR Code Data: {"productId":"KIMSON-WIRE-2023-001","batchId":"BATCH-OLD-001","manufacturingDate":"2023-01-15","wireType":"Standard Copper","length":"100 meters","voltage":"240V","verified":false,"expired":true}
```

#### Invalid Product ID
```
QR Code Data: {"productId":"FAKE-WIRE-001","batchId":"INVALID-BATCH","manufacturingDate":"2024-09-01","wireType":"Unknown","length":"50 meters","voltage":"240V","verified":false,"error":"Invalid product ID"}
```

### 4. Special Promotion QR Codes

#### Double Points Promotion
```
QR Code Data: {"productId":"KIMSON-WIRE-2024-007","batchId":"BATCH-PROMO-001","manufacturingDate":"2024-09-22","wireType":"Premium Copper","length":"100 meters","voltage":"240V","verified":true,"rewardPoints":100,"promotion":"Double Points Week","promotionCode":"DOUBLE24"}
```

#### Bonus Reward
```
QR Code Data: {"productId":"KIMSON-WIRE-2024-008","batchId":"BATCH-BONUS-001","manufacturingDate":"2024-09-23","wireType":"Industrial Grade","length":"300 meters","voltage":"440V","verified":true,"rewardPoints":200,"bonus":50,"bonusReason":"New Product Launch"}
```

### 5. Test Error Scenarios

#### Network Error Simulation
```
QR Code Data: {"productId":"KIMSON-TEST-NETWORK-ERROR","error":"NETWORK_ERROR","message":"Unable to verify product. Please check your internet connection."}
```

#### Server Maintenance
```
QR Code Data: {"productId":"KIMSON-TEST-MAINTENANCE","error":"MAINTENANCE","message":"Authentication service is temporarily unavailable. Please try again later."}
```

#### Damaged QR Code
```
QR Code Data: {"productId":"KIMSON-WIRE-DAMAGED","batchId":"BATCH-","manufacturingDate":"","wireType":"","length":"","voltage":"","verified":false,"error":"Damaged QR code. Please contact support."}
```

## How to Use These QR Codes

### For Manual Testing:
1. Copy any of the QR code data strings above
2. Use an online QR code generator (like qr-code-generator.com)
3. Paste the JSON data and generate a QR code
4. Print or display the QR code on another device
5. Use the Kimson app to scan the code

### For Development Testing:
1. Create mock data in your app using these JSON structures
2. Test different scenarios without needing physical QR codes
3. Validate app behavior for success, error, and edge cases

### Expected App Behavior:

#### Valid Codes:
- ✅ Show success message
- ✅ Award reward points
- ✅ Display product information
- ✅ Update user's point balance

#### Already Scanned:
- ⚠️ Show "Already authenticated" message
- ⚠️ Display original scan information
- ❌ No additional points awarded

#### Invalid/Expired:
- ❌ Show error message
- ❌ No points awarded
- ℹ️ Suggest contacting support

#### Promotional:
- 🎉 Show special promotion message
- ⭐ Award bonus points
- 🎁 Display promotion details

## Wire Types Available:
- Premium Copper
- Standard Aluminum  
- Heavy Duty Copper
- Flexible Cable
- Industrial Grade
- Weather Resistant
- Fire Resistant
- Low Voltage
- High Voltage
- Armored Cable

## Reward Points Structure:
- Standard Wire (25-50m): 25-50 points
- Premium Wire (100m): 50-75 points
- Heavy Duty (200m+): 100+ points
- Industrial Grade: 200+ points
- Special Promotions: 2x normal points

Remember: These are dummy codes for testing purposes only. In production, QR codes should be generated securely with proper authentication.
