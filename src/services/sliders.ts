import { db } from '../config/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export type SliderKind = 'tips' | 'offers' | 'deals' | 'promos';
export interface SliderItem { id?: string; title?: string; subtitle?: string; imageUrl: string; order: number; active: boolean; createdAt: number; }

const slidersRoot = (kind: SliderKind) => collection(db, 'sliders', kind, 'items');

export async function listSlides(kind: SliderKind): Promise<SliderItem[]> {
  try {
    const q = query(slidersRoot(kind), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  } catch (e) {
    const snap = await getDocs(slidersRoot(kind));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }
}

export async function createSlide(kind: SliderKind, data: Omit<SliderItem, 'id'>) {
  return await addDoc(slidersRoot(kind), data);
}

export async function updateSlide(kind: SliderKind, id: string, data: Partial<SliderItem>) {
  return await updateDoc(doc(db, 'sliders', kind, 'items', id), data as any);
}

export async function deleteSlide(kind: SliderKind, id: string) {
  return await deleteDoc(doc(db, 'sliders', kind, 'items', id));
}
