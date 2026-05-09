// Script to fix/update admin user document in Firestore
// Usage: node scripts/fixAdminUser.js

import { initializeApp } from 'firebase/app';
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
const db = getFirestore(app);

// Super Admin User Details
const adminData = {
  email: 'superadmin@kimson.com',
  role: 'superAdmin',
  name: 'Admin User',
  permissions: ['users', 'authentications', 'rewards', 'transactions'],
  createdAt: serverTimestamp()
};

// UID from Firebase Authentication
const adminUID = '0GpunGg9R7NaLpsXZNfwyz2KfZd2';

async function fixAdminUser() {
  try {
    console.log('🔧 Fixing admin user document...');
    console.log('UID:', adminUID);
    console.log('Email:', adminData.email);
    console.log('\nUpdating Firestore document...\n');
    
    // Create/Update admin document in Firestore
    await setDoc(doc(db, 'admins', adminUID), adminData, { merge: true });
    
    console.log('='.repeat(60));
    console.log('✅ Admin user document updated successfully!');
    console.log('='.repeat(60));
    console.log('\nDocument Structure:');
    console.log(JSON.stringify({
      ...adminData,
      createdAt: '[server timestamp]'
    }, null, 2));
    console.log('\n📝 Document Location:');
    console.log('   Collection: admins');
    console.log(`   Document ID: ${adminUID}`);
    console.log('\n🔍 Verify in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/kimson-3373e/firestore');
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating admin document:', error.message);
    console.error('Error Code:', error.code || 'Unknown');
    console.log('\n💡 Make sure:');
    console.log('   1. You have proper Firebase permissions');
    console.log('   2. Firestore is enabled in Firebase Console');
    console.log('   3. The admin collection is accessible');
    console.log('='.repeat(60) + '\n');
    
    process.exit(1);
  }
}

fixAdminUser();

