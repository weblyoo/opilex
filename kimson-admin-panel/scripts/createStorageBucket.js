// Script to create Firebase Storage bucket programmatically using Google Cloud Storage API
import { Storage } from '@google-cloud/storage';

const projectId = 'opilex-3373e';
const bucketName = `${projectId}.firebasestorage.app`;
const location = 'US-CENTRAL1'; // Iowa - supports no-cost tier

async function createBucket() {
  try {
    console.log('🚀 Creating Firebase Storage bucket...\n');
    console.log(`Project: ${projectId}`);
    console.log(`Bucket: ${bucketName}`);
    console.log(`Location: ${location} (Iowa)\n`);

    const storage = new Storage({ projectId });

    // Check if bucket already exists
    const [exists] = await storage.bucket(bucketName).exists();
    
    if (exists) {
      console.log('='.repeat(60));
      console.log('✅ Storage bucket already exists!');
      console.log('='.repeat(60));
      console.log(`\n📦 Bucket: ${bucketName}`);
      console.log('\n✨ Storage is ready. Deploy rules:');
      console.log('   firebase deploy --only storage');
      console.log('   Or run: node scripts/checkAndDeployStorage.js\n');
      return;
    }

    // Create the bucket
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
    console.log(`📊 Storage Class: STANDARD`);
    console.log('\n✨ Next steps:');
    console.log('   1. Wait 1-2 minutes for propagation');
    console.log('   2. Deploy storage rules:');
    console.log('      firebase deploy --only storage');
    console.log('   3. Or run: node scripts/checkAndDeployStorage.js\n');

  } catch (error) {
    console.error('\n❌ Error creating bucket:', error.message);
    
    if (error.code === 403) {
      console.log('\n💡 Permission denied. You may need to:');
      console.log('   1. Enable Cloud Storage API in Google Cloud Console');
      console.log('   2. Grant Storage Admin role to your account');
      console.log('   3. Or create bucket manually in Firebase Console');
    } else if (error.code === 409) {
      console.log('\n✅ Bucket already exists!');
      console.log('✨ Storage is ready. Deploy rules:');
      console.log('   firebase deploy --only storage\n');
    } else {
      console.log('\n💡 Alternative: Create bucket manually');
      console.log('   1. Go to: https://console.firebase.google.com/project/opilex-3373e/storage');
      console.log('   2. Click "Get Started"');
      console.log(`   3. Select location: us-central1`);
      console.log('   4. Click "Done"\n');
    }
    
    process.exit(1);
  }
}

createBucket();
