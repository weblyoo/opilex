import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type ReferAndEarnNavigationProp = StackNavigationProp<RootStackParamList, 'ReferAndEarn'>;

interface Props {
  navigation: ReferAndEarnNavigationProp;
}

const ReferAndEarnScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate referral code based on user ID
  const referralCode = `OPILEX${user?.id.substring(0, 6).toUpperCase() || 'DEMO123'}`;
  const referralLink = `https://opilex.app/refer/${referralCode}`;

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join OPILEX App and earn rewards! 🎁\n\nUse my referral code: ${referralCode}\n\nDownload now: ${referralLink}\n\nEarn points for every wire you authenticate!`,
        title: 'Join OPILEX App',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const benefits = [
    { icon: 'gift-box', title: '₹100 Bonus', desc: 'When your friend joins' },
    { icon: 'rewards', title: '10% Commission', desc: 'On their first scan' },
    { icon: 'wallet', title: 'Unlimited Referrals', desc: 'No limits on earnings' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Refer & Earn"
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
        {/* Referral Code Card */}
        <View style={[
          styles.referralCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.referralHeader}>
            <View style={[
              styles.referralIconContainer,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                borderColor: theme.colors.border,
              }
            ]}>
              <Icon name="gift-box" size={40} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            </View>
            <Text style={[styles.referralTitle, { color: theme.colors.text }]}>
              Your Referral Code
            </Text>
          </View>

          <View style={[
            styles.codeContainer,
            {
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              borderColor: theme.colors.border,
            }
          ]}>
            <Text style={[styles.codeText, { color: theme.colors.text }]}>
              {referralCode}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.copyButton,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                borderColor: theme.colors.border,
              }
            ]}
            onPress={handleCopyCode}
            activeOpacity={0.8}
          >
            <Icon name="scan" size={20} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            <Text style={[
              styles.copyButtonText,
              { color: isDark ? '#000000' : '#FFFFFF' }
            ]}>
              {copied ? 'Copied!' : 'Copy Code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Referral Benefits
          </Text>
          
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View 
                key={index}
                style={[
                  styles.benefitCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <View style={[
                  styles.benefitIcon,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <Icon name={benefit.icon as any} size={32} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                </View>
                <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                  {benefit.title}
                </Text>
                <Text style={[styles.benefitDesc, { color: theme.colors.accent }]}>
                  {benefit.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            How It Works
          </Text>
          
          <View style={styles.stepsList}>
            {[
              { step: '1', title: 'Share Your Code', desc: 'Send your referral code to friends' },
              { step: '2', title: 'Friend Joins', desc: 'They register using your code' },
              { step: '3', title: 'Earn Rewards', desc: 'Get points when they scan' },
            ].map((item, index) => (
              <View 
                key={index}
                style={[
                  styles.stepCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <View style={[
                  styles.stepNumber,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <Text style={[
                    styles.stepNumberText,
                    { color: isDark ? '#000000' : '#FFFFFF' }
                  ]}>
                    {item.step}
                  </Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.stepDesc, { color: theme.colors.accent }]}>
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Share Button */}
        <View style={styles.shareSection}>
          <TouchableOpacity
            style={[
              styles.shareButton,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                borderColor: theme.colors.border,
              }
            ]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Icon name="share" size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            <Text style={[
              styles.shareButtonText,
              { color: isDark ? '#000000' : '#FFFFFF' }
            ]}>
              Share with Friends
            </Text>
          </TouchableOpacity>
        </View>
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
  
  // Referral Card
  referralCard: {
    padding: 36,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  referralHeader: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 16,
  },
  referralIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  referralTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  codeContainer: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 24,
    minWidth: '85%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 18,
    gap: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Benefits Grid
  benefitsGrid: {
    gap: 18,
  },
  benefitCard: {
    padding: 28,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  benefitIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  benefitDesc: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    textAlign: 'center',
    letterSpacing: 0.2,
    opacity: 0.8,
  },

  // Steps List
  stepsList: {
    gap: 18,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    gap: 20,
  },
  stepNumber: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  stepNumberText: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  stepDesc: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    lineHeight: 20,
    letterSpacing: 0.2,
    opacity: 0.8,
  },

  // Share Section
  shareSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    gap: 12,
    width: '100%',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  shareButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ReferAndEarnScreen;
