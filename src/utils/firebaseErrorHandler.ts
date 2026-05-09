/**
 * Firebase Error Handler Utility
 * 
 * Provides user-friendly error messages for Firebase authentication errors
 */

export interface FirebaseError {
  code?: string;
  message?: string;
  stack?: string;
}

/**
 * Get user-friendly error message from Firebase error
 */
export function getFirebaseErrorMessage(error: FirebaseError | Error | any): string {
  const errorCode = error.code || '';
  const errorMessage = error.message || 'An unknown error occurred';

  // Firebase Auth Error Codes
  const errorMessages: { [key: string]: string } = {
    // Phone Authentication Errors
    'auth/operation-not-allowed': 'Phone authentication is not enabled. Please enable it in Firebase Console.',
    'auth/invalid-phone-number': 'Invalid phone number format. Please enter a valid 10-digit number starting with 6-9.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please contact support or try again later.',
    'auth/too-many-requests': 'Too many requests. Please wait a few minutes and try again.',
    'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please refresh and try again.',
    'auth/missing-recaptcha-token': 'reCAPTCHA verification failed. Please refresh and try again.',
    'auth/invalid-recaptcha-token': 'reCAPTCHA token is invalid. Please refresh and try again.',
    'auth/app-not-authorized': 'App not authorized. Please check Firebase configuration.',
    'auth/invalid-app-credential': 'Invalid app credentials. Please check Firebase configuration.',
    'auth/mobile-not-supported': 'Phone authentication is not available on mobile devices. Please use the web version or contact support.',
    
    // OTP Verification Errors
    'auth/invalid-verification-code': 'Invalid OTP code. Please check the code and try again.',
    'auth/code-expired': 'OTP code has expired. Please request a new OTP.',
    'auth/session-expired': 'Session expired. Please request a new OTP.',
    'auth/invalid-verification-id': 'Invalid verification session. Please request a new OTP.',
    'auth/missing-verification-code': 'Please enter the OTP code.',
    
    // General Auth Errors
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/internal-error': 'Internal error. Please try again later.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'User not found. Please register first.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password is too weak. Please use a stronger password.',
    'auth/invalid-email': 'Invalid email address format.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/requires-recent-login': 'Please log in again to perform this action.',
  };

  // Return specific error message if available
  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  // Return the error message if available
  if (errorMessage && errorMessage !== 'Firebase: Error (auth/unknown)') {
    return errorMessage;
  }

  // Default fallback
  return 'An error occurred. Please try again.';
}

/**
 * Log Firebase error with details
 * Avoids logging full stack traces to prevent Metro symbolication errors
 */
export function logFirebaseError(
  context: string,
  error: FirebaseError | Error | any,
  additionalInfo?: Record<string, any>
): void {
  // Extract error details without full stack trace to avoid Metro symbolication issues
  const errorDetails: any = {
    code: error.code || 'UNKNOWN',
    message: error.message || 'No message',
    ...additionalInfo,
  };
  
  // Include detailed information if available (for mobile-not-supported errors)
  if (error.details) {
    errorDetails.details = error.details;
  }
  
  // Only include stack trace in development, and format it to avoid Metro issues
  if (__DEV__ && error.stack) {
    // Extract just the first few lines of stack trace
    const stackLines = error.stack.split('\n').slice(0, 3).join('\n');
    errorDetails.stackPreview = stackLines;
  }
  
  // For mobile-not-supported errors, only log once and keep it minimal
  if (error.code === 'auth/mobile-not-supported') {
    // Minimal logging for mobile-not-supported - this is expected behavior
    if (__DEV__) {
      console.log('ℹ️ Phone auth not available on mobile - using web or backend required');
    }
    return; // Don't log detailed error for expected mobile limitation
  }
  
  // Log error details in a clean format to avoid triggering React Native's error boundary
  console.error(`❌ Firebase Error [${context}]:`);
  console.error(`   Code: ${errorDetails.code}`);
  console.error(`   Message: ${errorDetails.message}`);
  if (errorDetails.platform) {
    console.error(`   Platform: ${errorDetails.platform}`);
  }
  
  // Log additional details if available (but not as error object to avoid call stack)
  if (Object.keys(errorDetails).length > 3) {
    const additionalDetails = { ...errorDetails };
    delete additionalDetails.code;
    delete additionalDetails.message;
    delete additionalDetails.platform;
    if (Object.keys(additionalDetails).length > 0) {
      console.log('   Additional Info:', additionalDetails);
    }
  }
}

/**
 * Check if error is a specific Firebase error code
 */
export function isFirebaseError(error: any, code: string): boolean {
  return error?.code === code;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    isFirebaseError(error, 'auth/network-request-failed') ||
    error?.message?.includes('network') ||
    error?.message?.includes('fetch')
  );
}

/**
 * Check if error requires user to retry
 */
export function isRetryableError(error: any): boolean {
  const retryableCodes = [
    'auth/network-request-failed',
    'auth/internal-error',
    'auth/too-many-requests',
  ];
  
  return retryableCodes.some(code => isFirebaseError(error, code));
}

