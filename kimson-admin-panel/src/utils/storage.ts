import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  LANGUAGE: 'selectedLanguage',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  BIOMETRIC_ENABLED: 'biometricEnabled',
} as const;

// Generic storage functions
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting item in storage:', error);
    throw error;
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error getting item from storage:', error);
    return null;
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item from storage:', error);
    throw error;
  }
};

export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

// Typed storage functions
export const setUserToken = async (token: string): Promise<void> => {
  await setItem(STORAGE_KEYS.USER_TOKEN, token);
};

export const getUserToken = async (): Promise<string | null> => {
  return await getItem(STORAGE_KEYS.USER_TOKEN);
};

export const setUserData = async (userData: any): Promise<void> => {
  await setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
};

export const getUserData = async (): Promise<any | null> => {
  const data = await getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

export const setLanguage = async (language: 'en' | 'hi' | 'mr' | 'gu'): Promise<void> => {
  await setItem(STORAGE_KEYS.LANGUAGE, language);
};

export const getLanguage = async (): Promise<'en' | 'hi' | 'mr' | 'gu'> => {
  const language = await getItem(STORAGE_KEYS.LANGUAGE);
  return (language as 'en' | 'hi' | 'mr' | 'gu') || 'en';
};

export const setOnboardingCompleted = async (completed: boolean): Promise<void> => {
  await setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
};

export const getOnboardingCompleted = async (): Promise<boolean> => {
  const completed = await getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  return completed === 'true';
};
