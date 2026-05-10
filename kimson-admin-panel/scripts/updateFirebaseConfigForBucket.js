// Script to update Firebase config with custom bucket name
import { readFileSync, writeFileSync } from 'fs';

const bucketName = process.argv[2] || 'opilex-3373e-storage';

console.log(`📝 Updating Firebase config to use bucket: ${bucketName}\n`);

try {
  const configPath = 'src/config/firebase.ts';
  const content = readFileSync(configPath, 'utf8');
  
  // Update storageBucket in both env var fallback and default
  const updated = content.replace(
    /storageBucket:\s*import\.meta\.env\.VITE_FIREBASE_STORAGE_BUCKET\s*\|\|\s*["'].*?["']/,
    `storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "${bucketName}"`
  );
  
  writeFileSync(configPath, updated, 'utf8');
  
  console.log('='.repeat(70));
  console.log('✅ Firebase config updated!');
  console.log('='.repeat(70));
  console.log(`\n📦 Storage Bucket: ${bucketName}`);
  console.log('\n✨ Next steps:');
  console.log('   1. Restart dev server (if running)');
  console.log('   2. Deploy storage rules: firebase deploy --only storage');
  console.log('   3. Test upload functionality\n');

} catch (error) {
  console.error('❌ Error updating config:', error.message);
  console.log('\n💡 Manual update: Edit src/config/firebase.ts');
  console.log(`   Change storageBucket to: "${bucketName}"\n`);
  process.exit(1);
}

