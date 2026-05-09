import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  setDoc,
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
  SCRATCH_REWARDS: 'scratchRewards',
  SETTINGS: 'settings',
  BANK_ACCOUNTS: 'bankAccounts',
} as const;

const DEFAULT_QR_POINTS_BALANCE = 50000;
const QR_POINTS_DOC_ID = 'qrPoints';

// ============ QR POINTS (for download/print deduction) ============
export const qrPointsService = {
  async getBalance(): Promise<number> {
    const ref = doc(db, COLLECTIONS.SETTINGS, QR_POINTS_DOC_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return DEFAULT_QR_POINTS_BALANCE;
    const data = snap.data();
    return typeof data?.balance === 'number' ? data.balance : DEFAULT_QR_POINTS_BALANCE;
  },

  async deduct(count: number): Promise<{ newBalance: number }> {
    const ref = doc(db, COLLECTIONS.SETTINGS, QR_POINTS_DOC_ID);
    const snap = await getDoc(ref);
    const current = snap.exists() && typeof snap.data()?.balance === 'number'
      ? snap.data()!.balance
      : DEFAULT_QR_POINTS_BALANCE;
    const newBalance = Math.max(0, current - count);
    await setDoc(ref, { balance: newBalance, updatedAt: Timestamp.now() }, { merge: true });
    return { newBalance };
  },
};

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
      return snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id,
      }));
    } catch (error: any) {
      // If index error, try without orderBy
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
          return snapshot.docs.map(d => ({
            ...d.data(),
            id: d.id,
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

  // Get user by ID (userId must be the Firestore document id)
  async getUserById(userId: string): Promise<any | null> {
    if (!userId || typeof userId !== 'string') return null;
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId.trim()));
      if (!userDoc.exists()) return null;
      return {
        ...userDoc.data(),
        id: userDoc.id,
      };
    } catch (e) {
      console.error('getUserById error:', e);
      return null;
    }
  },

  // Update user points (for bonus / adjustment)
  async updateUserPoints(userId: string, pointsToAdd: number, _reason?: string): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const current = userSnap.data().rewardPoints || 0;
    const newPoints = current + pointsToAdd;
    await updateDoc(userRef, {
      rewardPoints: newPoints >= 0 ? newPoints : 0,
      updatedAt: Timestamp.now(),
    });
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

  // Get authentications by user ID
  async getAuthenticationsByUser(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
        where('userId', '==', userId),
        orderBy('authenticatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const q = query(
            collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
            where('userId', '==', userId)
          );
          const snapshot = await getDocs(q);
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          list.sort((a, b) => {
            const dateA = a.authenticatedAt?.toDate ? a.authenticatedAt.toDate() : new Date(a.authenticatedAt || 0);
            const dateB = b.authenticatedAt?.toDate ? b.authenticatedAt.toDate() : new Date(b.authenticatedAt || 0);
            return dateB.getTime() - dateA.getTime();
          });
          return list;
        } catch (fallbackError) {
          console.error('Error loading user authentications:', fallbackError);
          return [];
        }
      }
      console.error('Error loading user authentications:', error);
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

  // Loyal clients: users with 3+ scans in last 7 days (wire authentications + reward QR scans)
  async getLoyalClients(minScansPerWeek: number = 3): Promise<any[]> {
    try {
      const [auths, rewardQRSnapshot, users] = await Promise.all([
        this.getAllAuthentications(),
        getDocs(query(collection(db, COLLECTIONS.REWARD_QR_CODES), where('used', '==', true))),
        adminUserService.getAllUsers(),
      ]);
      const userMap = new Map(users.map((u: any) => [u.id, u]));
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const byUser: Record<string, { count: number; items: string[]; points: number }> = {};
      // Count wire/product authentications in last 7 days
      auths.forEach((a: any) => {
        const date = a.authenticatedAt?.toDate ? a.authenticatedAt.toDate() : new Date(a.authenticatedAt || 0);
        if (date < sevenDaysAgo) return;
        const uid = a.userId;
        if (!uid) return;
        if (!byUser[uid]) byUser[uid] = { count: 0, items: [], points: 0 };
        byUser[uid].count++;
        byUser[uid].points += a.rewardPoints || 0;
        const item = a.productInfo?.type || 'Wire';
        if (item && !byUser[uid].items.includes(item)) byUser[uid].items.push(item);
      });
      // Count reward QR code scans (used) in last 7 days
      rewardQRSnapshot.docs.forEach((d) => {
        const data = d.data();
        const usedAt = data.usedAt?.toDate ? data.usedAt.toDate() : new Date(data.usedAt || 0);
        if (usedAt < sevenDaysAgo) return;
        const uid = data.usedBy || '';
        if (!uid) return;
        if (!byUser[uid]) byUser[uid] = { count: 0, items: [], points: 0 };
        byUser[uid].count++;
        const item = data.productName || data.description || 'Reward QR';
        if (item && !byUser[uid].items.includes(item)) byUser[uid].items.push(item);
      });
      const loyal = Object.entries(byUser)
        .filter(([, v]) => v.count >= minScansPerWeek)
        .map(([userId, v]) => {
          const user = userMap.get(userId);
          return {
            userId,
            userName: user?.name || 'Unknown',
            userPhone: user?.phoneNumber || 'N/A',
            userState: user?.state || '—',
            scanCount: v.count,
            points: v.points,
            userPoints: user?.rewardPoints || 0,
            itemsShort: v.items.slice(0, 5).join(', ') || 'Wire',
          };
        })
        .sort((a, b) => b.scanCount - a.scanCount);
      return loyal;
    } catch (error) {
      console.error('Error loading loyal clients:', error);
      return [];
    }
  },

  /**
   * Get all product authentications (wire + reward QR scans) with user name and state, for admin Product Authentications page.
   * Returns list sorted by time desc: { id, userId, userName, productName, userState, time }.
   */
  async getAllProductAuthentications(): Promise<{ id: string; userId: string; userName: string; productName: string; userState: string; time: Date }[]> {
    try {
      const [wireAuths, rewardQRSnapshot, users] = await Promise.all([
        this.getAllAuthentications(),
        getDocs(query(collection(db, COLLECTIONS.REWARD_QR_CODES), where('used', '==', true))),
        adminUserService.getAllUsers(),
      ]);
      const userMap = new Map(users.map((u: any) => [u.id, { name: u.name || 'Unknown', state: u.state || '' }]));

      const rows: { id: string; userId: string; productName: string; time: Date }[] = [];

      wireAuths.forEach((a: any) => {
        const time = a.authenticatedAt?.toDate ? a.authenticatedAt.toDate() : new Date(a.authenticatedAt || 0);
        rows.push({
          id: `wire-${a.id}`,
          userId: a.userId || '',
          productName: a.productInfo?.type || a.qrCode || 'Wire',
          time,
        });
      });

      rewardQRSnapshot.docs.forEach((d) => {
        const data = d.data();
        const usedAt = data.usedAt?.toDate ? data.usedAt.toDate() : new Date(data.usedAt || 0);
        rows.push({
          id: `qr-${d.id}`,
          userId: data.usedBy || '',
          productName: data.productName || data.description || 'Reward QR',
          time: usedAt,
        });
      });

      rows.sort((a, b) => b.time.getTime() - a.time.getTime());

      return rows.map((r) => {
        const u = userMap.get(r.userId);
        return {
          id: r.id,
          userId: r.userId,
          userName: u?.name || 'Unknown',
          productName: r.productName,
          userState: u?.state || '—',
          time: r.time,
        };
      });
    } catch (error) {
      console.error('Error loading product authentications:', error);
      return [];
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

// ============ BANK ACCOUNTS (user withdrawal accounts) ============
export const adminBankAccountService = {
  async getBankAccountsByUserId(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.BANK_ACCOUNTS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      return list;
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      return [];
    }
  },

  async getBankAccountsForUserIds(userIds: string[]): Promise<Record<string, any[]>> {
    const unique = [...new Set(userIds)].filter(Boolean);
    const out: Record<string, any[]> = {};
    await Promise.all(
      unique.map(async (uid) => {
        out[uid] = await this.getBankAccountsByUserId(uid);
      })
    );
    return out;
  },

  async getBankAccountsCount(): Promise<number> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.BANK_ACCOUNTS));
      return snapshot.size;
    } catch (error) {
      console.error('Error counting bank accounts:', error);
      return 0;
    }
  },
};

