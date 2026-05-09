// Script to update existing admin user document in Firestore
// This script updates the document for the existing superadmin user
// Usage: node scripts/updateAdminUser.js <password>
// NOTE: You need to authenticate first to write to Firestore

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "kimson-3373e.firebaseapp.com",
  projectId: "kimson-3373e",
  storageBucket: "kimson-3373e.firebasestorage.app",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Super Admin User - EXACT structure as specified
const adminUID = '0GpunGg9R7NaLpsXZNfwyz2KfZd2';
const adminEmail = 'superadmin@kimson.com';

const adminDocument = {
  email: adminEmail,
  role: 'superAdmin',
  name: 'Admin User',
  permissions: ['users', 'authentications', 'rewards', 'transactions'],
  createdAt: serverTimestamp()
};

async function updateAdminUser() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 Updating Admin User Document');
    console.log('='.repeat(70));
    console.log('\nUID:', adminUID);
    console.log('Email:', adminDocument.email);
    
    // Get password from command line or prompt
    const password = process.argv[2];
    
    if (!password) {
      console.error('\n❌ ERROR: Password required!');
      console.error('\nUsage: node scripts/updateAdminUser.js <password>');
      console.error('   Example: node scripts/updateAdminUser.js YourPassword123');
      console.error('\n💡 This script needs to authenticate to write to Firestore.');
      console.error('='.repeat(70) + '\n');
      process.exit(1);
    }
    
    console.log('\n🔐 Authenticating...');
    
    // Authenticate first
    try {
      await signInWithEmailAndPassword(auth, adminEmail, password);
      console.log('✅ Authenticated successfully');
    } catch (authError) {
      console.error('\n❌ Authentication failed:', authError.message);
      console.error('\n💡 Make sure:');
      console.error('   1. Email/Password auth is enabled in Firebase Console');
      console.error('   2. User exists in Firebase Authentication');
      console.error('   3. Password is correct');
      process.exit(1);
    }
    
    console.log('\nUpdating Firestore document with structure:\n');
    console.log(JSON.stringify({
      email: adminDocument.email,
      role: adminDocument.role,
      name: adminDocument.name,
      permissions: adminDocument.permissions,
      createdAt: '[server timestamp]'
    }, null, 2));
    console.log('\n');
    
    // Update admin document - using setDoc with merge: false to ensure exact structure
    await setDoc(doc(db, 'admins', adminUID), adminDocument);
    
    console.log('='.repeat(70));
    console.log('✅ SUCCESS! Admin user document updated successfully!');
    console.log('='.repeat(70));
    console.log('\n📋 Document Details:');
    console.log('   Collection: admins');
    console.log(`   Document ID: ${adminUID}`);
    console.log('   Email:', adminDocument.email);
    console.log('   Role:', adminDocument.role);
    console.log('   Name:', adminDocument.name);
    console.log('   Permissions:', adminDocument.permissions.join(', '));
    console.log('   CreatedAt:', 'server timestamp');
    console.log('\n🔍 Verify in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/kimson-3373e/firestore');
    console.log('   → Navigate to: admins collection');
    console.log(`   → Document ID: ${adminUID}`);
    console.log('\n✅ You can now login to the admin panel!');
    console.log('   URL: http://localhost:5173');
    console.log('   Email: superadmin@kimson.com');
    console.log('='.repeat(70) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ ERROR: Failed to update admin document');
    console.error('='.repeat(70));
    console.error('\nError Message:', error.message);
    console.error('Error Code:', error.code || 'Unknown');
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check Firebase project connection');
    console.error('   2. Ensure Firestore is enabled');
    console.error('   3. Verify you have write permissions');
    console.error('   4. Check Firestore rules allow admin writes');
    console.error('\n💡 Alternative Methods:');
    console.error('   1. Use Firebase Console manually (no auth needed)');
    console.error('      See: scripts/fixAdminUserFirebaseConsole.md');
    console.error('   2. Run with correct password:');
    console.error(`      node scripts/updateAdminUser.js <password>`);
    console.error('='.repeat(70) + '\n');
    
    process.exit(1);
  }
}

updateAdminUser();

