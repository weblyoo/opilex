# ⚡ Quick Fix: Enable Email/Password Auth

## ⚠️ Error: `auth/operation-not-allowed`

This means Email/Password authentication is **disabled** in Firebase.

---

## ✅ Fix in 2 Minutes

### Step 1: Enable Email/Password (30 seconds)

1. **Click this link**:
   https://console.firebase.google.com/project/kimson-3373e/authentication/providers

2. **Find "Email/Password"** in the list

3. **Click on it**

4. **Toggle "Enable" to ON** ✅

5. **Click "Save"**

6. **Done!** ✅

---

### Step 2: Create Admin User

Now you can create admin using any method:

**Option A: Use HTML File** (Easiest)
1. Open `create-admin.html` in your browser
2. Fill in email and password
3. Click "Create Admin User"

**Option B: Use Script**
```bash
node scripts/createAdmin.js admin@kimson.com YourPassword123
```

**Option C: Manual in Firebase Console**
1. Authentication → Add user
2. Copy User UID
3. Firestore → admins collection → Add document

---

## ✅ That's It!

Once Email/Password is enabled, everything works! 🎉

---

**Quick Link**: https://console.firebase.google.com/project/kimson-3373e/authentication/providers

