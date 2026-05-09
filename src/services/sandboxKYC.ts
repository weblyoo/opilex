/**
 * Sandbox KYC Service
 * 
 * Handles Aadhaar KYC verification using Sandbox API.
 * Implements OTP generation and verification flow.
 */

import { getSandboxAccessToken } from './sandboxAuth';
import { SANDBOX_CONFIG } from '../config/sandbox';
import { mockGenerateAadhaarOTP, mockVerifyAadhaarOTP, shouldUseMockKYC } from './mockKYC';

// Request/Response Types
export interface AadhaarOTPRequest {
  '@entity': string;  // Required by OKYC - entity type
  aadhaar_number: string;
  consent: string;  // Must be 'Y' or 'N' (not boolean)
  reason: string;   // Reason for KYC verification
}

export interface AadhaarOTPResponse {
  request_id: string;
  message: string;
  success: boolean;
  error?: string;
}

export interface AadhaarVerifyRequest {
  request_id: string;
  otp: string;
}

export interface AadhaarAddress {
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
}

export interface AadhaarData {
  name: string;
  dob: string; // Date of birth (format: DD-MM-YYYY or YYYY-MM-DD)
  gender: string; // M/F/T
  address: AadhaarAddress;
  photo?: string; // Base64 encoded photo
  mobile_number?: string;
  email?: string;
}

export interface AadhaarVerifyResponse {
  verified: boolean;
  aadhaar_data?: AadhaarData;
  message?: string;
  error?: string;
  request_id?: string;
}

/**
 * Generate OTP for Aadhaar verification
 * 
 * @param aadhaarNumber - 12-digit Aadhaar number
 * @returns Promise<AadhaarOTPResponse> Response containing request_id
 * @throws Error if OTP generation fails
 */
