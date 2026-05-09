import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration - Uses environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kimson-3373e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kimson-3373e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kimson-3373e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1002505057634",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1002505057634:web:fe5a29d0d3945c850ae83b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-40Z3KKDR4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (web uses getAuth instead of initializeAuth with persistence)
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Functions
export const functions = getFunctions(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Analytics only if supported
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };
export default app;
