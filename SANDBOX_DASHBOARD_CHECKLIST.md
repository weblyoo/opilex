# ✅ Sandbox API Dashboard Checklist

## 🔍 How to Fix "Insufficient Privilege" Error

If you're getting an "Insufficient privilege" (403) error, follow these steps in your **Sandbox Developer Dashboard**:

---

## 📋 Step-by-Step Checklist

### 1. **Log in to Sandbox Dashboard**

Visit: https://developer.sandbox.co.in/  
Login with your Sandbox account credentials.

---

### 2. **Verify API Key Status**

Navigate to: **API Keys** section (usually in Settings or Dashboard)

**Check:**
- [ ] Your Test API Key is **active** (not expired or disabled)
- [ ] API Key: `key_test_8d548e4b104b454bbcefe09d1fbbb4a7` exists
- [ ] API Secret matches: `secret_test_007adeaa9a304513a1e7a9de7ee475dc`

---

### 3. **Check API Key Permissions**

**Important:** Even Test keys need permissions enabled!

Look for a **"Permissions"** or **"Services"** section for your API key:

- [ ] **KYC Service** is enabled/activated
- [ ] **Aadhaar Offline KYC** permission is granted
- [ ] No restrictions on the API key

**If permissions are missing:**
- Enable KYC permissions
- Save changes
- Wait a few minutes for changes to propagate

---

### 4. **Verify Subscription Status**

Navigate to: **Subscription** or **Billing** section

**Check:**
- [ ] Your account has an **active subscription**
- [ ] Subscription includes **KYC services**
- [ ] Subscription is not expired
- [ ] Wallet has credits (if required for test keys)

**Note:** Some Test keys still require active subscription or credits.

---

### 5. **Check Wallet Balance**

Navigate to: **Wallet** or **Credits** section

**Check:**
- [ ] Wallet balance is sufficient (some APIs require credits even in test mode)
- [ ] Credits are not exhausted

---

### 6. **Verify Account Status**

Navigate to: **Account Settings** or **Profile**

**Check:**
- [ ] Account is verified (email/phone verified)
- [ ] Account is not suspended
- [ ] No compliance issues

---

### 7. **Review API Documentation**

Visit: https://developer.sandbox.co.in/docs/kyc

**Verify:**
- [ ] You're using the correct endpoints
- [ ] Request format matches documentation
- [ ] Headers are correct (`x-api-key`, `x-api-secret`, `x-api-version`)
- [ ] API version is supported (v2.0 for OKYC, check for offline KYC)

---

### 8. **Test API Key in Postman/curl**

Test your API key directly:

```bash
# Test Authentication
curl -X POST https://api.sandbox.co.in/authenticate \
  -H "Content-Type: application/json" \
  -H "x-api-key: key_test_8d548e4b104b454bbcefe09d1fbbb4a7" \
  -H "x-api-secret: secret_test_007adeaa9a304513a1e7a9de7ee475dc"

# If successful, use the access_token for KYC test
```

---

## 🆘 Still Getting "Insufficient Privilege"?

### Contact Sandbox Support:

1. **Email:** Check for support email in dashboard
2. **Support Portal:** Look for "Help" or "Support" in dashboard
3. **Documentation:** https://developer.sandbox.co.in/docs
4. **Status Page:** Check if KYC service is operational

### Provide Support With:

- API Key: `key_test_8d548e4b104b454bbcefe09d1fbbb4a7`
- Error: "Insufficient privilege (403)"
- Endpoint: `/kyc/aadhaar/offline/otp`
- Request timestamp
- Account email/username

---

## 📝 Notes

- **Test Keys:** Some test keys have limited permissions or need activation
- **Propagation:** Permission changes may take 5-10 minutes to take effect
- **Rate Limits:** Check if you've hit rate limits (try after some time)
- **API Version:** Ensure you're using the correct API version (v2.0)

---

## ✅ After Making Changes

1. **Clear app cache** (or restart app)
2. **Wait 5-10 minutes** for changes to propagate
3. **Try KYC again**
4. **Check logs** for any new error messages

---

**Last Updated:** Based on Sandbox API documentation as of 2024
