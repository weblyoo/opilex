/**
 * Script to completely delete users from Firebase
 * This will delete:
 * - User document from Firestore 'users' collection
 * - All wireAuthentications for the user
 * - All rewards for the user
 * - All transactions for the user
 * - User from Firebase Authentication (if possible)
 * 
 * Usage: node scripts/deleteUsers.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, deleteUser as deleteAuthUser } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  writeBatch
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "kimson-3373e.firebaseapp.com",
  projectId: "kimson-3373e",
  storageBucket: "kimson-3373e.firebasestorage.app",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Phone numbers to delete
const phoneNumbersToDelete = [
  '+918380843472',  // +91 83808 43472
  '+919112005199',  // +91 91120 05199
];

// Normalize phone number (remove spaces, ensure +91 prefix)
function normalizePhoneNumber(phone) {
  let normalized = phone.replace(/\s+/g, '').trim();
  if (!normalized.startsWith('+91')) {
    if (normalized.startsWith('91')) {
      normalized = '+' + normalized;
    } else if (normalized.startsWith('0')) {
      normalized = '+91' + normalized.substring(1);
    } else {
      normalized = '+91' + normalized;
    }
  }
  return normalized;
}

// Find user by phone number
async function findUserByPhoneNumber(phoneNumber) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  console.log(`\n🔍 Searching for user with phone: ${normalizedPhone}`);
  
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('phoneNumber', '==', normalizedPhone)
    );
    
    const snapshot = await getDocs(usersQuery);
    
    if (snapshot.empty) {
      console.log(`   ⚠️  No user found with phone: ${normalizedPhone}`);
      return null;
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`   ✅ Found user: ${userData.name || 'No name'} (ID: ${userDoc.id})`);
    console.log(`      Phone: ${userData.phoneNumber}`);
    console.log(`      Email: ${userData.email || 'No email'}`);
    console.log(`      User Type: ${userData.userType || 'Not set'}`);
    
    return {
      id: userDoc.id,
      ...userData
    };
  } catch (error) {
    console.error(`   ❌ Error searching for user:`, error.message);
    return null;
  }
}

// Delete all related data for a user
async function deleteUserData(userId) {
  console.log(`\n🗑️  Deleting all data for user: ${userId}`);
  
  const batch = writeBatch(db);
  let deleteCount = 0;
  
  try {
    // 1. Delete wireAuthentications
    console.log(`   📋 Checking wireAuthentications...`);
    const authsQuery = query(
      collection(db, 'wireAuthentications'),
      where('userId', '==', userId)
    );
    const authsSnapshot = await getDocs(authsQuery);
    authsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${authsSnapshot.size} wireAuthentications to delete`);
    
    // 2. Delete rewards
    console.log(`   📋 Checking rewards...`);
    const rewardsQuery = query(
      collection(db, 'rewards'),
      where('userId', '==', userId)
    );
    const rewardsSnapshot = await getDocs(rewardsQuery);
    rewardsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${rewardsSnapshot.size} rewards to delete`);
    
    // 3. Delete transactions
    console.log(`   📋 Checking transactions...`);
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    transactionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${transactionsSnapshot.size} transactions to delete`);
    
    // 4. Delete user document
    console.log(`   📋 Deleting user document...`);
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);
    deleteCount++;
    
    // Commit all deletions
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`   ✅ Successfully deleted ${deleteCount} documents`);
    } else {
      console.log(`   ⚠️  No documents found to delete`);
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error deleting user data:`, error.message);
    return false;
  }
}

// Main function
async function deleteUsers() {
  console.log('🚀 Starting user deletion process...');
  console.log(`📱 Phone numbers to delete: ${phoneNumbersToDelete.join(', ')}`);
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const phoneNumber of phoneNumbersToDelete) {
    try {
      // Find user
      const user = await findUserByPhoneNumber(phoneNumber);
      
      if (!user) {
        results.push({
          phoneNumber,
          success: false,
          message: 'User not found'
        });
        continue;
      }
      
      // Delete all user data
      const deleted = await deleteUserData(user.id);
      
      if (deleted) {
        results.push({
          phoneNumber,
          userId: user.id,
          success: true,
          message: 'User and all related data deleted successfully'
        });
        console.log(`\n✅ Successfully deleted user: ${phoneNumber}`);
      } else {
        results.push({
          phoneNumber,
          userId: user.id,
          success: false,
          message: 'Failed to delete user data'
        });
        console.log(`\n❌ Failed to delete user: ${phoneNumber}`);
      }
    } catch (error) {
      console.error(`\n❌ Error processing ${phoneNumber}:`, error.message);
      results.push({
        phoneNumber,
        success: false,
        message: `Error: ${error.message}`
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DELETION SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. Phone: ${result.phoneNumber}`);
    console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.userId) {
      console.log(`   User ID: ${result.userId}`);
    }
    console.log(`   Message: ${result.message}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`\n📈 Total: ${results.length} users processed`);
  console.log(`   ✅ Successfully deleted: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  
  if (successCount > 0) {
    console.log('\n✅ Users deleted successfully! You can now register again.');
  }
  
  process.exit(0);
}

// Run the script
deleteUsers().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
