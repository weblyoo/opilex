/**
 * Sandbox API Configuration
 * 
 * ⚠️ SECURITY WARNING:
 * In production, move these credentials to environment variables.
 * Never commit API keys to version control.
 * 
 * Use expo-constants for environment variables:
 * import Constants from 'expo-constants';
 * const API_KEY = Constants.expoConfig?.extra?.sandboxApiKey;
 */

export const SANDBOX_CONFIG = {
  // API Credentials
  // 🔄 TO SWITCH: Uncomment the keys you want to use and comment out the other
  
  // 🧪 TEST KEY (Development - OKYC endpoints require LIVE key)
  // API_KEY: 'key_test_8d548e4b104b454bbcefe09d1fbbb4a7',
  // API_SECRET: 'secret_test_007adeaa9a304513a1e7a9de7ee475dc',
  
  // ✅ LIVE KEY (Required for OKYC endpoints - consumes credits) ✅ ACTIVE
  // Sandbox team confirmed: OKYC endpoints require production/live key
  API_KEY: 'key_live_bdc866212c0e40c78fcf4f41acd45bb1',
  API_SECRET: 'secret_live_943291b891064242852c18425341a379',
  
  // Development Mode Flag
  // Set to true to always use Mock KYC (bypasses Sandbox API entirely)
  // Set to false to try Sandbox API first, fallback to mock on errors
  // ✅ Mock KYC disabled - using Sandbox API
  USE_MOCK_KYC: false, // false = use Sandbox API
  
  // Base URL - Environment-specific URLs
  BASE_URL_TEST: 'https://api.sandbox.co.in',
  BASE_URL_PROD: 'https://api.sandbox.co.in',
  
  // API Endpoints
  // Confirmed from Sandbox documentation: Use OKYC (Online KYC) endpoints
  AUTH_ENDPOINT: '/authenticate',
  AADHAAR_OTP_ENDPOINT: '/kyc/aadhaar/okyc/otp', // ✅ OKYC - Online KYC (CONFIRMED)
  AADHAAR_VERIFY_ENDPOINT: '/kyc/aadhaar/okyc/verify', // ✅ OKYC verification
  
  // API Version (required for some endpoints)
  // Note: OKYC APIs require x-api-version: 2.0 (as of Oct 2024)
  // Offline KYC may also require this header
  API_VERSION: '2.0',
  
  // Token expiry buffer (in milliseconds)
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
  
  // Get the correct base URL based on API key type
  // Auto-detects environment: test credentials -> test URL, live credentials -> prod URL
  getBaseUrl(): string {
    // Auto-detect environment based on API key prefix
    if (this.API_KEY.startsWith('key_test_')) {
      return this.BASE_URL_TEST;
    } else if (this.API_KEY.startsWith('key_live_')) {
      return this.BASE_URL_PROD;
    }
    // Default to test if unclear
    console.warn('⚠️ Could not determine environment from API key. Using test environment.');
    return this.BASE_URL_TEST;
  },
};

// Helper to get current base URL (for backward compatibility)
export const getSandboxBaseUrl = (): string => {
  return SANDBOX_CONFIG.getBaseUrl();
};

// Storage keys for token caching
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@sandbox_access_token',
  TOKEN_EXPIRY: '@sandbox_token_expiry',
};

