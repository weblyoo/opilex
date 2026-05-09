import React, { useState, useRef } from 'react';
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
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { globalTextStyles } from '../styles/globalStyles';
import { fonts } from '../config/fonts';
import { INDIAN_STATES } from '../constants/states';

type RegistrationDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'RegistrationDetails'>;
type RegistrationDetailsRouteProp = RouteProp<RootStackParamList, 'RegistrationDetails'>;

interface Props {
  navigation: RegistrationDetailsNavigationProp;
  route: RegistrationDetailsRouteProp;
}

const { width, height } = Dimensions.get('window');

const RegistrationDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userType } = route.params;
  const { theme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  
  // Initialize with user data if available
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber?.replace('+91', '') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [referralCode, setReferralCode] = useState(user?.referralCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showStatePicker, setShowStatePicker] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Get the display name based on user type
  const getUserTypeDisplay = () => {
    return userType === 'electrician' ? 'Electrician' : 'Dealer';
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePincode = (pincode: string): boolean => {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
  };

  const handleContinue = async () => {
    const newErrors: { [key: string]: string } = {};

    // Validate all fields
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!validatePincode(pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration data
      // Note: Firestore doesn't allow undefined values, so we only include referralCode if it has a value
      // Ensure userType is normalized (lowercase) for consistency
      const normalizedUserType = userType ? userType.toLowerCase().trim() : userType;
      
      console.log('💾 Saving registration data:', {
        userType: userType,
        normalizedUserType: normalizedUserType,
        userId: user.id,
      });
      
      const registrationData: any = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        userType: normalizedUserType, // Use normalized userType
        registrationCompleted: true,
        updatedAt: serverTimestamp(),
      };

      // Only include referralCode if it has a value (Firestore doesn't allow undefined)
      if (referralCode.trim()) {
        registrationData.referralCode = referralCode.trim();
      }

      // Update user in Firestore - CRITICAL: Ensure userType is saved correctly
      const firestoreUpdateData = {
        ...registrationData,
        // Preserve existing fields
        id: user.id,
        kycVerified: user.kycVerified || false,
        language: user.language || 'en',
        rewardPoints: user.rewardPoints || 0,
        createdAt: user.createdAt instanceof Date ? user.createdAt : serverTimestamp(),
        // CRITICAL: Explicitly set userType to ensure it's saved correctly
        userType: normalizedUserType,
      };
      
      console.log('💾 [REGISTRATION] Saving to Firestore with userType:', normalizedUserType);
      await setDoc(
        doc(db, 'users', user.id),
        firestoreUpdateData,
        { merge: true }
      );
      console.log('✅ [REGISTRATION] Firestore update completed');

      // Update local user profile - CRITICAL: Ensure userType is included
      console.log('✅ Registration data saved to Firestore, updating local profile...');
      await updateUserProfile({
        ...registrationData,
        userType: normalizedUserType, // Explicitly include userType
        createdAt: user.createdAt,
      });
      console.log('✅ User profile updated with userType:', normalizedUserType);
      
      // Force refresh user data from Firestore to ensure consistency
      console.log('🔄 [REGISTRATION] Refreshing user data from Firestore...');
      const { getDoc } = await import('firebase/firestore');
      const userDocRef = doc(db, 'users', user.id);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const latestUserData = userDocSnapshot.data();
        console.log('✅ [REGISTRATION] Verified userType in Firestore:', latestUserData.userType);
      }

      setIsLoading(false);

      // Navigate to KYC screen
      navigation.navigate('KYC');
    } catch (error: any) {
      setIsLoading(false);
      console.error('Registration details error:', error);
      Alert.alert('Error', error.message || 'Failed to save registration details. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Section - Fixed */}
          <View style={styles.headerSection}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo-dark.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            
            <Text style={[styles.registerText, globalTextStyles.h1, { color: theme.colors.text }]}>{getUserTypeDisplay()}</Text>
            <Text style={[styles.instructionMessage, globalTextStyles.subtitle, { color: theme.colors.accent }]}>
              Fill in your details to continue
            </Text>
          </View>

          {/* Registration Card - Scrollable */}
          <View style={styles.cardContainer}>
            <View style={[styles.registrationCard, { backgroundColor: '#000000' }]}>
              <ScrollView 
                ref={scrollViewRef}
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
              <View style={styles.formSection}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Icon name="user" size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>Full Name</Text>
                  </View>
                  <View style={[styles.inputContainer, { 
                    borderColor: errors.name ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#000000' 
                  }]}>
                    <TextInput
                      placeholder="Enter your full name"
                      placeholderTextColor="#666666"
                      value={name}
                      onChangeText={setName}
                      style={[styles.inputText, { color: '#FFFFFF' }]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.name && (
                    <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.name}</Text>
                  )}
                </View>

                {/* Phone Number Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Icon name="phone" size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>Phone Number</Text>
                  </View>
                  <View style={[styles.inputContainer, { 
                    borderColor: errors.phoneNumber ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#000000' 
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
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.phoneNumber && (
                    <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.phoneNumber}</Text>
                  )}
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Icon name="info" size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>Email Address</Text>
                  </View>
                  <View style={[styles.inputContainer, { 
                    borderColor: errors.email ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#000000' 
                  }]}>
                    <TextInput
                      placeholder="Enter your email"
                      placeholderTextColor="#666666"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[styles.inputText, { color: '#FFFFFF' }]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.email && (
                    <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.email}</Text>
                  )}
                </View>

                {/* Address Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Icon name="home" size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>Address</Text>
                  </View>
                  <View style={[styles.inputContainerMultiline, { 
                    borderColor: errors.address ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#000000' 
                  }]}>
                    <TextInput
                      placeholder="Enter your complete address"
                      placeholderTextColor="#666666"
                      value={address}
                      onChangeText={setAddress}
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[styles.inputTextMultiline, { color: '#FFFFFF' }]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.address && (
                    <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.address}</Text>
                  )}
                </View>

                {/* City Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Icon name="store-locator" size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>City</Text>
                  </View>
                  <View style={[styles.inputContainer, { 
                      borderColor: errors.city ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#000000' 
                  }]}>
                      <TextInput
                        placeholder="Enter your city"
                        placeholderTextColor="#666666"
                        value={city}
                        onChangeText={setCity}
                        style={[styles.inputText, { color: '#FFFFFF' }]}
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                  </View>
                  {errors.city && (
                    <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.city}</Text>
                  )}
                </View>

                {/* State and Pincode Row */}
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <View style={styles.labelRow}>
                      <Icon name="location" size={16} color="#FFFFFF" strokeWidth={2} />
                      <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>State</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowStatePicker(true)}
                      style={[styles.inputContainer, { 
                        borderColor: errors.state ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                        backgroundColor: '#000000',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }]}
                    >
                      <Icon name="chevron-down" size={18} color="#888888" strokeWidth={2} />
                      <Text style={[styles.inputText, { color: state ? '#FFFFFF' : '#666666', flex: 1, marginLeft: 8 }]}>
                        {state || 'Select state'}
                      </Text>
                    </TouchableOpacity>
                    {errors.state && (
                      <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.state}</Text>
                    )}
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <View style={styles.labelRow}>
                      <Icon name="location" size={16} color="#FFFFFF" strokeWidth={2} />
                      <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>Pincode</Text>
                    </View>
                    <View style={[styles.inputContainer, { 
                      borderColor: errors.pincode ? '#F44336' : 'rgba(51, 51, 51, 0.3)',
                      backgroundColor: '#000000' 
                    }]}>
                      <TextInput
                        placeholder="Pincode"
                        placeholderTextColor="#666666"
                        value={pincode}
                        onChangeText={setPincode}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={[styles.inputText, { color: '#FFFFFF' }]}
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                    {errors.pincode && (
                      <Text style={[styles.errorMessage, globalTextStyles.caption]}>{errors.pincode}</Text>
                    )}
                  </View>
                </View>

                {/* Referral Code Input (Optional) */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Icon name="gift-box" size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={[styles.inputLabel, globalTextStyles.label, { color: '#CCCCCC' }]}>Referral Code</Text>
                    <Text style={[styles.optionalLabel, { color: '#666666' }]}>(Optional)</Text>
                  </View>
                  <View style={[styles.inputContainer, { 
                    borderColor: 'rgba(51, 51, 51, 0.3)',
                    backgroundColor: '#000000' 
                  }]}>
                    <TextInput
                      placeholder="Enter referral code if you have one"
                      placeholderTextColor="#666666"
                      value={referralCode}
                      onChangeText={setReferralCode}
                      autoCapitalize="characters"
                      style={[styles.inputText, { color: '#FFFFFF' }]}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                  style={[styles.continueButton, { backgroundColor: '#000000', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }]}
                  onPress={handleContinue}
                  disabled={Boolean(isLoading)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.continueButtonText, globalTextStyles.button, { color: '#FFFFFF' }]}>
                    {isLoading ? 'Please wait...' : 'Continue to KYC'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* State dropdown modal */}
        <Modal
          visible={showStatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStatePicker(false)}
        >
          <View style={styles.stateModalOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowStatePicker(false)}>
              <View style={styles.stateModalBackdrop} />
            </TouchableWithoutFeedback>
            <View style={styles.stateModalContent}>
              <Text style={styles.stateModalTitle}>Select State</Text>
              <FlatList
                data={INDIAN_STATES}
                keyExtractor={(item) => item}
                style={styles.stateModalList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.stateModalItem, state === item && styles.stateModalItemSelected]}
                    onPress={() => {
                      setState(item);
                      setShowStatePicker(false);
                    }}
                  >
                    <Text style={[styles.stateModalItemText, state === item && styles.stateModalItemTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.stateModalClose}
                onPress={() => setShowStatePicker(false)}
              >
                <Text style={styles.stateModalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Header - Fixed at top
  headerSection: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
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
  registerText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionMessage: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 26,
  },
  // Card container - Scrollable
  cardContainer: {
    flex: 1,
  },
  registrationCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 60,
    flexGrow: 1,
  },
  formSection: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionalLabel: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 11,
    fontWeight: '300',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 14,
    fontWeight: '500',
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
  inputContainerMultiline: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
  },
  countryPrefix: {
    fontFamily: 'Ubuntu-Medium',
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
    fontFamily: 'Ubuntu-Light',
    flex: 1,
    fontSize: 16,
    fontWeight: '300',
    paddingVertical: 0,
  },
  inputTextMultiline: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 16,
    fontWeight: '300',
    minHeight: 60,
  },
  errorMessage: {
    fontFamily: 'Ubuntu-Light',
    color: '#F44336',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  continueButton: {
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  continueButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  stateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  stateModalBackdrop: {
    flex: 1,
  },
  stateModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
    paddingBottom: 24,
  },
  stateModalTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  stateModalList: {
    maxHeight: height * 0.45,
  },
  stateModalItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  stateModalItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  stateModalItemText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 16,
    color: '#CCCCCC',
  },
  stateModalItemTextSelected: {
    fontFamily: 'Ubuntu-Medium',
    color: '#FFFFFF',
  },
  stateModalClose: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  stateModalCloseText: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default RegistrationDetailsScreen;





