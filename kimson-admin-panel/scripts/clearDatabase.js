import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// List of collections to clear
const collectionsToClear = [
  'users',
  'wireAuthentications',
  'rewards',
  'transactions',
  'rewardQRCodes',
  'schemes',
  'schemeJoins',
  'scratchRewards',
  'gst_verifications',
  'kyc_verifications',
  'bankAccounts',
  'sliders',
  'legacyClaims'
];

async function deleteCollection(collectionName) {
  console.log(`🧹 Clearing collection: ${collectionName}...`);
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  
  if (snapshot.empty) {
    console.log(`  - ${collectionName} is already empty.`);
    return;
  }

  console.log(`  - Deleting ${snapshot.size} documents...`);
  const deletePromises = snapshot.docs.map(document => deleteDoc(doc(db, collectionName, document.id)));
  await Promise.all(deletePromises);
  console.log(`  ✅ ${collectionName} cleared.`);
}

async function clearDatabase() {
  try {
    console.log('🚀 Starting Database Cleanup for Opilex...');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('='.repeat(40));

    for (const col of collectionsToClear) {
      try {
        await deleteCollection(col);
      } catch (err) {
        console.error(`  ❌ Error clearing ${col}:`, err.message);
      }
    }

    console.log('='.repeat(40));
    console.log('🎉 Database cleanup complete!');
    console.log('NOTE: The "admins" collection was preserved.');
    console.log('='.repeat(40));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

clearDatabase();