// ============ KYC / GST (per-user verification) ============
export const adminKycGstService = {
  async getKycByUserId(userId: string): Promise<any | null> {
    try {
      const snap = await getDoc(doc(db, 'kyc_verifications', userId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (error) {
      console.error('Error loading KYC:', error);
      return null;
    }
  },
  async getGstByUserId(userId: string): Promise<any | null> {
    try {
      const snap = await getDoc(doc(db, 'gst_verifications', userId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (error) {
      console.error('Error loading GST:', error);
      return null;
    }
  },
};

// ============ TRANSACTIONS MANAGEMENT ============
export const adminTransactionService = {
  async getTransactionsByUserId(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('userId', '==', userId),
        orderBy('requestedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error: any) {
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        try {
          const q = query(
            collection(db, COLLECTIONS.TRANSACTIONS),
            where('userId', '==', userId)
          );
          const snapshot = await getDocs(q);
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => {
            const ta = a.requestedAt?.toDate ? a.requestedAt.toDate() : new Date(a.requestedAt || 0);
            const tb = b.requestedAt?.toDate ? b.requestedAt.toDate() : new Date(b.requestedAt || 0);
            return tb.getTime() - ta.getTime();
          });
          return list;
        } catch (_) {
          return [];
        }
      }
      console.error('Error loading user transactions:', error);
      return [];
    }
  },

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

  // Update transaction status (optional rejectionReason when status is 'rejected')
  async updateTransactionStatus(
    transactionId: string,
    status: 'approved' | 'rejected',
    options?: { rejectionReason?: string }
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      status,
      updatedAt: Timestamp.now(),
    };
    if (status === 'rejected' && options?.rejectionReason != null && options.rejectionReason.trim() !== '') {
      payload.rejectionReason = options.rejectionReason.trim();
    }
    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), payload);
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

// ============ SCRATCH REWARDS (Loyal Client) ============
export const adminScratchRewardService = {
  async createScratchReward(points: number, userId: string, createdBy: string): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.SCRATCH_REWARDS), {
      points,
      userId,
      createdBy,
      createdAt: Timestamp.now(),
      claimed: false,
    });
    return ref.id;
  },

  async getUnclaimedByUser(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SCRATCH_REWARDS),
        where('userId', '==', userId),
        where('claimed', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading scratch rewards:', error);
      return [];
    }
  },
};
