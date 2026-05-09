import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from './storage';

export type SchemeType = 'product' | 'cashback' | 'voucher' | 'contest';
export type VisibilityType = 'all' | 'selected' | 'eligible';
export type UserCategory = 'all' | 'new' | 'existing' | 'premium';

export interface Scheme {
  id?: string;
  name: string;
  type: SchemeType;
  description?: string;
  pointsRequired: number;
  imageUrl?: string;
  bannerImageUrl?: string;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  quantity?: number;
  stock?: number;
  minPoints?: number;
  userCategory?: UserCategory;
  regions?: string[];
  cities?: string[];
  visibility: VisibilityType;
  selectedUserIds?: string[];
  priority: number; // Higher number = appears first
  isActive: boolean;
  isPublished: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  createdBy?: string;
}

const COLLECTION = 'schemes';

/** Remove undefined values so Firestore doesn't reject the document */
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    if (out[key] === undefined) delete out[key];
  }
  return out;
}

export const schemeService = {
  // Get all schemes (no composite index required – fetches all then sorts in memory)
  async getAllSchemes(): Promise<Scheme[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      const list = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? '',
          type: data.type ?? 'product',
          description: data.description,
          pointsRequired: data.pointsRequired ?? 0,
          imageUrl: data.imageUrl,
          bannerImageUrl: data.bannerImageUrl,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
          endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
          quantity: data.quantity,
          stock: data.stock,
          minPoints: data.minPoints,
          userCategory: data.userCategory,
          regions: data.regions,
          cities: data.cities,
          visibility: data.visibility ?? 'all',
          selectedUserIds: data.selectedUserIds,
          priority: data.priority ?? 0,
          isActive: data.isActive !== false,
          isPublished: data.isPublished === true,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          createdBy: data.createdBy,
        } as Scheme;
      });
      list.sort((a, b) => {
        const p = (b.priority ?? 0) - (a.priority ?? 0);
        if (p !== 0) return p;
        const aT = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toMillis?.() ?? 0;
        const bT = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toMillis?.() ?? 0;
        return bT - aT;
      });
      return list;
    } catch (error: any) {
      console.error('Error loading schemes:', error);
      return [];
    }
  },

  // Get active schemes
  async getActiveSchemes(): Promise<Scheme[]> {
    const schemes = await this.getAllSchemes();
    const now = new Date();
    return schemes.filter(scheme => {
      if (!scheme.isActive || !scheme.isPublished) return false;
      const startDate = scheme.startDate instanceof Date ? scheme.startDate : scheme.startDate?.toDate();
      const endDate = scheme.endDate instanceof Date ? scheme.endDate : scheme.endDate?.toDate();
      if (startDate && now < startDate) return false;
      if (endDate && now > endDate) return false;
      if (scheme.stock !== undefined && scheme.stock <= 0) return false;
      return true;
    });
  },

  // Get scheme by ID
  async getSchemeById(schemeId: string): Promise<Scheme | null> {
    try {
      const docRef = doc(db, COLLECTION, schemeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
          endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        } as Scheme;
      }
      return null;
    } catch (error) {
      console.error('Error getting scheme:', error);
      return null;
    }
  },

  // Create scheme
  async createScheme(scheme: Omit<Scheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const startDate = scheme.startDate instanceof Date ? scheme.startDate : (scheme.startDate as any)?.toDate?.();
      const endDate = scheme.endDate instanceof Date ? scheme.endDate : (scheme.endDate as any)?.toDate?.();
      const schemeData = stripUndefined({
        ...scheme,
        startDate: Timestamp.fromDate(startDate || new Date()),
        endDate: Timestamp.fromDate(endDate || new Date()),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const docRef = await addDoc(collection(db, COLLECTION), schemeData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating scheme:', error);
      throw error;
    }
  },

  // Update scheme
  async updateScheme(schemeId: string, updates: Partial<Scheme>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, schemeId);
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      if (updates.startDate) {
        updateData.startDate = updates.startDate instanceof Date
          ? Timestamp.fromDate(updates.startDate)
          : updates.startDate;
      }
      if (updates.endDate) {
        updateData.endDate = updates.endDate instanceof Date
          ? Timestamp.fromDate(updates.endDate)
          : updates.endDate;
      }
      await updateDoc(docRef, stripUndefined(updateData));
    } catch (error) {
      console.error('Error updating scheme:', error);
      throw error;
    }
  },

  // Delete scheme
  async deleteScheme(schemeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION, schemeId));
    } catch (error) {
      console.error('Error deleting scheme:', error);
      throw error;
    }
  },

  // Upload scheme image
  async uploadSchemeImage(file: File, schemeId?: string): Promise<string> {
    return await uploadImage(file, 'schemes');
  },

  /** Scheme user timeline: list of users who joined schemes (from mobile app). */
  async getSchemeJoins(): Promise<SchemeJoin[]> {
    try {
      const q = query(
        collection(db, 'schemeJoins'),
        orderBy('joinedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId || '',
          userName: data.userName || '',
          userPhone: data.userPhone || '',
          schemeId: data.schemeId || '',
          schemeName: data.schemeName || '',
          amountRequired: data.amountRequired ?? 0,
          joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : (data.joinedAt ? new Date(data.joinedAt) : new Date()),
          walletBalanceBefore: data.walletBalanceBefore ?? 0,
          walletBalanceAfter: data.walletBalanceAfter ?? 0,
        };
      });
    } catch (error: any) {
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const snapshot = await getDocs(collection(db, 'schemeJoins'));
          const list = snapshot.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId || '',
              userName: data.userName || '',
              userPhone: data.userPhone || '',
              schemeId: data.schemeId || '',
              schemeName: data.schemeName || '',
              amountRequired: data.amountRequired ?? 0,
              joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : (data.joinedAt ? new Date(data.joinedAt) : new Date()),
              walletBalanceBefore: data.walletBalanceBefore ?? 0,
              walletBalanceAfter: data.walletBalanceAfter ?? 0,
            };
          });
          list.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());
          return list;
        } catch (e) {
          console.error('Error loading scheme joins:', e);
          return [];
        }
      }
      console.error('Error loading scheme joins:', error);
      return [];
    }
  },
};

export interface SchemeJoin {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  schemeId: string;
  schemeName: string;
  amountRequired: number;
  joinedAt: Date;
  walletBalanceBefore: number;
  walletBalanceAfter: number;
}
