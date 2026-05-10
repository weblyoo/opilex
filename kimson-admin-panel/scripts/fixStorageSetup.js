// Script to fix Firebase Storage setup
// Checks if Storage is initialized and provides exact steps to fix

import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "opilex-3373e.firebaseapp.com",
  projectId: "opilex-3373e",
  storageBucket: "opilex-3373e-storage", // Try custom bucket first
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

async function checkStorage() {
  console.log('🔍 Checking Firebase Storage status...\n');

  // Try custom bucket name first
  let bucketName = 'opilex-3373e-storage';
  let storage = null;
  let app = null;

  try {
    app = initializeApp(firebaseConfig);
    storage = getStorage(app);
    const rootRef = ref(storage, '/');
    await listAll(rootRef);
    
    console.log('='.repeat(60));
    console.log('✅ Firebase Storage is working!');
    console.log(`✅ Using bucket: ${bucketName}`);
    console.log('='.repeat(60));
    console.log('\n✨ Your admin panel Storage is ready!\n');
    process.exit(0);

  } catch (error) {
    // Try default bucket name
    if (error.code === 'storage/unknown' || error.code === 'storage/bucket-not-found') {
      console.log('⚠️  Custom bucket not found. Trying default bucket...\n');
      
      try {
        const defaultConfig = {
          ...firebaseConfig,
          storageBucket: 'opilex-3373e.firebasestorage.app'
        };
        
        app = initializeApp(defaultConfig, 'default-check');
        storage = getStorage(app);
        const rootRef = ref(storage, '/');
        await listAll(rootRef);
        
        console.log('='.repeat(60));
        console.log('✅ Default Storage bucket found!');
        console.log('='.repeat(60));
        console.log('\n📝 Update your config file:');
        console.log('   File: src/config/firebase.ts');
        console.log('   Change: storageBucket: "opilex-3373e.firebasestorage.app"\n');
        process.exit(0);

      } catch (defaultError) {
        // Storage not initialized at all
        console.log('='.repeat(60));
        console.log('❌ Firebase Storage is NOT initialized');
        console.log('='.repeat(60));
        console.log('\n📝 ACTION REQUIRED:\n');
        console.log('1. Open Firebase Console:');
        console.log('   https://console.firebase.google.com/project/opilex-3373e/storage\n');
        console.log('2. Click "Get Started"\n');
        console.log('3. ⚠️  IMPORTANT: Select Location');
        console.log('   Choose: "us-central1" (Iowa)');
        console.log('   - Supports no-cost tier');
        console.log('   - Location cannot be changed later\n');
        console.log('4. Storage Class: "Standard"\n');
        console.log('5. Click "Done"\n');
        console.log('6. Wait 1-2 minutes for propagation\n');
        console.log('7. Run this script again:');
        console.log('   node scripts/fixStorageSetup.js\n');
        console.log('='.repeat(60));
        console.log('\n💡 Error Details:');
        console.log(`   Code: ${error.code}`);
        console.log(`   Message: ${error.message}\n`);
        process.exit(1);
      }
    } else {
      console.log('❌ Unexpected error:', error);
      process.exit(1);
    }
  }
}

checkStorage();


