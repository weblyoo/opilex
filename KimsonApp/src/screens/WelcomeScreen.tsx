import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import { globalTextStyles } from '../styles/globalStyles';
import { fonts } from '../config/fonts';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  const handleNext = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section with Logo */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo-dark.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Banner Image */}
          <View style={styles.bannerContainer}>
            <Image 
              source={require('../../assets/welcomebanner.png')}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Description Text */}
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
                An exclusive program to recognize your contribution as our valued partner
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* CTA Button - Fixed at Bottom with Safe Spacing */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: theme.colors.text }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.getStartedButtonText, globalTextStyles.button, { color: theme.colors.background }]}>
              GET STARTED
            </Text>
            <Icon 
              name="arrow-right" 
              size={20} 
              color={theme.colors.background} 
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  // Header Section
  headerSection: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  logoImage: {
    width: 280,
    height: 200,
  },
  // Banner Section
  bannerContainer: {
    width: '90%',
    height: 250,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  // Content Section
  contentSection: {
    paddingHorizontal: 30,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  descriptionSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  descriptionText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 34,
    fontWeight: '300',
    paddingHorizontal: 10,
  },
  // Button Container - Fixed at Bottom with Safe Spacing
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 80,
    marginBottom: 80,
    backgroundColor: 'transparent',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    width: '85%',
  },
  getStartedButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 18,
    fontWeight: '900',
    marginRight: 10,
    letterSpacing: 1,
  },
});

export default WelcomeScreen;




