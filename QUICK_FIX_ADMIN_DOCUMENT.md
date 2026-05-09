# ⚡ Quick Fix: Admin Document Structure

## The Problem

The admin user document in Firestore needs to have this exact structure, but the script can't write without authentication.

## ✅ EASIEST SOLUTION: Use Firebase Console

**No authentication needed!** Just manually create/update the document:

### Step 1: Open Firestore

Go to: https://console.firebase.google.com/project/kimson-3373e/firestore

### Step 2: Open/Create Document

1. Click on **`admins`** collection (create if doesn't exist)
2. Find or create document with ID: `0GpunGg9R7NaLpsXZNfwyz2KfZd2`

### Step 3: Add Fields

Click on the document and add these fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `superadmin@kimson.com` |
| `role` | string | `superAdmin` |
| `name` | string | `Admin User` |
| `permissions` | array | `users`, `authentications`, `rewards`, `transactions` |
| `createdAt` | timestamp | Click "Use server timestamp" |

### Step 4: Save

Click **Update** or **Save**

## ✅ Alternative: Use Script (Requires Password)

If you prefer using the script:

```bash
cd kimson-admin-panel
node scripts/updateAdminUser.js YourPassword
```

**Note**: Replace `YourPassword` with the actual Firebase Auth password.

## 📋 Exact Structure Required

```json
{
  "email": "superadmin@kimson.com",
  "role": "superAdmin",
  "name": "Admin User",
  "permissions": ["users", "authentications", "rewards", "transactions"],
  "createdAt": [server timestamp]
}
```

## ✅ Verify

After creating/updating:

1. Check document exists in `admins` collection
2. Document ID: `0GpunGg9R7NaLpsXZNfwyz2KfZd2`
3. All fields match structure above
4. Try logging in: http://localhost:5173

---

**Recommendation**: Use Firebase Console method - it's the fastest and doesn't require passwords! 🚀

