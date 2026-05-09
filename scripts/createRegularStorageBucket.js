// Script to create a regular Cloud Storage bucket (without .firebasestorage.app)
// This avoids domain verification issues

import { Storage } from '@google-cloud/storage';

const projectId = 'kimson-3373e';
// Use regular bucket name (not .firebasestorage.app to avoid domain verification)
const bucketName = `${projectId}-storage`;
const location = 'US-CENTRAL1';

async function createBucket() {
  try {
    console.log('🚀 Creating Cloud Storage bucket...\n');
    console.log(`Project: ${projectId}`);
    console.log(`Bucket: ${bucketName}`);
    console.log(`Location: ${location} (Iowa)\n`);
    console.log('⚠️  Using regular bucket name to avoid domain verification\n');

    const storage = new Storage({ projectId });

    // Check if bucket exists
    try {
      const [exists] = await storage.bucket(bucketName).exists();
      if (exists) {
        console.log('='.repeat(70));
        console.log('✅ Storage bucket already exists!');
        console.log('='.repeat(70));
        console.log(`\n📦 Bucket: ${bucketName}`);
        console.log('\n✨ Next: Update Firebase config to use this bucket');
        console.log('   Then deploy rules: firebase deploy --only storage\n');
        return;
      }
    } catch (checkError) {
      // Continue to create
    }

    // Create bucket
    console.log('📦 Creating bucket...\n');
    const [bucket] = await storage.createBucket(bucketName, {
      location: location,
      storageClass: 'STANDARD',
    });

    console.log('='.repeat(70));
    console.log('✅ Storage bucket created successfully!');
    console.log('='.repeat(70));
    console.log(`\n📦 Bucket: ${bucket.name}`);
    console.log(`📍 Location: ${location}`);
    console.log('\n📝 Next Steps:');
    console.log('   1. Update Firebase config to use this bucket name');
    console.log('   2. Deploy storage rules: firebase deploy --only storage');
    console.log('   3. Or run: node scripts/updateFirebaseConfig.js\n');
    console.log('💡 Note: Update src/config/firebase.ts with:');
    console.log(`   storageBucket: "${bucketName}"\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('domain') || error.message.includes('verify')) {
      console.log('\n💡 Domain verification issue detected.');
      console.log('\n📋 Solution: Use one of these bucket names:\n');
      console.log('Option 1: Simple name (no domain)');
      console.log(`   Name: ${projectId}-storage`);
      console.log(`   (Avoids .firebasestorage.app domain)\n`);
      
      console.log('Option 2: Old format');
      console.log(`   Name: ${projectId}.appspot.com`);
      console.log(`   (Legacy format, still works)\n`);
      
      console.log('Option 3: Let Firebase create it');
      console.log('   Go to Firebase Console > Storage > Get Started');
      console.log('   Firebase will auto-create with correct domain\n');
      
    } else if (error.code === 403) {
      console.log('\n💡 Permission denied. Grant Storage Admin role:');
      console.log('   https://console.cloud.google.com/iam-admin/iam?project=kimson-3373e\n');
    } else {
      console.log('\n💡 Create bucket manually in Google Cloud Console');
      console.log('   Use bucket name WITHOUT .firebasestorage.app\n');
    }
    
    process.exit(1);
  }
}

createBucket();

