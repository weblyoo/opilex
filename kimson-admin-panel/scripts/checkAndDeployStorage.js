// Combined script: Check Storage status and deploy rules if ready
// This script will:
// 1. Check if Storage is initialized
// 2. If yes, deploy rules automatically
// 3. If no, provide clear instructions

import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll } from 'firebase/storage';
import { execSync } from 'child_process';

const firebaseConfig = {
  apiKey: "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: "opilex-3373e.firebaseapp.com",
  projectId: "opilex-3373e",
  storageBucket: "opilex-3373e-storage",
  messagingSenderId: "1002505057634",
  appId: "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: "G-40Z3KKDR4Y"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function checkAndDeploy() {
  console.log('🔍 Checking Firebase Storage status...\n');

  try {
    // Check if Storage is initialized
    const rootRef = ref(storage, '/');
    await listAll(rootRef);
    
    console.log('='.repeat(60));
    console.log('✅ Firebase Storage is initialized!');
    console.log('='.repeat(60));
    console.log('\n📦 Deploying storage rules...\n');

    // Deploy rules
    try {
      execSync('firebase deploy --only storage', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });

      console.log('\n' + '='.repeat(60));
      console.log('✅ Storage rules deployed successfully!');
      console.log('='.repeat(60));
      console.log('\n✨ Your admin panel is ready!');
      console.log('   - Price List page: /price-list');
      console.log('   - Product Catalog page: /product-catalog\n');

    } catch (deployError) {
      console.error('\n❌ Error deploying rules:', deployError.message);
      console.log('\n💡 Make sure Firebase CLI is installed:');
      console.log('   npm install -g firebase-tools\n');
      process.exit(1);
    }

    process.exit(0);

  } catch (error) {
    console.log('='.repeat(60));
    console.log('❌ Firebase Storage is NOT initialized yet');
    console.log('='.repeat(60));
    console.log('\n📝 To fix this:\n');
    console.log('1. Open this link:');
    console.log('   https://console.firebase.google.com/project/opilex-3373e/storage\n');
    console.log('2. Click "Get Started"');
    console.log('\n3. ⚠️  IMPORTANT: Select location');
    console.log('   Choose: "us-central1" (Iowa)');
    console.log('   - Supports no-cost tier');
    console.log('   - Location cannot be changed later\n');
    console.log('4. Storage Class: "Standard"');
    console.log('\n5. Click "Done"');
    console.log('\n6. Wait 1-2 minutes for propagation');
    console.log('\n7. Run this script again:');
    console.log('   node scripts/checkAndDeployStorage.js\n');
    console.log('='.repeat(60) + '\n');

    if (error.code === 'storage/unknown') {
      console.log('💡 Error Code: storage/unknown');
      console.log('   This means Storage bucket needs to be created.\n');
    }

    process.exit(1);
  }
}

checkAndDeploy();

