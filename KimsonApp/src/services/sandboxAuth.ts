/**
 * Sandbox API Authentication Service
 * 
 * Handles authentication with Sandbox API and token management.
 * Tokens are cached in AsyncStorage to reduce API calls.
 */

import { SANDBOX_CONFIG, STORAGE_KEYS } from '../config/sandbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

/**
 * Get Sandbox API access token
 * Token is cached and reused until expiry
 * 
 * @returns Promise<string> Access token
 * @throws Error if authentication fails
 */
export async function getSandboxAccessToken(): Promise<string> {
  try {
    // Include API key in cache key to ensure tokens are key-specific
    // This prevents using a token from one key when switching to another
    const apiKeyIdentifier = SANDBOX_CONFIG.API_KEY.substring(0, 20); // Use first 20 chars as identifier
    const tokenCacheKey = `${STORAGE_KEYS.ACCESS_TOKEN}_${apiKeyIdentifier}`;
    const expiryCacheKey = `${STORAGE_KEYS.TOKEN_EXPIRY}_${apiKeyIdentifier}`;
    
    // Check cached token
    const cachedToken = await AsyncStorage.getItem(tokenCacheKey);
    const expiryTimeStr = await AsyncStorage.getItem(expiryCacheKey);
    
    if (cachedToken && expiryTimeStr) {
      const expiry = parseInt(expiryTimeStr, 10);
      const now = Date.now();
      
      // If token is still valid (with buffer), return cached token
      if (now < expiry - SANDBOX_CONFIG.TOKEN_EXPIRY_BUFFER) {
        console.log('Using cached Sandbox access token');
        return cachedToken;
      }
    }

    console.log('Fetching new Sandbox access token with API key:', SANDBOX_CONFIG.API_KEY.substring(0, 20) + '...');

    // Get new token from Sandbox API
    // Note: Sandbox API requires lowercase header names: x-api-key and x-api-secret
    const response = await fetch(
      `${SANDBOX_CONFIG.getBaseUrl()}${SANDBOX_CONFIG.AUTH_ENDPOINT}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SANDBOX_CONFIG.API_KEY,
          'x-api-secret': SANDBOX_CONFIG.API_SECRET,
        },
      }
    );

    // Handle response parsing
    let data: AuthResponse;
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `Authentication failed: ${response.status} ${response.statusText}`;
      try {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch (e) {
        // Use default error message
      }
      console.error('Sandbox auth error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Parse successful response
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
    }
    
    if (!data.access_token) {
      throw new Error('Invalid response: access_token not found');
    }

    const accessToken = data.access_token;
    const expiresIn = data.expires_in || 86400; // Default 24 hours (in seconds)
    
    // Calculate expiry time (in milliseconds)
    const expiryTimeMs = Date.now() + (expiresIn * 1000);
    
    // Cache token (reuse variables declared at the top of the function)
    await AsyncStorage.setItem(tokenCacheKey, accessToken);
    await AsyncStorage.setItem(expiryCacheKey, expiryTimeMs.toString());

    console.log('Sandbox access token cached successfully');
    return accessToken;
  } catch (error: any) {
    console.error('Error getting Sandbox access token:', error);
    throw new Error(error.message || 'Failed to authenticate with Sandbox API');
  }
}

/**
 * Clear cached Sandbox token
 * Useful for logout or when token is invalid
 * Clears token for current API key
 */
export async function clearSandboxToken(): Promise<void> {
  try {
    // Clear token for current API key
    const apiKeyIdentifier = SANDBOX_CONFIG.API_KEY.substring(0, 20);
    const tokenCacheKey = `${STORAGE_KEYS.ACCESS_TOKEN}_${apiKeyIdentifier}`;
    const expiryCacheKey = `${STORAGE_KEYS.TOKEN_EXPIRY}_${apiKeyIdentifier}`;
    
    await AsyncStorage.removeItem(tokenCacheKey);
    await AsyncStorage.removeItem(expiryCacheKey);
    
    // Also try to clear old format tokens (for backward compatibility)
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    } catch (e) {
      // Ignore if old keys don't exist
    }
    
    console.log('Sandbox token cleared');
  } catch (error) {
    console.error('Error clearing Sandbox token:', error);
  }
}

/**
 * Clear ALL cached Sandbox tokens (useful when switching API keys)
 */
export async function clearAllSandboxTokens(): Promise<void> {
  try {
    // Clear all possible token cache keys
    const keys = await AsyncStorage.getAllKeys();
    const tokenKeys = keys.filter(key => 
      key.startsWith(STORAGE_KEYS.ACCESS_TOKEN) || 
      key.startsWith(STORAGE_KEYS.TOKEN_EXPIRY)
    );
    
    await Promise.all(tokenKeys.map(key => AsyncStorage.removeItem(key)));
    console.log('All Sandbox tokens cleared');
  } catch (error) {
    console.error('Error clearing all Sandbox tokens:', error);
  }
}

/**
 * Check if we have a valid cached token
 */
export async function hasValidToken(): Promise<boolean> {
  try {
    const apiKeyIdentifier = SANDBOX_CONFIG.API_KEY.substring(0, 20);
    const tokenCacheKey = `${STORAGE_KEYS.ACCESS_TOKEN}_${apiKeyIdentifier}`;
    const expiryCacheKey = `${STORAGE_KEYS.TOKEN_EXPIRY}_${apiKeyIdentifier}`;
    
    const cachedToken = await AsyncStorage.getItem(tokenCacheKey);
    const expiryTimeStr = await AsyncStorage.getItem(expiryCacheKey);
    
    if (!cachedToken || !expiryTimeStr) {
      return false;
    }
    
    const expiry = parseInt(expiryTimeStr, 10);
    const now = Date.now();
    
    return now < expiry - SANDBOX_CONFIG.TOKEN_EXPIRY_BUFFER;
  } catch (error) {
    return false;
  }
}

