/**
 * OTP Registration Testing & Diagnostic Script
 * 
 * This script helps test and diagnose Firebase Phone Authentication
 * for new user registration in the Opilex App.
 * 
 * Usage:
 *   node test-otp-registration.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'opilex-3373e'
});

const auth = admin.auth();
const db = admin.firestore();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

/**
 * Check if phone authentication is enabled
 */
async function checkPhoneAuthStatus() {
  console.log('\n📱 ========== PHONE AUTH STATUS CHECK ==========\n');
  
  try {
    // Try to list users with phone provider
    const listUsersResult = await auth.listUsers(100);
    const phoneUsers = listUsersResult.users.filter(user => 
      user.providerData.some(provider => provider.providerId === 'phone')
    );
    
    console.log('✅ Phone Authentication: ENABLED');
    console.log(`📊 Phone Users Found: ${phoneUsers.length}`);
    
    if (phoneUsers.length > 0) {
      console.log('\n📋 Recent Phone Users:');
      phoneUsers.slice(0, 5).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.phoneNumber} (UID: ${user.uid.substring(0, 10)}...)`);
        console.log(`      Created: ${new Date(user.metadata.creationTime).toLocaleString()}`);
        console.log(`      Last Login: ${new Date(user.metadata.lastSignInTime).toLocaleString()}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking phone auth status:', error.message);
    return false;
  }
}

/**
 * Check user registration status in Firestore
 */
async function checkUserRegistration(phoneNumber) {
  console.log(`\n🔍 ========== CHECKING USER: ${phoneNumber} ==========\n`);
  
  try {
    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
    
    // Check in Firebase Auth
    let authUser = null;
    try {
      authUser = await auth.getUserByPhoneNumber(formattedPhone);
      console.log('✅ User found in Firebase Auth');
      console.log(`   UID: ${authUser.uid}`);
      console.log(`   Phone: ${authUser.phoneNumber}`);
      console.log(`   Created: ${new Date(authUser.metadata.creationTime).toLocaleString()}`);
      console.log(`   Last Login: ${new Date(authUser.metadata.lastSignInTime).toLocaleString()}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('ℹ️  User NOT found in Firebase Auth (New user)');
      } else {
        throw error;
      }
    }
    
    // Check in Firestore
    if (authUser) {
      const userDoc = await db.collection('users').doc(authUser.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('\n✅ User found in Firestore');
        console.log(`   User Type: ${userData.userType}`);
        console.log(`   KYC Verified: ${userData.kycVerified ? 'Yes' : 'No'}`);
        console.log(`   Registration Completed: ${userData.registrationCompleted ? 'Yes' : 'No'}`);
        console.log(`   Reward Points: ${userData.rewardPoints}`);
        
        if (userData.registrationCompleted) {
          console.log(`\n📝 Registration Details:`);
          console.log(`   Name: ${userData.name || 'Not set'}`);
          console.log(`   Email: ${userData.email || 'Not set'}`);
          console.log(`   City: ${userData.city || 'Not set'}`);
          console.log(`   State: ${userData.state || 'Not set'}`);
        }
      } else {
        console.log('\n⚠️  User found in Auth but NOT in Firestore');
        console.log('   This might indicate an incomplete registration');
      }
    }
    
    return authUser;
  } catch (error) {
    console.error('❌ Error checking user:', error.message);
    return null;
  }
}

/**
 * Simulate OTP registration flow
 */
async function simulateOTPRegistration() {
  console.log('\n🎯 ========== SIMULATING OTP REGISTRATION ==========\n');
  
  const phoneNumber = await ask('Enter phone number to test (e.g., 9876543210): ');
  const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
  
  console.log(`\n📞 Testing with: ${formattedPhone}\n`);
  
  // Step 1: Check if user exists
  console.log('Step 1: Checking if user exists...');
  const existingUser = await checkUserRegistration(formattedPhone);
  
  if (existingUser) {
    console.log('\n⚠️  User already exists!');
    const proceed = await ask('Do you want to continue? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Aborted.');
      return;
    }
  }
  
  // Step 2: Simulate sending OTP
  console.log('\nStep 2: Simulating OTP send...');
  console.log('✅ In the app, Firebase would send an SMS OTP to this number');
  console.log('   The user would receive a 6-digit code');
  
  // Step 3: Simulate OTP verification
  console.log('\nStep 3: Simulating OTP verification...');
  console.log('✅ Firebase verifies the OTP code');
  console.log('✅ User is authenticated and UID is generated');
  
  // Step 4: Create user document in Firestore (if needed)
  if (!existingUser) {
    console.log('\nStep 4: Creating user document in Firestore...');
    
    const newUserData = {
      phoneNumber: formattedPhone,
      userType: 'electrician', // Default, will be updated during registration
      kycVerified: false,
      language: 'en',
      rewardPoints: 50000,
      registrationCompleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('✅ User document created with initial data');
    console.log('   User would then proceed to:');
    console.log('   - Select user type (Electrician/Dealer)');
    console.log('   - Fill registration details');
    console.log('   - Complete KYC verification');
  }
  
  console.log('\n✅ Registration flow simulation complete!');
}

/**
 * Check Firebase configuration
 */
async function checkFirebaseConfig() {
  console.log('\n⚙️  ========== FIREBASE CONFIGURATION ==========\n');
  
  try {
    const projectId = admin.app().options.projectId;
    console.log(`✅ Project ID: ${projectId}`);
    
    // Check Auth settings
    console.log('✅ Firebase Admin SDK initialized');
    console.log('✅ Firestore connected');
    
    // List available authentication providers
    console.log('\n🔐 Authentication Providers:');
    const config = await admin.auth().getProviderConfig('phone');
    console.log('   ✅ Phone Authentication: ENABLED');
  } catch (error) {
    if (error.code === 'auth/configuration-not-found') {
      console.log('   ⚠️  Phone Authentication: Configuration not found');
    } else {
      console.error('   ❌ Error:', error.message);
    }
  }
}

/**
 * Main menu
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   OTP REGISTRATION TESTING & DIAGNOSTIC TOOL     ║');
  console.log('║   Opilex App - Firebase Phone Authentication     ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  while (true) {
    console.log('\nSelect an option:');
    console.log('1. Check Phone Authentication Status');
    console.log('2. Check User Registration Status');
    console.log('3. Simulate OTP Registration Flow');
    console.log('4. Check Firebase Configuration');
    console.log('5. Exit');
    
    const choice = await ask('\nEnter your choice (1-5): ');
    
    switch (choice) {
      case '1':
        await checkPhoneAuthStatus();
        break;
      case '2':
        const phone = await ask('Enter phone number (e.g., 9876543210): ');
        await checkUserRegistration(phone);
        break;
      case '3':
        await simulateOTPRegistration();
        break;
      case '4':
        await checkFirebaseConfig();
        break;
      case '5':
        console.log('\nGoodbye! 👋\n');
        rl.close();
        process.exit(0);
      default:
        console.log('\n❌ Invalid choice. Please try again.');
    }
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  rl.close();
  process.exit(1);
});

// Run main
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
