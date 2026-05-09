// Script to help setup Firebase Storage
// Note: Storage bucket must be created in Firebase Console due to location selection requirement

import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll } from 'firebase/storage';

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
const storage = getStorage(app);

async function checkStorage() {
  try {
    console.log('🔍 Checking Firebase Storage status...\n');
    
    // Try to list files in root (this will fail if Storage is not initialized)
    const rootRef = ref(storage, '/');
    await listAll(rootRef);
    
    console.log('='.repeat(60));
    console.log('✅ Firebase Storage is initialized and working!');
    console.log('='.repeat(60));
    console.log('\n📝 Storage Bucket: kimson-3373e.firebasestorage.app');
    console.log('✨ You can now deploy storage rules:');
    console.log('   firebase deploy --only storage\n');
    
    process.exit(0);
  } catch (error) {
    console.log('='.repeat(60));
    console.log('❌ Firebase Storage is NOT initialized yet');
    console.log('='.repeat(60));
    console.log('\n📝 To fix this, you need to:');
    console.log('\n1. Go to Firebase Console:');
    console.log('   https://console.firebase.google.com/project/kimson-3373e/storage');
    console.log('\n2. Click "Get Started"');
    console.log('\n3. ⚠️  IMPORTANT: Select location "us-central1" (Iowa)');
    console.log('   - This region supports no-cost tier');
    console.log('   - Location cannot be changed later');
    console.log('\n4. Storage Class: Select "Standard"');
    console.log('\n5. Click "Done"');
    console.log('\n6. Wait 1-2 minutes for propagation');
    console.log('\n7. Run this script again to verify:');
    console.log('   node scripts/setupStorage.js');
    console.log('\n8. Then deploy storage rules:');
    console.log('   firebase deploy --only storage');
    console.log('\n' + '='.repeat(60) + '\n');
    
    if (error.code === 'storage/unknown') {
      console.log('💡 Error Code: storage/unknown');
      console.log('   This usually means Storage is not initialized.\n');
    } else {
      console.log('💡 Error:', error.message);
      console.log('   Code:', error.code || 'Unknown\n');
    }
    
    process.exit(1);
  }
}

checkStorage();

