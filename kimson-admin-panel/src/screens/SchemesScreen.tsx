import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Icon from '../components/Icon';

const { width } = Dimensions.get('window');

type SchemesNavigationProp = StackNavigationProp<RootStackParamList, 'Schemes'>;

interface Props {
  navigation: SchemesNavigationProp;
}

interface Scheme {
  id: string;
  title: string;
  description: string;
  points: number;
  validUntil: string;
  category: 'premium' | 'standard' | 'basic';
}

const SchemesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const schemes: Scheme[] = []; // Empty for now to show empty state
  const rewardPoints = user?.rewardPoints || 0;
  const eligibleSchemes = 0;
  const totalSchemes = 0;

  const handleSchemePress = (scheme: Scheme) => {
    Alert.alert(
      scheme.title,
      `${scheme.description}\n\nReward: ${scheme.points} points\nValid until: ${scheme.validUntil}\n\nTap "Participate" to join this scheme.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Participate', 
          onPress: () => Alert.alert('Success', 'You have joined this scheme! Start earning points.')
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    return theme.colors.text;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'premium': return 'star';
      case 'standard': return 'schemes';
      case 'basic': return 'gift-box';
      default: return 'gift-box';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Schemes"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={[
          styles.headerSection,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={[
            styles.headerIconContainer,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
            }
          ]}>
            <Icon name="gift-box" size={48} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
            Reward Schemes
          </Text>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          {/* Reward Points Card */}
          <View style={[
            styles.statCard,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            <View style={styles.statCardHeader}>
              <Text style={[styles.statCardLabel, { color: theme.colors.accent }]}>
                Reward Points
              </Text>
              <View style={[
                styles.statIconCircle,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                }
              ]}>
                <Icon name="wallet" size={18} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: theme.colors.text }]}>
              {rewardPoints}
            </Text>
          </View>

          {/* Eligible Schemes Card */}
          <View style={[
            styles.statCard,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            <View style={styles.statCardHeader}>
              <Text style={[styles.statCardLabel, { color: theme.colors.accent }]}>
                Eligible Schemes
              </Text>
              <View style={[
                styles.statIconCircle,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                }
              ]}>
                <Icon name="gift-box" size={18} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
            </View>
            <Text style={[styles.statCardValue, { color: theme.colors.text }]}>
              {eligibleSchemes}/{totalSchemes}
            </Text>
          </View>
        </View>

        {/* Empty State or Schemes List */}
        {schemes.length === 0 ? (
          <View style={[
            styles.emptyStateContainer,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            <View style={styles.emptyIconContainer}>
              <View style={[
                styles.emptyIconCircle,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="gift-box" size={64} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
            </View>
            
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Active Schemes
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.accent }]}>
              Keep scanning products to participate in exciting reward schemes!
            </Text>

            <TouchableOpacity
              style={[
                styles.scanButton,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                }
              ]}
              onPress={() => navigation.navigate('WireAuthentication')}
              activeOpacity={0.8}
            >
              <Icon name="scan" size={22} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              <Text style={[
                styles.scanButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                Start Scanning
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.schemesList}>
            {schemes.map((scheme) => (
              <TouchableOpacity
                key={scheme.id}
                style={[
                  styles.schemeCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleSchemePress(scheme)}
                activeOpacity={0.8}
              >
                <View style={styles.schemeHeader}>
                  <View style={[
                    styles.schemeIconContainer,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Icon 
                      name={getCategoryIcon(scheme.category)} 
                      size={24} 
                      color={isDark ? '#000000' : '#FFFFFF'} 
                      strokeWidth={2.5} 
                    />
                  </View>
                  <View style={styles.schemeInfo}>
                    <Text style={[styles.schemeTitle, { color: theme.colors.text }]}>
                      {scheme.title}
                    </Text>
                    <Text style={[styles.schemeCategory, { color: theme.colors.accent }]}>
                      {scheme.category.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[
                    styles.pointsBadge,
                    {
                      backgroundColor: isDark ? '#000000' : '#FFFFFF',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Text style={[styles.pointsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      +{scheme.points}
                    </Text>
                    <Text style={[styles.pointsLabel, { color: theme.colors.accent }]}>
                      pts
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.schemeDescription, { color: theme.colors.accent }]}>
                  {scheme.description}
                </Text>
                
                <View style={styles.schemeFooter}>
                  <Text style={[styles.validUntil, { color: theme.colors.accent }]}>
                    Valid until: {scheme.validUntil}
                  </Text>
                  <View style={{ transform: [{ rotate: '180deg' }] }}>
                    <Icon 
                      name="arrow-left" 
                      size={18} 
                      color={theme.colors.iconColor} 
                      strokeWidth={2.5} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  // Header Section
  headerSection: {
    borderRadius: 28,
    padding: 32,
    marginBottom: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  headerIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  mainTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardLabel: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statCardValue: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    padding: 48,
    borderRadius: 28,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  emptyIconContainer: {
    marginBottom: 32,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  emptyTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    gap: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  scanButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  // Schemes List
  schemesList: {
    gap: 16,
  },
  schemeCard: {
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
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  schemeIconContainer: {
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
  schemeInfo: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  schemeCategory: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  pointsBadge: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  pointsText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  pointsLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  schemeDescription: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  schemeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  validUntil: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.7,
  },
});

export default SchemesScreen;
