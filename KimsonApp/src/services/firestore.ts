import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, WireAuthentication, Reward } from '../types';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  WIRE_AUTHENTICATIONS: 'wireAuthentications',
  REWARDS: 'rewards',
  TRANSACTIONS: 'transactions',
  SCRATCH_REWARDS: 'scratchRewards',
  SCHEME_JOINS: 'schemeJoins',
} as const;

// User operations
export const userService = {
  async createUser(userId: string, userData: Omit<User, 'id'>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const rewardPoints = userData.rewardPoints ?? 50000; // Default 50,000 for new users
    await setDoc(userRef, {
      ...userData,
      rewardPoints,
      createdAt: serverTimestamp(),
    });
  },

  async getUserById(userId: string): Promise<User | null> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  },

  async updateUserPoints(userId: string, points: number): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentPoints = userSnap.data().rewardPoints || 0;
      const newPoints = currentPoints + points;
      
      console.log('💾 [FIRESTORE] Updating user points:', {
        userId,
        currentPoints,
        pointsToAdd: points,
        newPoints,
      });
      
      await updateDoc(userRef, {
        rewardPoints: newPoints,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ [FIRESTORE] User points updated successfully:', newPoints);
    } else {
      console.warn('⚠️ [FIRESTORE] User document not found:', userId);
    }
  },

  /** Redeem reward points to wallet balance. 1 point = ₹1. Deducts points, adds same amount (Rs) to walletBalance. */
  async redeemPointsToWallet(userId: string, points: number): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const data = userSnap.data();
    const currentPoints = data.rewardPoints || 0;
    const currentWallet = data.walletBalance || 0;
    if (currentPoints < points) throw new Error('Insufficient points');
    const newPoints = currentPoints - points;
    const newWallet = currentWallet + points; // 1 point = 1 Rs
    await updateDoc(userRef, {
      rewardPoints: newPoints,
      walletBalance: newWallet,
      updatedAt: serverTimestamp(),
    });
  },

  /** Deduct amount from user wallet for scheme join. Allows negative balance. Returns before/after wallet. */
  async deductWalletForScheme(userId: string, amount: number): Promise<{ walletBefore: number; walletAfter: number }> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const currentWallet = userSnap.data().walletBalance ?? 0;
    const walletAfter = currentWallet - amount;
    await updateDoc(userRef, {
      walletBalance: walletAfter,
      updatedAt: serverTimestamp(),
    });
    return { walletBefore: currentWallet, walletAfter };
  },
};

// Wire authentication operations
export const wireAuthService = {
  async authenticateWire(userId: string, qrCode: string): Promise<WireAuthentication> {
    // Check if wire has already been authenticated
    const existingAuth = await this.getAuthenticationByQRCode(qrCode);
    if (existingAuth) {
      throw new Error('This wire has already been authenticated');
    }

    // Mock validation - in real app, this would call an API to verify the wire
    const isValid = await this.validateWireCode(qrCode);
    if (!isValid) {
      throw new Error('Invalid wire authentication code');
    }

    // Create authentication record
    const authData = {
      userId,
      qrCode,
      authenticatedAt: serverTimestamp(),
      rewardPoints: 50, // Default reward points
      productInfo: {
        type: 'Copper Wire',
        batch: this.extractBatchFromCode(qrCode),
        manufacturingDate: new Date(),
      },
    };

    const authRef = await addDoc(collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS), authData);
    
    // Update user points
    await userService.updateUserPoints(userId, 50);
    
    // Create reward record
    await rewardService.createReward(userId, 50, 'wire_authentication', 'Wire authentication reward');

    return {
      id: authRef.id,
      ...authData,
      authenticatedAt: new Date(),
    } as WireAuthentication;
  },

  async getAuthenticationByQRCode(qrCode: string): Promise<WireAuthentication | null> {
    const q = query(
      collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
      where('qrCode', '==', qrCode),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as WireAuthentication;
    }
    return null;
  },

  async getUserAuthentications(userId: string): Promise<WireAuthentication[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
        where('userId', '==', userId),
        orderBy('authenticatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WireAuthentication[];
    } catch (e: any) {
      if (e?.code === 'failed-precondition' || e?.message?.includes('index')) {
        const q = query(
          collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as WireAuthentication[];
        list.sort((a, b) => {
          const at = a.authenticatedAt?.toDate ? a.authenticatedAt.toDate().getTime() : (a.authenticatedAt as any)?.seconds ? (a.authenticatedAt as any).seconds * 1000 : 0;
          const bt = b.authenticatedAt?.toDate ? b.authenticatedAt.toDate().getTime() : (b.authenticatedAt as any)?.seconds ? (b.authenticatedAt as any).seconds * 1000 : 0;
          return bt - at;
        });
        return list;
      }
      throw e;
    }
  },

  async validateWireCode(qrCode: string): Promise<boolean> {
    // Mock validation - in real app, this would call Opilex's API
    // For demo purposes, we'll consider codes starting with 'OPILEX_' as valid
    return qrCode.startsWith('OPILEX_') && qrCode.length > 10;
  },

  extractBatchFromCode(qrCode: string): string {
    // Extract batch info from QR code
    const parts = qrCode.split('_');
    return parts.length > 2 ? parts[2] : 'UNKNOWN';
  },
};

