/**
 * Mock KYC Service
 * 
 * Simulates Sandbox KYC API responses for development when:
 * - Sandbox API credentials don't have KYC permissions
 * - Testing without consuming API credits
 * - Development environment setup
 * 
 * This service mimics the exact response structure of Sandbox API.
 */

import { 
  AadhaarOTPResponse, 
  AadhaarVerifyResponse, 
  AadhaarData 
} from './sandboxKYC';

// Mock request IDs stored per Aadhaar number
const mockRequests = new Map<string, { aadhaarNumber: string; timestamp: number }>();

/**
 * Mock Aadhaar OTP generation
 * Simulates sending OTP for Aadhaar verification
 * 
 * @param aadhaarNumber - 12-digit Aadhaar number
 * @returns Mock OTP response with request_id
 */
export async function mockGenerateAadhaarOTP(
  aadhaarNumber: string
): Promise<AadhaarOTPResponse> {
  // Validate format
  const aadhaarRegex = /^\d{12}$/;
  if (!aadhaarRegex.test(aadhaarNumber)) {
    throw new Error('Invalid Aadhaar number format. Must be 12 digits.');
  }

  console.log('🔧 [MOCK KYC] Generating OTP for:', aadhaarNumber.substring(0, 4) + '****' + aadhaarNumber.substring(8));

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate mock request ID
  const requestId = `mock_req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Store request
  mockRequests.set(requestId, {
    aadhaarNumber,
    timestamp: Date.now(),
  });

  console.log('✅ [MOCK KYC] OTP generated. Request ID:', requestId);
  console.log('ℹ️  [MOCK KYC] Any 6-digit OTP will work for verification');

  return {
    request_id: requestId,
    message: 'OTP sent successfully (Mock)',
    success: true,
  };
}

/**
 * Mock Aadhaar OTP verification
 * Simulates verifying OTP and returning Aadhaar data
 * 
 * @param requestId - Request ID from OTP generation
 * @param otp - Any 6-digit OTP (all accepted in mock mode)
 * @returns Mock verification response with Aadhaar data
 */
export async function mockVerifyAadhaarOTP(
  requestId: string,
  otp: string
): Promise<AadhaarVerifyResponse> {
  // Validate OTP format
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    throw new Error('Invalid OTP format. Must be 6 digits.');
  }

  console.log('🔧 [MOCK KYC] Verifying OTP. Request ID:', requestId);

  // Check if request exists in mock storage
  const request = mockRequests.get(requestId);
  
  // If request not found but it's a mock request ID or we're in mock mode, accept it anyway
  // This handles cases where the app fell back to mock after API failure
  if (!request) {
    // Check if it's a mock request ID format
    if (requestId.startsWith('mock_req_')) {
      console.log('ℹ️  [MOCK KYC] Mock request ID detected, accepting any valid OTP');
    } else {
      // For real API request IDs that failed and fell back to mock, also accept them
      // This allows seamless fallback from real API to mock
      console.log('ℹ️  [MOCK KYC] Real API request ID in mock mode, accepting OTP for development');
      console.log('ℹ️  [MOCK KYC] In mock mode, any 6-digit OTP is accepted');
    }
  } else {
    // Check if request expired (10 minutes) only if it exists in storage
    const age = Date.now() - request.timestamp;
    if (age > 10 * 60 * 1000) {
      mockRequests.delete(requestId);
      console.log('ℹ️  [MOCK KYC] Stored request expired, but accepting OTP anyway in mock mode');
    }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // If request was in storage, clean it up
  if (request) {
    mockRequests.delete(requestId);
  }

  // Generate mock Aadhaar data
  const mockAadhaarData: AadhaarData = {
    name: 'Ram Patel',
    dob: '01-01-1990',
    gender: 'M',
    address: {
      care_of: 'S/O Father Name',
      house: 'House No 123',
      street: 'Main Street',
      locality: 'Sample Locality',
      vtc: 'Sample City',
      sub_district: 'Sample Sub-District',
      district: 'Sample District',
      state: 'Sample State',
      pincode: '123456',
      post_office: 'Sample PO',
    },
    mobile_number: '9876543210',
    email: 'john.doe@example.com',
  };

  console.log('✅ [MOCK KYC] OTP verified successfully');
  console.log('ℹ️  [MOCK KYC] Returned mock Aadhaar data');

  return {
    verified: true,
    aadhaar_data: mockAadhaarData,
    message: 'Aadhaar verified successfully (Mock)',
    request_id: requestId,
  };
}

/**
 * Check if we should use mock KYC
 * Returns true if mock mode is explicitly enabled in config
 */
export function shouldUseMockKYC(): boolean {
  // Import config to check flag
  try {
    const { SANDBOX_CONFIG } = require('../config/sandbox');
    return SANDBOX_CONFIG.USE_MOCK_KYC || false;
  } catch (e) {
    // If config not available, default to false (use real API with fallback)
    return false;
  }
}

/**
 * Clear all mock requests (for testing)
 */
export function clearMockRequests(): void {
  mockRequests.clear();
  console.log('🔧 [MOCK KYC] All mock requests cleared');
}
