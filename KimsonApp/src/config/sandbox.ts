import Constants from 'expo-constants';

const extraSandbox = (Constants.expoConfig?.extra?.sandbox || {}) as {
  apiKey?: string;
  apiSecret?: string;
  useMockKyc?: boolean;
};

export const SANDBOX_CONFIG = {
  API_KEY: extraSandbox.apiKey || '',
  API_SECRET: extraSandbox.apiSecret || '',
  USE_MOCK_KYC: Boolean(extraSandbox.useMockKyc),
  BASE_URL_TEST: 'https://api.sandbox.co.in',
  BASE_URL_PROD: 'https://api.sandbox.co.in',
  AUTH_ENDPOINT: '/authenticate',
  AADHAAR_OTP_ENDPOINT: '/kyc/aadhaar/okyc/otp',
  AADHAAR_VERIFY_ENDPOINT: '/kyc/aadhaar/okyc/verify',
  API_VERSION: '2.0',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000,

  getBaseUrl(): string {
    return this.API_KEY.startsWith('key_live_') ? this.BASE_URL_PROD : this.BASE_URL_TEST;
  },
};

export const getSandboxBaseUrl = (): string => SANDBOX_CONFIG.getBaseUrl();

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@opilex_sandbox_access_token',
  TOKEN_EXPIRY: '@opilex_sandbox_token_expiry',
};
