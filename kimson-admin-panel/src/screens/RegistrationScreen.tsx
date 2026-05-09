import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import mockAuthService from '../services/mockAuth';
import { fonts } from '../config/fonts';
import { globalTextStyles } from '../styles/globalStyles';

type RegistrationNavigationProp = StackNavigationProp<RootStackParamList, 'Registration'>;

interface Props {
  navigation: RegistrationNavigationProp;
}

type UserType = 'electrician' | 'dealer';

const { width, height } = Dimensions.get('window');

const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, updateUserProfile } = useAuth();

  const handleNext = async () => {
    if (!selectedUserType || !user) return;
    
    setIsLoading(true);
    
    try {
      // Normalize userType before saving
      const normalizedUserType = selectedUserType.toLowerCase().trim() as 'electrician' | 'dealer';
      
      console.log('💾 [ADMIN-REGISTRATION] Saving userType to Firestore:', {
        selectedUserType,
        normalizedUserType,
        userId: user.id,
      });
      
      // Update user type in Firestore immediately (will be confirmed in RegistrationDetails)
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      
      await setDoc(
        doc(db, 'users', user.id),
        {
          userType: normalizedUserType,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      
      // Update local user profile
      await updateUserProfile({ userType: normalizedUserType });
      
      console.log('✅ [ADMIN-REGISTRATION] UserType saved successfully:', normalizedUserType);
      
      setIsLoading(false);
      
      // Navigate to Registration Details screen
      navigation.navigate('RegistrationDetails', { userType: normalizedUserType });
    } catch (error) {
      setIsLoading(false);
      console.error('❌ [ADMIN-REGISTRATION] Registration error:', error);
      Alert.alert('Error', 'Failed to save user type. Please try again.');
    }
  };

  const renderUserTypeOption = (
    type: UserType,
    title: string,
    description: string,
    iconName: string
  ) => (
    <TouchableOpacity
      key={type}
      style={[
        styles.userTypeOption,
        { 
          borderColor: selectedUserType === type ? theme.colors.text : theme.colors.border,
          backgroundColor: theme.colors.background
        }
      ]}
      onPress={() => setSelectedUserType(type)}
      activeOpacity={0.8}
    >
      <View style={styles.optionContent}>
        <View style={[
          styles.iconContainer,
          { 
            backgroundColor: selectedUserType === type ? theme.colors.text : theme.colors.surface,
            borderColor: selectedUserType === type ? theme.colors.text : theme.colors.border
          }
        ]}>
          <Icon 
            name={iconName}
            size={24}
            color={selectedUserType === type ? theme.colors.background : theme.colors.iconColor}
            strokeWidth={2}
          />
        </View>
        
        <View style={styles.textContent}>
          <Text style={[
            styles.optionTitle,
            { color: theme.colors.text }
          ]}>{title}</Text>
          <Text style={[
            styles.optionDescription,
            { color: theme.colors.accent }
          ]}>{description}</Text>
        </View>
        
        <View style={[
          styles.radioButton,
          { borderColor: selectedUserType === type ? theme.colors.text : theme.colors.border }
        ]}>
          {selectedUserType === type && (
            <View style={[styles.radioButtonInner, { backgroundColor: theme.colors.text }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
            
            <Text style={[styles.registerText, { color: theme.colors.text }]}>Register</Text>
            <Text style={[styles.instructionMessage, { color: theme.colors.accent }]}>
              Choose your account type to continue
            </Text>
          </View>

          {/* Registration Card - Takes remaining 3/4 of screen */}
          <View style={styles.cardContainer}>
            <View style={[styles.registrationCard, { backgroundColor: theme.colors.cardBackground }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Account Type</Text>
              </View>

              <ScrollView 
                style={styles.formSection}
                showsVerticalScrollIndicator={false}
              >
                {/* User Type Options */}
                <View style={styles.optionsContainer}>
                  {renderUserTypeOption(
                    'electrician',
                    'Electrician Professional',
                    'For contractors, installers & electrical professionals',
                    'settings'
                  )}
                  
                  {renderUserTypeOption(
                    'dealer',
                    'Dealer Partner',
                    'For distributors, dealers & electrical shops',
                    'store-locator'
                  )}
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                  style={[
                    styles.continueButton, 
                    { 
                      backgroundColor: selectedUserType ? theme.colors.text : theme.colors.surface,
                      opacity: selectedUserType ? 1 : 0.5
                    }
                  ]}
                  onPress={handleNext}
                  disabled={!selectedUserType || isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.continueButtonText, 
                    { color: selectedUserType ? theme.colors.background : theme.colors.accent }
                  ]}>
                    {isLoading ? 'Setting up...' : 'Continue Registration'}
                  </Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={[styles.footerText, { color: theme.colors.accent }]}>
                    You can change your account type later in settings
                  </Text>
                </View>
              </ScrollView>
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
    width: 350,
    height: 250,
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
  // Card container takes 3/4 of screen
  cardContainer: {
    flex: 3,
    paddingHorizontal: 20,
  },
  registrationCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 30,
    paddingBottom: 30,
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
  },
  formSection: {
    flex: 1,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  userTypeOption: {
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
  },
  textContent: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 13,
    lineHeight: 18,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  continueButton: {
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  continueButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: 10,
  },
  footerText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});

export default RegistrationScreen;
