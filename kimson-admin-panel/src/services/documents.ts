import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
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

// --------------- Multiple items (price lists / product catalogs) ---------------

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
    console.error('Error getting price lists:', e);
    return [];
  }
}

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
    console.error('Error getting product catalogs:', e);
    return [];
  }
}

export async function addPriceList(title: string, url: string, imageUrl?: string): Promise<string> {
  const ref = await addDoc(itemsCollection('pricelist'), {
    title,
    url: url || '',
    imageUrl: imageUrl ?? null,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function addProductCatalog(title: string, url: string, imageUrl?: string): Promise<string> {
  const ref = await addDoc(itemsCollection('products'), {
    title,
    url: url || '',
    imageUrl: imageUrl ?? null,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePriceList(id: string, data: { title?: string; url?: string; imageUrl?: string }): Promise<void> {
  const ref = doc(db, 'settings', 'documents', 'pricelist', id);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updateProductCatalog(id: string, data: { title?: string; url?: string; imageUrl?: string }): Promise<void> {
  const ref = doc(db, 'settings', 'documents', 'products', id);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deletePriceListItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'settings', 'documents', 'pricelist', id));
}

export async function deleteProductCatalogItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'settings', 'documents', 'products', id));
}

// --------------- Legacy single-doc (backward compat; prefer multi above) ---------------

const docRef = (kind: Kind) => doc(db, 'settings', 'documents', kind, 'latest');

export async function getDocument(kind: Kind): Promise<AdminDocMeta | null> {
  try {
    const snap = await getDoc(docRef(kind));
    return snap.exists() ? (snap.data() as AdminDocMeta) : null;
  } catch (error) {
    console.error(`Error getting document for ${kind}:`, error);
    return null;
  }
}

export async function setDocument(kind: Kind, title: string, url: string, imageUrl?: string) {
  const existing = await getDocument(kind);
  await setDoc(docRef(kind), {
    title,
    url: url || existing?.url || '',
    imageUrl: imageUrl !== undefined ? imageUrl : (existing?.imageUrl || null),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteDocument(kind: Kind): Promise<void> {
  await deleteDoc(docRef(kind));
}
