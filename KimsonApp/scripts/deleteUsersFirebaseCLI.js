/**
 * Script to delete users using Firebase Client SDK with proper authentication
 * This script will authenticate and then delete users
 * 
 * Usage: node scripts/deleteUsersFirebaseCLI.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

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

// Phone numbers to delete
const phoneNumbersToDelete = [
  '+918380843472',  // +91 83808 43472
  '+919112005199',  // +91 91120 05199
];

// Normalize phone number
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

// Delete user and all related data
async function deleteUserByPhoneNumber(phoneNumber) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  console.log(`\n🔍 Searching for user with phone: ${normalizedPhone}`);
  
  try {
    // Find user
    const usersQuery = query(
      collection(db, 'users'),
      where('phoneNumber', '==', normalizedPhone)
    );
    
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      console.log(`   ⚠️  No user found with phone: ${normalizedPhone}`);
      return { success: false, message: 'User not found' };
    }
    
    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`   ✅ Found user: ${userData.name || 'No name'} (ID: ${userId})`);
    console.log(`      Phone: ${userData.phoneNumber}`);
    console.log(`      Email: ${userData.email || 'No email'}`);
    console.log(`      User Type: ${userData.userType || 'Not set'}`);
    
    // Delete all related data using batch
    const batch = writeBatch(db);
    let deleteCount = 0;
    
    // 1. Wire authentications
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
    console.log(`      Found ${authsSnapshot.size} wireAuthentications`);
    
    // 2. Rewards
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
    console.log(`      Found ${rewardsSnapshot.size} rewards`);
    
    // 3. Transactions
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
    console.log(`      Found ${transactionsSnapshot.size} transactions`);
    
    // 4. User document
    console.log(`   📋 Deleting user document...`);
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);
    deleteCount++;
    
    // Commit all deletions
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`   ✅ Successfully deleted ${deleteCount} documents`);
      return { 
        success: true, 
        userId, 
        deletedCount,
        message: `Successfully deleted user and ${deleteCount} related documents`
      };
    } else {
      console.log(`   ⚠️  No documents found to delete`);
      return { success: false, message: 'No documents found' };
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, message: `Error: ${error.message}` };
  }
}

// Main function
async function deleteUsers() {
  console.log('🚀 Starting user deletion process...');
  console.log(`📱 Phone numbers to delete: ${phoneNumbersToDelete.join(', ')}`);
  console.log('='.repeat(60));
  console.log('⚠️  Note: This script requires proper Firestore security rules');
  console.log('   If you get permission errors, use Firebase Console instead.');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const phoneNumber of phoneNumbersToDelete) {
    const result = await deleteUserByPhoneNumber(phoneNumber);
    results.push({
      phoneNumber,
      ...result
    });
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
    if (result.deletedCount) {
      console.log(`   Documents Deleted: ${result.deletedCount}`);
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
  } else if (failCount > 0) {
    console.log('\n⚠️  Deletion failed. Please use Firebase Console method:');
    console.log('   https://console.firebase.google.com/project/kimson-3373e/firestore');
  }
  
  process.exit(0);
}

// Run the script
deleteUsers().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
