# 🗑️ Delete Users Guide

## Option 1: Delete via Firebase Console (Recommended - Easiest)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/project/kimson-3373e/firestore
2. Sign in if needed

### Step 2: Find and Delete Users

#### For Phone: +91 83808 43472
1. Click on **"users"** collection
2. Search for phone number: `+918380843472` or `8380843472`
3. Click on the user document
4. Note the **Document ID** (this is the userId)
5. Click **Delete** button
6. Confirm deletion

#### For Phone: +91 91120 05199
1. Search for phone number: `+919112005199` or `9112005199`
2. Click on the user document
3. Note the **Document ID** (this is the userId)
4. Click **Delete** button
5. Confirm deletion

### Step 3: Delete Related Data

For each user, delete related data:

#### Delete Wire Authentications
1. Go to **"wireAuthentications"** collection
2. Filter by `userId` = (the Document ID from Step 2)
3. Select all matching documents
4. Click **Delete**

#### Delete Rewards
1. Go to **"rewards"** collection
2. Filter by `userId` = (the Document ID from Step 2)
3. Select all matching documents
4. Click **Delete**

#### Delete Transactions
1. Go to **"transactions"** collection
2. Filter by `userId` = (the Document ID from Step 2)
3. Select all matching documents
4. Click **Delete**

### Step 4: Delete from Firebase Authentication (Optional)
1. Go to: https://console.firebase.google.com/project/kimson-3373e/authentication/users
2. Search for the phone numbers
3. Click on each user
4. Click **Delete user** button
5. Confirm deletion

---

## Option 2: Use Admin Panel Script

If you're logged into the admin panel, you can use the browser console:

1. Open Admin Panel
2. Open Browser Console (F12)
3. Copy and paste this script:

```javascript
// Delete users by phone number
async function deleteUsersByPhone() {
  const { db } = await import('./src/config/firebase.ts');
  const { collection, query, where, getDocs, deleteDoc, doc, writeBatch } = await import('firebase/firestore');
  
  const phoneNumbers = ['+918380843472', '+919112005199'];
  
  for (const phone of phoneNumbers) {
    console.log(`\n🔍 Searching for: ${phone}`);
    
    // Find user
    const usersQuery = query(collection(db, 'users'), where('phoneNumber', '==', phone));
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      console.log(`   ⚠️  User not found: ${phone}`);
      continue;
    }
    
    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    console.log(`   ✅ Found user: ${userId}`);
    
    // Delete related data
    const batch = writeBatch(db);
    let count = 0;
    
    // Wire authentications
    const authsQuery = query(collection(db, 'wireAuthentications'), where('userId', '==', userId));
    const authsSnapshot = await getDocs(authsQuery);
    authsSnapshot.forEach(doc => { batch.delete(doc.ref); count++; });
    console.log(`   📋 Found ${authsSnapshot.size} wireAuthentications`);
    
    // Rewards
    const rewardsQuery = query(collection(db, 'rewards'), where('userId', '==', userId));
    const rewardsSnapshot = await getDocs(rewardsQuery);
    rewardsSnapshot.forEach(doc => { batch.delete(doc.ref); count++; });
    console.log(`   📋 Found ${rewardsSnapshot.size} rewards`);
    
    // Transactions
    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    transactionsSnapshot.forEach(doc => { batch.delete(doc.ref); count++; });
    console.log(`   📋 Found ${transactionsSnapshot.size} transactions`);
    
    // User document
    batch.delete(doc(db, 'users', userId));
    count++;
    
    // Commit
    await batch.commit();
    console.log(`   ✅ Deleted ${count} documents for user: ${phone}`);
  }
  
  console.log('\n✅ Deletion complete!');
}

deleteUsersByPhone();
```

---

## Option 3: Quick Firebase Console Method

### Fastest Way:

1. **Open Firestore**: https://console.firebase.google.com/project/kimson-3373e/firestore/data
2. **Search for users**:
   - Click on `users` collection
   - Use the search/filter to find phone numbers: `8380843472` or `9112005199`
3. **Delete user documents**:
   - Click on each user document
   - Click **Delete** button
   - Confirm

4. **Clean up related data** (optional but recommended):
   - Go to `wireAuthentications` → Filter by userId → Delete
   - Go to `rewards` → Filter by userId → Delete  
   - Go to `transactions` → Filter by userId → Delete

5. **Delete from Authentication** (optional):
   - Go to Authentication → Users
   - Find by phone number
   - Delete

---

## ✅ After Deletion

Once users are deleted:
- ✅ They can register again with the same phone numbers
- ✅ All their data is removed from Firestore
- ✅ They will need to complete registration again
- ✅ They can select "Dealer" or "Electrician" during registration

---

## 📝 Notes

- **Firebase Authentication**: Users in Firebase Auth will remain unless manually deleted
- **Phone numbers**: Can be reused immediately after deletion
- **Data recovery**: Deleted data cannot be recovered, so be sure before deleting

---

**Recommended**: Use **Option 1 (Firebase Console)** as it's the most straightforward and visual.