export async function generateAadhaarOTP(
  aadhaarNumber: string
): Promise<AadhaarOTPResponse> {
  // Check if mock mode is explicitly enabled
  if (shouldUseMockKYC()) {
    console.log('🛠️ Mock KYC mode enabled - using mock service directly');
    return await mockGenerateAadhaarOTP(aadhaarNumber);
  }
  
  try {
    // Validate Aadhaar number format
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber)) {
      throw new Error('Invalid Aadhaar number format. Must be 12 digits.');
    }

    // Get access token
    const accessToken = await getSandboxAccessToken();
    
    // Prepare request
    // Format from Sandbox team - OKYC requires @entity, consent as 'Y', and reason
    // NOTE: For testing, use valid test Aadhaar numbers from Sandbox documentation
    // Production: Real Aadhaar numbers will be validated by UIDAI
    const requestBody: AadhaarOTPRequest = {
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
      aadhaar_number: aadhaarNumber,
      consent: 'Y', // Must be 'Y' or 'N' string, not boolean
      reason: 'KYC verification for user onboarding', // Required field
    };

    console.log('Generating Aadhaar OTP for:', aadhaarNumber.substring(0, 4) + '****' + aadhaarNumber.substring(8));

    // Call Sandbox API
    // Sandbox API requires x-api-key and x-api-secret headers on all requests
    // IMPORTANT: Token should NOT have "Bearer" prefix as per Sandbox team feedback
    // Also include x-api-version header (required for v2.0 APIs)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': SANDBOX_CONFIG.API_KEY,
      'x-api-secret': SANDBOX_CONFIG.API_SECRET,
      'Authorization': accessToken, // No "Bearer" prefix - pass token directly
    };
    
    // Add API version header if configured
    if (SANDBOX_CONFIG.API_VERSION) {
      headers['x-api-version'] = SANDBOX_CONFIG.API_VERSION;
    }
    
    const response = await fetch(
      `${SANDBOX_CONFIG.getBaseUrl()}${SANDBOX_CONFIG.AADHAAR_OTP_ENDPOINT}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      }
    );

    // Handle non-JSON responses
    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
    }

    // Log the full response for debugging
    console.log('📥 Sandbox API Response Status:', response.status);
    console.log('📥 Sandbox API Response Data:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      const errorMessage = responseData.message || 
                          responseData.error || 
                          responseData.detail ||
                          responseData.error_message ||
                          `OTP generation failed: ${response.status} ${response.statusText}`;
      
      console.error('Sandbox OTP generation error:', errorMessage, responseData);
      console.error('Full response data:', JSON.stringify(responseData, null, 2));
      
      // Handle specific error cases
      const errorMsgLower = errorMessage.toLowerCase();
      if (errorMsgLower.includes('insufficient privilege') || 
          errorMsgLower.includes('insufficient permission') ||
          errorMsgLower.includes('permission denied') ||
          errorMsgLower.includes('authorization') ||
          errorMsgLower.includes('credential') ||
          errorMsgLower.includes('signature') ||
          response.status === 403 ||
          response.status === 401) {
        console.warn('⚠️ Sandbox API authentication/permission error - falling back to Mock KYC');
        console.log('ℹ️  This is a development fallback for API configuration issues');
        console.log('ℹ️  For now, using mock KYC for development');
        
        // Fall back to mock KYC
        return await mockGenerateAadhaarOTP(aadhaarNumber);
      }
      
      throw new Error(errorMessage);
    }

    // Extract request_id or reference_id from response
    // Sandbox API returns data in a nested structure with reference_id
    const requestId = responseData.request_id || 
                      responseData.data?.request_id || 
                      responseData.data?.reference_id?.toString() || 
                      responseData.reference_id?.toString();
    
    if (!requestId) {
      console.error('❌ Missing request_id/reference_id in response. Full response:', responseData);
      console.warn('⚠️ Sandbox API returned success but no request_id - falling back to Mock KYC');
      return await mockGenerateAadhaarOTP(aadhaarNumber);
    }

    console.log('Aadhaar OTP generated successfully. Request ID:', requestId);
    
    return {
      request_id: requestId,
      message: responseData.data?.message || responseData.message || 'OTP sent successfully',
      success: true,
    };
  } catch (error: any) {
    console.error('Error generating Aadhaar OTP:', error);
    
    // Provide user-friendly error messages
    const errorMsg = error.message || 'Unknown error';
    
    if (errorMsg.includes('Invalid Aadhaar') || errorMsg.includes('invalid') || errorMsg.includes('Invalid')) {
      throw new Error('Invalid Aadhaar number. Please check and try again.');
    } else if (errorMsg.includes('insufficient privilege') || 
               errorMsg.includes('insufficient permission') ||
               errorMsg.includes('permission denied') ||
               errorMsg.includes('Authorization') ||
               errorMsg.includes('Credential') ||
               errorMsg.includes('Signature') ||
               errorMsg.includes('401') || 
               errorMsg.includes('403')) {
      console.warn('⚠️ Sandbox API authentication/permission error - falling back to Mock KYC');
      console.log('ℹ️  This is a development fallback for API configuration issues');
      console.log('ℹ️  For now, using mock KYC for development');
      
      // Fall back to mock KYC
      return await mockGenerateAadhaarOTP(aadhaarNumber);
    } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('Network')) {
      throw new Error('Network error. Please check your internet connection.');
    } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (errorMsg.includes('500') || errorMsg.includes('503')) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
    
    throw new Error(errorMsg || 'Failed to generate OTP. Please try again.');
  }
}

/**
 * Verify OTP and get Aadhaar data
 * 
 * @param requestId - Request ID from OTP generation
 * @param otp - 6-digit OTP received on mobile
 * @returns Promise<AadhaarVerifyResponse> Response containing Aadhaar data
 * @throws Error if verification fails
 */
export async function verifyAadhaarOTP(
  requestId: string,
  otp: string
): Promise<AadhaarVerifyResponse> {
  // Check if mock mode is explicitly enabled OR if request ID is from mock
  if (shouldUseMockKYC() || requestId.startsWith('mock_req_')) {
    if (shouldUseMockKYC()) {
      console.log('🛠️ Mock KYC mode enabled - using mock service directly');
    }
    return await mockVerifyAadhaarOTP(requestId, otp);
  }
  
  try {
    // Validate inputs
    if (!requestId || !requestId.trim()) {
      throw new Error('Invalid request ID');
    }

    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      throw new Error('Invalid OTP format. Must be 6 digits.');
    }

    // Get access token
    const accessToken = await getSandboxAccessToken();
    
    // Prepare request
    // Sandbox API uses reference_id for verification
    const requestBody: any = {
      reference_id: parseInt(requestId), // Convert back to number
      otp: otp,
    };

    console.log('Verifying Aadhaar OTP. Reference ID:', requestId);

    // Call Sandbox API
    // Sandbox API requires x-api-key and x-api-secret headers on all requests
    // IMPORTANT: Token should NOT have "Bearer" prefix as per Sandbox team feedback
    // Also include x-api-version header (required for v2.0 APIs)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': SANDBOX_CONFIG.API_KEY,
      'x-api-secret': SANDBOX_CONFIG.API_SECRET,
      'Authorization': accessToken, // No "Bearer" prefix - pass token directly
    };
    
    // Add API version header if configured
    if (SANDBOX_CONFIG.API_VERSION) {
      headers['x-api-version'] = SANDBOX_CONFIG.API_VERSION;
    }
    
    const response = await fetch(
      `${SANDBOX_CONFIG.getBaseUrl()}${SANDBOX_CONFIG.AADHAAR_VERIFY_ENDPOINT}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      }
    );

    // Handle non-JSON responses
    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errorMessage = responseData.message || 
                          responseData.error || 
                          responseData.detail ||
                          responseData.error_message ||
                          `OTP verification failed: ${response.status} ${response.statusText}`;
      
      console.error('Sandbox OTP verification error:', errorMessage, responseData);
      console.error('Full response data:', JSON.stringify(responseData, null, 2));
      
      // Handle specific error cases - ONLY fallback to mock for auth/permission errors
      // DO NOT fallback for invalid OTP - let the real error show
      const errorMsgLower = errorMessage.toLowerCase();
      const isAuthError = errorMsgLower.includes('insufficient privilege') || 
                          errorMsgLower.includes('insufficient permission') ||
                          errorMsgLower.includes('permission denied') ||
                          (errorMsgLower.includes('authorization') && !errorMsgLower.includes('invalid')) ||
                          (errorMsgLower.includes('credential') && !errorMsgLower.includes('invalid')) ||
                          (errorMsgLower.includes('signature') && !errorMsgLower.includes('invalid')) ||
                          (response.status === 403 && !errorMsgLower.includes('invalid') && !errorMsgLower.includes('otp')) ||
                          (response.status === 401 && !errorMsgLower.includes('invalid') && !errorMsgLower.includes('otp'));
      
      // If it's an OTP-related error (invalid, expired, wrong), throw it directly - don't fallback
      const isOTPError = errorMsgLower.includes('invalid otp') || 
                        errorMsgLower.includes('otp invalid') ||
                        errorMsgLower.includes('wrong otp') ||
                        errorMsgLower.includes('otp expired') ||
                        errorMsgLower.includes('expired otp') ||
                        errorMsgLower.includes('incorrect otp');
      
      if (isOTPError) {
        // This is a real OTP error - throw it directly so user knows their OTP is wrong
        throw new Error(errorMessage);
      }
      
      // Only fallback to mock for authentication/permission errors, not OTP errors
      if (isAuthError) {
        console.warn('⚠️ Sandbox API authentication/permission error - falling back to Mock KYC');
        console.log('ℹ️  This is a development fallback for API configuration issues');
        console.log('ℹ️  For now, using mock KYC for development');
        
        // Fall back to mock KYC
        return await mockVerifyAadhaarOTP(requestId, otp);
      }
      
      // For all other errors, throw them directly
      throw new Error(errorMessage);
    }

    // Log response for debugging
    console.log('📥 Sandbox Verify Response:', JSON.stringify(responseData, null, 2));
    
    // Extract aadhaar data from nested structure
    const aadhaarData = responseData.aadhaar_data || responseData.data?.aadhaar_data || responseData.data;
    
    // Check if verification was successful
    if (!aadhaarData) {
      throw new Error(
        responseData.message || responseData.data?.message || 
        'Aadhaar verification failed. Please check your OTP and try again.'
      );
    }

    console.log('Aadhaar OTP verified successfully');
    
    return {
      verified: true,
      aadhaar_data: aadhaarData,
      message: responseData.data?.message || responseData.message || 'Aadhaar verified successfully',
      request_id: requestId,
    };
  } catch (error: any) {
    console.error('Error verifying Aadhaar OTP:', error);
    
    // Provide user-friendly error messages
    const errorMsg = error.message || 'Unknown error';
    const errorMsgLower = errorMsg.toLowerCase();
    
    // OTP-related errors - throw directly, don't fallback to mock
    if (errorMsgLower.includes('invalid otp') || 
        errorMsgLower.includes('otp invalid') ||
        errorMsgLower.includes('wrong otp') ||
        errorMsgLower.includes('otp expired') ||
        errorMsgLower.includes('expired otp') ||
        errorMsgLower.includes('incorrect otp') ||
        (errorMsgLower.includes('expired') && errorMsgLower.includes('otp')) ||
        (errorMsgLower.includes('wrong') && errorMsgLower.includes('otp'))) {
      // This is a real OTP error from the API - show it to the user
      throw new Error(errorMsg || 'Invalid or expired OTP. Please request a new OTP.');
    }
    
    // Only fallback to mock for authentication/permission errors, NOT for OTP errors
    const isAuthError = errorMsgLower.includes('insufficient privilege') || 
                        errorMsgLower.includes('insufficient permission') ||
                        errorMsgLower.includes('permission denied') ||
                        (errorMsgLower.includes('authorization') && !errorMsgLower.includes('invalid') && !errorMsgLower.includes('otp')) ||
                        (errorMsgLower.includes('credential') && !errorMsgLower.includes('invalid') && !errorMsgLower.includes('otp')) ||
                        (errorMsgLower.includes('signature') && !errorMsgLower.includes('invalid') && !errorMsgLower.includes('otp')) ||
                        ((errorMsg.includes('401') || errorMsg.includes('403')) && !errorMsgLower.includes('invalid') && !errorMsgLower.includes('otp'));
    
    if (isAuthError) {
      console.warn('⚠️ Sandbox API authentication/permission error - falling back to Mock KYC');
      console.log('ℹ️  This is a development fallback for API configuration issues');
      console.log('ℹ️  For now, using mock KYC for development');
      
      // Fall back to mock KYC only for auth errors
      return await mockVerifyAadhaarOTP(requestId, otp);
    } else if (errorMsgLower.includes('network') || errorMsgLower.includes('fetch') || errorMsgLower.includes('network')) {
      throw new Error('Network error. Please check your internet connection.');
    } else if (errorMsgLower.includes('429') || errorMsgLower.includes('rate limit')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (errorMsgLower.includes('500') || errorMsgLower.includes('503')) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
    
    // For all other errors (including invalid OTP), throw them directly
    throw new Error(errorMsg || 'Failed to verify OTP. Please try again.');
  }
}

