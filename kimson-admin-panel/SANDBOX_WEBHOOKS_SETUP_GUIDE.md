# 📡 Sandbox Webhooks Setup Guide

## 🎯 Overview

Sandbox webhooks allow you to receive real-time events from Sandbox APIs without polling. This is useful for:
- **KYC Status Updates** - Get notified when KYC verification completes
- **Payment Events** - Real-time payment status updates
- **Transaction Updates** - Get instant transaction notifications
- **Event-Based Workflows** - Build robust, event-driven applications

---

## ⚠️ Important: Webhook Architecture

**For React Native/Expo Apps:**
- ❌ Mobile apps **cannot directly receive webhooks**
- ✅ You need a **backend server** to receive webhooks
- ✅ Backend processes webhook and notifies mobile app (via push notifications or polling)

**Recommended Architecture:**
```
Sandbox API → Webhook → Backend Server → Mobile App
                                    ↓
                            (Push Notification / Firebase)
```

---

## 🔧 Setup Options

### Option 1: Firebase Cloud Functions (Recommended)

Receive webhooks via Firebase Cloud Functions and notify users via push notifications.

### Option 2: Backend Server

Use your own backend server (Node.js, Python, etc.) to receive webhooks.

### Option 3: Third-Party Webhook Service

Use services like Zapier, Make.com, or n8n as webhook receivers.

---

## 📋 Sandbox Dashboard Configuration

### Step 1: Configure Webhook in Sandbox Dashboard

1. **Go to:** Sandbox Dashboard → Webhooks
2. **Click:** "Add Webhook" or "Configure Webhook"
3. **Fill in:**
   - **Webhook URL:** Your server endpoint (e.g., `https://your-backend.com/webhook/sandbox`)
   - **Events:** Select events to receive:
     - ✅ KYC Verification Complete
     - ✅ KYC Verification Failed
     - ✅ Payment Status Updates
     - ✅ Transaction Updates
   - **Status:** Enable

---

## 🔧 Option 1: Firebase Cloud Functions Setup

### Step 1: Install Firebase Functions

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### Step 2: Create Webhook Handler

**File:** `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Sandbox webhook endpoint
export const sandboxWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Verify webhook signature (if Sandbox provides one)
    const signature = req.headers['x-sandbox-signature'];
    // Add signature verification logic here
    
    const webhookData = req.body;
    const eventType = webhookData.event_type;
    const data = webhookData.data;
    
    console.log('Sandbox webhook received:', eventType, data);
    
    switch (eventType) {
      case 'kyc.verification.complete':
        await handleKYCComplete(data);
        break;
      case 'kyc.verification.failed':
        await handleKYCFailed(data);
        break;
      default:
        console.log('Unknown event type:', eventType);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleKYCComplete(data: any) {
  const userId = data.user_id || data.userId;
  const requestId = data.request_id;
  
  if (!userId) {
    console.error('No user ID in webhook data');
    return;
  }
  
  // Update user KYC status in Firestore
  await admin.firestore().collection('users').doc(userId).update({
    kycVerified: true,
    kycVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    kycRequestId: requestId,
  });
  
  // Send push notification to user
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();
  const fcmToken = userData?.fcmToken;
  
  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: 'KYC Verification Complete',
        body: 'Your Aadhaar verification was successful!',
      },
      data: {
        type: 'kyc_complete',
        userId: userId,
      },
    });
  }
}

async function handleKYCFailed(data: any) {
  const userId = data.user_id || data.userId;
  
  if (!userId) return;
  
  // Send push notification about failure
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();
  const fcmToken = userData?.fcmToken;
  
  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: 'KYC Verification Failed',
        body: data.message || 'Please try again',
      },
      data: {
        type: 'kyc_failed',
        userId: userId,
      },
    });
  }
}
```

### Step 3: Deploy Cloud Function

```bash
firebase deploy --only functions:sandboxWebhook
```

### Step 4: Get Webhook URL

After deployment, you'll get a URL like:
```
https://us-central1-opilex-3373e.cloudfunctions.net/sandboxWebhook
```

### Step 5: Configure in Sandbox Dashboard

1. Copy the Cloud Function URL
2. Paste in Sandbox Dashboard → Webhooks → Webhook URL
3. Select events you want to receive
4. Enable webhook

---

## 🔧 Option 2: Backend Server Setup (Node.js Example)

### Step 1: Create Express Server

**File:** `backend/server.js`

```javascript
const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Sandbox webhook endpoint
app.post('/webhook/sandbox', async (req, res) => {
  try {
    const webhookData = req.body;
    const eventType = webhookData.event_type;
    
    console.log('Sandbox webhook:', eventType);
    
    // Process webhook
    if (eventType === 'kyc.verification.complete') {
      await handleKYCComplete(webhookData.data);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function handleKYCComplete(data) {
  const userId = data.user_id;
  
  // Update Firestore
  await admin.firestore()
    .collection('users')
    .doc(userId)
    .update({
      kycVerified: true,
      kycVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  
  // Send push notification
  // ... notification logic
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Step 2: Deploy to Server

Deploy to:
- Heroku
- AWS Lambda
- Google Cloud Run
- Your own server

### Step 3: Configure Webhook URL

Use your deployed server URL:
```
https://your-backend.com/webhook/sandbox
```

---

## 📱 Mobile App Integration

### Step 1: Add Push Notifications

**Install:**
```bash
npm install expo-notifications
```

### Step 2: Request Notification Permissions

**File:** `src/utils/notifications.ts`

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);
  
  // Save token to Firestore for webhook handler
  // await savePushTokenToFirestore(token);
  
  return token;
}
```

### Step 3: Listen for Notifications

```typescript
useEffect(() => {
  // Handle notifications received while app is foregrounded
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    
    if (notification.request.content.data.type === 'kyc_complete') {
      // Refresh user data
      refreshUser();
      // Show success message
      Alert.alert('KYC Verified!', 'Your Aadhaar verification is complete.');
    }
  });
  
  return () => subscription.remove();
}, []);
```

---

## 🔒 Webhook Security

### Verify Webhook Signature

Sandbox may send a signature header. Always verify:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 📋 Webhook Event Types

Common Sandbox webhook events:

1. **KYC Events:**
   - `kyc.verification.complete` - KYC verified successfully
   - `kyc.verification.failed` - KYC verification failed
   - `kyc.otp.sent` - OTP sent to user

2. **Payment Events:**
   - `payment.success` - Payment completed
   - `payment.failed` - Payment failed
   - `payment.refunded` - Payment refunded

---

## ✅ Quick Setup Checklist

- [ ] Choose webhook receiver (Firebase Functions / Backend Server)
- [ ] Deploy webhook endpoint
- [ ] Get webhook URL
- [ ] Configure in Sandbox Dashboard
- [ ] Select events to receive
- [ ] Test webhook (Sandbox may have a test button)
- [ ] Implement notification handling in mobile app
- [ ] Add push notification permissions
- [ ] Test end-to-end flow

---

## 🆘 Testing Webhooks

### Option 1: Use Sandbox Test Mode
- Sandbox may provide webhook testing tools
- Test with sample events

### Option 2: Use ngrok (Local Testing)
```bash
npm install -g ngrok
ngrok http 3000
# Use ngrok URL as webhook URL in Sandbox dashboard
```

### Option 3: Use RequestBin
1. Go to https://requestbin.com
2. Create a bin
3. Use bin URL as webhook URL
4. Test and view requests

---

**Webhooks are now configured! Set up your backend receiver to process Sandbox events.** 📡

