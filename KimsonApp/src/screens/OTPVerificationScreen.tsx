import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { globalTextStyles } from '../styles/globalStyles';

type OTPVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerification'>;
type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

interface Props {
  navigation: OTPVerificationNavigationProp;
  route: OTPVerificationRouteProp;
}

const { width, height } = Dimensions.get('window');

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber, verificationId } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [currentVerificationId, setCurrentVerificationId] = useState<string>(verificationId);
  
  const { theme, toggleTheme, isDark } = useTheme();
  const { verifyOTP, sendOTP } = useAuth();
  
  // Create refs for each OTP input
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    
    // Only allow single digit
    if (text.length > 1) {
      text = text.slice(-1);
    }
    
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input if current field has value
    if (text && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Auto-focus previous input if current field is empty (for backspace)
    if (!text && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    // Validate OTP format
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }
    
    // Check if OTP contains only digits
    if (!/^\d{6}$/.test(otpCode)) {
      Alert.alert('Error', 'OTP should contain only numbers');
      return;
    }

    if (!currentVerificationId) {
      Alert.alert('Error', 'Session expired. Please request a new OTP.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📱 Starting OTP verification...');
      console.log('   Phone:', phoneNumber);
      console.log('   OTP length:', otpCode.length);
      console.log('   Verification ID:', currentVerificationId.substring(0, 20) + '...');
      
      // Use real Firebase verification with verificationId
      await verifyOTP(currentVerificationId, otpCode);
      
      console.log('✅ OTP verified successfully!');
      setIsLoading(false);
      
      // Navigate to registration type selection after successful OTP verification
      navigation.navigate('RegistrationType');
    } catch (error: any) {
      setIsLoading(false);
      console.error('❌ OTP verification error:', error);
      
      // Show user-friendly error
      let errorMessage = 'Invalid OTP. Please try again.';
      
      // Parse Firebase error codes
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new OTP.';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'Session expired. Please request a new OTP.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Verification Failed', errorMessage, [
        {
          text: 'Try Again',
          onPress: () => {
            // Clear OTP fields
            setOtp(['', '', '', '', '', '']);
            otpInputRefs.current[0]?.focus();
          }
        },
        {
          text: 'Resend OTP',
          onPress: handleResendOTP,
          style: 'default'
        }
      ]);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(30);
    setIsLoading(true);
    
    try {
      console.log('Resending OTP to:', phoneNumber);
      // Resend OTP using real Firebase auth
      const newVerificationId = await sendOTP(phoneNumber);
      
      // Update verificationId
      setCurrentVerificationId(newVerificationId);
      
      // Update route params
      navigation.setParams({ 
        phoneNumber,
        verificationId: newVerificationId
      });
      
      // Clear OTP fields
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
      
      Alert.alert('Success', 'OTP has been resent to your mobile number');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP');
      setCanResend(true); // Allow retry
    } finally {
      setIsLoading(false);
    }
    
    // Restart timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
            <Text style={[styles.verifyText, globalTextStyles.h1, { color: theme.colors.text }]}>Verify OTP</Text>
            <Text style={[styles.instructionMessage, globalTextStyles.subtitle, { color: theme.colors.accent }]}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={[styles.phoneNumber, globalTextStyles.h4, { color: theme.colors.text }]}>+91 {phoneNumber}</Text>
            </Text>
          </View>

          {/* OTP Card - Takes remaining 3/4 of screen */}
          <View style={styles.cardContainer}>
            <View style={[styles.otpCard, { backgroundColor: '#000000' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, globalTextStyles.h3, { color: '#FFFFFF' }]}>Enter OTP</Text>
              </View>

              <View style={styles.formSection}>
                {/* OTP Input */}
                <View style={styles.otpInputContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { otpInputRefs.current[index] = ref; }}
                      style={[
                        styles.otpInput,
                        { 
                          borderColor: digit ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
                          backgroundColor: '#000000',
                          color: '#FFFFFF'
                        }
                      ]}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      autoFocus={Boolean(index === 0)}
                      selectTextOnFocus={true}
                      placeholderTextColor="#666666"
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                          otpInputRefs.current[index - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  style={[styles.verifyButton, { backgroundColor: '#000000', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }]}
                  onPress={handleVerifyOTP}
                  disabled={Boolean(isLoading)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.verifyButtonText, globalTextStyles.button, { color: '#FFFFFF' }]}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Text>
                </TouchableOpacity>

                {/* Resend Section */}
                <View style={styles.resendSection}>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResendOTP}>
                      <Text style={[styles.resendLink, globalTextStyles.body, { color: '#FFFFFF' }]}>
                        Resend OTP
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.resendTimer, globalTextStyles.body, { color: '#CCCCCC' }]}>
                      Resend OTP in {resendTimer}s
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    paddingTop: 100,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  verifyText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionMessage: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 26,
  },
  phoneNumber: {
    fontWeight: '600',
  },
  // Card container takes reduced height
  cardContainer: {
    flex: 2.2,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  otpCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 30,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 0,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verifyButton: {
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 0,
    paddingBottom: 40,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendTimer: {
    fontSize: 14,
  },
});

export default OTPVerificationScreen;





