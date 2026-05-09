// Script to add admin by UID (for admin@kimson.com)
// Usage: node scripts/addAdminByUID.js [password]

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

// Admin user details
const adminUID = 'LnDHQWN8uQaQQPKCBpCLvNXDWgu1';
const adminEmail = 'admin@kimson.com';
const password = process.argv[2] || 'Admin@123456'; // Default password, can override

async function addAdminByUID() {
  try {
    console.log('🔧 Adding admin user to Firestore...');
    console.log('='.repeat(60));
    console.log('User ID:', adminUID);
    console.log('Email:', adminEmail);
    console.log('\n🔐 Signing in to authenticate...\n');

    // Sign in first to authenticate
    try {
      await signInWithEmailAndPassword(auth, adminEmail, password);
      console.log('✅ Signed in successfully\n');
    } catch (signInError) {
      if (signInError.code === 'auth/wrong-password') {
        console.error('❌ Incorrect password. Please provide the correct password:');
        console.log('   Usage: node scripts/addAdminByUID.js <password>');
        console.log('   Example: node scripts/addAdminByUID.js YourPassword123');
        process.exit(1);
      }
      throw signInError;
    }

    console.log('📝 Creating admin document in Firestore...\n');

    // Create/Update admin document in Firestore
    await setDoc(doc(db, 'admins', adminUID), {
      email: adminEmail,
      role: 'superAdmin',
      name: 'Admin User',
      permissions: ['users', 'authentications', 'rewards', 'transactions', 'sliders', 'documents', 'analytics', 'settings'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log('='.repeat(60));
    console.log('✅ Admin user added successfully!');
    console.log('='.repeat(60));
    console.log('\n📋 Admin Details:');
    console.log('   User ID:', adminUID);
    console.log('   Email:', adminEmail);
    console.log('   Role: superAdmin');
    console.log('\n📝 Document Location:');
    console.log('   Collection: admins');
    console.log(`   Document ID: ${adminUID}`);
    console.log('\n🔍 Verify in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/kimson-3373e/firestore/data/~2Fadmins~2F' + adminUID);
    console.log('\n✨ You can now login to the admin panel!');
    console.log('   URL: http://localhost:5173/login');
    console.log('   Email: admin@kimson.com');
    console.log('   Password: [use the password you set]');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error adding admin:', error.message);
    console.error('Error Code:', error.code || 'Unknown');

    if (error.code === 'permission-denied' || error.message.includes('permission')) {
      console.log('\n💡 Permission denied.');
      console.log('   Make sure Firestore security rules allow admin document creation.');
      console.log('   Check: https://console.firebase.google.com/project/kimson-3373e/firestore/rules');
      console.log('\n📝 You may need to:');
      console.log('   1. Deploy Firestore rules: firebase deploy --only firestore:rules');
      console.log('   2. Or manually add the document in Firebase Console');
    }

    console.log('\n📝 Alternative: Add manually in Firebase Console');
    console.log('   https://console.firebase.google.com/project/kimson-3373e/firestore');
    console.log('   Collection: admins');
    console.log(`   Document ID: ${adminUID}`);
    console.log('   Fields: { email: "admin@kimson.com", role: "superAdmin", ... }');
    console.log('='.repeat(60) + '\n');

    process.exit(1);
  }
}

addAdminByUID();

