# 🚀 Starting the Admin Panel

## Quick Start

### Step 1: Navigate to Admin Panel Directory
```bash
cd kimson-admin-panel
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Open: **http://localhost:5173**

You should see the **Login Page**.

---

## ✅ Before First Login

### 1. Enable Email/Password Authentication

1. Go to: https://console.firebase.google.com/project/kimson-3373e/authentication/providers
2. Click **Email/Password**
3. Enable it
4. Click **Save**

### 2. Create Admin User

**Option A: Using Script** (Recommended)
```bash
node scripts/createAdmin.js admin@kimson.com YourPassword123
```

**Option B: Manual**
1. Firebase Console → Authentication → Add user
   - Email: admin@kimson.com
   - Password: (choose secure password)
2. Copy the User UID
3. Firebase Console → Firestore → Create Collection `admins`
4. Add document with UID as Document ID:
   ```json
   {
     "email": "admin@kimson.com",
     "role": "superAdmin",
     "name": "Admin User",
     "permissions": ["users", "authentications", "rewards", "transactions"],
     "createdAt": [server timestamp]
   }
   ```

---

## 🔍 Troubleshooting

### If the page shows blank or errors:

1. **Check Browser Console** (F12)
   - Look for red error messages
   - Check Network tab for failed requests

2. **Verify Dev Server is Running**
   - Should see: `VITE v7.1.12 ready`
   - URL: `http://localhost:5173`

3. **Check Firebase Connection**
   - Open browser console
   - Look for Firebase errors
   - Verify config in `src/config/firebase.ts`

4. **Common Issues**:
   - **Port already in use**: Use `npm run dev -- --port 3000`
   - **Module not found**: Run `npm install`
   - **TypeScript errors**: Already fixed! ✅

---

## ✅ What Should Work

✅ Dev server starts successfully  
✅ Login page displays at http://localhost:5173  
✅ No console errors  
✅ Tailwind CSS styles applied  
✅ Firebase connection working  

---

## 📝 Next Steps After Login

Once logged in, you'll see:
- Dashboard with statistics
- (Coming soon) User Management
- (Coming soon) Wire Authentications
- (Coming soon) Rewards Management
- (Coming soon) Transactions

---

## 🆘 Still Not Working?

See `TROUBLESHOOTING.md` for detailed help.

