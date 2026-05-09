import { db } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

type Kind = 'pricelist' | 'products';
export interface AdminDocMeta { 
  title: string; 
  url: string; 
  imageUrl?: string;
  updatedAt: any; 
}

const docRef = (kind: Kind) => doc(db, 'settings', 'documents', kind, 'latest');

export async function getDocument(kind: Kind): Promise<AdminDocMeta | null> {
  try {
    const snap = await getDoc(docRef(kind));
    return snap.exists() ? (snap.data() as AdminDocMeta) : null;
  } catch (error) {
    console.error(`Error getting document for ${kind}:`, error);
    // Return null instead of throwing so page can still render
    return null;
  }
}

export async function setDocument(kind: Kind, title: string, url: string, imageUrl?: string) {
  // Get existing document to preserve fields
  const existing = await getDocument(kind);
  
  await setDoc(docRef(kind), { 
    title, 
    url: url || existing?.url || '',
    imageUrl: imageUrl !== undefined ? imageUrl : (existing?.imageUrl || null),
    updatedAt: serverTimestamp() 
  }, { merge: true });
}
