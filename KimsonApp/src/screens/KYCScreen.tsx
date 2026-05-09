import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { globalTextStyles } from '../styles/globalStyles';
import { fonts } from '../config/fonts';
import { generateAadhaarOTP, verifyAadhaarOTP } from '../services/sandboxKYC';
import { clearAllSandboxTokens } from '../services/sandboxAuth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

type KYCNavigationProp = StackNavigationProp<RootStackParamList, 'KYC'>;

interface Props {
  navigation: KYCNavigationProp;
}

const { width, height } = Dimensions.get('window');

const KYCScreen: React.FC<Props> = ({ navigation }) => {
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [requestId, setRequestId] = useState<string>(''); // Store Sandbox request ID
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<{ aadhar?: string; otp?: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showKYCSuccessModal, setShowKYCSuccessModal] = useState(false);
  
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, updateUserProfile } = useAuth();

  const validateAadhar = (aadhar: string): boolean => {
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(aadhar);
  };

  const handleSendOTP = async () => {
    setErrors({});
    
    if (!aadharNumber.trim()) {
      setErrors({ aadhar: 'Aadhar number is required' });
      return;
    }

    if (!validateAadhar(aadharNumber)) {
      setErrors({ aadhar: 'Please enter a valid 12-digit Aadhar number' });
      return;
    }

    setIsLoading(true);
    
    try {
      // Clear cached token if switching API keys or if there's an error
      // This ensures we use the correct API key's token
      await clearAllSandboxTokens();
      
      // Call Sandbox API to generate OTP
      const otpResponse = await generateAadhaarOTP(aadharNumber);
      
      if (!otpResponse.success || !otpResponse.request_id) {
        throw new Error(otpResponse.message || 'Failed to generate OTP');
      }
      
      // Store request_id for verification
      console.log('✅ OTP Generated Successfully:', {
        request_id: otpResponse.request_id,
        request_id_type: typeof otpResponse.request_id,
        message: otpResponse.message,
      });
      
      setRequestId(otpResponse.request_id);
      setIsOtpSent(true);
      setErrors({}); // Clear any existing errors after successful OTP
      setShowSuccessModal(true);
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error: any) {
      console.error('OTP generation error:', error);
      setErrors({ aadhar: error.message || 'Failed to send OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyKYC = async () => {
    setErrors({});
    
    if (!otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    if (!requestId) {
      Alert.alert('Error', 'Session expired. Please request OTP again.');
      setIsOtpSent(false);
      setOtp('');
      return;
    }

    setIsVerifying(true);
    
    try {
      console.log('🔍 KYC Verification - Starting OTP verification:', {
        requestId: requestId,
        otpLength: otp.length,
        aadharNumber: aadharNumber.substring(0, 4) + '****' + aadharNumber.substring(8),
      });
      
      // Call Sandbox API to verify OTP
      const verifyResponse = await verifyAadhaarOTP(requestId, otp);
      
      console.log('✅ KYC Verification - OTP verified successfully:', {
        verified: verifyResponse.verified,
        hasAadhaarData: !!verifyResponse.aadhaar_data,
      });
      
      if (!verifyResponse.verified || !verifyResponse.aadhaar_data) {
        throw new Error(verifyResponse.message || 'KYC verification failed');
      }

      const aadhaarData = verifyResponse.aadhaar_data;
      
      // Save KYC data to Firestore
      const kycData = {
        userId: user.id,
        aadhaarNumber: aadharNumber,
        verified: true,
        verifiedAt: serverTimestamp(),
        aadhaarData: {
          name: aadhaarData.name || '',
          dob: aadhaarData.dob || '',
          gender: aadhaarData.gender || '',
          address: aadhaarData.address || {},
          ...(aadhaarData.photo && { photo: aadhaarData.photo }), // Only include if available
          ...(aadhaarData.mobile_number && { mobile_number: aadhaarData.mobile_number }),
          ...(aadhaarData.email && { email: aadhaarData.email }),
        },
        provider: 'sandbox',
        createdAt: serverTimestamp(),
      };

      // Save to Firestore
      await setDoc(
        doc(db, 'kyc_verifications', user.id),
        kycData
      );

      // Update user profile
      // IMPORTANT: Preserve user's registered name - don't overwrite with Aadhaar name
      // Only use Aadhaar name if user hasn't registered a name yet
      const updatedUser = {
        ...user,
        userType: user.userType || 'electrician', // CRITICAL: Ensure userType is set (default to electrician for KYC flow)
        kycVerified: true,
        name: user.name || aadhaarData.name || '', // Prioritize registered name over Aadhaar name
        rewardPoints: (user.rewardPoints || 0) + 100, // Welcome bonus
        kycVerificationId: user.id, // Reference to KYC document
      };

      console.log('💾 [KYC] Saving userType to Firestore:', {
        userType: updatedUser.userType,
        userId: user.id,
      });

      await updateUserProfile(updatedUser);
      
      // Also update Firestore user document
      // CRITICAL: Explicitly set userType
      const firestoreUserData = {
        ...updatedUser,
        userType: updatedUser.userType || 'electrician', // CRITICAL: Explicitly set userType
        createdAt: updatedUser.createdAt instanceof Date 
          ? updatedUser.createdAt 
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(
        doc(db, 'users', user.id),
        firestoreUserData,
        { merge: true }
      );
      
      setIsVerifying(false);
      setShowKYCSuccessModal(true);
    } catch (error: any) {
      setIsVerifying(false);
      console.error('❌ KYC verification error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        requestId: requestId,
        otpLength: otp.length,
      });
      
      // Handle specific error cases
      const errorMessage = error.message || 'KYC verification failed. Please try again.';
      
      if (errorMessage.includes('Invalid OTP') || 
          errorMessage.includes('expired') ||
          errorMessage.includes('wrong') ||
          errorMessage.includes('Invalid or expired')) {
        // Show error message with suggestion to request new OTP
        const displayMessage = errorMessage.includes('expired') 
          ? 'OTP has expired. Please request a new OTP.'
          : errorMessage;
        setErrors({ otp: displayMessage });
        
        // Also show an alert with action to resend OTP
        Alert.alert(
          'OTP Verification Failed',
          displayMessage,
          [
            {
              text: 'Request New OTP',
              onPress: () => {
                setIsOtpSent(false);
                setOtp('');
                setRequestId('');
                setErrors({});
              },
              style: 'default',
            },
            {
              text: 'Try Again',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header Section - Takes 1/4 of screen */}
          <View style={styles.headerSection}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo-dark.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* KYC Card - Takes remaining 3/4 of screen */}
          <View style={styles.cardContainer}>
            <View style={[styles.kycCard, { backgroundColor: '#000000' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, globalTextStyles.h3, { color: '#FFFFFF' }]}>KYC Verification</Text>
                {/* Progress Steps */}
                <View style={styles.stepContainer}>
                  <View style={styles.step}>
                    <View style={[styles.stepIndicator, styles.stepActive, { backgroundColor: '#FFFFFF' }]}>
                      <Text style={[styles.stepNumber, { color: '#1a1a1a' }]}>1</Text>
                    </View>
                    <Text style={[styles.stepText, globalTextStyles.label, { color: '#CCCCCC' }]}>Aadhar</Text>
                  </View>
                  
                  <View style={[styles.stepLine, { backgroundColor: '#333333' }]} />
                  
                  <View style={styles.step}>
                    <View style={[styles.stepIndicator, isOtpSent && styles.stepActive, 
                      { backgroundColor: isOtpSent ? '#FFFFFF' : '#000000' }]}>
                      <Text style={[styles.stepNumber, { color: isOtpSent ? '#1a1a1a' : '#CCCCCC' }]}>2</Text>
                    </View>
                    <Text style={[styles.stepText, globalTextStyles.label, { color: '#CCCCCC' }]}>OTP</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                {/* Aadhar Number Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>Aadhar Number</Text>
                  <View style={[styles.inputContainer, { 
                    borderColor: errors.aadhar ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#000000',
                    opacity: isOtpSent ? 0.5 : 1
                  }]}>
                    <TextInput
                      placeholder="Enter 12-digit Aadhar number"
                      placeholderTextColor="#666666"
                      value={aadharNumber}
                      onChangeText={setAadharNumber}
                      keyboardType="number-pad"
                      maxLength={12}
                      editable={Boolean(!isOtpSent)}
                      style={[styles.inputText, { color: '#FFFFFF' }]}
                    />
                  </View>
                  {errors.aadhar && (
                    <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.aadhar}</Text>
                  )}
                </View>

                {/* OTP Input - only shown after OTP is sent */}
                {isOtpSent && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>Enter OTP</Text>
                    <View style={[styles.inputContainer, { 
                      borderColor: errors.otp ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                      backgroundColor: '#000000'
                    }]}>
                      <TextInput
                        placeholder="Enter 6-digit OTP"
                        placeholderTextColor="#666666"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={[styles.inputText, { color: '#FFFFFF' }]}
                      />
                    </View>
                    {errors.otp && (
                      <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.otp}</Text>
                    )}
                  </View>
                )}

                {/* Action Buttons */}
                {!isOtpSent ? (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FFFFFF' }]}
                    onPress={handleSendOTP}
                    disabled={Boolean(isLoading)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionButtonText, globalTextStyles.button, { color: '#1a1a1a' }]}>
                      {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#FFFFFF' }]}
                      onPress={handleVerifyKYC}
                      disabled={Boolean(isVerifying)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.actionButtonText, globalTextStyles.button, { color: '#1a1a1a' }]}>
                        {isVerifying ? 'Verifying...' : 'Verify & Complete'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.resendButton, { borderColor: 'rgba(51, 51, 51, 0.3)' }]}
                      onPress={() => {
                        // Reset OTP and request new one
                        setOtp('');
                        setRequestId('');
                        handleSendOTP();
                      }}
                      activeOpacity={0.8}
                      disabled={Boolean(isLoading)}
                    >
                      <Text style={[styles.resendButtonText, globalTextStyles.body, { color: '#CCCCCC' }]}>
                        {isLoading ? 'Sending...' : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={[styles.footerText, globalTextStyles.caption, { color: '#CCCCCC' }]}>
                  🔒 Your information is secure and encrypted
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Modern OTP Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContainer}>
              {/* Success Icon with Animation */}
              <View style={styles.successIconContainer}>
                <View style={[styles.successIconCircle, { backgroundColor: '#000000' }]}>
                  <Icon name="check" size={40} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>

              {/* Success Message */}
              <Text style={[styles.successTitle, globalTextStyles.h3]}>OTP Sent!</Text>
              <Text style={[styles.successMessage, globalTextStyles.body]}>
                OTP has been sent to your registered mobile number
              </Text>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.successCloseButton}
                onPress={() => setShowSuccessModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.successCloseButtonText, globalTextStyles.button]}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modern KYC Verification Success Modal */}
        <Modal
          visible={showKYCSuccessModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowKYCSuccessModal(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.kycSuccessModalContainer}>
              {/* Animated Success Icon */}
              <View style={styles.kycSuccessIconContainer}>
                <View style={styles.kycSuccessIconOuter}>
                  <View style={[styles.kycSuccessIconInner, { backgroundColor: '#000000' }]}>
                    <Icon name="check" size={50} color="#FFFFFF" strokeWidth={4} />
                  </View>
                </View>
              </View>

              {/* Success Badge */}
              <View style={styles.successBadge}>
                <Text style={styles.successBadgeText}>✓ VERIFIED</Text>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.kycContinueButton}
                onPress={() => {
                  setShowKYCSuccessModal(false);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                  });
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.kycContinueButtonText, globalTextStyles.button]}>
                  Continue to Dashboard
                </Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  // Header takes 1/4 of screen
  headerSection: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logoImage: {
    width: 245,
    height: 175,
  },
  verifyText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  instructionMessage: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center',
  },
  // Card container takes 3/4 of screen
  cardContainer: {
    flex: 3,
    paddingHorizontal: 0,
    paddingBottom: '-10%',
  },
  kycCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 30,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  cardTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  // Progress steps
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  step: {
    alignItems: 'center',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepActive: {
    // Dynamic styling handled inline
  },
  stepNumber: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 12,
    fontWeight: '500',
  },
  stepLine: {
    width: 30,
    height: 2,
    marginHorizontal: 10,
    marginBottom: 18,
  },
  formSection: {
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 50,
  },
  inputText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 16,
    fontWeight: '300',
    paddingVertical: 0,
    flex: 1,
  },
  errorMessage: {
    fontFamily: 'Ubuntu-Light',
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  actionButton: {
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  actionButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resendButton: {
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
  },
  resendButtonText: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 40,
  },
  footerText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Modern Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successModalContainer: {
    backgroundColor: '#000000',
    borderRadius: 25,
    padding: 35,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.3)',
  },
  successIconContainer: {
    marginBottom: 25,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  successTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  successCloseButton: {
    backgroundColor: '#000000',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successCloseButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Modern KYC Success Modal Styles
  kycSuccessModalContainer: {
    backgroundColor: '#000000',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  kycSuccessIconContainer: {
    marginBottom: 15,
  },
  kycSuccessIconOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  kycSuccessIconInner: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
  },
  successBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  successBadgeText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  kycSuccessTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  kycWelcomeText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 25,
    textAlign: 'center',
  },
  kycSuccessDetailsContainer: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.3)',
  },
  kycSuccessDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  kycSuccessDetailText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 15,
    color: '#CCCCCC',
    flex: 1,
    lineHeight: 20,
  },
  kycContinueButton: {
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  kycContinueButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default KYCScreen;





