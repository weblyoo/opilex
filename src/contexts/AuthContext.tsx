import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { 
  User as FirebaseUser,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { getUserData, setUserData, getUserToken, setUserToken, clearStorage } from '../utils/storage';
import { setupRecaptcha } from '../utils/recaptcha';
import { getFirebaseErrorMessage, logFirebaseError } from '../utils/firebaseErrorHandler';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  sendOTP: (phoneNumber: string) => Promise<string>; // Returns verificationId instead of ConfirmationResult
  verifyOTP: (verificationId: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // User is signed in, fetch user data from Firestore
        await loadUserData(firebaseUser.uid);
      } else {
        // User is signed out
        setUser(null);
        await clearStorage();
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    // Load cached user data on app start
    loadCachedUserData().finally(() => {
      if (isMounted && !auth.currentUser) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loadCachedUserData = async () => {
    try {
      const cachedUser = await getUserData();
      if (cachedUser) {
        setUser(cachedUser);
      }
    } catch (error) {
      console.error('Error loading cached user data:', error);
    }
  };

  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Normalize userType to lowercase for consistency
        if (userData.userType) {
          userData.userType = userData.userType.toLowerCase().trim() as 'electrician' | 'dealer';
        }
        console.log('📥 [AUTH-ADMIN] Loaded user data from Firestore:', { 
          id: userData.id, 
          userType: userData.userType,
          rewardPoints: userData.rewardPoints || 0,
        });
        setUser(userData);
        await setUserData(userData);
      } else {
        console.warn('⚠️ [AUTH-ADMIN] User document not found in Firestore:', uid);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserAfterAuth = async (firebaseUser: FirebaseUser) => {
      if (!firebaseUser) {
        throw new Error('Authentication failed. Please try again.');
      }
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // New user - create profile in Firestore
        const newUser: User = {
          id: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || '',
          userType: 'electrician', // Default, will be updated during registration
          kycVerified: false,
          language: 'en',
          rewardPoints: 0,
          createdAt: new Date(),
        };
        
        // Save to Firestore with server timestamp
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp(),
        });
        
        setUser(newUser);
        await setUserData(newUser);
      } else {
        // Existing user - load from Firestore
        const userData = userDoc.data() as User;
        // Normalize userType to lowercase for consistency
        if (userData.userType) {
          userData.userType = userData.userType.toLowerCase().trim() as 'electrician' | 'dealer';
        }
        console.log('📥 [AUTH-ADMIN] Loaded existing user:', { id: userData.id, userType: userData.userType });
        setUser(userData);
        await setUserData(userData);
      }
      
      // Store auth token
      const token = await firebaseUser.getIdToken();
      await setUserToken(token);
      
    // Clear pending confirmation
    setPendingConfirmation(null);
    
    console.log('✅ OTP verified successfully. User:', firebaseUser.uid);
  };

  const sendOTP = async (phoneNumber: string): Promise<string> => {
    // Format phone number with country code (outside try block for error handler access)
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
    
    try {
      console.log('📱 ========== SENDING OTP ==========');
      console.log('📞 Phone Number:', formattedPhone);
      console.log('💻 Platform:', Platform.OS);
      
      // Setup reCAPTCHA for web platform only
      if (Platform.OS === 'web') {
        setupRecaptcha();
        
        // Dynamically import RecaptchaVerifier only on web
        const { RecaptchaVerifier } = await import('firebase/auth');
        
        // Check if reCAPTCHA verifier already exists
        let recaptchaVerifier = (window as any).recaptchaVerifier;
        
        if (!recaptchaVerifier) {
          // Create new reCAPTCHA verifier for web
          recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
              delete (window as any).recaptchaVerifier;
            }
          }, auth);
          
          (window as any).recaptchaVerifier = recaptchaVerifier;
        }
        
          // Send OTP with reCAPTCHA verifier (web)
          const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
          setPendingConfirmation(confirmation);
          console.log('✅ OTP sent successfully on web. Verification ID:', confirmation.verificationId.substring(0, 20) + '...');
          return confirmation.verificationId;
      } else {
        // For React Native (mobile/APK) - Use Firebase REST API
        // Try using PhoneAuthProvider.verifyPhoneNumber which might work with app verification
        try {
          const phoneAuthProvider = new PhoneAuthProvider(auth);
          
          // For Android APK, Firebase may handle verification automatically
          // Try to verify phone number - this might work if app is properly configured
          const verificationId = await phoneAuthProvider.verifyPhoneNumber(
            formattedPhone,
            // @ts-ignore - Android may not require explicit verifier
            undefined
          );
          
          // Store confirmation for later use
          const confirmation: ConfirmationResult = {
            verificationId,
            confirm: async (code: string) => {
              const credential = PhoneAuthProvider.credential(verificationId, code);
              return await signInWithCredential(auth, credential);
            }
          } as any as ConfirmationResult;
          
          setPendingConfirmation(confirmation);
          console.log('✅ OTP sent successfully. Verification ID:', verificationId.substring(0, 20) + '...');
          
          return verificationId;
          
        } catch (verifyError: any) {
          console.log('⚠️ PhoneAuthProvider.verifyPhoneNumber failed, trying REST API fallback...');
          console.log('Error:', verifyError?.message || verifyError?.toString());
          
          // If verifyPhoneNumber fails, try REST API as fallback
          try {
            // Use the Android app's API key from google-services.json
            const apiKey = "AIzaSyD5eJ5TGK-3lgYTuodBXWWrgp1z0q9SrMw";
            
            console.log('📤 Attempting to send OTP via REST API to:', formattedPhone);
            console.log('📱 Using Android app API key');
            
            // Use REST API with Android app verification
            // For Android, we need to disable app verification for testing
            // OR ensure SHA fingerprints are properly configured in Firebase Console
            const sendCodeResponse = await fetch(
              `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${apiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  phoneNumber: formattedPhone,
                  // Disable app verification for testing (required for REST API on Android)
                  // In production, remove this and ensure SHA fingerprints are configured
                  appVerificationDisabledForTesting: true,
                }),
              }
            );
            
            const sendCodeData = await sendCodeResponse.json();
            
            console.log('📥 REST API Response Status:', sendCodeResponse.status);
            console.log('📥 REST API Response Data:', JSON.stringify(sendCodeData, null, 2));
            
            if (!sendCodeResponse.ok) {
              // Check the specific error
              const errorCode = sendCodeData.error?.code;
              const errorMessage = sendCodeData.error?.message || '';
              
              console.error('❌ REST API Error:', errorCode, errorMessage);
              
              // Convert errorCode to string for comparison if it's a number
              const errorCodeStr = errorCode?.toString() || '';
              const errorMessageStr = errorMessage?.toString() || '';
              
              // Handle TOO_MANY_ATTEMPTS rate limiting
              if (errorMessage.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
                throw new Error(
                  'Too many OTP attempts. Please try again later.\n\n' +
                  'Firebase has temporarily blocked OTP requests for this phone number due to too many attempts.\n\n' +
                  '🔧 Solutions:\n' +
                  '1. Wait 1-2 hours and try again with the same number\n' +
                  '2. Try with a different phone number\n' +
                  '3. Contact support if you need immediate access'
                );
              }
              
              // Handle MISSING_CLIENT_IDENTIFIER or setup errors
              if ((errorCode === 400 && errorMessage.includes('MISSING_CLIENT_IDENTIFIER')) ||
                  errorMessageStr.includes('phone authentication setup required') ||
                  errorMessageStr.includes('app verification')) {
                console.log('⚠️ App verification error detected:', errorMessage);
                
                // Check if phone auth is enabled
                if (errorMessageStr.includes('OPERATION_NOT_ALLOWED')) {
                  throw new Error(
                    'Phone authentication is not enabled in Firebase Console.\n\n' +
                    'Please enable it:\n' +
                    '1. Go to Firebase Console → Authentication → Sign-in method\n' +
                    '2. Click on "Phone"\n' +
                    '3. Toggle "Enable" ON\n' +
                    '4. Click "Save"'
                  );
                }
                
                // Provide detailed setup instructions
                throw new Error(
                  'Phone authentication setup required for Android app.\n\n' +
                  'The issue: Firebase needs to verify your Android app identity.\n\n' +
                  '✅ SHA fingerprints are already added to Firebase Console.\n' +
                  '⏰ However, changes can take 5-10 minutes to propagate.\n\n' +
                  '🔧 Next steps:\n\n' +
                  '1. Wait 5-10 minutes after adding SHA fingerprints\n' +
                  '2. Rebuild your APK: npx expo run:android\n' +
                  '3. Uninstall old APK and install the new one\n' +
                  '4. Try again\n\n' +
                  '📝 Verify in Firebase Console:\n' +
                  '- Project Settings → Android App (com.kimson.wireauth)\n' +
                  '- SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25\n' +
                  '- SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C\n' +
                  '- Authentication → Sign-in method → Phone → Enable'
                );
              }
              
              // Handle CAPTCHA errors
              if (errorCodeStr.includes('CAPTCHA') || errorCodeStr.includes('RECAPTCHA') || 
                  errorMessageStr.includes('CAPTCHA') || errorMessageStr.includes('recaptcha')) {
                throw new Error(
                  'Phone authentication requires app verification setup.\n\n' +
                  'To fix this:\n' +
                  '1. Go to Firebase Console → Project Settings → Your Android App\n' +
                  '2. Add SHA-1 and SHA-256 fingerprints\n' +
                  '3. Rebuild and reinstall the APK\n\n' +
                  'See PHONE_AUTH_APK_SETUP.md for detailed instructions.'
                );
              }
              
              // Handle OPERATION_NOT_ALLOWED
              if (errorCodeStr.includes('OPERATION_NOT_ALLOWED') || errorMessageStr.includes('OPERATION_NOT_ALLOWED')) {
                throw new Error(
                  'Phone authentication is not enabled in Firebase Console.\n\n' +
                  'Please enable it: Firebase Console → Authentication → Sign-in method → Phone → Enable'
                );
              }
              
              throw new Error(errorMessage || 'Failed to send verification code');
            }
            
            // Create ConfirmationResult from REST API response
            const sessionInfo = sendCodeData.sessionInfo;
            
            console.log('✅ OTP sent successfully via REST API. Session Info:', sessionInfo.substring(0, 20) + '...');
            
            const confirmation: ConfirmationResult = {
              verificationId: sessionInfo,
              confirm: async (code: string) => {
                const verifyResponse = await fetch(
                  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${apiKey}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      sessionInfo: sessionInfo,
                      code: code,
                    }),
                  }
                );
                
                const verifyData = await verifyResponse.json();
                
                if (!verifyResponse.ok) {
                  throw new Error(verifyData.error?.message || 'Invalid verification code');
                }
                
                // Sign in with credential
                const credential = PhoneAuthProvider.credential(sessionInfo, code);
                return await signInWithCredential(auth, credential);
              }
            } as any as ConfirmationResult;
            
            setPendingConfirmation(confirmation);
            return sessionInfo;
            
          } catch (restApiError: any) {
            // Provide helpful error message
            const errorMessage = restApiError?.message || 'Failed to send OTP';
            
            // If it's a reCAPTCHA/CAPTCHA error, provide setup instructions
            if (errorMessage.includes('CAPTCHA') || errorMessage.includes('recaptcha')) {
              throw new Error(
                'Phone authentication setup required:\n\n' +
                '1. Go to Firebase Console → Authentication → Sign-in method → Phone\n' +
                '2. Ensure Phone auth is enabled\n' +
                '3. For Android: Add SHA-1 and SHA-256 fingerprints in Firebase Console\n' +
                '4. Rebuild and reinstall the APK\n\n' +
                'Or contact support for assistance.'
              );
            }
            
            throw restApiError;
          }
        }
      }
    } catch (error: any) {
      // Enhanced error logging (formattedPhone is now accessible)
      logFirebaseError('sendOTP', error, {
        phoneNumber: formattedPhone ? formattedPhone.substring(0, 7) + '****' : 'N/A', // Masked, with fallback
        platform: Platform.OS,
        originalPhone: phoneNumber.substring(0, 3) + '****', // Also log original
      });
      
      // Get user-friendly error message
      const errorMessage = getFirebaseErrorMessage(error);
      
      throw new Error(errorMessage);
    }
  };

  const verifyOTP = async (verificationId: string, otp: string): Promise<void> => {
    try {
      console.log('🔐 Starting OTP verification...');
      console.log('   Verification ID:', verificationId.substring(0, 20) + '...');
      console.log('   OTP length:', otp.length);
      
      // Get confirmation from pending or create new one
      let confirmation = pendingConfirmation;
      
      // Always try to use the credential directly for more reliability
      try {
        const credential = PhoneAuthProvider.credential(verificationId, otp);
        console.log('✅ Credential created, signing in...');
        const result = await signInWithCredential(auth, credential);
        const firebaseUser = result.user;
        
        if (!firebaseUser) {
          throw new Error('Authentication failed. Please try again.');
        }
        
        console.log('✅ Sign-in successful. User ID:', firebaseUser.uid);
        // Load user data
        await loadUserAfterAuth(firebaseUser);
        return;
      } catch (credentialError: any) {
        console.log('⚠️ Credential sign-in failed, trying confirmation method...');
        console.log('   Error:', credentialError.message);
        
        // Fallback to confirmation method if credential fails
        if (confirmation && confirmation.verificationId === verificationId) {
          console.log('📱 Trying confirmation.confirm() method...');
          const result = await confirmation.confirm(otp);
          const firebaseUser = result.user;
          
          if (!firebaseUser) {
            throw new Error('Authentication failed. Please try again.');
          }
          
          console.log('✅ Confirmation successful. User ID:', firebaseUser.uid);
          await loadUserAfterAuth(firebaseUser);
          return;
        }
        
        // If both methods fail, throw the original error
        throw credentialError;
      }
      
    } catch (error: any) {
      // Enhanced error logging
      logFirebaseError('verifyOTP', error, {
        otpLength: otp.length,
      });
      
      // Get user-friendly error message
      const errorMessage = getFirebaseErrorMessage(error);
      
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (userData: Partial<User> | User): Promise<void> => {
    try {
      let updatedUser: User;
      
      if ('id' in userData && userData.id) {
        // Full user object passed
        updatedUser = userData as User;
      } else {
        // Partial update
        if (!user) {
          throw new Error('No current user to update');
        }
        updatedUser = { ...user, ...userData };
      }
      
      // Update local state and storage
      setUser(updatedUser);
      await setUserData(updatedUser);
      
      // Update Firestore if user exists
      if (firebaseUser) {
        try {
          // Convert Date objects to Firestore-compatible format
          const firestoreData: any = {
            ...updatedUser,
            updatedAt: serverTimestamp(),
          };
          
          // Handle createdAt - preserve existing or use serverTimestamp
          if (updatedUser.createdAt instanceof Date) {
            firestoreData.createdAt = updatedUser.createdAt;
          } else if (!updatedUser.createdAt) {
            firestoreData.createdAt = serverTimestamp();
          }
          
          await setDoc(
            doc(db, 'users', updatedUser.id),
            firestoreData,
            { merge: true }
          );
        } catch (firestoreError) {
          console.warn('Warning: Failed to update Firestore:', firestoreError);
          // Don't throw - local update succeeded
        }
      }
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      console.log('🔄 [AUTH-ADMIN] Refreshing user data from Firestore...');
      
      // Always try to fetch from Firestore first (production)
      if (firebaseUser) {
        console.log('📥 [AUTH-ADMIN] Fetching user from Firestore:', firebaseUser.uid);
        await loadUserData(firebaseUser.uid);
        console.log('✅ [AUTH-ADMIN] User data refreshed from Firestore');
        return;
      }
      
      // Fallback to mock service only if Firestore is not available
      console.log('⚠️ [AUTH-ADMIN] Firestore not available, using mock service');
      const currentUser = await mockAuthService.getCurrentUser();
      if (currentUser) {
        // Normalize userType
        if (currentUser.userType) {
          currentUser.userType = currentUser.userType.toLowerCase().trim() as 'electrician' | 'dealer';
        }
        setUser(currentUser);
        await setUserData(currentUser);
        console.log('✅ [AUTH-ADMIN] Updated user state with points:', currentUser.rewardPoints, 'userType:', currentUser.userType);
      }
    } catch (error) {
      console.error('❌ [AUTH-ADMIN] Error refreshing user:', error);
      // Fallback to cached data
      const cachedUser = await getUserData();
      if (cachedUser) {
        // Normalize userType from cache
        if (cachedUser.userType) {
          cachedUser.userType = cachedUser.userType.toLowerCase().trim() as 'electrician' | 'dealer';
        }
        setUser(cachedUser);
        console.log('⚠️ [AUTH-ADMIN] Used cached user data:', cachedUser.rewardPoints, 'userType:', cachedUser.userType);
      }
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      await clearStorage();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    sendOTP,
    verifyOTP,
    signOut,
    updateUserProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
