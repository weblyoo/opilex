# 🔧 Fix Admin User Document - Manual Steps

## Problem
The admin user document in Firestore needs to match this exact structure:

```json
{
  "email": "superadmin@opilex.com",
  "role": "superAdmin",
  "name": "Admin User",
  "permissions": ["users", "authentications", "rewards", "transactions"],
  "createdAt": [server timestamp]
}
```

## Current Admin User
- **Email**: `superadmin@opilex.com`
- **UID**: `0GpunGg9R7NaLpsXZNfwyz2KfZd2`

## ✅ Fix Using Firebase Console

### Step 1: Open Firestore

1. Go to: https://console.firebase.google.com/project/opilex-2a79f/firestore

### Step 2: Navigate to Admins Collection

1. Click on **`admins`** collection in the left sidebar
2. Find document with ID: `0GpunGg9R7NaLpsXZNfwyz2KfZd2`
3. If it doesn't exist, click **"Add document"** and set Document ID to: `0GpunGg9R7NaLpsXZNfwyz2KfZd2`

### Step 3: Add/Update Fields

Click on the document and ensure it has these exact fields:

1. **email** (string)
   - Value: `superadmin@opilex.com`

2. **role** (string)
   - Value: `superAdmin`

3. **name** (string)
   - Value: `Admin User`

4. **permissions** (array)
   - Click "Add field" → Select "array"
   - Add these items:
     - `users`
     - `authentications`
     - `rewards`
     - `transactions`

5. **createdAt** (timestamp)
   - Click "Add field" → Select "timestamp"
   - Click "Set to server timestamp" or use current date

### Step 4: Save

Click **"Update"** or **"Save"** to save the document.

## ✅ Fix Using Script

**Option B**: Run the fix script:

```bash
cd opilex-admin-panel
node scripts/fixAdminUser.js
```

## Verify

After fixing, verify the document structure:

1. Go to Firestore: https://console.firebase.google.com/project/opilex-2a79f/firestore
2. Open `admins` collection
3. Check document `0GpunGg9R7NaLpsXZNfwyz2KfZd2`
4. Ensure all fields match the structure above

## Expected Result

The document should look like this in Firebase Console:

```
Collection: admins
Document ID: 0GpunGg9R7NaLpsXZNfwyz2KfZd2

Fields:
├── email: "superadmin@opilex.com"
├── role: "superAdmin"
├── name: "Admin User"
├── permissions: ["users", "authentications", "rewards", "transactions"]
└── createdAt: [timestamp]
```

## Test Login

After fixing, test login:

1. Start admin panel: `npm run dev`
2. Go to: http://localhost:5173
3. Login with: `superadmin@opilex.com` + your password
4. Should successfully authenticate and show dashboard

## Troubleshooting

If login still fails:

1. Check browser console (F12) for errors
2. Verify document exists in Firestore
3. Ensure all field names match exactly (case-sensitive)
4. Check if Email/Password auth is enabled
5. Verify Firebase Auth user exists with correct UID

