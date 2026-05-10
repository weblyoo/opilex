# Sandbox API - cURL Request & JSON Response Examples

This document provides cURL request examples and expected JSON responses for all Sandbox API endpoints used in the Opilex App.

---

## 🔑 API Configuration

### ⚠️ IMPORTANT: Environment Matching

**CRITICAL:** Test credentials MUST be used with the test environment URL, and production credentials MUST be used with the production environment URL. Using test credentials with production URL (or vice versa) will result in authentication failures.

**Test Environment:**
- Base URL: `https://api.sandbox.co.in` (⚠️ Verify with Sandbox documentation)
- API Key: `key_test_8d548e4b104b454bbcefe09d1fbbb4a7`
- API Secret: `secret_test_007adeaa9a304513a1e7a9de7ee475dc`
- **Use:** Development and testing (no charges)

**Production Environment:**
- Base URL: `https://api.sandbox.co.in` (⚠️ Verify with Sandbox documentation)
- API Key: `key_live_bdc866212c0e40c78fcf4f41acd45bb1`
- API Secret: `secret_live_943291b891064242852c18425341a379`
- **Use:** Production (consumes quota and wallet charges)

**Note:** Please verify the correct test and production environment URLs with Sandbox documentation or support team.

---

## 1. Authentication Endpoint

Get an access token to use for subsequent API calls.

### cURL Request

```bash
curl -X POST "https://api.sandbox.co.in/authenticate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7" \
  -H "x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc"
```

### Request Headers

```
Content-Type: application/json
x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7
x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc
```

**Note:** No request body is required for authentication.

### Success Response (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

### Error Response (401 Unauthorized)

```json
{
  "error": "Invalid API credentials",
  "message": "The provided API key or secret is invalid",
  "status_code": 401
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "Missing required request parameters",
  "message": "missing required request parameters: [x-api-secret, x-api-key]",
  "status_code": 400
}
```

---

## 2. Generate Aadhaar OTP Endpoint

Generate an OTP for Aadhaar verification. The OTP will be sent to the mobile number linked with the Aadhaar.

### cURL Request

```bash
curl -X POST "https://api.sandbox.co.in/kyc/aadhaar/offline/otp" \
  -H "Content-Type: application/json" \
  -H "x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7" \
  -H "x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" \
  -H "x-api-version: 2.0" \
  -d '{
    "aadhaar_number": "123456789012",
    "consent": true
  }'
```

### Request Headers

```
Content-Type: application/json
x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7
x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc
Authorization: Bearer {access_token}
x-api-version: 2.0
```

### Request Body

```json
{
  "aadhaar_number": "123456789012",
  "consent": true
}
```

**Field Descriptions:**
- `aadhaar_number` (required): 12-digit Aadhaar number
- `consent` (optional): Boolean indicating user consent for KYC verification

### Success Response (200 OK)

```json
{
  "request_id": "req_abc123xyz456def789",
  "message": "OTP sent successfully to registered mobile number",
  "success": true
}
```

### Error Response (400 Bad Request - Invalid Aadhaar)

```json
{
  "error": "Invalid Aadhaar number",
  "message": "The provided Aadhaar number is invalid or not found",
  "status_code": 400
}
```

### Error Response (403 Forbidden - Insufficient Privileges)

```json
{
  "error": "Insufficient privileges",
  "message": "Your API key does not have KYC permissions enabled",
  "status_code": 403
}
```

### Error Response (401 Unauthorized - Invalid Token)

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired access token",
  "status_code": 401
}
```

### Error Response (429 Too Many Requests)

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later",
  "status_code": 429
}
```

---

## 3. Verify Aadhaar OTP Endpoint

Verify the OTP and retrieve Aadhaar data.

### cURL Request

```bash
curl -X POST "https://api.sandbox.co.in/kyc/aadhaar/offline/verify" \
  -H "Content-Type: application/json" \
  -H "x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7" \
  -H "x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" \
  -H "x-api-version: 2.0" \
  -d '{
    "request_id": "req_abc123xyz456def789",
    "otp": "123456"
  }'
```

### Request Headers

```
Content-Type: application/json
x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7
x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc
Authorization: Bearer {access_token}
x-api-version: 2.0
```

### Request Body

```json
{
  "request_id": "req_abc123xyz456def789",
  "otp": "123456"
}
```

**Field Descriptions:**
- `request_id` (required): Request ID received from OTP generation endpoint
- `otp` (required): 6-digit OTP received on mobile number

### Success Response (200 OK)

```json
{
  "verified": true,
  "request_id": "req_abc123xyz456def789",
  "message": "Aadhaar verified successfully",
  "aadhaar_data": {
    "name": "JOHN DOE",
    "dob": "01-01-1990",
    "gender": "M",
    "address": {
      "care_of": "S/O JOHN SMITH",
      "district": "BANGALORE URBAN",
      "house": "123",
      "landmark": "Near Park",
      "locality": "Koramangala",
      "pincode": "560095",
      "post_office": "Koramangala S.O",
      "state": "KARNATAKA",
      "street": "Main Street",
      "sub_district": "BANGALORE",
      "vtc": "BANGALORE"
    },
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "mobile_number": "9876543210",
    "email": "john.doe@example.com"
  }
}
```

