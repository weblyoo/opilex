// Script to add existing Firebase Auth user to admins collection
// Usage: node scripts/addExistingAdmin.js <email> [password]

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "opilex-2a79f.firebaseapp.com",
  projectId: "opilex-2a79f",
  storageBucket: "opilex-2a79f.firebasestorage.app",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('\nUsage: node scripts/addExistingAdmin.js <email> [password]');
  console.log('Example: node scripts/addExistingAdmin.js admin@opilex.com Admin@123456');
  process.exit(1);
}

async function addExistingAdmin() {
  try {
    console.log('🔧 Adding existing user to admins collection...');
    console.log('Email:', email);
    console.log('\n');

    if (!password) {
      console.log('⚠️  No password provided. Attempting to use existing session...');
      console.log('💡 If this fails, provide password: node scripts/addExistingAdmin.js <email> <password>\n');
    }

    // Sign in to get user UID
    let user;
    if (password) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log('✅ Signed in successfully');
    } else {
      // Try to get current user if already signed in
      if (auth.currentUser && auth.currentUser.email === email) {
        user = auth.currentUser;
        console.log('✅ Using existing session');
      } else {
        throw new Error('No password provided and no active session found. Please provide password.');
      }
    }

    const userId = user.uid;
    console.log('User ID:', userId);
    console.log('\n📝 Creating admin document in Firestore...\n');

    // Create/Update admin document in Firestore
    await setDoc(doc(db, 'admins', userId), {
      email: email,
      role: 'superAdmin',
      name: user.displayName || 'Admin User',
      permissions: ['users', 'authentications', 'rewards', 'transactions', 'sliders', 'documents', 'analytics', 'settings'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log('='.repeat(60));
    console.log('✅ Admin user added successfully!');
    console.log('='.repeat(60));
    console.log('\n📋 Admin Details:');
    console.log('   User ID:', userId);
    console.log('   Email:', email);
    console.log('   Role: superAdmin');
    console.log('\n📝 Document Location:');
    console.log('   Collection: admins');
    console.log(`   Document ID: ${userId}`);
    console.log('\n🔍 Verify in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/opilex-2a79f/firestore/data/~2Fadmins~2F' + userId);
    console.log('\n✨ You can now login to the admin panel!');
    console.log('   URL: http://localhost:5173/login');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error adding admin:', error.message);
    console.error('Error Code:', error.code || 'Unknown');

    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 User does not exist in Firebase Auth.');
      console.log('   Use createAdmin.js to create a new user first.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('\n💡 Incorrect password.');
      console.log('   Please provide the correct password.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 Invalid email format.');
      console.log('   Please provide a valid email address.');
    } else if (error.code === 'permission-denied' || error.message.includes('permission')) {
      console.log('\n💡 Permission denied.');
      console.log('   Make sure Firestore security rules allow admin document creation.');
      console.log('   Check: https://console.firebase.google.com/project/opilex-2a79f/firestore/rules');
    }

    console.log('\n📝 Alternative methods:');
    console.log('   1. Use Firebase Console to manually add admin document');
    console.log('   2. Use create-admin.html in browser');
    console.log('   3. Check FIREBASE_SETUP.md for detailed instructions');
    console.log('='.repeat(60) + '\n');

    process.exit(1);
  }
}

addExistingAdmin();

