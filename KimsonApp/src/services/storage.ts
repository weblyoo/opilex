import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadSliderImage(file: File, slider: 'tips' | 'offers' | 'deals' | 'promos'): Promise<string> {
  const filePath = `sliders/${slider}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

export async function uploadPdf(file: File, kind: 'pricelist'|'products'): Promise<string> {
  const path = `documents/${kind}/${Date.now()}_${file.name}`;
  const r = ref(storage, path);
  const snap = await uploadBytes(r, file, { contentType: file.type || 'application/pdf' });
  return await getDownloadURL(snap.ref);
}
