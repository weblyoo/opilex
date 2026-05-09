import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import { globalTextStyles } from '../styles/globalStyles';
import { fonts } from '../config/fonts';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

type RegistrationTypeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RegistrationType'>;

interface Props {
  navigation: RegistrationTypeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const RegistrationTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);

  const handleElectricianPress = async () => {
    setSelectedOption('electrician');
    console.log('💾 [REGISTRATION-TYPE] Register as Electrician');
    
    if (user?.id) {
      try {
        const normalizedUserType = 'electrician';
        console.log('💾 [REGISTRATION-TYPE] Saving userType to Firestore:', {
          userType: normalizedUserType,
          userId: user.id,
        });
        
        // Save userType to Firestore immediately
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
        
        console.log('✅ [REGISTRATION-TYPE] UserType saved successfully:', normalizedUserType);
      } catch (error) {
        console.error('❌ [REGISTRATION-TYPE] Error saving userType:', error);
      }
    }
    
    // Navigate to KYC screen for Aadhar verification
    setTimeout(() => {
      navigation.navigate('KYC');
    }, 300);
  };

  const handleDealerPress = async () => {
    setSelectedOption('dealer');
    console.log('💾 [REGISTRATION-TYPE] Register as Dealer');
    
    if (user?.id) {
      try {
        const normalizedUserType = 'dealer';
        console.log('💾 [REGISTRATION-TYPE] Saving userType to Firestore:', {
          userType: normalizedUserType,
          userId: user.id,
        });
        
        // Save userType to Firestore immediately
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
        
        console.log('✅ [REGISTRATION-TYPE] UserType saved successfully:', normalizedUserType);
      } catch (error) {
        console.error('❌ [REGISTRATION-TYPE] Error saving userType:', error);
      }
    }
    
    // Navigate to GST verification screen
    setTimeout(() => {
      navigation.navigate('GSTVerification');
    }, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ['#000000', '#0d0d0d', '#000000'] : ['#f8f9fa', '#ffffff', '#f8f9fa']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header Section with Logo */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo-dark.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <Text style={[styles.helloText, globalTextStyles.h1, { color: theme.colors.text }]}>Welcome!</Text>
          <Text style={[styles.subtitle, globalTextStyles.subtitle, { color: theme.colors.accent }]}>
            Choose your registration type to get started
          </Text>
        </View>

        {/* Registration Options - Modern Cards */}
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            {/* Electrician Option */}
            <View style={styles.optionWrapper}>
              <TouchableOpacity
                style={[
                  styles.optionCard, 
                  { 
                    backgroundColor: selectedOption === 'electrician' ? '#000000' : '#FFFFFF',
                    borderColor: selectedOption === 'electrician' ? '#000000' : '#000000',
                    shadowColor: '#000000',
                    transform: [{ scale: selectedOption === 'electrician' ? 1.05 : 1 }],
                  }
                ]}
                onPress={handleElectricianPress}
                activeOpacity={0.7}
              >
                <Image 
                  source={require('../../assets/electrician.png')} 
                  style={{ 
                    width: 80, 
                    height: 80,
                    tintColor: selectedOption === 'electrician' ? '#FFFFFF' : '#000000'
                  }}
                  resizeMode="contain"
                />
                {selectedOption === 'electrician' && (
                  <View style={[styles.checkmark, { backgroundColor: '#FFFFFF' }]}>
                    <Icon name="check" size={16} color="#000000" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[styles.optionTitle, globalTextStyles.button, { 
                color: selectedOption === 'electrician' ? '#000000' : '#000000',
                fontWeight: selectedOption === 'electrician' ? 'bold' : '600',
              }]}>
                REGISTER AS A{'\n'}ELECTRICIAN
              </Text>
            </View>

            {/* Dealer Option */}
            <View style={styles.optionWrapper}>
              <TouchableOpacity
                style={[
                  styles.optionCard, 
                  { 
                    backgroundColor: selectedOption === 'dealer' ? '#000000' : '#FFFFFF',
                    borderColor: selectedOption === 'dealer' ? '#000000' : '#000000',
                    shadowColor: '#000000',
                    transform: [{ scale: selectedOption === 'dealer' ? 1.05 : 1 }],
                  }
                ]}
                onPress={handleDealerPress}
                activeOpacity={0.7}
              >
                <Image 
                  source={require('../../assets/retailer.png')} 
                  style={{ 
                    width: 80, 
                    height: 80,
                    tintColor: selectedOption === 'dealer' ? '#FFFFFF' : '#000000'
                  }}
                  resizeMode="contain"
                />
                {selectedOption === 'dealer' && (
                  <View style={[styles.checkmark, { backgroundColor: '#FFFFFF' }]}>
                    <Icon name="check" size={16} color="#000000" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[styles.optionTitle, globalTextStyles.button, { 
                color: selectedOption === 'dealer' ? '#000000' : '#000000',
                fontWeight: selectedOption === 'dealer' ? 'bold' : '600',
              }]}>
                REGISTER AS A{'\n'}DEALER
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  // Header Section
  headerSection: {
    flex: 0.8,
    paddingTop: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 280,
    height: 200,
  },
  helloText: {
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'Ubuntu-Light',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 25,
    opacity: 0.8,
  },
  // Options Container
  optionsContainer: {
    flex: 1.2,
    paddingHorizontal: 25,
    paddingBottom: 50,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
  },
  optionWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
  optionCard: {
    width: 140,
    height: 140,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  optionTitle: {
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    lineHeight: 20,
  },
});

export default RegistrationTypeScreen;





