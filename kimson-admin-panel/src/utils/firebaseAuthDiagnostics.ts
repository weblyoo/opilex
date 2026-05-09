/**
 * Firebase Auth Diagnostics Utility
 * 
 * Helps diagnose Firebase authentication issues
 */

import { auth } from '../config/firebase';
import { Platform } from 'react-native';

export interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Check if Firebase Auth is properly initialized
 */
export async function checkFirebaseAuthInit(): Promise<DiagnosticResult> {
  try {
    if (!auth) {
      return {
        success: false,
        message: 'Firebase Auth is not initialized',
      };
    }

    return {
      success: true,
      message: 'Firebase Auth is initialized',
      details: {
        app: auth.app.name,
        currentUser: auth.currentUser?.uid || 'No user',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Error checking Firebase Auth initialization',
      details: { error: error.message },
    };
  }
}

/**
 * Check if reCAPTCHA container exists (web only)
 */
export function checkRecaptchaContainer(): DiagnosticResult {
  if (Platform.OS !== 'web') {
    return {
      success: true,
      message: 'reCAPTCHA not needed on mobile platform',
    };
  }

  if (typeof document === 'undefined') {
    return {
      success: false,
      message: 'Document not available (not running in browser)',
    };
  }

  const container = document.getElementById('recaptcha-container');
  
  if (!container) {
    return {
      success: false,
      message: 'reCAPTCHA container not found. Run setupRecaptcha() first.',
    };
  }

  return {
    success: true,
    message: 'reCAPTCHA container exists',
    details: {
      containerId: container.id,
      isVisible: container.style.display !== 'none',
    },
  };
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber: string): DiagnosticResult {
  if (!phoneNumber || !phoneNumber.trim()) {
    return {
      success: false,
      message: 'Phone number is empty',
    };
  }

  // Remove spaces and special characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if it's a valid Indian phone number
  if (cleaned.length === 10) {
    // 10-digit number (will add +91)
    const firstDigit = cleaned[0];
    if (firstDigit >= '6' && firstDigit <= '9') {
      return {
        success: true,
        message: 'Valid 10-digit Indian phone number',
        details: {
          formatted: `+91${cleaned}`,
        },
      };
    }
  }

  // Check if it already has country code
  if (phoneNumber.startsWith('+91') && cleaned.length === 12) {
    return {
      success: true,
      message: 'Valid phone number with country code',
      details: {
        formatted: phoneNumber,
      },
    };
  }

  return {
    success: false,
    message: 'Invalid phone number format. Must be 10 digits starting with 6-9, or +91XXXXXXXXXX',
    details: {
      received: phoneNumber,
      cleaned: cleaned,
      length: cleaned.length,
    },
  };
}

/**
 * Run all diagnostics
 */
export async function runAllDiagnostics(phoneNumber?: string): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // Check Firebase Auth initialization
  results.push(await checkFirebaseAuthInit());

  // Check reCAPTCHA container
  results.push(checkRecaptchaContainer());

  // Validate phone number if provided
  if (phoneNumber) {
    results.push(validatePhoneNumber(phoneNumber));
  }

  return results;
}

/**
 * Print diagnostics to console
 */
export async function printDiagnostics(phoneNumber?: string): Promise<void> {
  console.log('🔍 Firebase Auth Diagnostics');
  console.log('==========================');
  
  const results = await runAllDiagnostics(phoneNumber);
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.success ? '✅' : '❌'} ${result.message}`);
    if (result.details) {
      console.log('   Details:', result.details);
    }
  });
  
  console.log('\n==========================');
}

