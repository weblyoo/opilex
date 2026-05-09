import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, LanguageOption } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import { globalTextStyles } from '../styles/globalStyles';

type LanguageSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'LanguageSelection'>;

interface Props {
  navigation: LanguageSelectionNavigationProp;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

const LanguageSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr' | 'gu'>('en');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const { getLanguage } = await import('../utils/storage');
        const savedLanguage = await getLanguage();
        setSelectedLanguage(savedLanguage);
      } catch (error) {
        console.error('Error loading saved language:', error);
      }
    };
    loadSavedLanguage();
  }, []);

  const handleNext = async () => {
    try {
      // Save the selected language to storage
      const { setLanguage: saveLanguage } = await import('../utils/storage');
      const { setLanguage: setI18nLanguage } = await import('../utils/i18n');
      
      await saveLanguage(selectedLanguage);
      setI18nLanguage(selectedLanguage);
      
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Error saving language:', error);
      // Navigate anyway even if save fails
      navigation.navigate('Welcome');
    }
  };

  const handleLanguageSelect = (languageCode: 'en' | 'hi' | 'mr' | 'gu') => {
    setSelectedLanguage(languageCode);
    setIsDropdownOpen(false);
  };

  const getSelectedLanguage = () => {
    return languages.find(lang => lang.code === selectedLanguage) || languages[0];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          
          <Text style={[styles.helloText, globalTextStyles.h1, { color: theme.colors.text }]}>Hello!</Text>
          <Text style={[styles.subtitle, globalTextStyles.subtitle, { color: theme.colors.accent }]}>
            Select your preferred language
          </Text>
        </View>

        {/* Language Selector - No Card Background */}
        <View style={styles.languageSelectorContainer}>
          <Text style={[styles.selectorLabel, globalTextStyles.label, { color: theme.colors.text }]}>
            Choose Language
          </Text>
          
          <TouchableOpacity
            style={[styles.modernDropdownButton, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border 
            }]}
            onPress={() => setIsDropdownOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.dropdownContent}>
              <View style={styles.languageInfo}>
                <View style={[styles.languageFlag, { backgroundColor: theme.colors.accent }]}>
                  <Text style={[styles.flagText, globalTextStyles.caption]}>
                    {getSelectedLanguage().code.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.languageDetails}>
                  <Text style={[styles.languageName, globalTextStyles.body, { color: theme.colors.text }]}>
                    {getSelectedLanguage().name}
                  </Text>
                  <Text style={[styles.languageNative, globalTextStyles.caption, { color: theme.colors.accent }]}>
                    {getSelectedLanguage().nativeName}
                  </Text>
                </View>
              </View>
              <View style={[styles.dropdownArrow, { backgroundColor: theme.colors.accent }]}>
                <Icon 
                  name="chevron-down" 
                  size={16} 
                  color={theme.colors.background} 
                  strokeWidth={2}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Next Button at Bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.colors.text }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
                <Text style={[styles.nextButtonText, { color: theme.colors.background }]}>
                  Next
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

      {/* Modern Language Selection Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Language
              </Text>
              <TouchableOpacity
                onPress={() => setIsDropdownOpen(false)}
                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              >
                <Icon name="globe" size={20} color={theme.colors.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.modernLanguageOption,
                    { borderBottomColor: theme.colors.border },
                    selectedLanguage === language.code && [styles.selectedLanguageOption, { backgroundColor: theme.colors.surface }]
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageOptionContent}>
                    <View style={[styles.optionFlag, { backgroundColor: theme.colors.accent }]}>
                      <Text style={styles.optionFlagText}>
                        {language.code.toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={styles.optionText}>
                      <Text style={[styles.optionName, { color: theme.colors.text }]}>
                        {language.name}
                      </Text>
                      <Text style={[styles.optionNative, { color: theme.colors.accent }]}>
                        {language.nativeName}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.optionRadio,
                      { borderColor: theme.colors.border },
                      selectedLanguage === language.code && [styles.optionRadioSelected, { borderColor: theme.colors.accent }]
                    ]}>
                      {selectedLanguage === language.code && (
                        <View style={[styles.optionRadioInner, { backgroundColor: theme.colors.accent }]} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 280,
    height: 200,
  },
  helloText: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400',
    marginBottom: 0,
  },
  // Language Selector - No Card
  languageSelectorContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  selectorLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modernDropdownButton: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  flagText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  languageDetails: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Button Container
  buttonContainer: {
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 10,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    width: '50%',
    alignSelf: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 25,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageList: {
    maxHeight: 400,
  },
  modernLanguageOption: {
    borderBottomWidth: 1,
    paddingHorizontal: 25,
  },
  selectedLanguageOption: {
    // Additional styling for selected option
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  optionFlag: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionFlagText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    marginRight: 16,
  },
  optionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionNative: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    // Additional styling for selected radio
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default LanguageSelectionScreen;
