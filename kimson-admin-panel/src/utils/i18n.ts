/**
 * Internationalization utilities for multi-language support
 */

export type LanguageCode = 'en' | 'hi' | 'mr' | 'gu';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
    gu: string;
  };
}

export const translations: Translations = {
  // Common
  welcome: {
    en: 'Welcome',
    hi: 'स्वागत है',
    mr: 'स्वागत आहे',
    gu: 'સ્વાગત છે',
  },
  next: {
    en: 'Next',
    hi: 'अगला',
    mr: 'पुढे',
    gu: 'આગળ',
  },
  back: {
    en: 'Back',
    hi: 'वापस',
    mr: 'मागे',
    gu: 'પાછળ',
  },
  save: {
    en: 'Save',
    hi: 'सहेजें',
    mr: 'जतन करा',
    gu: 'સેવ કરો',
  },
  cancel: {
    en: 'Cancel',
    hi: 'रद्द करें',
    mr: 'रद्द करा',
    gu: 'રદ કરો',
  },
  
  // Authentication
  login: {
    en: 'Login',
    hi: 'लॉगिन',
    mr: 'लॉगिन',
    gu: 'લૉગિન',
  },
  phoneNumber: {
    en: 'Phone Number',
    hi: 'फोन नंबर',
    mr: 'फोन नंबर',
    gu: 'ફોન નંબર',
  },
  enterOTP: {
    en: 'Enter OTP',
    hi: 'OTP दर्ज करें',
    mr: 'OTP टाका',
    gu: 'OTP દાખલ કરો',
  },
  verifyOTP: {
    en: 'Verify OTP',
    hi: 'OTP सत्यापित करें',
    mr: 'OTP सत्यापित करा',
    gu: 'OTP ચકાસો',
  },
  
  // Registration
  registerAsElectrician: {
    en: 'Register as Electrician',
    hi: 'इलेक्ट्रिशियन के रूप में पंजीकरण',
    mr: 'इलेक्ट्रिशियन म्हणून नोंदणी',
    gu: 'ઇલેક્ટ્રિશિયન તરીકે નોંધણી',
  },
  registerAsDealer: {
    en: 'Register as Dealer',
    hi: 'रिटेलर के रूप में पंजीकरण',
    mr: 'रिटेलर म्हणून नोंदणी',
    gu: 'રિટેલર તરીકે નોંધણી',
  },
  
  // KYC
  kycVerification: {
    en: 'KYC Verification',
    hi: 'KYC सत्यापन',
    mr: 'KYC सत्यापन',
    gu: 'KYC ચકાસણી',
  },
  aadharNumber: {
    en: 'Aadhar Number',
    hi: 'आधार संख्या',
    mr: 'आधार क्रमांक',
    gu: 'આધાર નંબર',
  },
  
  // Dashboard
  dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    mr: 'डॅशबोर्ड',
    gu: 'ડૅશબોર્ડ',
  },
  scanWire: {
    en: 'Scan Wire',
    hi: 'तार स्कैन करें',
    mr: 'वायर स्कॅन करा',
    gu: 'વાયર સ્કૅન કરો',
  },
  myRewards: {
    en: 'My Rewards',
    hi: 'मेरे पुरस्कार',
    mr: 'माझे बक्षीस',
    gu: 'મારા પુરસ્કારો',
  },
  wallet: {
    en: 'Wallet',
    hi: 'वॉलेट',
    mr: 'वॉलेट',
    gu: 'વૉલેટ',
  },
  profile: {
    en: 'Profile',
    hi: 'प्रोफाइल',
    mr: 'प्रोफाइल',
    gu: 'પ્રોફાઇલ',
  },
  
  // Wire Authentication
  authenticateWire: {
    en: 'Authenticate Wire',
    hi: 'तार सत्यापित करें',
    mr: 'वायर सत्यापित करा',
    gu: 'વાયર પ્રમાણિત કરો',
  },
  scanQRCode: {
    en: 'Scan QR Code',
    hi: 'QR कोड स्कैन करें',
    mr: 'QR कोड स्कॅन करा',
    gu: 'QR કોડ સ્કૅન કરો',
  },
  enterManually: {
    en: 'Enter Manually',
    hi: 'मैन्युअल रूप से दर्ज करें',
    mr: 'मॅन्युअली एंटर करा',
    gu: 'મેન્યુઅલી દાખલ કરો',
  },
  
  // Rewards
  totalPoints: {
    en: 'Total Points',
    hi: 'कुल अंक',
    mr: 'एकूण गुण',
    gu: 'કુલ પોઇન્ટ્સ',
  },
  earnedPoints: {
    en: 'Earned Points',
    hi: 'अर्जित अंक',
    mr: 'मिळवलेले गुण',
    gu: 'કમાયેલા પોઇન્ટ્સ',
  },
  
  // Language Selection
  selectLanguage: {
    en: 'Select Language',
    hi: 'भाषा चुनें',
    mr: 'भाषा निवडा',
    gu: 'ભાષા પસંદ કરો',
  },
  english: {
    en: 'English',
    hi: 'अंग्रेजी',
    mr: 'इंग्रजी',
    gu: 'અંગ્રેજી',
  },
  hindi: {
    en: 'Hindi',
    hi: 'हिंदी',
    mr: 'हिंदी',
    gu: 'હિન્દી',
  },
  marathi: {
    en: 'Marathi',
    hi: 'मराठी',
    mr: 'मराठी',
    gu: 'મરાઠી',
  },
  gujarati: {
    en: 'Gujarati',
    hi: 'गुजराती',
    mr: 'गुजराती',
    gu: 'ગુજરાતી',
  },
};

let currentLanguage: LanguageCode = 'en';

export const setLanguage = (language: LanguageCode): void => {
  currentLanguage = language;
};

export const getCurrentLanguage = (): LanguageCode => {
  return currentLanguage;
};

export const t = (key: string): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  return translation[currentLanguage] || translation.en || key;
};

export const getLanguageName = (code: LanguageCode): string => {
  const names = {
    en: 'English',
    hi: 'हिंदी',
    mr: 'मराठी',
    gu: 'ગુજરાતી',
  };
  return names[code];
};

export const initializeLanguage = async (): Promise<void> => {
  try {
    const { getLanguage } = await import('./storage');
    const savedLanguage = await getLanguage();
    setLanguage(savedLanguage);
  } catch (error) {
    console.error('Error initializing language:', error);
    setLanguage('en');
  }
};
