# 🗑️ Delete Users - Quick Instructions

## ✅ Easiest Method: Firebase Console

Since programmatic deletion requires admin credentials, here's the fastest way:

### Step 1: Open Firebase Console
**Direct Link**: https://console.firebase.google.com/project/kimson-3373e/firestore/data

### Step 2: Delete Users

1. Click on **`users`** collection
2. Use the search/filter box at the top
3. Search for phone number: `8380843472` or `9112005199`
4. Click on each user document
5. Click **Delete** button (trash icon)
6. Confirm deletion

### Step 3: Clean Up Related Data (Optional)

For each deleted user, you can optionally delete related data:

1. Go to **`wireAuthentications`** collection
2. Filter by `userId` = (the user ID you deleted)
3. Select all → Delete

Repeat for:
- **`rewards`** collection
- **`transactions`** collection

### Step 4: Delete from Authentication (Optional)

1. Go to: https://console.firebase.google.com/project/kimson-3373e/authentication/users
2. Search for phone numbers
3. Delete each user

---

## ✅ Alternative: Admin Panel Browser Console

If admin panel is running:

1. Open admin panel: http://localhost:5173
2. Login as admin
3. Open Browser Console (F12)
4. Run:
   ```javascript
   // Import deleteUsers utility
   import { deleteUsersByPhoneNumbers } from './src/utils/deleteUsers';
   
   // Delete the users
   deleteUsersByPhoneNumbers(['+918380843472', '+919112005199']).then(results => {
     console.log('Results:', results);
   });
   ```

---

## ✅ After Deletion

- ✅ Users can register again with same phone numbers
- ✅ All data is removed
- ✅ Fresh start for registration

---

**Recommended**: Use **Firebase Console method** - it's the fastest and most reliable!
