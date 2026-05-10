# 🖥️ Web Admin Panel Setup Guide - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Firebase Configuration](#firebase-configuration)
5. [Authentication Setup](#authentication-setup)
6. [Database Connection](#database-connection)
7. [Admin Features Implementation](#admin-features-implementation)
8. [Security Rules for Admin](#security-rules-for-admin)
9. [Deployment](#deployment)

---

## 📖 Overview

This guide will help you create a **web admin panel** that connects to the same Firebase database (`opilex-2a79f`) used by your React Native mobile app. The admin panel will allow you to:

- View all users and their data
- Monitor wire authentications
- Manage rewards and transactions
- View analytics and statistics
- Approve/reject withdrawal requests
- Manage user accounts

---

## ✅ Prerequisites

Before starting, ensure you have:

- Node.js 16+ installed
- npm or yarn package manager
- Firebase project access (opilex-2a79f)
- Basic knowledge of React/Next.js
- Git installed

---

## 🚀 Project Setup

### Option 1: React + Vite (Recommended for Simple Admin)

```bash
# Create new React project
npm create vite@latest opilex-admin-panel -- --template react-ts
cd opilex-admin-panel
npm install

# Install Firebase and UI dependencies
npm install firebase
npm install react-router-dom
npm install @tanstack/react-query
npm install recharts  # For charts/analytics
npm install date-fns   # For date formatting
```

### Option 2: Next.js (Recommended for Production)

```bash
# Create Next.js project
npx create-next-app@latest opilex-admin-panel --typescript --tailwind --app
cd opilex-admin-panel

# Install Firebase dependencies
npm install firebase
npm install @tanstack/react-query
npm install recharts
npm install date-fns
npm install next-auth  # Optional: for additional auth
```

### Option 3: React Admin (Quick Setup)

```bash
# Using React Admin framework
npm install react-admin firebase firebase-admin
npm install ra-data-firestore
```

---

## 🔥 Firebase Configuration

### Step 1: Create Firebase Config File

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// ⚠️ SAME CONFIG AS MOBILE APP
const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "opilex-2a79f.firebaseapp.com",
  projectId: "opilex-2a79f",
  storageBucket: "opilex-2a79f.firebasestorage.app",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export default app;
```

### Step 2: Install Firebase

```bash
npm install firebase
```

---

## 🔐 Authentication Setup

### Step 1: Enable Email/Password Authentication

In Firebase Console:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Email link (passwordless sign-in)** if needed

### Step 2: Create Admin Authentication Hook

Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'superAdmin';
  name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const adminData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: adminData.role || 'admin',
            name: adminData.name
          });
        } else {
          // Not an admin - sign out
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, login, logout };
};
```

### Step 3: Create Admin Collection in Firestore

Add admin users to Firestore:

```typescript
// In Firebase Console or via script
// Collection: 'admins'
// Document ID: Firebase UID
{
  email: 'admin@opilex.com',
  role: 'superAdmin',
  name: 'Admin User',
  createdAt: serverTimestamp(),
  permissions: ['users', 'authentications', 'rewards', 'transactions']
}
```

### Step 4: Create Login Component

Create `src/components/Login.tsx`:

```typescript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Opilex Admin Panel
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          {error && (
            <div className="mb-4 text-red-500 text-sm">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
```

---

## 💾 Database Connection

### Step 1: Create Admin Services

Create `src/services/adminService.ts`:

```typescript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  WIRE_AUTHENTICATIONS: 'wireAuthentications',
  REWARDS: 'rewards',
  TRANSACTIONS: 'transactions',
  ADMINS: 'admins',
} as const;

// ============ USER MANAGEMENT ============
export const adminUserService = {
  // Get all users
  async getAllUsers(): Promise<any[]> {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Get user by ID
  async getUserById(userId: string): Promise<any | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  },

  // Update user
  async updateUser(userId: string, data: any): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete user (be careful!)
  async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  },

  // Search users
  async searchUsers(searchTerm: string): Promise<any[]> {
    const allUsers = await this.getAllUsers();
    return allUsers.filter(user => 
      user.phoneNumber?.includes(searchTerm) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
};

// ============ WIRE AUTHENTICATIONS ============
export const adminWireAuthService = {
  // Get all authentications
  async getAllAuthentications(): Promise<any[]> {
    const q = query(
      collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
      orderBy('authenticatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Get authentications by user
  async getAuthenticationsByUser(userId: string): Promise<any[]> {
    const q = query(
      collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
      where('userId', '==', userId),
      orderBy('authenticatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Get statistics
  async getStatistics(): Promise<any> {
    const allAuths = await this.getAllAuthentications();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: allAuths.length,
      today: allAuths.filter(auth => {
        const authDate = auth.authenticatedAt?.toDate();
        return authDate && authDate >= today;
      }).length,
      thisWeek: allAuths.filter(auth => {
        const authDate = auth.authenticatedAt?.toDate();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return authDate && authDate >= weekAgo;
      }).length,
      thisMonth: allAuths.filter(auth => {
        const authDate = auth.authenticatedAt?.toDate();
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return authDate && authDate >= monthAgo;
      }).length,
    };
  },
};

// ============ REWARDS MANAGEMENT ============
export const adminRewardService = {
  // Get all rewards
  async getAllRewards(): Promise<any[]> {
    const q = query(
      collection(db, COLLECTIONS.REWARDS),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Get rewards by user
  async getRewardsByUser(userId: string): Promise<any[]> {
    const q = query(
      collection(db, COLLECTIONS.REWARDS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Get total points statistics
  async getTotalPointsStats(): Promise<any> {
    const allRewards = await this.getAllRewards();
    const totalPoints = allRewards.reduce((sum, reward) => sum + (reward.points || 0), 0);

    const usersMap = new Map();
    allRewards.forEach(reward => {
      const current = usersMap.get(reward.userId) || 0;
      usersMap.set(reward.userId, current + (reward.points || 0));
    });

    return {
      totalPoints,
      totalRewards: allRewards.length,
      uniqueUsers: usersMap.size,
      averagePerUser: usersMap.size > 0 ? totalPoints / usersMap.size : 0,
    };
  },
};

// ============ TRANSACTIONS MANAGEMENT ============
export const adminTransactionService = {
  // Get all transactions
  async getAllTransactions(): Promise<any[]> {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      orderBy('requestedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Get pending withdrawals
  async getPendingWithdrawals(): Promise<any[]> {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), {
      status,
      notes,
      processedAt: Timestamp.now(),
    });
  },
};
```

### Step 2: Create Admin Dashboard Component

Create `src/components/Dashboard.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { adminWireAuthService } from '../services/adminService';
import { adminRewardService } from '../services/adminService';
import { adminTransactionService } from '../services/adminService';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    authentications: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
    rewards: { totalPoints: 0, totalRewards: 0, uniqueUsers: 0 },
    transactions: { pending: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [authStats, rewardStats, transactions] = await Promise.all([
        adminWireAuthService.getStatistics(),
        adminRewardService.getTotalPointsStats(),
        adminTransactionService.getPendingWithdrawals(),
      ]);

      setStats({
        authentications: authStats,
        rewards: rewardStats,
        transactions: {
          pending: transactions.length,
          total: 0, // Load separately if needed
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Authentication Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Wire Authentications</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.authentications.total}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Today: {stats.authentications.today}
          </p>
        </div>

        {/* Rewards Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Points</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.rewards.totalPoints.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.rewards.uniqueUsers} users
          </p>
        </div>

        {/* Pending Transactions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Withdrawals</h3>
          <p className="text-3xl font-bold text-orange-600">
            {stats.transactions.pending}
          </p>
          <p className="text-sm text-gray-500 mt-2">Requires action</p>
        </div>

        {/* Weekly Authentications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">This Week</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.authentications.thisWeek}
          </p>
          <p className="text-sm text-gray-500 mt-2">Authentications</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔒 Security Rules for Admin

Update `firestore.rules` to include admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Admin access - admins can read/write everything
    match /{document=**} {
      allow read, write: if isAdmin();
    }

    // Regular user rules (same as mobile app)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /wireAuthentications/{authId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
                       (resource.data.userId == request.auth.uid || isAdmin());
    }
    
    match /rewards/{rewardId} {
      allow read: if request.auth != null && 
                       (resource.data.userId == request.auth.uid || isAdmin());
    }
    
    match /transactions/{transactionId} {
      allow create, read: if request.auth != null && 
                                (resource.data.userId == request.auth.uid || isAdmin());
    }

    // Admin collection - only admins can read
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
  }
}
```

**Deploy updated rules:**
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Admin Features Implementation

### 1. Users Management Page

Create `src/pages/Users.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { adminUserService } from '../services/adminService';

export const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await adminUserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                KYC Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.userType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.rewardPoints || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.kycVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.kycVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### 2. Authentications Page

Create `src/pages/Authentications.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { adminWireAuthService } from '../services/adminService';
import { format } from 'date-fns';

export const AuthenticationsPage = () => {
  const [authentications, setAuthentications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthentications();
  }, []);

  const loadAuthentications = async () => {
    try {
      const all = await adminWireAuthService.getAllAuthentications();
      setAuthentications(all);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Wire Authentications</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                QR Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {authentications.map((auth) => (
              <tr key={auth.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  {auth.qrCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {auth.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  +{auth.rewardPoints}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {auth.authenticatedAt?.toDate() 
                    ? format(auth.authenticatedAt.toDate(), 'PPp')
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## 🚀 Deployment

### Option 1: Deploy to Firebase Hosting

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build your app
npm run build

# Deploy
firebase deploy --only hosting
```

### Option 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 3: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## 📝 Complete Project Structure

```
opilex-admin-panel/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── hooks/
│   │   └── useAuth.ts            # Authentication hook
│   ├── services/
│   │   └── adminService.ts      # Admin database services
│   ├── components/
│   │   ├── Login.tsx             # Login component
│   │   ├── Dashboard.tsx         # Dashboard component
│   │   └── Layout.tsx            # App layout
│   ├── pages/
│   │   ├── Users.tsx             # Users management
│   │   ├── Authentications.tsx   # Wire authentications
│   │   ├── Rewards.tsx           # Rewards management
│   │   └── Transactions.tsx     # Transactions management
│   └── App.tsx                    # Main app component
├── firebase.json                  # Firebase config
├── .firebaserc                    # Firebase project
├── package.json
└── README.md
```

---

## ✅ Quick Start Checklist

- [ ] Create new React/Next.js project
- [ ] Install Firebase SDK
- [ ] Copy Firebase config from mobile app
- [ ] Set up authentication with email/password
- [ ] Create admin users in Firestore
- [ ] Update Firestore security rules
- [ ] Deploy updated rules
- [ ] Create admin services
- [ ] Build admin UI components
- [ ] Test admin panel functionality
- [ ] Deploy to hosting

---

## 🔗 Useful Links

- **Firebase Console**: https://console.firebase.google.com/project/opilex-2a79f
- **Firestore Rules**: https://console.firebase.google.com/project/opilex-2a79f/firestore/rules
- **Authentication**: https://console.firebase.google.com/project/opilex-2a79f/authentication/providers
- **Firebase Docs**: https://firebase.google.com/docs

---

## 🎉 You're Ready!

Your admin panel will now connect to the same Firebase database as your mobile app, allowing you to manage all user data, authenticate wires, manage rewards, and process transactions from a web interface!
