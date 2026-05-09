import React, { useState, useRef, useEffect } from 'react';
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
  StatusBar,
  Modal,
  FlatList,
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
import Header from '../components/Header';
import { INDIAN_STATES } from '../constants/states';

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileNavigationProp;
}

const { width, height } = Dimensions.get('window');

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, updateUserProfile, signOut } = useAuth();
  
  // Initialize form fields from user data
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Populate form fields from user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      // Remove +91 prefix if present
      const phone = user.phoneNumber?.replace('+91', '').trim() || '';
      setPhoneNumber(phone);
      setEmail(user.email || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setState(user.state || '');
      setPincode(user.pincode || '');
    }
  }, [user]);

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

  const handleSaveProfile = async () => {
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
      // Prepare updated profile data
      const updatedProfileData = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: `+91${phoneNumber.trim()}`,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        updatedAt: serverTimestamp(),
      };

      // Prepare Firestore update data (only include referralCode if it exists)
      const firestoreUpdateData: any = {
        ...updatedProfileData,
        // Preserve existing fields
        id: user.id,
        userType: user.userType,
        kycVerified: user.kycVerified || false,
        language: user.language || 'en',
        rewardPoints: user.rewardPoints || 0,
        registrationCompleted: user.registrationCompleted || true,
        createdAt: user.createdAt instanceof Date ? user.createdAt : serverTimestamp(),
      };

      // Only include optional fields if they exist (Firestore doesn't allow undefined)
      if (user.kycVerificationId) {
        firestoreUpdateData.kycVerificationId = user.kycVerificationId;
      }
      if (user.referralCode) {
        firestoreUpdateData.referralCode = user.referralCode;
      }

      // Update user in Firestore
      await setDoc(
        doc(db, 'users', user.id),
        firestoreUpdateData,
        { merge: true }
      );

      // Update local user profile
      await updateUserProfile({
        ...updatedProfileData,
        createdAt: user.createdAt,
      });

      setIsLoading(false);
      
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header
        title="Profile"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Profile Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <View style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}>
                  <Icon 
                    name="user" 
                    size={48} 
                    color={isDark ? '#000000' : '#FFFFFF'} 
                    strokeWidth={2.5} 
                  />
                </View>
                <TouchableOpacity 
                  style={[
                    styles.editAvatarButton,
                    {
                      backgroundColor: isDark ? '#000000' : '#FFFFFF',
                      borderColor: isDark ? '#FFFFFF' : '#000000',
                    }
                  ]} 
                  activeOpacity={0.8}
                >
                  <Icon 
                    name="camera" 
                    size={18} 
                    color={isDark ? '#FFFFFF' : '#000000'} 
                    strokeWidth={2} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.name || 'User Name'}
              </Text>
              <Text style={[styles.userPhone, { color: theme.colors.accent }]}>
                {user?.phoneNumber || '+91 XXXXXXXXXX'}
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Full Name</Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDark ? '#000000' : '#F5F5F5',
                      borderColor: errors.name ? theme.colors.error : theme.colors.border,
                    }
                  ]}>
                    <Icon 
                      name="user" 
                      size={20} 
                      color={theme.colors.iconColor} 
                      strokeWidth={2} 
                    />
                    <TextInput
                      placeholder="Enter your full name"
                      placeholderTextColor={theme.colors.accent}
                      value={name}
                      onChangeText={setName}
                      style={[styles.inputText, { color: theme.colors.text }]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.name && (
                    <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
                      {errors.name}
                    </Text>
                  )}
                </View>

                {/* Phone Number Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Phone Number</Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDark ? '#000000' : '#F5F5F5',
                      borderColor: errors.phoneNumber ? theme.colors.error : theme.colors.border,
                    }
                  ]}>
                    <Text style={[styles.countryPrefix, { color: theme.colors.iconColor }]}>+91</Text>
                    <View style={[styles.inputSeparator, { backgroundColor: theme.colors.border }]} />
                    <Icon name="phone" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                    <TextInput
                      placeholder="Enter mobile number"
                      placeholderTextColor={theme.colors.accent}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={[styles.inputText, { color: theme.colors.text }]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.phoneNumber && (
                    <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
                      {errors.phoneNumber}
                    </Text>
                  )}
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Email Address</Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDark ? '#000000' : '#F5F5F5',
                      borderColor: errors.email ? theme.colors.error : theme.colors.border,
                    }
                  ]}>
                    <Icon name="info" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                    <TextInput
                      placeholder="Enter your email"
                      placeholderTextColor={theme.colors.accent}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[styles.inputText, { color: theme.colors.text }]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.email && (
                    <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
                      {errors.email}
                    </Text>
                  )}
                </View>

                {/* Address Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Address</Text>
                  <View style={[
                    styles.inputContainerMultiline,
                    {
                      backgroundColor: isDark ? '#000000' : '#F5F5F5',
                      borderColor: errors.address ? theme.colors.error : theme.colors.border,
                    }
                  ]}>
                    <View style={styles.multilineIcon}>
                      <Icon name="home" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                    </View>
                    <TextInput
                      placeholder="Enter your complete address"
                      placeholderTextColor={theme.colors.accent}
                      value={address}
                      onChangeText={setAddress}
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[styles.inputTextMultiline, { color: theme.colors.text }]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.address && (
                    <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
                      {errors.address}
                    </Text>
                  )}
                </View>

                {/* City Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>City</Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDark ? '#000000' : '#F5F5F5',
                      borderColor: errors.city ? theme.colors.error : theme.colors.border,
                    }
                  ]}>
                    <Icon name="store-locator" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                    <TextInput
                      placeholder="Enter your city"
                      placeholderTextColor={theme.colors.accent}
                      value={city}
                      onChangeText={setCity}
                      style={[styles.inputText, { color: theme.colors.text }]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                  </View>
                  {errors.city && (
                    <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
                      {errors.city}
                    </Text>
                  )}
                </View>

                {/* State and Pincode Row */}
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>State</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowStatePicker(true)}
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: isDark ? '#000000' : '#F5F5F5',
                          borderColor: errors.state ? theme.colors.error : theme.colors.border,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }
                      ]}
                    >
                      <Icon name="chevron-down" size={18} color={theme.colors.accent} strokeWidth={2} />
                      <Text style={[styles.inputText, { color: state ? theme.colors.text : theme.colors.accent, flex: 1, marginLeft: 8 }]}>
                        {state || 'Select state'}
                      </Text>
                    </TouchableOpacity>
                    {errors.state && (
                      <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
                        {errors.state}
                      </Text>
                    )}
                  </View>

                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Pincode</Text>
                    <View style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDark ? '#000000' : '#F5F5F5',
                        borderColor: errors.pincode ? theme.colors.error : theme.colors.border,
                      }
                    ]}>
                      <Icon name="location" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                      <TextInput
                        placeholder="Pincode"
                        placeholderTextColor={theme.colors.accent}
                        value={pincode}
                        onChangeText={setPincode}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={[styles.inputText, { color: theme.colors.text }]}
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    </View>
                    {errors.pincode && (
                      <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
                        {errors.pincode}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: isDark ? '#FFFFFF' : '#000000',
                    }
                  ]}
                  onPress={handleSaveProfile}
                  disabled={Boolean(isLoading)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.saveButtonText,
                    { color: isDark ? '#000000' : '#FFFFFF' }
                  ]}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                  style={[
                    styles.logoutButton,
                    {
                      backgroundColor: 'transparent',
                      borderColor: theme.colors.error || '#F44336',
                    }
                  ]}
                  onPress={handleLogoutPress}
                  activeOpacity={0.8}
                >
                  <Icon name="log-out" size={20} color={theme.colors.error || '#F44336'} strokeWidth={2} />
                  <Text style={[
                    styles.logoutButtonText,
                    { color: theme.colors.error || '#F44336' }
                  ]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

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
            <View style={[styles.stateModalContent, { backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5' }]}>
              <Text style={[styles.stateModalTitle, { color: theme.colors.text }]}>Select State</Text>
              <FlatList
                data={INDIAN_STATES}
                keyExtractor={(item) => item}
                style={styles.stateModalList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.stateModalItem,
                      state === item && [styles.stateModalItemSelected, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]
                    ]}
                    onPress={() => {
                      setState(item);
                      setShowStatePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.stateModalItemText,
                      { color: theme.colors.text },
                      state === item && styles.stateModalItemTextSelected
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={[styles.stateModalClose, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
                onPress={() => setShowStatePicker(false)}
              >
                <Text style={[styles.stateModalCloseText, { color: theme.colors.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Logout confirmation modal - same design as Schemes / Wire Auth result modals */}
        <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
          <View style={styles.logoutModalOverlay}>
            <View style={[styles.logoutModalContainer, { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderColor: isDark ? '#FFFFFF' : '#000000' }]}>
              <View style={[styles.logoutModalIconOuter, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>
                <View style={[styles.logoutModalIconInner, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
                  <Icon name="log-out" size={40} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                </View>
              </View>
              <Text style={[styles.logoutModalTitle, { color: theme.colors.text }]}>Logout?</Text>
              <Text style={[styles.logoutModalMessage, { color: theme.colors.accent }]}>Are you sure you want to logout?</Text>
              <View style={styles.logoutModalButtons}>
                <TouchableOpacity
                  style={[styles.logoutModalBtnCancel, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}
                  onPress={() => setShowLogoutModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.logoutModalBtnCancelText, { color: theme.colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logoutModalBtnLogout, { backgroundColor: theme.colors.error || '#C62828' }]}
                  onPress={handleLogoutConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logoutModalBtnLogoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userPhone: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  // Form Section
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 0,
    height: 60,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    gap: 14,
  },
  inputContainerMultiline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 110,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    gap: 14,
  },
  multilineIcon: {
    marginTop: 4,
  },
  countryPrefix: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginRight: 10,
  },
  inputSeparator: {
    width: 1.5,
    height: 26,
    marginRight: 10,
    opacity: 0.3,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    paddingVertical: 0,
  },
  inputTextMultiline: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    minHeight: 78,
    paddingTop: 0,
  },
  errorMessage: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    marginTop: 8,
    marginLeft: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    opacity: 0.9,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  saveButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 18,
    borderWidth: 2,
    marginTop: 16,
    marginBottom: 24,
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
    paddingBottom: 24,
  },
  stateModalTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  stateModalList: {
    maxHeight: height * 0.45,
  },
  stateModalItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  stateModalItemSelected: {},
  stateModalItemText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 16,
  },
  stateModalItemTextSelected: {
    fontFamily: 'Ubuntu-Medium',
  },
  stateModalClose: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  stateModalCloseText: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 16,
  },
  // Logout confirmation modal - same design as Schemes / Wire Auth result modals
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutModalContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
  },
  logoutModalIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 14,
  },
  logoutModalIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  logoutModalMessage: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutModalBtnCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  logoutModalBtnCancelText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
  },
  logoutModalBtnLogout: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalBtnLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;



