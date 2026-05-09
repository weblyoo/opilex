import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'superAdmin';
  name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!db) {
        setUser(null);
        setLoading(false);
        return;
      }
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (userDoc.exists()) {
            const adminData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: adminData.role || 'admin',
              name: adminData.name,
            });
          } else {
            await signOut(auth);
            setUser(null);
          }
        } catch (e) {
          console.error('useAuth: admin check failed', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error(
        'Firebase Auth is not available. Check the console for initialization errors.'
      );
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  return { user, loading, login, logout };
};

