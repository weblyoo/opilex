# ⚠️ KYC "Insufficient Privilege" Error - Troubleshooting Guide

## 🔍 Error Description

**Error:** `insufficient privilege` or `insufficient permission`

This error indicates that your Sandbox API credentials don't have the necessary permissions to access KYC endpoints.

---

## ✅ Changes Made

### Enhanced Error Handling

1. **Better Error Detection:**
   - Detects "insufficient privilege" errors
   - Checks for 403 status codes
   - Provides actionable error messages

2. **User-Friendly Messages:**
   - Clear instructions on what to check
   - Steps to resolve the issue
   - Guidance on contacting support

---

## 🔧 Possible Causes & Solutions

### 1. **API Key Lacks KYC Permissions**

**Solution:**
- Log in to Sandbox Dashboard: https://dashboard.sandbox.co.in
- Check API key permissions
- Ensure KYC/Aadhaar verification is enabled for your API key

### 2. **Subscription Expired**

**Solution:**
- Check your Sandbox account subscription status
- Renew subscription if expired
- Ensure you're using an active subscription plan

### 3. **Insufficient Credits**

**Solution:**
- Check your account balance/credits
- Add credits if needed
- Verify pricing for Aadhaar KYC API calls

### 4. **Wrong API Endpoints**

**Solution:**
- Verify endpoint URLs in Sandbox documentation
- Check if endpoints have changed
- Ensure you're using the correct API version

### 5. **Account Status**

**Solution:**
- Verify account is active and not suspended
- Check for any account restrictions
- Contact Sandbox support if account issues persist

---

## 📋 Check Your Sandbox Account

1. **Dashboard:** https://dashboard.sandbox.co.in
2. **Check:**
   - ✅ API key permissions
   - ✅ Subscription status
   - ✅ Account credits
   - ✅ Account status

3. **Verify:**
   - API key: `key_live_bdc866212c0e40c78fcf4f41acd45bb1`
   - API secret: `secret_live_943291b891064242852c18425341a379`
   - Both should be active and have KYC permissions

---

## 🔄 Alternative Solution

If the issue persists, you may need to:

1. **Generate New API Keys:**
   - Create new API keys in Sandbox dashboard
   - Ensure they have KYC permissions enabled
   - Update credentials in `src/config/sandbox.ts`

2. **Use Test Environment:**
   - Try using Sandbox test/sandbox environment first
   - Test API keys with test Aadhaar numbers
   - Verify everything works before going live

3. **Contact Sandbox Support:**
   - Reach out to Sandbox customer support
   - Provide your API key details
   - Request KYC permissions to be enabled

---

## 📝 Error Message Displayed

When "insufficient privilege" error occurs, users will see:

```
Insufficient privileges. Please check:
1. Your Sandbox API key has KYC permissions enabled
2. Your subscription is active and not expired
3. Your account has sufficient credits

Contact Sandbox support or check your account dashboard.
```

---

**Check your Sandbox account dashboard to resolve the insufficient privilege error.** ⚠️

