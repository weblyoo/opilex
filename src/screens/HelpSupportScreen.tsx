import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { globalTextStyles } from '../styles/globalStyles';

type HelpSupportNavigationProp = StackNavigationProp<RootStackParamList, 'HelpSupport'>;

interface Props {
  navigation: HelpSupportNavigationProp;
}

const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Required Fields', 'Please fill in all fields to submit your request.');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    Alert.alert(
      'Request Submitted',
      'Thank you for contacting us! We will get back to you within 24-48 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
          },
        },
      ]
    );
  };

  const handleCall = () => {
    Linking.openURL('tel:+911234567890');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@kimson.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/911234567890');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.kimson.com');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Help & Support"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact Us
          </Text>
          
          <View style={styles.contactGrid}>
            {/* Phone */}
            <TouchableOpacity
              style={[
                styles.contactCard,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <View style={[
                styles.contactIconContainer,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="phone" size={28} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.contactLabel, { color: theme.colors.accent }]}>
                CALL US
              </Text>
              <Text style={[styles.contactValue, { color: theme.colors.text }]}>
                +91-1234567890
              </Text>
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              style={[
                styles.contactCard,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={handleEmail}
              activeOpacity={0.8}
            >
              <View style={[
                styles.contactIconContainer,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="mail" size={28} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.contactLabel, { color: theme.colors.accent }]}>
                EMAIL US
              </Text>
              <Text style={[styles.contactValue, { color: theme.colors.text }]}>
                support@kimson.com
              </Text>
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              style={[
                styles.contactCard,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={handleWhatsApp}
              activeOpacity={0.8}
            >
              <View style={[
                styles.contactIconContainer,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="support" size={28} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.contactLabel, { color: theme.colors.accent }]}>
                WHATSAPP
              </Text>
              <Text style={[styles.contactValue, { color: theme.colors.text }]}>
                Chat with us
              </Text>
            </TouchableOpacity>

            {/* Website */}
            <TouchableOpacity
              style={[
                styles.contactCard,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={handleWebsite}
              activeOpacity={0.8}
            >
              <View style={[
                styles.contactIconContainer,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="globe" size={28} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.contactLabel, { color: theme.colors.accent }]}>
                WEBSITE
              </Text>
              <Text style={[styles.contactValue, { color: theme.colors.text }]}>
                www.kimson.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Send us a Message
          </Text>
          
          <View style={[
            styles.formCard,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.accent }]}>
                Full Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#000000' : '#FFFFFF',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.accent}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.accent }]}>
                Email Address *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#000000' : '#FFFFFF',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }
                ]}
                placeholder="your.email@example.com"
                placeholderTextColor={theme.colors.accent}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Subject Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.accent }]}>
                Subject *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#000000' : '#FFFFFF',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }
                ]}
                placeholder="What is this regarding?"
                placeholderTextColor={theme.colors.accent}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            {/* Message Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.accent }]}>
                Message *
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? '#000000' : '#FFFFFF',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }
                ]}
                placeholder="Please describe your issue or question in detail..."
                placeholderTextColor={theme.colors.accent}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Icon name="send" size={22} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              <Text style={[
                styles.submitButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                Submit Request
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Help
          </Text>
          
          <View style={[
            styles.faqCard,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            <View style={styles.faqItem}>
              <Icon name="clock" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={[styles.faqText, { color: theme.colors.text }]}>
                Monday - Friday: 9:00 AM - 6:00 PM
              </Text>
            </View>
            <View style={[styles.faqDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.faqItem}>
              <Icon name="clock" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={[styles.faqText, { color: theme.colors.text }]}>
                Saturday: 9:00 AM - 2:00 PM
              </Text>
            </View>
            <View style={[styles.faqDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.faqItem}>
              <Icon name="clock" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={[styles.faqText, { color: theme.colors.text }]}>
                Response Time: Within 24-48 hours
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  contactCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  contactIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  formCard: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 12,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    minHeight: 140,
    letterSpacing: 0.2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 2,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  faqCard: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  faqDivider: {
    height: 1.5,
    width: '100%',
    opacity: 0.3,
    marginVertical: 4,
  },
  faqText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  bottomSpace: {
    height: 40,
  },
});

export default HelpSupportScreen;

