// Script to create admin user in Firebase
// Usage: node create-admin.mjs

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "kimson-3373e.firebaseapp.com",
  projectId: "kimson-3373e",
  storageBucket: "kimson-3373e.firebasestorage.app",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL = 'admin@opilex.com';
const PASSWORD = 'Admin.123';

async function createAdmin() {
  try {
    console.log(`Creating admin user: ${EMAIL}...`);
    
    let userCredential;
    try {
      // Try to create a new user
      userCredential = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
      console.log('✅ User created in Firebase Auth');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log('⚠️ User already exists, signing in instead...');
        userCredential = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
        console.log('✅ Signed in to existing user');
      } else {
        throw err;
      }
    }

    const uid = userCredential.user.uid;
    console.log(`User UID: ${uid}`);

    // Add user to admins collection
    await setDoc(doc(db, 'admins', uid), {
      email: EMAIL,
      name: 'Opilex Admin',
      role: 'superAdmin',
      createdAt: Timestamp.now(),
      active: true,
    });

    console.log('✅ Admin document created in Firestore "admins" collection');
    console.log('\n🎉 Admin user created successfully!');
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   UID: ${uid}`);
    console.log(`   Role: superAdmin`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message || error);
    process.exit(1);
  }
}

createAdmin();
