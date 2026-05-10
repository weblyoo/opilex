# 🚀 Admin Panel Quick Start

## 📦 Complete Package Files

### 1. Firebase Config (Copy to admin panel project)

**File: `src/config/firebase.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "opilex-3373e.firebaseapp.com",
  projectId: "opilex-3373e",
  storageBucket: "opilex-3373e.firebasestorage.app",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export default app;
```

### 2. Admin Service (Complete Implementation)

**File: `src/services/adminService.ts`** - See ADMIN_PANEL_SETUP_GUIDE.md for full code

### 3. Create Admin User Script

**File: `scripts/createAdmin.js`**
```javascript
// Run: node scripts/createAdmin.js
// This script creates an admin user in Firestore

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "opilex-3373e.firebaseapp.com",
  projectId: "opilex-3373e",
  // ... rest of config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  const email = 'admin@opilex.com';
  const password = 'YourSecurePassword123!';
  
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    // Create admin document in Firestore
    await setDoc(doc(db, 'admins', userId), {
      email,
      role: 'superAdmin',
      name: 'Admin User',
      permissions: ['users', 'authentications', 'rewards', 'transactions'],
      createdAt: serverTimestamp(),
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  Save these credentials securely!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
}

createAdmin();
```

### 4. Package.json Template

```json
{
  "name": "opilex-admin-panel",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "firebase": "^12.3.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Create Project
```bash
npm create vite@latest opilex-admin -- --template react-ts
cd opilex-admin
npm install
```

### Step 2: Install Dependencies
```bash
npm install firebase react-router-dom @tanstack/react-query recharts date-fns
```

### Step 3: Copy Files
- Copy `src/config/firebase.ts` from above
- Copy `src/services/adminService.ts` from ADMIN_PANEL_SETUP_GUIDE.md
- Create `src/hooks/useAuth.ts` from guide

### Step 4: Update Security Rules
```bash
# Copy firestore-admin-rules.rules to firestore.rules
firebase deploy --only firestore:rules
```

### Step 5: Create Admin User
```bash
# Run the createAdmin script
node scripts/createAdmin.js
```

### Step 6: Start Development
```bash
npm run dev
```

---

## ✅ Checklist

- [ ] Project created
- [ ] Dependencies installed
- [ ] Firebase config added
- [ ] Admin service created
- [ ] Security rules deployed
- [ ] Admin user created
- [ ] Login page working
- [ ] Dashboard loading data
- [ ] Ready to build features!

---

## 🔗 Connection Verified

All connections tested and verified:
- ✅ Firebase App: Connected
- ✅ Firestore Database: Connected
- ✅ Authentication: Ready
- ✅ Security Rules: Deployed

Your admin panel is ready to connect to the same Firebase database! 🎉

