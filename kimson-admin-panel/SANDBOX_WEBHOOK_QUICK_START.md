# 🚀 Sandbox Webhooks - Quick Start

## 🎯 What You Need

You're viewing the Sandbox Webhooks section. Here's what to do:

---

## ✅ Quick Steps

### 1. **Choose Your Webhook Receiver**

**For this React Native app, you have 3 options:**

#### Option A: Firebase Cloud Functions (Recommended) ⭐
- ✅ No separate server needed
- ✅ Easy to deploy
- ✅ Integrates with Firestore
- ✅ Can send push notifications

#### Option B: Your Own Backend Server
- ✅ Full control
- ✅ Custom logic
- ⚠️ Requires server setup

#### Option C: Skip Webhooks (Polling)
- ✅ No backend needed
- ❌ Less efficient
- ❌ Real-time delays

---

### 2. **If Using Firebase Cloud Functions:**

#### Step 1: Initialize Functions
```bash
cd your-project-root
firebase init functions
# Select TypeScript
# Install dependencies: Yes
```

#### Step 2: Create Webhook Handler
Create: `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sandboxWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body;
  
  // Handle KYC completion
  if (event.event_type === 'kyc.verification.complete') {
    const userId = event.data.user_id;
    
    // Update Firestore
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        kycVerified: true,
        kycVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }
  
  res.status(200).json({ success: true });
});
```

#### Step 3: Deploy
```bash
firebase deploy --only functions:sandboxWebhook
```

#### Step 4: Get Webhook URL
After deployment, you'll get:
```
https://us-central1-opilex-2a79f.cloudfunctions.net/sandboxWebhook
```

#### Step 5: Configure in Sandbox Dashboard
1. Copy the Cloud Function URL above
2. Paste in Sandbox Dashboard → Webhooks → Webhook URL
3. Select events: `kyc.verification.complete`
4. Enable webhook

---

### 3. **If Using Your Backend Server:**

1. **Create webhook endpoint:** `POST /webhook/sandbox`
2. **Deploy server** (Heroku, AWS, etc.)
3. **Get public URL:** `https://your-server.com/webhook/sandbox`
4. **Configure in Sandbox Dashboard**

---

### 4. **If Skipping Webhooks (Current Approach):**

Your app currently:
- ✅ Makes direct API calls to Sandbox
- ✅ Polls for results after OTP verification
- ✅ Works without backend

**This is fine for now!** Webhooks are optional for real-time updates.

---

## 📋 Sandbox Dashboard Configuration

When you're ready to set up webhooks:

1. **Go to:** Sandbox Dashboard → Webhooks
2. **Click:** "Add Webhook" or "Configure"
3. **Enter:**
   - **Webhook URL:** Your server endpoint
   - **Events:** Select which events to receive
   - **Status:** Enable
4. **Save**

---

## 🎯 Recommended: Start Without Webhooks

**For now, your app works fine without webhooks:**
- ✅ Direct API calls work
- ✅ Real-time updates not critical for KYC
- ✅ Simpler architecture

**Add webhooks later when you need:**
- Real-time notifications
- Background processing
- Event-driven workflows

---

**You can configure webhooks later when needed! The app works fine without them.** ✅

