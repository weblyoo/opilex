import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { userService, transactionService, COLLECTIONS } from './firestore';

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
  priority: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

const COLLECTION = 'schemes';

export const schemeService = {
  // Get all active schemes for a user. walletBalance used for "min wallet to join" (pointsRequired).
  async getActiveSchemes(userId: string, walletBalance: number, userCategory?: string): Promise<Scheme[]> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, COLLECTION),
        where('isActive', '==', true),
        where('isPublished', '==', true),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const schemes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
          endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        } as Scheme;
      });

      // Filter: active/published, within date, in stock. Any user can join; amount deducted from wallet (can go negative).
      const filtered = schemes.filter(scheme => {
        const startDate = scheme.startDate instanceof Date ? scheme.startDate : scheme.startDate?.toDate?.();
        const endDate = scheme.endDate instanceof Date ? scheme.endDate : scheme.endDate?.toDate?.();
        if (startDate && now.toDate() < startDate) return false;
        if (endDate && now.toDate() > endDate) return false;
        if (scheme.stock !== undefined && scheme.stock <= 0) return false;
        if (scheme.userCategory && scheme.userCategory !== 'all' && userCategory && scheme.userCategory !== userCategory) return false;
        if (scheme.visibility === 'selected' && !scheme.selectedUserIds?.includes(userId)) return false;
        return true;
      });
      // Sort by priority desc, then by createdAt desc
      filtered.sort((a, b) => {
        const p = (b.priority ?? 0) - (a.priority ?? 0);
        if (p !== 0) return p;
        const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt?.toDate?.()?.getTime() ?? 0;
        const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt?.toDate?.()?.getTime() ?? 0;
        return bDate - aDate;
      });
      return filtered;
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const q = query(
            collection(db, COLLECTION),
            where('isActive', '==', true),
            where('isPublished', '==', true)
          );
          const snapshot = await getDocs(q);
          const schemes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
              endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            } as Scheme;
          });

          const now = new Date();
          const filtered = schemes.filter(scheme => {
            const startDate = scheme.startDate instanceof Date ? scheme.startDate : scheme.startDate?.toDate?.();
            const endDate = scheme.endDate instanceof Date ? scheme.endDate : scheme.endDate?.toDate?.();
            if (startDate && now < startDate) return false;
            if (endDate && now > endDate) return false;
            if (scheme.stock !== undefined && scheme.stock <= 0) return false;
            if (scheme.userCategory && scheme.userCategory !== 'all' && userCategory && scheme.userCategory !== userCategory) return false;
            if (scheme.visibility === 'selected' && !scheme.selectedUserIds?.includes(userId)) return false;
            return true;
          });
          filtered.sort((a, b) => {
            const p = (b.priority ?? 0) - (a.priority ?? 0);
            if (p !== 0) return p;
            const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt?.toDate?.()?.getTime() ?? 0;
            const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt?.toDate?.()?.getTime() ?? 0;
            return bDate - aDate;
          });
          return filtered;
        } catch (fallbackError) {
          // Last resort: get all docs and filter in memory
          try {
            const snapshot = await getDocs(collection(db, COLLECTION));
            const all = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
                endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
              } as Scheme;
            });
            const now = new Date();
            const filtered = all.filter(scheme => {
              if (!scheme.isActive || !scheme.isPublished) return false;
              const startDate = scheme.startDate instanceof Date ? scheme.startDate : scheme.startDate?.toDate?.();
              const endDate = scheme.endDate instanceof Date ? scheme.endDate : scheme.endDate?.toDate?.();
              if (startDate && now < startDate) return false;
              if (endDate && now > endDate) return false;
              if (scheme.stock !== undefined && scheme.stock <= 0) return false;
              if (scheme.userCategory && scheme.userCategory !== 'all' && userCategory && scheme.userCategory !== userCategory) return false;
              if (scheme.visibility === 'selected' && !scheme.selectedUserIds?.includes(userId)) return false;
              return true;
            });
            filtered.sort((a, b) => {
              const p = (b.priority ?? 0) - (a.priority ?? 0);
              if (p !== 0) return p;
              const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt?.toDate?.()?.getTime() ?? 0;
              const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt?.toDate?.()?.getTime() ?? 0;
              return bDate - aDate;
            });
            return filtered;
          } catch (e) {
            console.error('Error loading schemes (fallback):', e);
            return [];
          }
        }
      }
      console.error('Error loading schemes:', error);
      return [];
    }
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

  // Claim a scheme (create a claim record - you may want to create a claims collection)
  async claimScheme(userId: string, schemeId: string): Promise<void> {
    console.log('Scheme claimed:', { userId, schemeId, timestamp: new Date() });
  },

  /**
   * Join a scheme: requires wallet >= min wallet to join (pointsRequired); then deducts Amount Required (minPoints) from wallet. Records join for admin timeline.
   */
  async joinScheme(
    userId: string,
    userName: string,
    userPhone: string,
    schemeId: string,
    walletBalance: number
  ): Promise<{ walletBefore: number; walletAfter: number }> {
    const scheme = await this.getSchemeById(schemeId);
    if (!scheme) throw new Error('Scheme not found');
    const minWalletToJoin = scheme.pointsRequired ?? 0;
    const amountRequired = scheme.minPoints ?? 0;
    if (walletBalance < minWalletToJoin) {
      throw new Error(
        `Not eligible to join. Min wallet required: ₹${minWalletToJoin.toLocaleString()}. Your balance: ₹${walletBalance.toLocaleString()}.`
      );
    }
    if (walletBalance < amountRequired) {
      throw new Error(
        `Insufficient balance to join. Amount required: ₹${amountRequired.toLocaleString()}. Your balance: ₹${walletBalance.toLocaleString()}. Wallet cannot go negative.`
      );
    }
    const { walletBefore, walletAfter } = await userService.deductWalletForScheme(userId, amountRequired);
    const schemeEndDate = scheme.endDate instanceof Date ? scheme.endDate : (scheme.endDate as any)?.toDate?.() ?? null;
    await addDoc(collection(db, COLLECTIONS.SCHEME_JOINS), {
      userId,
      userName: userName || '',
      userPhone: userPhone || '',
      schemeId,
      schemeName: scheme.name,
      amountRequired,
      schemeEndDate: schemeEndDate ? Timestamp.fromDate(schemeEndDate instanceof Date ? schemeEndDate : new Date(schemeEndDate)) : null,
      joinedAt: serverTimestamp(),
      walletBalanceBefore: walletBefore,
      walletBalanceAfter: walletAfter,
    });
    await transactionService.createSchemeDeduction(userId, amountRequired, schemeId, scheme.name);
    return { walletBefore, walletAfter };
  },

  /** User's scheme joins (timeline) – ordered by joinedAt desc. Enriches joins missing schemeEndDate from scheme doc so completed section shows all ended schemes. */
  async getMySchemeJoins(userId: string): Promise<SchemeJoinRecord[]> {
    let list: SchemeJoinRecord[];
    try {
      const q = query(
        collection(db, COLLECTIONS.SCHEME_JOINS),
        where('userId', '==', userId),
        orderBy('joinedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      list = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          schemeId: data.schemeId,
          schemeName: data.schemeName || '',
          amountRequired: data.amountRequired ?? 0,
          joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : data.joinedAt,
          walletBalanceAfter: data.walletBalanceAfter ?? 0,
          schemeEndDate: data.schemeEndDate?.toDate ? data.schemeEndDate.toDate() : data.schemeEndDate,
        };
      });
    } catch (e: any) {
      if (e?.code === 'failed-precondition' || e?.message?.includes('index')) {
        const q = query(
          collection(db, COLLECTIONS.SCHEME_JOINS),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        list = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            userId: data.userId,
            schemeId: data.schemeId,
            schemeName: data.schemeName || '',
            amountRequired: data.amountRequired ?? 0,
            joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : data.joinedAt,
            walletBalanceAfter: data.walletBalanceAfter ?? 0,
            schemeEndDate: data.schemeEndDate?.toDate ? data.schemeEndDate.toDate() : data.schemeEndDate,
          };
        });
        list.sort((a, b) => {
          const at = a.joinedAt instanceof Date ? a.joinedAt.getTime() : (a.joinedAt as any)?.seconds ? (a.joinedAt as any).seconds * 1000 : 0;
          const bt = b.joinedAt instanceof Date ? b.joinedAt.getTime() : (b.joinedAt as any)?.seconds ? (b.joinedAt as any).seconds * 1000 : 0;
          return bt - at;
        });
      } else {
        console.error('Error loading scheme joins:', e);
        return [];
      }
    }
    // Enrich joins missing schemeEndDate from scheme doc so they can be marked completed
    for (const j of list) {
      if (j.schemeEndDate == null && j.schemeId) {
        const scheme = await this.getSchemeById(j.schemeId);
        if (scheme?.endDate) {
          const end = scheme.endDate instanceof Date ? scheme.endDate : (scheme.endDate as any)?.toDate?.();
          if (end) j.schemeEndDate = end instanceof Date ? end : new Date(end);
        }
      }
    }
    return list;
  },
};

export interface SchemeJoinRecord {
  id: string;
  userId: string;
  schemeId: string;
  schemeName: string;
  amountRequired: number;
  joinedAt: Date | any;
  walletBalanceAfter?: number;
  schemeEndDate?: Date | null;
}
