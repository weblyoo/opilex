import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';

type LeadershipBoardNavigationProp = StackNavigationProp<RootStackParamList, 'LeadershipBoard'>;

interface Props {
  navigation: LeadershipBoardNavigationProp;
}

interface Leader {
  id: string;
  name: string;
  points: number;
  rank: number;
  location: string;
  verifications: number;
  badge: 'platinum' | 'gold' | 'silver' | 'bronze';
  avatar: string;
}

const LeadershipBoardScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const currentUser = {
    rank: 47,
    name: 'You',
    points: 1250,
    verifications: 25,
  };

  const topLeaders: Leader[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      points: 15420,
      rank: 1,
      location: 'Delhi',
      verifications: 308,
      badge: 'platinum',
      avatar: 'RK',
    },
    {
      id: '2',
      name: 'Amit Sharma',
      points: 12350,
      rank: 2,
      location: 'Mumbai',
      verifications: 247,
      badge: 'gold',
      avatar: 'AS',
    },
    {
      id: '3',
      name: 'Priya Singh',
      points: 10875,
      rank: 3,
      location: 'Bangalore',
      verifications: 217,
      badge: 'gold',
      avatar: 'PS',
    },
    {
      id: '4',
      name: 'Mohammed Ali',
      points: 9640,
      rank: 4,
      location: 'Chennai',
      verifications: 192,
      badge: 'silver',
      avatar: 'MA',
    },
    {
      id: '5',
      name: 'Sunita Patel',
      points: 8890,
      rank: 5,
      location: 'Pune',
      verifications: 178,
      badge: 'silver',
      avatar: 'SP',
    },
  ];

  const periods = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
    { id: 'all-time', label: 'All Time' },
  ];

  const getBadgeColor = (badge: string) => {
    return theme.colors.text;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'star';
      case 2: return 'star';
      case 3: return 'star';
      default: return 'leadership-board';
    }
  };

  const getRankColor = (rank: number) => {
    return theme.colors.text;
  };

  const handleLeaderPress = (leader: Leader) => {
    Alert.alert(
      `${leader.name} - Rank #${leader.rank}`,
      `Location: ${leader.location}\nTotal Points: ${leader.points.toLocaleString()}\nVerifications: ${leader.verifications}\nBadge: ${leader.badge.toUpperCase()}\n\nGreat performance! Keep up the excellent work.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    Alert.alert('Period Updated', `Showing ${period} leaderboard`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Leadership Board"
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
        {/* Header Card */}
        <View style={[
          styles.headerCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={[
            styles.headerIcon,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
              borderColor: theme.colors.border,
            }
          ]}>
            <Icon name="leadership-board" size={36} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Leadership Board
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
            Top performers in product verification and rewards
          </Text>
        </View>

        {/* Your Rank Card */}
        <View style={[
          styles.userRankCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.userRankHeader}>
            <Text style={[styles.userRankTitle, { color: theme.colors.text }]}>
              Your Current Rank
            </Text>
            <View style={[
              styles.userRankBadge,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                borderColor: theme.colors.border,
              }
            ]}>
              <Text style={[
                styles.userRankNumber,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                #{currentUser.rank}
              </Text>
            </View>
          </View>
          <View style={[styles.userStats, { borderTopColor: theme.colors.border }]}>
            <View style={styles.userStatItem}>
              <Text style={[styles.userStatValue, { color: theme.colors.text }]}>
                {currentUser.points.toLocaleString()}
              </Text>
              <Text style={[styles.userStatLabel, { color: theme.colors.accent }]}>Points</Text>
            </View>
            <View style={[styles.userStatDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.userStatItem}>
              <Text style={[styles.userStatValue, { color: theme.colors.text }]}>
                {currentUser.verifications}
              </Text>
              <Text style={[styles.userStatLabel, { color: theme.colors.accent }]}>Verifications</Text>
            </View>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.periodFilter}>
          <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Time Period</Text>
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false} 
            style={[
              styles.periodScroll,
              {
                backgroundColor: isDark ? '#000000' : '#F5F5F5',
                borderColor: theme.colors.border,
              }
            ]}
            contentContainerStyle={styles.periodScrollContent}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodButton,
                  {
                    borderColor: theme.colors.border,
                  },
                  selectedPeriod === period.id && {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#FFFFFF' : '#000000',
                  },
                  selectedPeriod !== period.id && {
                    backgroundColor: 'transparent',
                  }
                ]}
                onPress={() => handlePeriodChange(period.id)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.periodButtonText,
                  {
                    color: selectedPeriod === period.id
                      ? (isDark ? '#000000' : '#FFFFFF')
                      : theme.colors.text,
                  }
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top 3 Podium */}
        <View style={[
          styles.podiumCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <Text style={[styles.podiumTitle, { color: theme.colors.text }]}>Top Performers</Text>
          <View style={styles.podiumContainer}>
            {topLeaders.slice(0, 3).map((leader, index) => (
              <TouchableOpacity
                key={leader.id}
                style={[styles.podiumItem, { flex: index === 0 ? 1.2 : 1 }]}
                onPress={() => handleLeaderPress(leader)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.podiumRank,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <Icon 
                    name={getRankIcon(leader.rank)} 
                    size={20} 
                    color={isDark ? '#000000' : '#FFFFFF'} 
                    strokeWidth={2.5} 
                  />
                </View>
                <View style={[
                  styles.podiumAvatar,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <Text style={[
                    styles.podiumAvatarText,
                    { color: isDark ? '#000000' : '#FFFFFF' }
                  ]}>
                    {leader.avatar}
                  </Text>
                </View>
                <Text style={[styles.podiumName, { color: theme.colors.text }]}>
                  {leader.name}
                </Text>
                <Text style={[styles.podiumPoints, { color: theme.colors.accent }]}>
                  {leader.points.toLocaleString()} pts
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Full Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Full Leaderboard</Text>
          
          {topLeaders.map((leader) => (
            <TouchableOpacity
              key={leader.id}
              style={[
                styles.leaderCard,
                {
                  backgroundColor: isDark ? '#000000' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => handleLeaderPress(leader)}
              activeOpacity={0.8}
            >
              <View style={styles.leaderRank}>
                <Text style={[styles.rankNumber, { color: theme.colors.text }]}>
                  #{leader.rank}
                </Text>
              </View>
              
              <View style={[
                styles.leaderAvatar,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Text style={[
                  styles.avatarText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  {leader.avatar}
                </Text>
              </View>
              
              <View style={styles.leaderInfo}>
                <Text style={[styles.leaderName, { color: theme.colors.text }]} numberOfLines={2}>
                  {leader.name}
                </Text>
                <Text style={[styles.leaderLocation, { color: theme.colors.accent }]}>
                  {leader.location}
                </Text>
              </View>
              
              <View style={styles.leaderStats}>
                <Text style={[styles.leaderPoints, { color: theme.colors.text }]}>
                  {leader.points.toLocaleString()}
                </Text>
                <Text style={[styles.leaderPointsLabel, { color: theme.colors.accent }]}>
                  points
                </Text>
              </View>
              
              <View style={[
                styles.badgeContainer,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Text style={[
                  styles.badgeText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  {leader.badge.charAt(0).toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievement Info */}
        <View style={[
          styles.infoCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={[
            styles.infoIcon,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
              borderColor: theme.colors.border,
            }
          ]}>
            <Icon name="star" size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              How to Climb the Board
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.accent }]}>
              • Verify more products to earn points{'\n'}
              • Complete schemes for bonus rewards{'\n'}
              • Maintain consistent activity{'\n'}
              • Unlock higher badges for recognition
            </Text>
          </View>
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
  headerCard: {
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
  headerIcon: {
    width: 88,
    height: 88,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  userRankCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  userRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userRankTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  userRankBadge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  userRankNumber: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1.5,
  },
  userStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  userStatDivider: {
    width: 1.5,
    height: 50,
    opacity: 0.3,
    marginHorizontal: 8,
  },
  userStatValue: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  userStatLabel: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.3,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  periodFilter: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  periodScroll: {
    borderRadius: 20,
    padding: 6,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  periodScrollContent: {
    gap: 6,
  },
  periodButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  podiumCard: {
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
  podiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    gap: 12,
  },
  podiumItem: {
    alignItems: 'center',
  },
  podiumRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  podiumAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  podiumName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  podiumPoints: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    textAlign: 'center',
    opacity: 0.7,
    letterSpacing: 0.2,
  },
  leaderboardSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  leaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    gap: 10,
  },
  leaderRank: {
    width: 40,
    alignItems: 'center',
    flexShrink: 0,
  },
  rankNumber: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  leaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    flexShrink: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  leaderInfo: {
    flex: 1,
    minWidth: 90,
    justifyContent: 'center',
  },
  leaderName: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  leaderLocation: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    opacity: 0.7,
    letterSpacing: 0.2,
  },
  leaderStats: {
    alignItems: 'flex-end',
    marginRight: 8,
    minWidth: 56,
    flexShrink: 0,
  },
  leaderPoints: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  leaderPointsLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  badgeContainer: {
    width: 32,
    height: 32,
    flexShrink: 0,
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
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    gap: 18,
  },
  infoIcon: {
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
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 22,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
});

export default LeadershipBoardScreen;