// Reward operations
export const rewardService = {
  async createReward(
    userId: string,
    points: number,
    type: 'wire_authentication' | 'bonus' | 'referral',
    description: string,
    productName?: string
  ): Promise<Reward> {
    const rewardData: Record<string, unknown> = {
      userId,
      points,
      type,
      description,
      createdAt: serverTimestamp(),
    };
    if (productName != null && productName !== '') {
      rewardData.productName = productName;
    }

    const rewardRef = await addDoc(collection(db, COLLECTIONS.REWARDS), rewardData);
    
    return {
      id: rewardRef.id,
      ...rewardData,
      createdAt: new Date(),
    } as Reward;
  },

  async getUserRewards(userId: string): Promise<Reward[]> {
    try {
      // Try query with orderBy first (requires composite index)
      const q = query(
        collection(db, COLLECTIONS.REWARDS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Reward[];
    } catch (error: any) {
      // If index error, fallback to query without orderBy and sort in memory
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        console.warn('⚠️ [FIRESTORE] Index not found, falling back to in-memory sort');
        try {
          const q = query(
            collection(db, COLLECTIONS.REWARDS),
            where('userId', '==', userId)
          );
          
          const querySnapshot = await getDocs(q);
          const rewards = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Reward[];
          
          // Sort by createdAt in memory (newest first)
          rewards.sort((a, b) => {
            const dateA = a.createdAt instanceof Date 
              ? a.createdAt 
              : a.createdAt?.toDate 
                ? a.createdAt.toDate() 
                : new Date(a.createdAt || 0);
            const dateB = b.createdAt instanceof Date 
              ? b.createdAt 
              : b.createdAt?.toDate 
                ? b.createdAt.toDate() 
                : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          });
          
          return rewards;
        } catch (fallbackError) {
          console.error('❌ [FIRESTORE] Error loading rewards (fallback):', fallbackError);
          return [];
        }
      }
      console.error('❌ [FIRESTORE] Error loading rewards:', error);
      return [];
    }
  },

  async getTotalUserPoints(userId: string): Promise<number> {
    const rewards = await this.getUserRewards(userId);
    return rewards.reduce((total, reward) => total + reward.points, 0);
  },
};

// Transaction operations
export const transactionService = {
  async createWithdrawalRequest(
    userId: string,
    amount: number,
    account?: { id: string; type: 'bank' | 'upi'; bankName?: string; accountHolderName?: string; accountNumber?: string; ifscCode?: string; upiUserName?: string; upiId?: string; mobileNumber?: string }
  ): Promise<void> {
    const transactionData: Record<string, unknown> = {
      userId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      requestedAt: serverTimestamp(),
    };
    if (account) {
      transactionData.accountId = account.id;
      transactionData.accountType = account.type;
      if (account.type === 'bank') {
        transactionData.bankName = account.bankName;
        transactionData.accountHolderName = account.accountHolderName;
        transactionData.accountNumber = account.accountNumber;
        transactionData.ifscCode = account.ifscCode;
      } else {
        transactionData.upiUserName = account.upiUserName;
        transactionData.upiId = account.upiId;
        transactionData.mobileNumber = account.mobileNumber;
      }
    }
    await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transactionData);
  },

  /** UPI redemption: creates a transaction so admin can Approve/Reject. amount in doc = points/10 (rupees). */
  async createRedemptionRequest(
    userId: string,
    points: number,
    upiId: string,
    mobileNumber?: string
  ): Promise<void> {
    const amountRupees = Math.round(points / 10);
    const transactionData = {
      userId,
      type: 'upi_redeem',
      amount: amountRupees,
      points,
      status: 'pending',
      requestedAt: serverTimestamp(),
      upiId: upiId.trim(),
      ...(mobileNumber?.trim() && { mobileNumber: mobileNumber.trim() }),
    };
    await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transactionData);
  },

  /** Scheme join: records deducted amount in transaction history so it appears in Wallet and Ledger. */
  async createSchemeDeduction(
    userId: string,
    amount: number,
    schemeId: string,
    schemeName: string
  ): Promise<void> {
    const transactionData = {
      userId,
      type: 'scheme_join',
      amount,
      schemeId,
      schemeName: schemeName || 'Scheme',
      status: 'completed',
      requestedAt: serverTimestamp(),
    };
    await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transactionData);
  },

  async getUserTransactions(userId: string): Promise<any[]> {
    try {
      // Try query with orderBy first (requires composite index)
      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('userId', '==', userId),
        orderBy('requestedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, fallback to query without orderBy and sort in memory
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        console.warn('⚠️ [FIRESTORE] Index not found, falling back to in-memory sort');
        try {
          const q = query(
            collection(db, COLLECTIONS.TRANSACTIONS),
            where('userId', '==', userId)
          );
          
          const querySnapshot = await getDocs(q);
          const transactions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          // Sort by requestedAt in memory (newest first)
          transactions.sort((a, b) => {
            const dateA = a.requestedAt instanceof Date 
              ? a.requestedAt 
              : a.requestedAt?.toDate 
                ? a.requestedAt.toDate() 
                : new Date(a.requestedAt || 0);
            const dateB = b.requestedAt instanceof Date 
              ? b.requestedAt 
              : b.requestedAt?.toDate 
                ? b.requestedAt.toDate() 
                : new Date(b.requestedAt || 0);
            return dateB.getTime() - dateA.getTime();
          });
          
          return transactions;
        } catch (fallbackError) {
          console.error('❌ [FIRESTORE] Error loading transactions (fallback):', fallbackError);
          return [];
        }
      }
      console.error('❌ [FIRESTORE] Error loading transactions:', error);
      return [];
    }
  },
};

