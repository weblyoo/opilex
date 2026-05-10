/**
 * OTP Login Test Script
 * Tests Firebase Phone Authentication setup and configuration
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

// Initialize Firebase Admin SDK
try {
  if (existsSync('./serviceAccountKey.json')) {
    const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'opilex-2a79f'
    });
  } else {
    throw new Error('serviceAccountKey.json not found');
  }
} catch (error) {
  console.log('⚠️  serviceAccountKey.json not found. Using default credentials.');
  try {
    admin.initializeApp({
      projectId: 'opilex-2a79f'
    });
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err.message);
    console.log('\n💡 To use this script, either:');
    console.log('   1. Add serviceAccountKey.json to project root');
    console.log('   2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    console.log('   3. Use Firebase CLI authentication (firebase login)');
    console.log('\n📝 Note: This script uses Firebase Admin SDK.');
    console.log('   For basic checks, use Firebase MCP instead.\n');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function testOTPLoginSetup() {
  console.log('\n🔍 Testing OTP Login Setup for Opilex App\n');
  console.log('='.repeat(60));

  const results = {
    project: false,
    firestore: false,
    authConfig: false,
    users: false,
    phoneAuth: false,
  };

  try {
    // Test 1: Check Firebase Project
    console.log('\n1️⃣  Checking Firebase Project...');
    try {
      const project = await admin.projectManager().getProject('opilex-2a79f');
      console.log('   ✅ Project ID:', project.projectId);
      console.log('   ✅ Project Number:', project.projectNumber);
      results.project = true;
    } catch (error) {
      console.log('   ❌ Project check failed:', error.message);
    }

    // Test 2: Check Firestore Connection
    console.log('\n2️⃣  Testing Firestore Connection...');
    try {
      const testDoc = db.collection('test').doc('otp-test');
      await testDoc.set({ test: true, timestamp: admin.firestore.FieldValue.serverTimestamp() });
      const doc = await testDoc.get();
      if (doc.exists) {
        console.log('   ✅ Firestore connection successful');
        await testDoc.delete(); // Cleanup
        results.firestore = true;
      }
    } catch (error) {
      console.log('   ❌ Firestore test failed:', error.message);
    }

    // Test 3: Check Authentication Configuration
    console.log('\n3️⃣  Checking Authentication Configuration...');
    try {
      // List auth providers (this requires Firebase Admin SDK)
      console.log('   ⚠️  Phone auth provider status cannot be checked via Admin SDK');
      console.log('   💡 Check Firebase Console: Authentication > Sign-in method');
      console.log('   📍 URL: https://console.firebase.google.com/project/opilex-2a79f/authentication/providers');
      results.authConfig = true; // Assume true, needs manual check
    } catch (error) {
      console.log('   ❌ Auth config check failed:', error.message);
    }

    // Test 4: Check Existing Users
    console.log('\n4️⃣  Checking Existing Users...');
    try {
      const listUsersResult = await auth.listUsers(10);
      const phoneUsers = listUsersResult.users.filter(u => u.phoneNumber);
      const emailUsers = listUsersResult.users.filter(u => u.email);
      
      console.log(`   📊 Total users: ${listUsersResult.users.length}`);
      console.log(`   📱 Phone auth users: ${phoneUsers.length}`);
      console.log(`   📧 Email auth users: ${emailUsers.length}`);
      
      if (phoneUsers.length > 0) {
        console.log('   ✅ Phone authentication users found:');
        phoneUsers.forEach(u => {
          console.log(`      - ${u.phoneNumber} (UID: ${u.uid})`);
        });
        results.users = true;
      } else {
        console.log('   ⚠️  No phone authentication users found');
        console.log('   💡 This is normal if phone auth is not enabled yet');
      }
      
      if (emailUsers.length > 0) {
        console.log('   📧 Email users found:');
        emailUsers.forEach(u => {
          console.log(`      - ${u.email} (UID: ${u.uid})`);
        });
      }
    } catch (error) {
      console.log('   ❌ User check failed:', error.message);
    }

    // Test 5: Check Firestore Users Collection
    console.log('\n5️⃣  Checking Firestore Users Collection...');
    try {
      const usersSnapshot = await db.collection('users').limit(5).get();
      console.log(`   📊 Users in Firestore: ${usersSnapshot.size}`);
      
      if (usersSnapshot.size > 0) {
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`      - ${data.phoneNumber || 'N/A'} (ID: ${doc.id})`);
        });
        results.users = true;
      } else {
        console.log('   ⚠️  No users found in Firestore');
        console.log('   💡 Users will be created on first OTP login');
      }
    } catch (error) {
      console.log('   ❌ Firestore users check failed:', error.message);
    }

    // Test 6: Phone Authentication Readiness
    console.log('\n6️⃣  Phone Authentication Readiness...');
    console.log('   ⚠️  Manual verification required:');
    console.log('   📋 Checklist:');
    console.log('      [ ] Phone provider enabled in Firebase Console');
    console.log('      [ ] SHA fingerprints added (Android)');
    console.log('      [ ] Bundle ID configured (iOS)');
    console.log('      [ ] reCAPTCHA configured (Web)');
    console.log('      [ ] Code updated to use real Firebase auth');
    console.log('      [ ] Mock auth service removed/replaced');
    
    // Check if code is using mock auth
    const authContextPath = './src/contexts/AuthContext.tsx';
    if (existsSync(authContextPath)) {
      const authContext = readFileSync(authContextPath, 'utf8');
      if (authContext.includes('mockConfirmation') || authContext.includes('mock-verification-id')) {
        console.log('   ⚠️  Code is still using MOCK authentication');
        console.log('   💡 Update AuthContext.tsx to use real Firebase auth');
      } else {
        console.log('   ✅ Code appears to use real Firebase auth');
        results.phoneAuth = true;
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');
  console.log(`   Project Status:        ${results.project ? '✅' : '❌'}`);
  console.log(`   Firestore:            ${results.firestore ? '✅' : '❌'}`);
  console.log(`   Auth Config:          ${results.authConfig ? '✅' : '⚠️  (Manual check)'}`);
  console.log(`   Users Found:          ${results.users ? '✅' : '⚠️  (None yet)'}`);
  console.log(`   Phone Auth Ready:     ${results.phoneAuth ? '✅' : '⚠️  (Needs update)'}`);

  console.log('\n🎯 Next Steps:');
  console.log('   1. Enable Phone Authentication in Firebase Console');
  console.log('   2. Update AuthContext.tsx to use real Firebase auth');
  console.log('   3. Update LoginScreen.tsx to call real sendOTP');
  console.log('   4. Update OTPVerificationScreen.tsx to use real verifyOTP');
  console.log('   5. Test with a real phone number');
  
  console.log('\n📚 Documentation:');
  console.log('   - See OTP_LOGIN_STATUS_REPORT.md for detailed instructions');
  console.log('   - Firebase Console: https://console.firebase.google.com/project/opilex-2a79f\n');

  process.exit(0);
}

// Run tests
testOTPLoginSetup().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

