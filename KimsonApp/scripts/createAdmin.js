// Script to create admin user in Firebase
// Usage: node scripts/createAdmin.js

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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

// Get email and password from command line or use defaults
const email = process.argv[2] || 'admin@kimson.com';
const password = process.argv[3] || 'Admin@123456';

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    console.log('Email:', email);
    console.log('\n⚠️  Make sure Email/Password authentication is enabled in Firebase Console!');
    console.log('   URL: https://console.firebase.google.com/project/kimson-3373e/authentication/providers\n');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    console.log('✅ User created in Firebase Auth');
    
    // Create admin document in Firestore
    await setDoc(doc(db, 'admins', userId), {
      email,
      role: 'superAdmin',
      name: 'Admin User',
      permissions: ['users', 'authentications', 'rewards', 'transactions'],
      createdAt: serverTimestamp(),
    });
    
    console.log('✅ Admin document created in Firestore');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Admin user created successfully!');
    console.log('='.repeat(60));
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  Save these credentials securely!');
    console.log('You can now login to the admin panel at http://localhost:5173');
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    console.error('Error Code:', error.code || 'Unknown');
    
    if (error.code === 'auth/operation-not-allowed') {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  EMAIL/PASSWORD AUTHENTICATION NOT ENABLED!');
      console.log('='.repeat(60));
      console.log('\n📝 To fix this:');
      console.log('   1. Go to Firebase Console:');
      console.log('      https://console.firebase.google.com/project/kimson-3373e/authentication/providers');
      console.log('   2. Click on "Email/Password"');
      console.log('   3. Toggle "Enable" to ON');
      console.log('   4. Click "Save"');
      console.log('   5. Run this script again');
      console.log('\n💡 Alternative: Use create-admin.html in your browser');
      console.log('='.repeat(60) + '\n');
    } else if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 User already exists in Firebase Auth.');
      console.log('   You just need to add them to the "admins" collection in Firestore:');
      console.log('   - Collection: admins');
      console.log('   - Document ID: Firebase Auth UID');
      console.log('   - Fields: email, role, name, permissions, createdAt');
    }
    
    process.exit(1);
  }
}

createAdmin();

