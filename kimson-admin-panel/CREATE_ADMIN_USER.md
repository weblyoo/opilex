# 🔐 Create Admin User - Step by Step

## ❌ Error: `auth/operation-not-allowed`

This error means **Email/Password authentication is not enabled** in Firebase.

---

## ✅ Solution: Enable Email/Password Authentication

### Step 1: Enable Email/Password Auth

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/project/opilex-2a79f/authentication/providers

2. **Enable Email/Password**
   - Click on **Email/Password** in the providers list
   - Toggle **Enable** to ON
   - Click **Save**

3. **Verify**
   - You should see "Email/Password" provider as **Enabled** ✅

---

## Step 2: Create Admin User

### Option A: Using Firebase Console (Easiest)

#### Part 1: Create Firebase Auth User

1. **In Firebase Console**
   - Go to: https://console.firebase.google.com/project/opilex-2a79f/authentication/users
   - Click **Add user** button
   - Enter:
     - **Email**: `admin@opilex.com`
     - **Password**: `Admin@123456` (or your secure password)
   - Click **Add user**
   - **Copy the User UID** (you'll need it in the next step)

#### Part 2: Add to Admins Collection

1. **Go to Firestore**
   - Navigate to: https://console.firebase.google.com/project/opilex-2a79f/firestore

2. **Create Admins Collection**
   - Click **Start collection** (if collection doesn't exist)
   - Collection ID: `admins`
   - Document ID: **Paste the User UID you copied**
   - Add these fields:
     ```
     email: admin@opilex.com (string)
     role: superAdmin (string)
     name: Admin User (string)
     permissions: ["users", "authentications", "rewards", "transactions"] (array)
     createdAt: [Use current timestamp]
     ```

3. **Save**
   - Click **Save**

---

### Option B: Using Script (After Enabling Auth)

Once Email/Password is enabled, you can use the script:

```bash
cd opilex-admin-panel
node scripts/createAdmin.js admin@opilex.com YourPassword123
```

---

### Option C: Manual Web Script

Create a simple HTML file to create admin:

**File: `create-admin.html`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Create Admin User</title>
</head>
<body>
    <h2>Create Admin User</h2>
    <input type="email" id="email" placeholder="Email" value="admin@opilex.com"><br><br>
    <input type="password" id="password" placeholder="Password"><br><br>
    <button onclick="createAdmin()">Create Admin</button>
    <div id="result"></div>

    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
        import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
        import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';

        const firebaseConfig = {
            apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
            authDomain: "opilex-2a79f.firebaseapp.com",
            projectId: "opilex-2a79f",
            storageBucket: "opilex-2a79f.firebasestorage.app",
            messagingSenderId: "1002505057634",
            appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
            measurementId: "G-40Z3KKDR4Y"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        window.createAdmin = async function() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('result');

            try {
                resultDiv.innerHTML = 'Creating user...';
                
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
                
                resultDiv.innerHTML = `
                    <h3 style="color: green;">✅ Admin created successfully!</h3>
                    <p><strong>User ID:</strong> ${userId}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p>You can now login to the admin panel.</p>
                `;
            } catch (error) {
                resultDiv.innerHTML = `
                    <h3 style="color: red;">❌ Error: ${error.message}</h3>
                    <p>Make sure Email/Password authentication is enabled in Firebase Console.</p>
                `;
            }
        };
    </script>
</body>
</html>
```

Open this file in your browser after enabling Email/Password auth.

---

## ✅ Verification

After creating the admin user:

1. **Test Login**
   - Go to: http://localhost:5173
   - Enter email and password
   - Should redirect to dashboard

2. **Check Firestore**
   - Verify document exists in `admins` collection
   - Verify fields are correct

---

## 🔗 Quick Links

- **Enable Auth**: https://console.firebase.google.com/project/opilex-2a79f/authentication/providers
- **Add User**: https://console.firebase.google.com/project/opilex-2a79f/authentication/users
- **Firestore**: https://console.firebase.google.com/project/opilex-2a79f/firestore

---

## 📝 Admin Document Structure

When creating the admin document in Firestore, use this structure:

```json
{
  "email": "admin@opilex.com",
  "role": "superAdmin",
  "name": "Admin User",
  "permissions": [
    "users",
    "authentications",
    "rewards",
    "transactions"
  ],
  "createdAt": "2024-10-29T12:00:00Z"
}
```

**Important**: Use the **Firebase Auth User UID** as the Document ID in the `admins` collection.

---

## 🎯 Summary

1. ✅ Enable Email/Password in Firebase Console
2. ✅ Create user in Authentication
3. ✅ Copy User UID
4. ✅ Add document to `admins` collection with UID as Document ID
5. ✅ Login to admin panel!

