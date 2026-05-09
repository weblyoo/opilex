/**
 * Mock Authentication Service
 * Simulates Firebase Authentication for development/testing
 */

import { User } from '../types';
import { setUserData, getUserData, setUserToken } from '../utils/storage';

// Mock user database
const mockUsers: { [key: string]: User } = {};

// Mock recent authentications database
const mockAuthentications: { [userId: string]: any[] } = {};

// Mock recent rewards database  
const mockRewards: { [userId: string]: any[] } = {};

export const mockAuthService = {
  // Simulate phone number verification
  async verifyPhoneNumber(phoneNumber: string): Promise<{ verificationId: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      verificationId: `mock_verification_${Date.now()}`
    };
  },

  // Simulate OTP verification
  async verifyOTP(phoneNumber: string, otp: string): Promise<{ user: User; isNewUser: boolean }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, accept any 6-digit OTP
    if (otp.length !== 6) {
      throw new Error('Invalid OTP');
    }

    const userId = `user_${phoneNumber.replace(/\D/g, '')}`;
    const existingUser = mockUsers[userId];

    if (existingUser) {
      // Existing user - return user data
      await setUserData(existingUser);
      await setUserToken(`mock_token_${userId}`);
      
      return {
        user: existingUser,
        isNewUser: false
      };
    } else {
      // New user - create minimal user object
      const newUser: User = {
        id: userId,
        phoneNumber: phoneNumber,
        userType: 'electrician', // Default, will be updated during registration
        kycVerified: false,
        language: 'en',
        rewardPoints: 0,
        createdAt: new Date(),
      };

      mockUsers[userId] = newUser;
      await setUserData(newUser);
      await setUserToken(`mock_token_${userId}`);

      return {
        user: newUser,
        isNewUser: true
      };
    }
  },

  // Update user after registration
  async updateUserAfterRegistration(userId: string, userType: 'electrician' | 'dealer', name?: string): Promise<User> {
    const user = mockUsers[userId];
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...user,
      userType,
      name: name || `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
    };

    mockUsers[userId] = updatedUser;
    await setUserData(updatedUser);

    return updatedUser;
  },

  // Complete KYC verification
  async completeKYC(userId: string, aadharNumber: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = mockUsers[userId];
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...user,
      kycVerified: true,
      rewardPoints: 100, // Welcome bonus
    };

    mockUsers[userId] = updatedUser;
    await setUserData(updatedUser);

    return updatedUser;
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await getUserData();
      return userData;
    } catch (error) {
      return null;
    }
  },

  // Add reward points
  async addRewardPoints(userId: string, points: number): Promise<User> {
    const user = mockUsers[userId];
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...user,
      rewardPoints: (user.rewardPoints || 0) + points,
    };

    mockUsers[userId] = updatedUser;
    await setUserData(updatedUser);
    
    console.log('Mock service: Added', points, 'points to user', userId, 'New total:', updatedUser.rewardPoints);

    return updatedUser;
  },

  // Add wire authentication record
  async addWireAuthentication(userId: string, code: string, points: number): Promise<void> {
    if (!mockAuthentications[userId]) {
      mockAuthentications[userId] = [];
    }

    const authentication = {
      id: `auth_${Date.now()}`,
      userId,
      qrCode: code,
      authenticatedAt: new Date(),
      rewardPoints: points,
      productInfo: {
        type: 'Opilex Copper Wire',
        batch: code.split('_')[2] || 'Unknown',
        manufacturingDate: new Date(),
      }
    };

    mockAuthentications[userId].unshift(authentication); // Add to beginning
    
    // Keep only last 10 authentications
    if (mockAuthentications[userId].length > 10) {
      mockAuthentications[userId] = mockAuthentications[userId].slice(0, 10);
    }

    // Also add to rewards
    if (!mockRewards[userId]) {
      mockRewards[userId] = [];
    }

    const reward = {
      id: `reward_${Date.now()}`,
      userId,
      points,
      type: 'wire_authentication',
      description: 'Wire authentication reward',
      createdAt: new Date(),
    };

    mockRewards[userId].unshift(reward); // Add to beginning
    
    // Keep only last 10 rewards
    if (mockRewards[userId].length > 10) {
      mockRewards[userId] = mockRewards[userId].slice(0, 10);
    }
  },

  // Get recent authentications
  async getRecentAuthentications(userId: string): Promise<any[]> {
    return mockAuthentications[userId] || [];
  },

  // Get recent rewards
  async getRecentRewards(userId: string): Promise<any[]> {
    return mockRewards[userId] || [];
  },

  // Sign out
  async signOut(): Promise<void> {
    // Clear user data would be handled by AuthContext
  }
};

// Export for use in AuthContext
export default mockAuthService;
