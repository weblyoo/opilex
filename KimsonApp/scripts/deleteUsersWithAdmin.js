/**
 * Script to delete users using Firebase Admin SDK
 * This script requires Firebase Admin SDK credentials
 * 
 * Setup options:
 * 1. Use Application Default Credentials: gcloud auth application-default login
 * 2. Use Service Account Key: Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 
 * Usage: node scripts/deleteUsersWithAdmin.js
 */

import admin from 'firebase-admin';

// Try to initialize Firebase Admin
let app;
try {
  // Method 1: Try Application Default Credentials
  if (admin.apps.length === 0) {
    app = admin.initializeApp({
      projectId: 'kimson-3373e',
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    app = admin.app();
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('\n💡 Setup Instructions:');
  console.log('   Option 1: Use Application Default Credentials');
  console.log('      Run: gcloud auth application-default login');
  console.log('   Option 2: Use Service Account Key');
  console.log('      1. Go to: https://console.firebase.google.com/project/kimson-3373e/settings/serviceaccounts/adminsdk');
  console.log('      2. Click "Generate new private key"');
  console.log('      3. Save the JSON file');
  console.log('      4. Set environment variable:');
  console.log('         $env:GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"');
  process.exit(1);
}

const db = admin.firestore();

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
    const usersSnapshot = await db.collection('users')
      .where('phoneNumber', '==', normalizedPhone)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`   ⚠️  No user found with phone: ${normalizedPhone}`);
      return { success: false, message: 'User not found' };
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`   ✅ Found user: ${userData.name || 'No name'} (ID: ${userId})`);
    console.log(`      Phone: ${userData.phoneNumber}`);
    console.log(`      Email: ${userData.email || 'No email'}`);
    console.log(`      User Type: ${userData.userType || 'Not set'}`);
    
    // Delete all related data using batch
    const batch = db.batch();
    let deleteCount = 0;
    
    // 1. Wire authentications
    console.log(`   📋 Checking wireAuthentications...`);
    const authsSnapshot = await db.collection('wireAuthentications')
      .where('userId', '==', userId)
      .get();
    
    authsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${authsSnapshot.size} wireAuthentications`);
    
    // 2. Rewards
    console.log(`   📋 Checking rewards...`);
    const rewardsSnapshot = await db.collection('rewards')
      .where('userId', '==', userId)
      .get();
    
    rewardsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${rewardsSnapshot.size} rewards`);
    
    // 3. Transactions
    console.log(`   📋 Checking transactions...`);
    const transactionsSnapshot = await db.collection('transactions')
      .where('userId', '==', userId)
      .get();
    
    transactionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`      Found ${transactionsSnapshot.size} transactions`);
    
    // 4. User document
    console.log(`   📋 Deleting user document...`);
    const userRef = db.collection('users').doc(userId);
    batch.delete(userRef);
    deleteCount++;
    
    // Commit all deletions
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`   ✅ Successfully deleted ${deleteCount} documents`);
      
      // Try to delete from Firebase Auth
      try {
        await admin.auth().deleteUser(userId);
        console.log(`   ✅ Deleted user from Firebase Authentication`);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`   ⚠️  User not found in Firebase Auth (may have been deleted already)`);
        } else {
          console.log(`   ⚠️  Could not delete from Auth: ${authError.message}`);
        }
      }
      
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
  console.log('🚀 Starting user deletion process using Firebase Admin SDK...');
  console.log(`📱 Phone numbers to delete: ${phoneNumbersToDelete.join(', ')}`);
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
  }
  
  // Close Firebase Admin
  await app.delete();
  process.exit(0);
}

// Run the script
deleteUsers().catch(async (error) => {
  console.error('\n❌ Fatal error:', error);
  if (app) {
    await app.delete();
  }
  process.exit(1);
});
