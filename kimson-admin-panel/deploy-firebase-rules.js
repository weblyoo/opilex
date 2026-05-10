// Firebase Rules Deployment Script
// Run with: node deploy-firebase-rules.js

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔥 Firebase Rules Deployment Script\n');
console.log('='.repeat(60));

try {
  // Check if Firebase CLI is installed
  console.log('1️⃣ Checking Firebase CLI...');
  try {
    const version = execSync('firebase --version', { encoding: 'utf-8' }).trim();
    console.log(`   ✅ Firebase CLI installed: v${version}\n`);
  } catch (error) {
    console.log('   ❌ Firebase CLI not found');
    console.log('   📦 Installing Firebase CLI...');
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log('   ✅ Firebase CLI installed\n');
  }

  // Check login status
  console.log('2️⃣ Checking Firebase login status...');
  try {
    const loginCheck = execSync('firebase login:list', { encoding: 'utf-8' });
    if (loginCheck.includes('No authorized accounts')) {
      console.log('   ⚠️  Not logged in to Firebase');
      console.log('   📝 Please run: firebase login');
      console.log('   🔗 This will open a browser for authentication\n');
      process.exit(1);
    } else {
      console.log('   ✅ Logged in to Firebase\n');
    }
  } catch (error) {
    console.log('   ❌ Error checking login status\n');
  }

  // Verify project configuration
  console.log('3️⃣ Verifying project configuration...');
  const firebaserc = JSON.parse(readFileSync('.firebaserc', 'utf-8'));
  const firebaseConfig = JSON.parse(readFileSync('firebase.json', 'utf-8'));
  
  console.log(`   ✅ Project ID: ${firebaserc.projects.default}`);
  console.log(`   ✅ Rules file: ${firebaseConfig.firestore.rules}\n`);

  // Deploy rules
  console.log('4️⃣ Deploying Firestore rules...');
  console.log('   ⏳ This may take a few moments...\n');
  
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Firestore rules deployed successfully!');
  console.log('='.repeat(60));
  console.log('\n🎉 Your Firebase setup is complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Test the connection: node test-firebase.js');
  console.log('   2. Enable Phone Authentication in Firebase Console');
  console.log('   3. Start using Firebase in your app\n');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n💡 Manual deployment option:');
  console.log('   1. Go to: https://console.firebase.google.com/project/opilex-3373e/firestore/rules');
  console.log('   2. Copy contents from firestore.rules');
  console.log('   3. Paste and click Publish\n');
  process.exit(1);
}
