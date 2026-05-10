// Script to enable Storage API and create bucket programmatically
import { Storage } from '@google-cloud/storage';
import { execSync } from 'child_process';

const projectId = 'opilex-3373e';
const bucketName = `${projectId}.firebasestorage.app`;
const location = 'US-CENTRAL1';

async function enableStorageAndCreate() {
  try {
    console.log('🚀 Enabling Firebase Storage...\n');
    console.log(`Project: ${projectId}`);
    console.log(`Location: ${location}\n`);

    // Step 1: Try to enable Storage API using gcloud if available
    try {
      console.log('📝 Step 1: Enabling Cloud Storage API...\n');
      execSync(`gcloud services enable storage-component.googleapis.com --project=${projectId}`, {
        stdio: 'inherit'
      });
      console.log('✅ Storage API enabled\n');
    } catch (gcloudError) {
      console.log('⚠️  gcloud not available, trying direct API approach...\n');
    }

    // Step 2: Create Storage instance
    console.log('📝 Step 2: Creating Storage client...\n');
    const storage = new Storage({ projectId });

    // Step 3: Check if bucket exists
    console.log('📝 Step 3: Checking if bucket exists...\n');
    try {
      const [exists] = await storage.bucket(bucketName).exists();
      if (exists) {
        console.log('='.repeat(60));
        console.log('✅ Storage bucket already exists!');
        console.log('='.repeat(60));
        console.log(`\n📦 Bucket: ${bucketName}`);
        console.log('\n✨ Storage is ready. Deploy rules:');
        console.log('   firebase deploy --only storage\n');
        return;
      }
    } catch (checkError) {
      console.log('Bucket does not exist, creating...\n');
    }

    // Step 4: Create bucket
    console.log('📝 Step 4: Creating Storage bucket...\n');
    console.log(`Bucket Name: ${bucketName}`);
    console.log(`Location: ${location}\n`);

    const [bucket] = await storage.createBucket(bucketName, {
      location: location,
      storageClass: 'STANDARD',
      // Firebase-specific settings
      uniformBucketLevelAccess: false,
    });

    console.log('='.repeat(60));
    console.log('✅ Storage bucket created successfully!');
    console.log('='.repeat(60));
    console.log(`\n📦 Bucket: ${bucket.name}`);
    console.log(`📍 Location: ${location}`);
    console.log('\n✨ Next steps:');
    console.log('   1. Wait 30 seconds for propagation');
    console.log('   2. Deploy storage rules:');
    console.log('      firebase deploy --only storage');
    console.log('   3. Or run: node scripts/checkAndDeployStorage.js\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Code:', error.code || 'Unknown');
    
    if (error.code === 403 || error.message.includes('Permission denied')) {
      console.log('\n💡 Permission denied. Solutions:\n');
      console.log('Option 1: Grant Storage Admin role');
      console.log('   1. Go to: https://console.cloud.google.com/iam-admin/iam?project=opilex-3373e');
      console.log('   2. Find your account: weblyo.com@gmail.com');
      console.log('   3. Add role: "Storage Admin"\n');
      
      console.log('Option 2: Use Application Default Credentials');
      console.log('   1. Install gcloud: https://cloud.google.com/sdk/docs/install');
      console.log('   2. Run: gcloud auth application-default login');
      console.log('   3. Run this script again\n');
      
      console.log('Option 3: Manual Console Creation');
      console.log('   If console gives location error, try:');
      console.log('   1. Go to: https://console.cloud.google.com/storage/browser?project=opilex-3373e');
      console.log('   2. Click "Create Bucket"');
      console.log('   3. Name: opilex-3373e.firebasestorage.app');
      console.log('   4. Location: us-central1');
      console.log('   5. Click "Create"\n');

    } else if (error.code === 409) {
      console.log('\n✅ Bucket already exists!');
      console.log('✨ Storage is ready. Deploy rules:');
      console.log('   firebase deploy --only storage\n');
    } else if (error.message.includes('API not enabled')) {
      console.log('\n💡 Storage API not enabled. Enable it:');
      console.log('   1. Go to: https://console.cloud.google.com/apis/library/storage-component.googleapis.com?project=opilex-3373e');
      console.log('   2. Click "Enable"');
      console.log('   3. Run this script again\n');
    } else {
      console.log('\n💡 Alternative: Create bucket manually');
      console.log('   See STORAGE_FINAL_SETUP.md for manual steps\n');
    }
    
    process.exit(1);
  }
}

enableStorageAndCreate();