// Scratch rewards (loyal client – admin gives, user scratches to claim)
export const scratchRewardService = {
  async getUnclaimedByUser(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SCRATCH_REWARDS),
        where('userId', '==', userId),
        where('claimed', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error loading scratch rewards:', error);
      return [];
    }
  },

  async claimScratchReward(rewardId: string, userId: string): Promise<{ success: boolean; points?: number }> {
    try {
      const ref = doc(db, COLLECTIONS.SCRATCH_REWARDS, rewardId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return { success: false };
      const data = snap.data();
      if (data.claimed || data.userId !== userId) return { success: false };
      const points = Number(data.points) || 0;
      await updateDoc(ref, {
        claimed: true,
        claimedAt: serverTimestamp(),
        claimedBy: userId,
      });
      await userService.updateUserPoints(userId, points);
      await rewardService.createReward(userId, points, 'bonus', 'Gift from admin (Scratch Rewards)');
      return { success: true, points };
    } catch (error) {
      console.error('Error claiming scratch reward:', error);
      return { success: false };
    }
  },
};

// Analytics operations
export const analyticsService = {
  async logWireAuthentication(userId: string, success: boolean): Promise<void> {
    // Log analytics event - you can extend this to use Firebase Analytics
    console.log('Wire authentication event:', { userId, success, timestamp: new Date() });
  },

  async logUserAction(userId: string, action: string, metadata?: any): Promise<void> {
    // Log user action for analytics
    console.log('User action:', { userId, action, metadata, timestamp: new Date() });
  },
};
