export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  userType: 'electrician' | 'dealer';
  kycVerified: boolean;
  kycVerificationId?: string; // Reference to KYC document in Firestore
  language: 'en' | 'hi' | 'mr' | 'gu';
  rewardPoints: number;
  walletBalance?: number; // in Rs; separate from reward points. 1 point = ₹1 when redeemed.
  createdAt: Date;
  // Registration details
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  referralCode?: string;
  registrationCompleted?: boolean;
}

export interface WireAuthentication {
  id: string;
  userId: string;
  qrCode: string;
  authenticatedAt: Date;
  rewardPoints: number;
  productInfo?: {
    type: string;
    batch: string;
    manufacturingDate: Date;
  };
}

export interface Reward {
  id: string;
  userId: string;
  points: number;
  type: 'wire_authentication' | 'bonus' | 'referral';
  description: string;
  createdAt: Date;
}

export interface KYCData {
  aadharNumber: string;
  verified: boolean;
  verifiedAt?: Date;
}

export interface KYCVerification {
  id: string;
  userId: string;
  aadhaarNumber: string;
  verified: boolean;
  verifiedAt?: Date;
  aadhaarData?: {
    name: string;
    dob: string;
    gender: string;
    address: {
      care_of?: string;
      district?: string;
      house?: string;
      landmark?: string;
      locality?: string;
      pincode?: string;
      post_office?: string;
      state?: string;
      street?: string;
      sub_district?: string;
      vtc?: string;
    };
    photo?: string;
    mobile_number?: string;
    email?: string;
  };
  provider: 'sandbox' | 'mock';
  createdAt?: Date;
}

import { ConfirmationResult } from 'firebase/auth';

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelection: undefined;
  Welcome: undefined;
  Login: undefined;
  OTPVerification: { phoneNumber: string; verificationId: string };
  RegistrationType: undefined;
  RegistrationDetails: { userType: 'electrician' | 'dealer' };
  Registration: undefined;
  KYC: undefined;
  GSTVerification: undefined;
  Dashboard: undefined;
  WireAuthentication: { scannedCode?: string; scanPurpose?: 'rewards' | 'authenticate' } | undefined;
  Scanner: { scanPurpose?: 'rewards' | 'authenticate' } | undefined;
  AuthenticateProduct: undefined;
  ScanRewards: undefined;
  Rewards: undefined;
  PurchaseHistory: undefined;
  RedeemPoints: undefined;
  Tutorial: undefined;
  Ledger: undefined;
  Transaction: undefined;
  Profile: undefined;
  Wallet: undefined;
  About: undefined;
  PriceList: undefined;
  AddAccount: undefined;
  Schemes: undefined;
  Coupons: undefined;
  Gold: undefined;
  ProductCatalog: undefined;
  SocialMedia: undefined;
  StoreLocator: undefined;
  LeadershipBoard: undefined;
  ReferAndEarn: undefined;
  ScratchRewards: undefined;
  HelpSupport: undefined;
};

export interface LanguageOption {
  code: 'en' | 'hi' | 'mr' | 'gu';
  name: string;
  nativeName: string;
}