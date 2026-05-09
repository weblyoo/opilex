/**
 * reCAPTCHA Setup Utility
 * 
 * Creates reCAPTCHA container for web platform
 * Required for Firebase Phone Authentication on web
 */

import { Platform } from 'react-native';

/**
 * Setup reCAPTCHA container for web platform
 * Call this in App.tsx or before using phone auth
 */
export const setupRecaptcha = (): void => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    // Create reCAPTCHA container if it doesn't exist
    if (!document.getElementById('recaptcha-container')) {
      const container = document.createElement('div');
      container.id = 'recaptcha-container';
      container.style.display = 'none';
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      document.body.appendChild(container);
      console.log('reCAPTCHA container created for web');
    }
  }
};

/**
 * Cleanup reCAPTCHA container
 */
export const cleanupRecaptcha = (): void => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.remove();
      console.log('reCAPTCHA container removed');
    }
  }
};

