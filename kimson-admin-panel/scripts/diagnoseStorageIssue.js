// Diagnostic script to identify the real Storage creation issue
import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getMetadata } from 'firebase/storage';

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
const storage = getStorage(app);

async function diagnose() {
  console.log('🔍 Diagnosing Firebase Storage Issue...\n');
  console.log('='.repeat(70));
  
  // Test 1: Check if Storage is accessible
  console.log('\n📝 Test 1: Checking Storage accessibility...');
  try {
    const rootRef = ref(storage, '/');
    await listAll(rootRef);
    console.log('✅ Storage is initialized and accessible!\n');
    console.log('✨ Storage is ready. Deploy rules:');
    console.log('   firebase deploy --only storage\n');
    return;
  } catch (error) {
    console.log('❌ Storage not accessible');
    console.log(`   Error Code: ${error.code || 'Unknown'}`);
    console.log(`   Message: ${error.message}\n`);
    
    // Analyze the error
    if (error.code === 'storage/unknown') {
      console.log('💡 Diagnosis: Storage bucket does not exist');
      console.log('\n📋 Solution: Create bucket using one of these methods:\n');
      
      console.log('Method 1: Google Cloud Console (Recommended)');
      console.log('   1. Go to: https://console.cloud.google.com/storage/browser?project=opilex-2a79f');
      console.log('   2. Click "Create Bucket"');
      console.log('   3. Name: opilex-2a79f.firebasestorage.app');
      console.log('   4. Location: us-central1');
      console.log('   5. Click "Create"\n');
      
      console.log('Method 2: Firebase Console');
      console.log('   1. Go to: https://console.firebase.google.com/project/opilex-2a79f/storage');
      console.log('   2. Click "Get Started"');
      console.log('   3. If you get location error, use Method 1 instead\n');
      
    } else if (error.code === 'storage/unauthorized') {
      console.log('💡 Diagnosis: Permission denied');
      console.log('\n📋 Solution: Grant Storage permissions');
      console.log('   1. Go to: https://console.cloud.google.com/iam-admin/iam?project=opilex-2a79f');
      console.log('   2. Find: weblyo.com@gmail.com');
      console.log('   3. Add role: Storage Admin\n');
      
    } else if (error.code === 'storage/bucket-not-found') {
      console.log('💡 Diagnosis: Bucket not found');
      console.log('\n📋 Solution: Create bucket (see Method 1 above)\n');
      
    } else {
      console.log('💡 Diagnosis: Unknown error');
      console.log('\n📋 Please share this error message for help\n');
    }
  }

  // Test 2: Check bucket metadata
  console.log('📝 Test 2: Checking bucket metadata...');
  try {
    const bucketRef = ref(storage);
    const metadata = await getMetadata(bucketRef);
    console.log('✅ Bucket metadata accessible');
    console.log(`   Bucket: ${metadata.bucket}`);
    console.log(`   Full Path: ${metadata.fullPath}\n`);
  } catch (error) {
    console.log('❌ Cannot access bucket metadata');
    console.log(`   Error: ${error.message}\n`);
  }

  console.log('='.repeat(70));
  console.log('\n📋 Next Steps:');
  console.log('   1. If bucket doesn\'t exist: Use Google Cloud Console to create it');
  console.log('   2. If permission issue: Grant Storage Admin role');
  console.log('   3. After bucket creation: Run "node scripts/checkAndDeployStorage.js"');
  console.log('   4. If still failing: Share the exact error message\n');
}

diagnose();

