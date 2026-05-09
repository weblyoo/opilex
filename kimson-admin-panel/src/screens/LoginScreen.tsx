import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Icon from '../components/Icon';
import { globalTextStyles } from '../styles/globalStyles';
import { useAuth } from '../contexts/AuthContext';
import { printDiagnostics } from '../utils/firebaseAuthDiagnostics';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phoneNumber?: string }>({});
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const { theme, toggleTheme, isDark } = useTheme();
  const { sendOTP } = useAuth();

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    setErrors({});
    
    if (!phoneNumber.trim()) {
      setErrors({ phoneNumber: 'Phone number is required' });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setErrors({ phoneNumber: 'Please enter a valid 10-digit phone number' });
      return;
    }

    setIsLoading(true);
    
    try {
      // Run diagnostics in development mode
      if (__DEV__) {
        await printDiagnostics(phoneNumber);
      }
      
      // Call real Firebase auth to send OTP
      const verificationId = await sendOTP(phoneNumber);
      
      setIsLoading(false);
      
      console.log('✅ OTP request successful. Navigating to verification screen...');
      
      // Navigate to OTP screen with verificationId (serializable)
      navigation.navigate('OTPVerification', { 
        phoneNumber,
        verificationId // Pass verificationId instead of confirmation object
      });
    } catch (error: any) {
      setIsLoading(false);
      
      // Only log error if not mobile-not-supported (we already handled it above)
      if (error.code !== 'auth/mobile-not-supported') {
        console.error('❌ Error sending OTP:', error.message || error.toString());
        if (error.code) {
          console.error('Error Code:', error.code);
        }
      }
      
      // Extract user-friendly error message
      const errorMessage = error.message || 'Failed to send OTP. Please try again.';
      const displayMessage = errorMessage.split('\n')[0];
      
      // Show user-friendly error
      setErrors({ 
        phoneNumber: displayMessage
      });
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
              <Text style={[styles.welcomeMessage, { color: theme.colors.accent }]}>
                Welcome to opilex
              </Text>
            </View>
          </View>

          {/* Login Card - Takes remaining 3/4 of screen */}
          <View style={styles.cardContainer}>
            <View style={[styles.loginCard, { backgroundColor: '#1a1a1a' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, globalTextStyles.h3, { color: '#FFFFFF' }]}>Login</Text>
              </View>

              <View style={styles.formSection}>
                {/* Mobile Number Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>📱 Mobile Number</Text>
                  <View style={[styles.inputContainer, { 
                    borderColor: errors.phoneNumber ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#2a2a2a' 
                  }]}>
                    <Text style={[styles.countryPrefix, globalTextStyles.body, { color: '#CCCCCC' }]}>+91</Text>
                    <View style={[styles.inputSeparator, { backgroundColor: 'rgba(51, 51, 51, 0.3)' }]} />
                    <TextInput
                      placeholder="Enter mobile number"
                      placeholderTextColor="#666666"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={[styles.inputText, { color: '#FFFFFF' }]}
                    />
                  </View>
                  {errors.phoneNumber && (
                    <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.phoneNumber}</Text>
                  )}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: '#FFFFFF' }]}
                  onPress={handleSendOTP}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.loginButtonText, globalTextStyles.button, { color: '#1a1a1a' }]}>
                    {isLoading ? 'Sending OTP...' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={[styles.footerText, globalTextStyles.caption, { color: '#CCCCCC' }]}>
                  By continuing, you agree to our{' '}
                  <Text style={[styles.linkText, globalTextStyles.caption, { color: '#FFFFFF' }]}>Terms</Text> and{' '}
                  <Text style={[styles.linkText, globalTextStyles.caption, { color: '#FFFFFF' }]}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Help & Support Link - Inside Card Bottom */}
              <View style={styles.helpSupportContainer}>
                <TouchableOpacity
                  style={styles.helpSupportButton}
                  onPress={() => setShowHelpModal(true)}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name="support" 
                    size={18} 
                    color="#CCCCCC" 
                    strokeWidth={2}
                  />
                  <Text style={styles.helpSupportText}>
                    Help & Support
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Stylish Help & Support Modal */}
        <Modal
          visible={showHelpModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowHelpModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Icon name="support" size={28} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.modalTitle}>Help & Support</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowHelpModal(false)}
                  style={styles.closeModalButton}
                >
                  <Icon name="close" size={24} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Contact Options */}
              <View style={styles.contactOptionsContainer}>
                {/* Phone Option */}
                <TouchableOpacity
                  style={styles.contactOption}
                  onPress={() => {
                    Linking.openURL('tel:+911234567890');
                    setShowHelpModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconContainer}>
                    <Icon name="phone" size={24} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactTitle}>Call Us</Text>
                    <Text style={styles.contactSubtitle}>+91-1234567890</Text>
                  </View>
                  <Icon name="arrow-right" size={20} color="#CCCCCC" strokeWidth={2} />
                </TouchableOpacity>

                {/* Email Option */}
                <TouchableOpacity
                  style={styles.contactOption}
                  onPress={() => {
                    Linking.openURL('mailto:support@opilex.com');
                    setShowHelpModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconContainer}>
                    <Icon name="info" size={24} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactTitle}>Email Us</Text>
                    <Text style={styles.contactSubtitle}>support@opilex.com</Text>
                  </View>
                  <Icon name="arrow-right" size={20} color="#CCCCCC" strokeWidth={2} />
                </TouchableOpacity>

                {/* Live Chat Option */}
                <TouchableOpacity
                  style={[styles.contactOption, styles.chatOption]}
                  onPress={() => {
                    Alert.alert('Live Chat', 'Live chat feature coming soon!');
                    setShowHelpModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.contactIconContainer, styles.chatIconContainer]}>
                    <Icon name="support" size={24} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactTitle}>Live Chat</Text>
                    <Text style={styles.contactSubtitle}>Available 24/7</Text>
                  </View>
                  <View style={styles.liveIndicator}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={[styles.modalFooterText, globalTextStyles.caption]}>
                  We're here to help you 24/7
                </Text>
              </View>
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
    marginBottom: 10,
  },
  logoImage: {
    width: 280,
    height: 200,
  },
  welcomeMessage: {
    fontSize: 26,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: -40,
  },
  // Card container takes reduced height
  cardContainer: {
    flex: 2.2,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  loginCard: {
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
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 50,
  },
  countryPrefix: {
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 12,
  },
  inputSeparator: {
    width: 1,
    height: 25,
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  errorMessage: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  loginButton: {
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  linkText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Help & Support Link - Inside Card Bottom
  helpSupportContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  helpSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  helpSupportText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 14,
    fontWeight: '300',
    marginLeft: 8,
    color: '#CCCCCC',
  },
  // Help & Support Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactOptionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  chatOption: {
    borderColor: '#FF9800',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 14,
    fontWeight: '300',
    color: '#CCCCCC',
  },
  liveIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalFooter: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 15,
  },
  modalFooterText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
});

export default LoginScreen;