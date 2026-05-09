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
      
      console.log('💾 [FIRESTORE-ADMIN] Updating user points:', {
        userId,
        currentPoints,
        pointsToAdd: points,
        newPoints,
      });
      
      await updateDoc(userRef, {
        rewardPoints: newPoints,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ [FIRESTORE-ADMIN] User points updated successfully:', newPoints);
    } else {
      console.warn('⚠️ [FIRESTORE-ADMIN] User document not found:', userId);
    }
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
  },

  async validateWireCode(qrCode: string): Promise<boolean> {
    // Mock validation - in real app, this would call Kimson's API
    // For demo purposes, we'll consider codes starting with 'KIMSON_' as valid
    return qrCode.startsWith('KIMSON_') && qrCode.length > 10;
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
    description: string
  ): Promise<Reward> {
    const rewardData = {
      userId,
      points,
      type,
      description,
      createdAt: serverTimestamp(),
    };

    const rewardRef = await addDoc(collection(db, COLLECTIONS.REWARDS), rewardData);
    
    return {
      id: rewardRef.id,
      ...rewardData,
      createdAt: new Date(),
    } as Reward;
  },

  async getUserRewards(userId: string): Promise<Reward[]> {
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
  },

  async getTotalUserPoints(userId: string): Promise<number> {
    const rewards = await this.getUserRewards(userId);
    return rewards.reduce((total, reward) => total + reward.points, 0);
  },
};

// Transaction operations
export const transactionService = {
  async createWithdrawalRequest(userId: string, amount: number): Promise<void> {
    const transactionData = {
      userId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      requestedAt: serverTimestamp(),
    };

    await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transactionData);
  },

  async getUserTransactions(userId: string): Promise<any[]> {
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
