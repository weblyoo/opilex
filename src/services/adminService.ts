import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  WIRE_AUTHENTICATIONS: 'wireAuthentications',
  REWARDS: 'rewards',
  TRANSACTIONS: 'transactions',
  ADMINS: 'admins',
  REWARD_QR_CODES: 'rewardQRCodes',
} as const;

// ============ USER MANAGEMENT ============
export const adminUserService = {
  // Get all users
  async getAllUsers(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (fallbackError) {
          console.error('Error loading users:', fallbackError);
          return [];
        }
      }
      console.error('Error loading users:', error);
      return [];
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<any | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) {
      return null;
    }
    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  },

  // Search users
  async searchUsers(searchTerm: string): Promise<any[]> {
    try {
      const allUsers = await this.getAllUsers();
      const term = searchTerm.toLowerCase();
      return allUsers.filter(user => {
        const name = user.name?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const phone = user.phoneNumber?.toLowerCase() || '';
        return name.includes(term) || email.includes(term) || phone.includes(term);
      });
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },
};

// ============ WIRE AUTHENTICATIONS MANAGEMENT ============
export const adminWireAuthService = {
  // Get all authentications
  async getAllAuthentications(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
        orderBy('authenticatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const snapshot = await getDocs(collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS));
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (fallbackError) {
          console.error('Error loading authentications:', fallbackError);
          return [];
        }
      }
      console.error('Error loading authentications:', error);
      return [];
    }
  },

  // Get statistics
  async getStatistics(): Promise<any> {
    try {
      const authentications = await this.getAllAuthentications();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - today.getDay());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        total: authentications.length,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      };

      authentications.forEach(auth => {
        const authDate = auth.authenticatedAt?.toDate ? auth.authenticatedAt.toDate() : new Date(auth.authenticatedAt);
        
        if (authDate >= today) {
          stats.today++;
        }
        if (authDate >= thisWeek) {
          stats.thisWeek++;
        }
        if (authDate >= thisMonth) {
          stats.thisMonth++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error loading statistics:', error);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      };
    }
  },
};

// ============ REWARDS MANAGEMENT ============
export const adminRewardService = {
  // Get all rewards
  async getAllRewards(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REWARDS),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const snapshot = await getDocs(collection(db, COLLECTIONS.REWARDS));
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (fallbackError) {
          console.error('Error loading rewards:', fallbackError);
          return [];
        }
      }
      console.error('Error loading rewards:', error);
      return [];
    }
  },

  // Get rewards by user
  async getRewardsByUser(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REWARDS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const q = query(
            collection(db, COLLECTIONS.REWARDS),
            where('userId', '==', userId)
          );
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (fallbackError) {
          console.error('Error loading user rewards:', fallbackError);
          return [];
        }
      }
      console.error('Error loading user rewards:', error);
      return [];
    }
  },

  // Get total points statistics
  async getTotalPointsStats(): Promise<any> {
    try {
      const rewards = await this.getAllRewards();
      const totalPoints = rewards.reduce((sum, reward) => sum + (reward.points || 0), 0);
      const uniqueUsers = new Set(rewards.map(r => r.userId)).size;
      const averagePerUser = uniqueUsers > 0 ? totalPoints / uniqueUsers : 0;

      return {
        totalPoints,
        totalRewards: rewards.length,
        uniqueUsers,
        averagePerUser,
      };
    } catch (error) {
      console.error('Error loading points stats:', error);
      return {
        totalPoints: 0,
        totalRewards: 0,
        uniqueUsers: 0,
        averagePerUser: 0,
      };
    }
  },
};

// ============ TRANSACTIONS MANAGEMENT ============
export const adminTransactionService = {
  // Get all transactions
  async getAllTransactions(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        orderBy('requestedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const snapshot = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS));
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (fallbackError) {
          console.error('Error loading transactions:', fallbackError);
          return [];
        }
      }
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  // Get pending withdrawals
  async getPendingWithdrawals(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('status', '==', 'pending'),
        orderBy('requestedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, try without status filter
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const snapshot = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS));
          return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(t => t.status === 'pending');
        } catch (fallbackError) {
          console.error('Error loading pending withdrawals:', fallbackError);
          return [];
        }
      }
      console.error('Error loading pending withdrawals:', error);
      return [];
    }
  },

  // Update transaction status
  async updateTransactionStatus(transactionId: string, status: 'approved' | 'rejected'): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), {
      status,
      updatedAt: Timestamp.now(),
    });
  },
};

// ============ QR CODES MANAGEMENT ============
export const adminQRCodeService = {
  // Get all QR codes
  async getAllQRCodes(): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REWARD_QR_CODES),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const snapshot = await getDocs(collection(db, COLLECTIONS.REWARD_QR_CODES));
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (fallbackError) {
          console.error('Error loading QR codes:', fallbackError);
          return [];
        }
      }
      console.error('Error loading QR codes:', error);
      return [];
    }
  },

  // Get QR codes by user type
  async getQRCodesByUserType(userType: 'electrician' | 'dealer'): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REWARD_QR_CODES),
        where('userType', '==', userType),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const q = query(
            collection(db, COLLECTIONS.REWARD_QR_CODES),
            where('userType', '==', userType)
          );
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (fallbackError) {
          console.error('Error loading QR codes by user type:', fallbackError);
          // Fallback: filter client-side
          const allCodes = await this.getAllQRCodes();
          return allCodes.filter(code => code.userType === userType);
        }
      }
      console.error('Error loading QR codes by user type:', error);
      // Fallback: filter client-side
      const allCodes = await this.getAllQRCodes();
      return allCodes.filter(code => code.userType === userType);
    }
  },

  // Get unused QR codes by user type
  async getUnusedQRCodesByUserType(userType: 'electrician' | 'dealer'): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REWARD_QR_CODES),
        where('userType', '==', userType),
        where('used', '==', false),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      // If index error, filter client-side
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const allCodes = await this.getQRCodesByUserType(userType);
          return allCodes.filter(code => !code.used);
        } catch (fallbackError) {
          console.error('Error loading unused QR codes:', fallbackError);
          return [];
        }
      }
      console.error('Error loading unused QR codes:', error);
      // Fallback: filter client-side
      const allCodes = await this.getQRCodesByUserType(userType);
      return allCodes.filter(code => !code.used);
    }
  },
};
