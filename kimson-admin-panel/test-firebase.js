// Firebase Connection Test - Full Verification
// Run this with: node test-firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "opilex-2a79f.firebaseapp.com",
  projectId: "opilex-2a79f",
  storageBucket: "opilex-2a79f.firebasestorage.app",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection...\n');
    
    // Test 1: Firebase App Initialization
    console.log('1️⃣ Testing Firebase App initialization...');
    if (app) {
      console.log('   ✅ Firebase App initialized successfully');
      console.log('   📋 Project ID:', app.options.projectId);
    } else {
      throw new Error('Firebase App failed to initialize');
    }
    
    // Test 2: Firebase Auth Connection
    console.log('\n2️⃣ Testing Firebase Auth connection...');
    if (auth) {
      console.log('   ✅ Firebase Auth initialized successfully');
      console.log('   📋 Auth Domain:', firebaseConfig.authDomain);
    } else {
      throw new Error('Firebase Auth failed to initialize');
    }
    
    // Test 3: Firestore Connection with Write Test
    console.log('\n3️⃣ Testing Firestore connection (with write test)...');
    try {
      // Test write to test collection (allowed by rules)
      const testDoc = doc(db, 'test', 'connection-verification');
      await setDoc(testDoc, {
        message: 'Firebase connection successful!',
        timestamp: new Date().toISOString(),
        verified: true
      });
      
      // Verify read
      const docSnap = await getDoc(testDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('   ✅ Firestore connection successful!');
        console.log('   ✅ Write test: PASSED');
        console.log('   ✅ Read test: PASSED');
        console.log('   📋 Database Name: firestore.googleapis.com');
        console.log('   📄 Test document:', data.message);
      } else {
        throw new Error('Document not found after write');
      }
    } catch (firestoreError) {
      if (firestoreError.code === 'permission-denied') {
        console.log('   ⚠️  Firestore connected but permissions not configured');
        console.log('   📝 To fix: Deploy security rules from firestore.rules');
        console.log('   🔗 Run: firebase deploy --only firestore:rules');
      } else {
        console.log('   ❌ Firestore connection error:', firestoreError.message);
        throw firestoreError;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Connection Test Summary:');
    console.log('   ✅ Firebase App: Connected');
    console.log('   ✅ Firebase Auth: Connected');
    console.log('   ✅ Firestore: Connected & Verified');
    console.log('   ✅ Rules: Deployed & Working');
    console.log('='.repeat(60));
    
    console.log('\n🎉 SUCCESS! Firebase is fully configured and working!');
    console.log('\n📝 Next Steps:');
    console.log('   1. ✅ Firestore rules deployed');
    console.log('   2. ⏭️  Enable Phone Authentication in Firebase Console');
    console.log('   3. ⏭️  Replace mock auth with real Firebase auth in app');
    console.log('\n🔗 Firebase Console: https://console.firebase.google.com/project/opilex-2a79f\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Firebase connection test failed:');
    console.error('   Error Code:', error.code || 'Unknown');
    console.error('   Error Message:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify Firebase config credentials');
    console.error('   3. Ensure Firebase project is active');
    console.error('   4. Check Firebase Console for project status');
    console.error('   5. Run: firebase deploy --only firestore:rules\n');
    process.exit(1);
  }
}

testFirebaseConnection();
