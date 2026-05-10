import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
const auth = getAuth(app);
const db = getFirestore(app);

const email = process.argv[2] || 'admin@opilex.com';
const password = process.argv[3] || 'Admin.123';

async function createAdmin() {
  try {
    console.log('🚀 Creating admin user for Opilex...');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Email:', email);
    
    let userId;
    try {
      // Try to create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      userId = userCredential.user.uid;
      console.log('✅ User created in Firebase Auth');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ User already exists, signing in to update Firestore...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
        console.log('✅ Signed in successfully');
      } else {
        throw error;
      }
    }
    
    // Create admin document in Firestore
    await setDoc(doc(db, 'admins', userId), {
      email,
      role: 'superAdmin',
      name: 'Admin User',
      permissions: ['users', 'authentications', 'rewards', 'transactions', 'sliders', 'documents', 'analytics', 'settings'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log('✅ Admin document created/updated in Firestore');
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Admin user setup complete!');
    console.log('Email:', email);
    console.log('User ID:', userId);
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
