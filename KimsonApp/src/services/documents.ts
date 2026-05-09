import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export interface AdminDocMeta {
  id?: string;
  title: string;
  url: string;
  imageUrl?: string;
  updatedAt: any;
}

type Kind = 'pricelist' | 'products';

const settingsDocRef = () => doc(db, 'settings', 'documents');
const itemsCollection = (kind: Kind) => collection(settingsDocRef(), kind);

/** Fetch all price lists (new multi-item API). */
export async function getPriceLists(): Promise<(AdminDocMeta & { id: string })[]> {
  try {
    const col = itemsCollection('pricelist');
    const q = query(col, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminDocMeta & { id: string }));
  } catch (e: any) {
    if (e?.code === 'failed-precondition' || e?.message?.includes('index')) {
      const snap = await getDocs(itemsCollection('pricelist'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminDocMeta & { id: string }));
      list.sort((a, b) => {
        const ta = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(0);
        const tb = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(0);
        return tb.getTime() - ta.getTime();
      });
      return list;
    }
    return [];
  }
}

/** Fetch all product catalogs (new multi-item API). */
export async function getProductCatalogs(): Promise<(AdminDocMeta & { id: string })[]> {
  try {
    const col = itemsCollection('products');
    const q = query(col, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminDocMeta & { id: string }));
  } catch (e: any) {
    if (e?.code === 'failed-precondition' || e?.message?.includes('index')) {
      const snap = await getDocs(itemsCollection('products'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminDocMeta & { id: string }));
      list.sort((a, b) => {
        const ta = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(0);
        const tb = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(0);
        return tb.getTime() - ta.getTime();
      });
      return list;
    }
    return [];
  }
}

// Legacy single-doc (backward compat)
const docRef = (kind: Kind) => doc(db, 'settings', 'documents', kind, 'latest');

export async function getDocument(kind: Kind): Promise<AdminDocMeta | null> {
  const snap = await getDoc(docRef(kind));
  return snap.exists() ? (snap.data() as AdminDocMeta) : null;
}

export async function setDocument(kind: Kind, title: string, url: string) {
  await setDoc(docRef(kind), { title, url, updatedAt: serverTimestamp() }, { merge: true });
}