### Error Response (400 Bad Request - Invalid OTP)

```json
{
  "verified": false,
  "error": "Invalid OTP",
  "message": "The provided OTP is incorrect or expired",
  "status_code": 400
}
```

### Error Response (400 Bad Request - Invalid Request ID)

```json
{
  "verified": false,
  "error": "Invalid request ID",
  "message": "The provided request_id is invalid or expired",
  "status_code": 400
}
```

### Error Response (401 Unauthorized - Invalid Token)

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired access token",
  "status_code": 401
}
```

### Error Response (403 Forbidden - Insufficient Privileges)

```json
{
  "error": "Insufficient privileges",
  "message": "Your API key does not have KYC permissions enabled",
  "status_code": 403
}
```

---

## 📋 Complete Flow Example

### Step 1: Authenticate

```bash
# Get access token
curl -X POST "https://api.sandbox.co.in/authenticate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7" \
  -H "x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

### Step 2: Generate OTP

```bash
# Generate OTP for Aadhaar
curl -X POST "https://api.sandbox.co.in/kyc/aadhaar/offline/otp" \
  -H "Content-Type: application/json" \
  -H "x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7" \
  -H "x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-version: 2.0" \
  -d '{
    "aadhaar_number": "123456789012",
    "consent": true
  }'
```

**Response:**
```json
{
  "request_id": "req_abc123xyz456def789",
  "message": "OTP sent successfully to registered mobile number",
  "success": true
}
```

### Step 3: Verify OTP

```bash
# Verify OTP and get Aadhaar data
curl -X POST "https://api.sandbox.co.in/kyc/aadhaar/offline/verify" \
  -H "Content-Type: application/json" \
  -H "x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7" \
  -H "x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-version: 2.0" \
  -d '{
    "request_id": "req_abc123xyz456def789",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "verified": true,
  "request_id": "req_abc123xyz456def789",
  "message": "Aadhaar verified successfully",
  "aadhaar_data": {
    "name": "JOHN DOE",
    "dob": "01-01-1990",
    "gender": "M",
    "address": {
      "care_of": "S/O JOHN SMITH",
      "district": "BANGALORE URBAN",
      "house": "123",
      "landmark": "Near Park",
      "locality": "Koramangala",
      "pincode": "560095",
      "post_office": "Koramangala S.O",
      "state": "KARNATAKA",
      "street": "Main Street",
      "sub_district": "BANGALORE",
      "vtc": "BANGALORE"
    },
    "photo": "data:image/jpeg;base64,...",
    "mobile_number": "9876543210",
    "email": "john.doe@example.com"
  }
}
```

---

## ⚠️ Important Notes

1. **Environment Matching (CRITICAL):**
   - ⚠️ **Test credentials MUST use test environment URL**
   - ⚠️ **Production credentials MUST use production environment URL**
   - Using test credentials with production URL (or vice versa) will fail
   - Verify the correct environment URLs with Sandbox documentation or support

2. **Headers Required:**
   - All requests require `x-api-key` and `x-api-secret` headers
   - KYC endpoints require `Authorization: Bearer {token}` header
   - API version header `x-api-version: 2.0` is recommended for KYC endpoints

3. **Token Expiry:**
   - Access tokens typically expire in 24 hours (86400 seconds)
   - Tokens are cached in the app to reduce API calls
   - Token cache is cleared when switching API keys

4. **Error Handling:**
   - Always check the `status_code` in error responses
   - Common errors: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 429 (Rate Limit)
   - Error messages provide specific details about what went wrong
   - If you get authentication errors, verify you're using the correct environment URL for your credentials

5. **Test vs Live Keys:**
   - Test keys don't consume quota or charges
   - Live keys consume quota and may incur charges
   - Switch to live keys only in production
   - **Always use matching environment URL for your key type**

6. **Aadhaar Number Format:**
   - Must be exactly 12 digits
   - No spaces or special characters
   - Example: `123456789012` ✅ (not `1234 5678 9012` ❌)

7. **OTP Format:**
   - Must be exactly 6 digits
   - OTPs typically expire in 5-10 minutes
   - Request a new OTP if expired

---

## 🔗 Additional Resources

- **Sandbox Developer Portal:** https://developer.sandbox.co.in/
- **API Documentation:** https://developer.sandbox.co.in/docs
- **KYC API Docs:** https://developer.sandbox.co.in/docs/kyc/aadhaar-offline
- **Support:** Contact Sandbox support for API key permissions and account issues

---

## 📝 Testing Checklist

- [ ] Authentication endpoint returns valid token
- [ ] OTP generation endpoint returns request_id
- [ ] OTP verification endpoint returns Aadhaar data
- [ ] Error handling works for invalid inputs
- [ ] Token caching works correctly
- [ ] API version header is included (if required)
- [ ] All required headers are present in requests

