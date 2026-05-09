/**
 * Script to delete users using Firebase Admin SDK
 * This requires Firebase Admin SDK with proper credentials
 * 
 * Usage: node scripts/deleteUsersAdmin.js
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin
// Try to use Application Default Credentials or service account
let app;
try {
  // Check if already initialized
  if (admin.apps.length === 0) {
    // Initialize with project ID (will use Application Default Credentials if available)
    app = admin.initializeApp({
      projectId: 'kimson-3373e',
    });
    console.log('✅ Firebase Admin initialized with Application Default Credentials');
  } else {
    app = admin.app();
    console.log('✅ Using existing Firebase Admin app');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('\n💡 To use this script, you need to:');
  console.log('   1. Set up Application Default Credentials:');
  console.log('      gcloud auth application-default login');
  console.log('   2. Or download a service account key from Firebase Console');
  console.log('      and set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

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

// Find user by phone number
async function findUserByPhoneNumber(phoneNumber) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  console.log(`\n🔍 Searching for user with phone: ${normalizedPhone}`);
  
  try {
    const usersSnapshot = await db.collection('users')
      .where('phoneNumber', '==', normalizedPhone)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`   ⚠️  No user found with phone: ${normalizedPhone}`);
      return null;
    }
    
    const userDoc = usersSnapshot.docs[0];
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
  
  const batch = db.batch();
  let deleteCount = 0;
  
  try {
    // 1. Delete wireAuthentications
    console.log(`   📋 Checking wireAuthentications...`);
    const authsSnapshot = await db.collection('wireAuthentications')
      .where('userId', '==', userId)
      .get();
    
    authsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${authsSnapshot.size} wireAuthentications to delete`);
    
    // 2. Delete rewards
    console.log(`   📋 Checking rewards...`);
    const rewardsSnapshot = await db.collection('rewards')
      .where('userId', '==', userId)
      .get();
    
    rewardsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${rewardsSnapshot.size} rewards to delete`);
    
    // 3. Delete transactions
    console.log(`   📋 Checking transactions...`);
    const transactionsSnapshot = await db.collection('transactions')
      .where('userId', '==', userId)
      .get();
    
    transactionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${transactionsSnapshot.size} transactions to delete`);
    
    // 4. Delete user document
    console.log(`   📋 Deleting user document...`);
    const userRef = db.collection('users').doc(userId);
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

// Delete user from Firebase Auth
async function deleteAuthUser(userId) {
  try {
    await auth.deleteUser(userId);
    console.log(`   ✅ Deleted user from Firebase Authentication`);
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`   ⚠️  User not found in Firebase Auth (may have been deleted already)`);
      return true;
    }
    console.error(`   ❌ Error deleting from Auth:`, error.message);
    return false;
  }
}

// Main function
async function deleteUsers() {
  console.log('🚀 Starting user deletion process using Firebase Admin SDK...');
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
      
      // Delete all user data from Firestore
      const deleted = await deleteUserData(user.id);
      
      // Try to delete from Firebase Auth
      await deleteAuthUser(user.id);
      
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
  
  // Close Firebase Admin
  await app.delete();
  process.exit(0);
}

// Run the script
deleteUsers().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  if (app) {
    app.delete().then(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
