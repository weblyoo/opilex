import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extraFirebase = (Constants.expoConfig?.extra?.firebase || {}) as Record<string, string>;

export const firebaseConfig = {
  apiKey: extraFirebase.apiKey || '',
  authDomain: extraFirebase.authDomain || '',
  projectId: extraFirebase.projectId || '',
  storageBucket: extraFirebase.storageBucket || '',
  messagingSenderId: extraFirebase.messagingSenderId || '',
  appId: extraFirebase.appId || '',
  measurementId: extraFirebase.measurementId || '',
};

export const firebaseAndroidApiKey = extraFirebase.androidApiKey || firebaseConfig.apiKey;

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

// Initialize Firebase with error handling - don't throw on Android
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let functions: Functions | null = null;
let storage: FirebaseStorage | null = null;

try {
  if (!hasFirebaseConfig) {
    throw new Error('Missing Opilex Firebase configuration. Set EXPO_PUBLIC_FIREBASE_* values before running the app.');
  }

  firebaseApp = initializeApp(firebaseConfig);
  // Use AsyncStorage persistence on native so auth state persists between sessions
  if (Platform.OS === 'web') {
    auth = getAuth(firebaseApp);
  } else {
    const { getReactNativePersistence } = require('@firebase/auth');
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  db = getFirestore(firebaseApp);
  functions = getFunctions(firebaseApp);
  storage = getStorage(firebaseApp);
  console.log('Firebase initialized successfully');
} catch (error: any) {
  console.error('=== FIREBASE INITIALIZATION ERROR ===');
  console.error('Error:', error);
  console.error('Error message:', error?.message);
  console.error('Error code:', error?.code);
  console.error('Error stack:', error?.stack);
  console.error('Error name:', error?.name);
  console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  console.error('=====================================');
  // Don't throw - create fallback objects to prevent app crash
  // The app can continue but Firebase features won't work
  console.warn('Firebase failed to initialize. Some features may not work.');
}

// Initialize Analytics only if supported (non-blocking)
let analytics: Analytics | null = null;
if (firebaseApp) {
  isSupported().then((supported) => {
    if (supported && firebaseApp) {
      try {
        analytics = getAnalytics(firebaseApp);
      } catch (error) {
        console.error('Analytics initialization error:', error);
        // Analytics is optional, don't throw
      }
    }
  }).catch((error) => {
    console.error('Analytics support check error:', error);
    // Analytics is optional, don't throw
  });
}

// Export with null checks - components should handle null cases
export { auth, db, functions, storage, analytics };
export default firebaseApp;
