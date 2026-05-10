// Script to automatically deploy Storage rules once Storage is initialized
// Run this after setting up Storage in Firebase Console

import { execSync } from 'child_process';

console.log('🚀 Deploying Firebase Storage Rules...\n');

try {
  // Check if firebase CLI is available
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.log('   npm install -g firebase-tools\n');
    process.exit(1);
  }

  // Deploy storage rules
  console.log('📦 Deploying storage rules...\n');
  execSync('firebase deploy --only storage', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Storage rules deployed successfully!');
  console.log('='.repeat(60));
  console.log('\n✨ Your Price List and Product Catalog pages are now ready!\n');

} catch (error) {
  console.error('\n❌ Error deploying storage rules');
  
  if (error.message.includes('Storage has not been set up')) {
    console.log('\n💡 Firebase Storage is not initialized yet.');
    console.log('\n📝 Please complete these steps first:');
    console.log('\n1. Go to: https://console.firebase.google.com/project/opilex-3373e/storage');
    console.log('2. Click "Get Started"');
    console.log('3. Select location: "us-central1" (Iowa)');
    console.log('4. Storage Class: "Standard"');
    console.log('5. Click "Done"');
    console.log('6. Wait 1-2 minutes');
    console.log('7. Run this script again: node scripts/deployStorageRules.js\n');
  } else {
    console.error('Error:', error.message);
  }
  
  process.exit(1);
}

