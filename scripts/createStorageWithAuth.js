// Script to create Firebase Storage bucket using Firebase authentication
// This uses the Firebase project credentials

import { Storage } from '@google-cloud/storage';

const projectId = 'kimson-3373e';
const bucketName = `${projectId}.firebasestorage.app`;
const location = 'US-CENTRAL1';

async function createBucket() {
  try {
    console.log('🚀 Creating Firebase Storage bucket...\n');
    console.log(`Project: ${projectId}`);
    console.log(`Bucket: ${bucketName}`);
    console.log(`Location: ${location} (Iowa)\n`);

    // Try to use Application Default Credentials or Firebase credentials
    const storage = new Storage({ 
      projectId,
      // Try to use default credentials
      keyFilename: undefined, // Will use environment or default credentials
    });

    // Check if bucket exists
    try {
      const [exists] = await storage.bucket(bucketName).exists();
      
      if (exists) {
        console.log('='.repeat(60));
        console.log('✅ Storage bucket already exists!');
        console.log('='.repeat(60));
        console.log('\n✨ Storage is ready. Deploy rules:');
        console.log('   firebase deploy --only storage\n');
        return;
      }
    } catch (checkError) {
      // Continue to create if check fails
    }

    // Create bucket
    console.log('📦 Creating bucket...\n');
    const [bucket] = await storage.createBucket(bucketName, {
      location: location,
      storageClass: 'STANDARD',
    });

    console.log('='.repeat(60));
    console.log('✅ Storage bucket created successfully!');
    console.log('='.repeat(60));
    console.log(`\n📦 Bucket: ${bucket.name}`);
    console.log(`📍 Location: ${location}`);
    console.log('\n✨ Next: Deploy rules: firebase deploy --only storage\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('Could not load the default credentials')) {
      console.log('\n💡 Authentication required. Options:\n');
      console.log('Option 1: Use Firebase Console (Easiest)');
      console.log('   1. Go to: https://console.firebase.google.com/project/kimson-3373e/storage');
      console.log('   2. Click "Get Started"');
      console.log('   3. Select location: us-central1');
      console.log('   4. Click "Done"\n');
      
      console.log('Option 2: Authenticate gcloud CLI');
      console.log('   1. Install: https://cloud.google.com/sdk/docs/install');
      console.log('   2. Run: gcloud auth application-default login');
      console.log('   3. Run this script again\n');
    } else if (error.code === 403) {
      console.log('\n💡 Permission denied. Need Storage Admin role.');
      console.log('   Use Firebase Console instead (Option 1 above)\n');
    } else if (error.code === 409) {
      console.log('\n✅ Bucket exists! Deploy rules: firebase deploy --only storage\n');
    } else {
      console.log('\n💡 Use Firebase Console to create bucket (see Option 1)\n');
    }
    
    process.exit(1);
  }
}

createBucket();

