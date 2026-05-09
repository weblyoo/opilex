import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';

type SocialMediaNavigationProp = StackNavigationProp<RootStackParamList, 'SocialMedia'>;

interface Props {
  navigation: SocialMediaNavigationProp;
}

const SocialMediaScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);

  const socialPlatforms = [
    {
      id: '1',
      name: 'Facebook',
      description: 'Follow us for latest updates and product news',
      followers: '12.5K',
      url: 'https://facebook.com/kimsonindustries',
      color: '#1877F2',
      icon: 'social-media',
    },
    {
      id: '2',
      name: 'Instagram',
      description: 'Behind the scenes and product showcases',
      followers: '8.2K',
      url: 'https://instagram.com/kimsonindustries',
      color: '#E4405F',
      icon: 'social-media',
    },
    {
      id: '3',
      name: 'LinkedIn',
      description: 'Professional updates and industry insights',
      followers: '5.8K',
      url: 'https://linkedin.com/company/kimsonindustries',
      color: '#0A66C2',
      icon: 'social-media',
    },
    {
      id: '4',
      name: 'YouTube',
      description: 'Product tutorials and installation guides',
      followers: '15.3K',
      url: 'https://youtube.com/kimsonindustries',
      color: '#FF0000',
      icon: 'watch-tutorial',
    },
    {
      id: '5',
      name: 'Twitter',
      description: 'Quick updates and customer support',
      followers: '6.7K',
      url: 'https://twitter.com/kimsonindustries',
      color: '#1DA1F2',
      icon: 'social-media',
    },
  ];

  const communityFeatures = [
    {
      id: '1',
      title: 'Share Your Projects',
      description: 'Show off your electrical installations using Kimson products',
      action: 'Upload Photo',
    },
    {
      id: '2',
      title: 'Connect with Experts',
      description: 'Get advice from experienced electricians and engineers',
      action: 'Join Community',
    },
    {
      id: '3',
      title: 'Product Reviews',
      description: 'Read and write reviews for Kimson products',
      action: 'Write Review',
    },
    {
      id: '4',
      title: 'Training Videos',
      description: 'Access exclusive training content and tutorials',
      action: 'Watch Now',
    },
  ];

  const handleSocialPress = (platform: any) => {
    setSelectedPlatform(platform);
    setShowModal(true);
  };

  const handleOpenPlatform = () => {
    if (selectedPlatform) {
      setShowModal(false);
      Linking.openURL(selectedPlatform.url).catch(() => {
        Alert.alert('Error', 'Could not open the link');
      });
    }
  };

  const handleCommunityFeature = (feature: any) => {
    Alert.alert(
      feature.title,
      `${feature.description}\n\nThis feature is coming soon!`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Social Media"
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
        {/* Social Icons Card */}
        <View style={[
          styles.socialIconsCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.recommendRow}>
            <View style={[
              styles.atSymbolContainer,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}>
              <Icon name="social-media" size={28} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            </View>
            <Text style={[styles.recommendText, { color: theme.colors.text }]}>
              Follow us on social media
            </Text>
          </View>
            <View style={styles.socialIconsRow}>
              {socialPlatforms.map((platform) => (
                <TouchableOpacity
                  key={`icon-${platform.id}`}
                  style={[styles.modernIcon, { backgroundColor: platform.color }]}
                  onPress={() => handleSocialPress(platform)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modernIconText}>
                    {platform.name === 'Facebook' ? 'f' :
                     platform.name === 'Instagram' ? '📸' :
                     platform.name === 'LinkedIn' ? 'in' :
                     platform.name === 'YouTube' ? '▶' :
                     platform.name === 'Twitter' ? '𝕏' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Social Platforms */}
          <View style={styles.platformsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Follow Us</Text>
            
            {socialPlatforms.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleSocialPress(platform)}
                activeOpacity={0.8}
              >
                <View style={styles.platformHeader}>
                  <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                    <Text style={styles.platformEmoji}>
                      {platform.name === 'Facebook' ? 'f' :
                       platform.name === 'Instagram' ? '📸' :
                       platform.name === 'LinkedIn' ? 'in' :
                       platform.name === 'YouTube' ? '▶' :
                       platform.name === 'Twitter' ? '𝕏' : ''}
                    </Text>
                  </View>
                  <View style={styles.platformInfo}>
                    <Text style={[styles.platformName, { color: theme.colors.text }]}>{platform.name}</Text>
                    <Text style={[styles.platformDescription, { color: theme.colors.accent }]}>
                      {platform.description}
                    </Text>
                  </View>
                  <View style={styles.followersContainer}>
                    <Text style={[styles.followersCount, { color: theme.colors.text }]}>{platform.followers}</Text>
                    <Text style={[styles.followersLabel, { color: theme.colors.accent }]}>followers</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Community Features */}
          <View style={styles.communitySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Community Features</Text>
            
            {communityFeatures.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleCommunityFeature(feature)}
                activeOpacity={0.8}
              >
                <View style={styles.featureContent}>
                  <View style={[
                    styles.featureIcon,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Icon name="gift-box" size={20} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
                    <Text style={[styles.featureDescription, { color: theme.colors.accent }]}>
                      {feature.description}
                    </Text>
                  </View>
                  <TouchableOpacity style={[
                    styles.actionButton,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Text style={[
                      styles.actionButtonText,
                      { color: isDark ? '#000000' : '#FFFFFF' }
                    ]}>
                      {feature.action}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Engagement Stats */}
          <View style={[
            styles.statsCard,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Our Community</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>48K+</Text>
                <Text style={[styles.statLabel, { color: theme.colors.accent }]}>Total Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>1.2K+</Text>
                <Text style={[styles.statLabel, { color: theme.colors.accent }]}>Monthly Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>95%</Text>
                <Text style={[styles.statLabel, { color: theme.colors.accent }]}>Engagement Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>24/7</Text>
                <Text style={[styles.statLabel, { color: theme.colors.accent }]}>Support</Text>
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Stylish Platform Modal */}
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.platformModalContainer,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
                borderColor: theme.colors.border,
              }
            ]}>
              {/* Platform Icon */}
              {selectedPlatform && (
                <>
                  <View style={styles.modalIconContainer}>
                    <View style={[styles.modalPlatformIcon, { backgroundColor: selectedPlatform.color }]}>
                      <Text style={styles.modalIconText}>
                        {selectedPlatform.name === 'Facebook' ? 'f' :
                         selectedPlatform.name === 'Instagram' ? '📸' :
                         selectedPlatform.name === 'LinkedIn' ? 'in' :
                         selectedPlatform.name === 'YouTube' ? '▶' :
                         selectedPlatform.name === 'Twitter' ? '𝕏' : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Platform Name */}
                  <Text style={[styles.modalPlatformName, { color: theme.colors.text }]}>
                    {selectedPlatform.name}
                  </Text>
                  
                  {/* Followers Badge */}
                  <View style={[
                    styles.modalFollowersBadge,
                    {
                      backgroundColor: isDark ? '#000000' : '#F5F5F5',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Icon name="support" size={16} color={theme.colors.text} strokeWidth={2.5} />
                    <Text style={[styles.modalFollowersText, { color: theme.colors.text }]}>
                      {selectedPlatform.followers} followers
                    </Text>
                  </View>

                  {/* Description */}
                  <Text style={[styles.modalDescription, { color: theme.colors.accent }]}>
                    {selectedPlatform.description}
                  </Text>

                  {/* Buttons */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalOpenButton, { backgroundColor: selectedPlatform.color }]}
                      onPress={handleOpenPlatform}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalOpenButtonText}>Open {selectedPlatform.name}</Text>
                      <Icon name="arrow-right" size={18} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalCancelButton,
                        {
                          backgroundColor: isDark ? '#000000' : '#F5F5F5',
                          borderColor: theme.colors.border,
                        }
                      ]}
                      onPress={() => setShowModal(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.modalCancelButtonText, { color: theme.colors.text }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  socialIconsCard: {
    marginBottom: 32,
    padding: 32,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  atSymbolContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  recommendText: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  modernIcon: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  modernIconText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  platformsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  platformCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  platformEmoji: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  platformDescription: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Light',
    lineHeight: 18,
    fontWeight: '400',
  },
  followersContainer: {
    alignItems: 'center',
  },
  followersCount: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  followersLabel: {
    fontSize: 11,
    fontFamily: 'Ubuntu-Regular',
    fontWeight: '500',
  },
  communitySection: {
    marginBottom: 24,
  },
  featureCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Light',
    lineHeight: 17,
    fontWeight: '400',
  },
  actionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statsCard: {
    padding: 28,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Ubuntu-Regular',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Stylish Platform Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  platformModalContainer: {
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalPlatformIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  modalIconText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalPlatformName: {
    fontSize: 28,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  modalFollowersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 24,
    gap: 10,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  modalFollowersText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalDescription: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalOpenButton: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  modalOpenButtonText: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalCancelButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SocialMediaScreen;
