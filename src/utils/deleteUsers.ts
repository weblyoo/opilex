/**
 * Utility function to delete users completely from Firebase
 * Can be called from Admin Panel browser console or admin service
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface DeleteUserResult {
  phoneNumber: string;
  userId?: string;
  success: boolean;
  message: string;
  deletedCount?: number;
}

/**
 * Delete a user and all related data by phone number
 */
export async function deleteUserByPhoneNumber(phoneNumber: string): Promise<DeleteUserResult> {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  
  try {
    console.log(`🔍 Searching for user with phone: ${normalizedPhone}`);
    
    // Find user
    const usersQuery = query(
      collection(db, 'users'),
      where('phoneNumber', '==', normalizedPhone)
    );
    
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      return {
        phoneNumber,
        success: false,
        message: 'User not found'
      };
    }
    
    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`✅ Found user: ${userData.name || 'No name'} (ID: ${userId})`);
    
    // Delete all related data
    const batch = writeBatch(db);
    let deleteCount = 0;
    
    // 1. Wire authentications
    const authsQuery = query(
      collection(db, 'wireAuthentications'),
      where('userId', '==', userId)
    );
    const authsSnapshot = await getDocs(authsQuery);
    authsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`   📋 Found ${authsSnapshot.size} wireAuthentications`);
    
    // 2. Rewards
    const rewardsQuery = query(
      collection(db, 'rewards'),
      where('userId', '==', userId)
    );
    const rewardsSnapshot = await getDocs(rewardsQuery);
    rewardsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`   📋 Found ${rewardsSnapshot.size} rewards`);
    
    // 3. Transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    transactionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    console.log(`   📋 Found ${transactionsSnapshot.size} transactions`);
    
    // 4. User document
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);
    deleteCount++;
    
    // Commit all deletions
    await batch.commit();
    
    console.log(`✅ Successfully deleted ${deleteCount} documents for user: ${normalizedPhone}`);
    
    return {
      phoneNumber,
      userId,
      success: true,
      message: `Successfully deleted user and ${deleteCount} related documents`,
      deletedCount
    };
  } catch (error: any) {
    console.error(`❌ Error deleting user ${normalizedPhone}:`, error);
    return {
      phoneNumber,
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Delete multiple users by phone numbers
 */
export async function deleteUsersByPhoneNumbers(phoneNumbers: string[]): Promise<DeleteUserResult[]> {
  const results: DeleteUserResult[] = [];
  
  for (const phoneNumber of phoneNumbers) {
    const result = await deleteUserByPhoneNumber(phoneNumber);
    results.push(result);
  }
  
  return results;
}

/**
 * Normalize phone number format
 */
function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\s+/g, '').trim();
  if (!normalized.startsWith('+91')) {
    if (normalized.startsWith('91')) {
      normalized = '+' + normalized;
    } else if (normalized.startsWith('0')) {
      normalized = '+91' + normalized.substring(1);
    } else {
      normalized = '+91' + normalized;
    }
  }
  return normalized;
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).deleteUsers = {
    deleteUserByPhoneNumber,
    deleteUsersByPhoneNumbers,
    deleteTheseUsers: async () => {
      const phoneNumbers = ['+918380843472', '+919112005199'];
      console.log('🚀 Deleting users:', phoneNumbers);
      const results = await deleteUsersByPhoneNumbers(phoneNumbers);
      console.log('📊 Results:', results);
      return results;
    }
  };
}
