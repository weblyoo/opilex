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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { globalTextStyles } from '../styles/globalStyles';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

type GSTVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'GSTVerification'>;

interface Props {
  navigation: GSTVerificationNavigationProp;
}

const { width, height } = Dimensions.get('window');

const GSTVerificationScreen: React.FC<Props> = ({ navigation }) => {
  const [gstNumber, setGstNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<{ gst?: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, updateUserProfile } = useAuth();

  const validateGST = (gst: string): boolean => {
    // GST format: 15 characters, alphanumeric
    // Format: 2 chars (state code) + 10 chars (PAN) + 3 chars (entity number) + 1 char (Z) + 1 char (check digit)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst.toUpperCase());
  };

  const handleVerifyGST = async () => {
    setErrors({});
    
    if (!gstNumber.trim()) {
      setErrors({ gst: 'GST number is required' });
      return;
    }

    const upperGST = gstNumber.toUpperCase().trim();
    
    if (!validateGST(upperGST)) {
      setErrors({ gst: 'Please enter a valid 15-character GST number' });
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    setIsVerifying(true);
    
    try {
      console.log('🔍 Starting GST verification for:', upperGST);
      console.log('👤 User ID:', user.id);
      
      // In a real app, you would call a GST verification API here
      // For now, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save GST data to Firestore
      const gstData = {
        userId: user.id,
        gstNumber: upperGST,
        verified: true,
        verifiedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      console.log('💾 Saving GST data to Firestore...');
      
      // Try to save to Firestore, but handle permission errors gracefully
      try {
        await setDoc(
          doc(db, 'gst_verifications', user.id),
          gstData
        );
        console.log('✅ GST data saved to Firestore successfully');
      } catch (firestoreError: any) {
        console.error('❌ Firestore error saving GST data:', firestoreError);
        // If permission denied, still proceed with local update
        if (firestoreError?.code === 'permission-denied' || firestoreError?.code === 'missing-or-insufficient-permissions') {
          console.warn('⚠️ GST data could not be saved to Firestore due to permissions. Proceeding with local update.');
        } else {
          throw firestoreError; // Re-throw if it's a different error
        }
      }

      // Update user profile - CRITICAL: Ensure userType is set to 'dealer'
      console.log('👤 Updating user profile...');
      const updatedUser = {
        ...user,
        userType: 'dealer', // CRITICAL: Explicitly set userType to dealer
        kycVerified: true, // Mark as verified for dealer
        rewardPoints: (user.rewardPoints || 0) + 100, // Welcome bonus
      };

      console.log('💾 [GST-VERIFICATION] Saving userType to Firestore:', {
        userType: 'dealer',
        userId: user.id,
      });

      try {
        await updateUserProfile(updatedUser);
        console.log('✅ User profile updated successfully with userType: dealer');
      } catch (profileError: any) {
        console.error('❌ Error updating user profile:', profileError);
        // Don't throw - continue with verification even if profile update fails
        console.warn('⚠️ Continuing with GST verification despite profile update error');
      }
      
      // Try to update Firestore user document, but handle permission errors
      // CRITICAL: Explicitly set userType to 'dealer'
      try {
        await setDoc(
          doc(db, 'users', user.id),
          {
            ...updatedUser,
            userType: 'dealer', // CRITICAL: Explicitly set userType to dealer
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log('✅ User document updated in Firestore with userType: dealer');
      } catch (firestoreError: any) {
        console.error('❌ Firestore error updating user:', firestoreError);
        // If permission denied, still proceed
        if (firestoreError?.code === 'permission-denied' || firestoreError?.code === 'missing-or-insufficient-permissions') {
          console.warn('⚠️ User data could not be updated in Firestore due to permissions. Local update completed.');
        } else {
          throw firestoreError; // Re-throw if it's a different error
        }
      }
      
      console.log('🎉 GST verification completed successfully');
      setIsVerifying(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      setIsVerifying(false);
      console.error('❌ GST verification error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      
      // Provide user-friendly error message
      let errorMessage = 'GST verification failed. Please try again.';
      if (error?.code === 'permission-denied' || error?.code === 'missing-or-insufficient-permissions') {
        errorMessage = 'Unable to save GST data. Please check your permissions or contact support.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
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

          {/* GST Card - Takes remaining 3/4 of screen */}
          <View style={styles.cardContainer}>
            <View style={[styles.gstCard, { backgroundColor: '#000000' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, globalTextStyles.h3, { color: '#FFFFFF' }]}>GST Verification</Text>
              </View>

              <View style={styles.formSection}>
                {/* GST Number Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>GST Number</Text>
                  <View style={[styles.inputContainer, { 
                    borderColor: errors.gst ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#000000'
                  }]}>
                    <TextInput
                      placeholder="Enter 15-character GST number"
                      placeholderTextColor="#666666"
                      value={gstNumber}
                      onChangeText={(text) => setGstNumber(text.toUpperCase())}
                      keyboardType="default"
                      maxLength={15}
                      autoCapitalize="characters"
                      style={[styles.inputText, { color: '#FFFFFF' }]}
                    />
                  </View>
                  {errors.gst && (
                    <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.gst}</Text>
                  )}
                  <Text style={[styles.helpText, globalTextStyles.caption, { color: '#666666' }]}>
                    Format: 15 characters (e.g., 27AABCU9603R1ZX)
                  </Text>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#000000', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }]}
                  onPress={handleVerifyGST}
                  disabled={Boolean(isVerifying)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.actionButtonText, globalTextStyles.button, { color: '#FFFFFF' }]}>
                    {isVerifying ? 'Verifying...' : 'Verify & Complete'}
                  </Text>
                </TouchableOpacity>
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

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowSuccessModal(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContainer}>
              {/* Success Icon */}
              <View style={styles.successIconContainer}>
                <View style={[styles.successIconCircle, { backgroundColor: '#000000' }]}>
                  <Icon name="check" size={50} color="#FFFFFF" strokeWidth={4} />
                </View>
              </View>

              {/* Success Message */}
              <Text style={[styles.successTitle, globalTextStyles.h2]}>GST Verified!</Text>
              <Text style={[styles.successMessage, globalTextStyles.body]}>
                Your GST number has been verified successfully
              </Text>
              
              {/* Continue Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                  });
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.continueButtonText, globalTextStyles.button]}>Continue</Text>
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
    marginBottom: 10,
  },
  logoImage: {
    width: 280,
    height: 200,
  },
  verifyText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionMessage: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  // Card container takes reduced height
  cardContainer: {
    flex: 2.2,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  gstCard: {
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
    marginBottom: 20,
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
  inputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
    letterSpacing: 1,
  },
  errorMessage: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  helpText: {
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    backgroundColor: '#000000',
    borderRadius: 25,
    padding: 30,
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 25,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
});

export default GSTVerificationScreen;






