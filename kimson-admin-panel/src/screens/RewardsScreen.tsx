import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { globalTextStyles } from '../styles/globalStyles';
import { fonts } from '../config/fonts';
import mockAuthService from '../services/mockAuth';
import { wireAuthService } from '../services/firestore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

type RewardsNavigationProp = StackNavigationProp<RootStackParamList, 'Rewards'>;

interface Props {
  navigation: RewardsNavigationProp;
}

const { width } = Dimensions.get('window');

interface ScanHistory {
  id: string;
  qrCode: string;
  authenticatedAt: any;
  rewardPoints: number;
  productInfo?: {
    type?: string;
    batch?: string;
    manufacturingDate?: any;
  };
}

const RewardsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [rewards, setRewards] = useState<any[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRewards();
    loadScanHistory();
  }, [user]);

  const loadRewards = async () => {
    if (!user) return;

    try {
      const recentRewards = await mockAuthService.getRecentRewards(user.id);
      setRewards(recentRewards);
      setTotalPoints(user.rewardPoints || 0);
      
      // Calculate daily and monthly points
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const todayRewards = recentRewards.filter(r => 
        new Date(r.createdAt).toDateString() === today.toDateString()
      );
      const monthRewards = recentRewards.filter(r => 
        new Date(r.createdAt) >= thisMonth
      );
      
      setDailyPoints(todayRewards.reduce((sum, r) => sum + r.points, 0));
      setMonthlyPoints(monthRewards.reduce((sum, r) => sum + r.points, 0));
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const loadScanHistory = async () => {
    if (!user) return;

    try {
      // Query without orderBy to avoid index requirement, we'll sort in memory
      const authsQuery = query(
        collection(db, 'wireAuthentications'),
        where('userId', '==', user.id),
        limit(50)
      );
      const querySnapshot = await getDocs(authsQuery);
      const history: ScanHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          qrCode: data.qrCode || '',
          authenticatedAt: data.authenticatedAt,
          rewardPoints: data.rewardPoints || 0,
          productInfo: data.productInfo,
        });
      });
      
      // Sort by date in memory (newest first)
      history.sort((a, b) => {
        const dateA = a.authenticatedAt?.toDate ? a.authenticatedAt.toDate() : new Date(a.authenticatedAt);
        const dateB = b.authenticatedAt?.toDate ? b.authenticatedAt.toDate() : new Date(b.authenticatedAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setScanHistory(history);
    } catch (error: any) {
      // Silently handle permission errors and index errors
      if (error?.code === 'permission-denied' || error?.code === 'missing-or-insufficient-permissions') {
        return;
      }
      if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
        // Index not created yet, try without orderBy
        console.warn('Firestore index not created. Loading without sorting.');
        return;
      }
      console.error('Error loading scan history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadRewards(), loadScanHistory()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="My Rewards"
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.text}
            colors={[theme.colors.text]}
          />
        }
      >
        {/* Points Card */}
        <View style={[
          styles.pointsCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.pointsCardHeader}>
            <Text style={[styles.pointsCardLabel, { color: theme.colors.accent }]}>
              Available Balance
            </Text>
          </View>

          <View style={styles.pointsCardContent}>
            <View style={[
              styles.awardIconCircle,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                borderColor: theme.colors.border,
              }
            ]}>
              <Icon name="rewards" size={48} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            </View>
            <View style={styles.pointsValueContainer}>
              <Text style={[styles.pointsCardValue, { color: theme.colors.text }]}>
                {totalPoints.toLocaleString()}
              </Text>
              <Text style={[styles.pointsCardUnit, { color: theme.colors.accent }]}>
                REWARD POINTS
              </Text>
            </View>
          </View>

          {/* Mini Stats */}
          <View style={[
            styles.miniStatsRow,
            {
              borderTopColor: theme.colors.border,
            }
          ]}>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatValue, { color: theme.colors.text }]}>
                {dailyPoints}
              </Text>
              <Text style={[styles.miniStatLabel, { color: theme.colors.accent }]}>
                Today
              </Text>
            </View>
            <View style={[styles.miniStatDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatValue, { color: theme.colors.text }]}>
                {monthlyPoints}
              </Text>
              <Text style={[styles.miniStatLabel, { color: theme.colors.accent }]}>
                This Month
              </Text>
            </View>
          </View>
        </View>

        {/* Scan QR Code History Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Scan QR Code History
          </Text>
          
          {scanHistory.length === 0 ? (
            <View style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                borderColor: theme.colors.border,
              }
            ]}>
              <View style={[
                styles.emptyIconCircle,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon 
                  name="scan" 
                  size={56} 
                  color={isDark ? '#000000' : '#FFFFFF'} 
                  strokeWidth={2.5} 
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No Scan History
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.accent }]}>
                Start scanning QR codes to see your history here!
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
                <Icon 
                  name="scan" 
                  size={20} 
                  color={isDark ? '#000000' : '#FFFFFF'} 
                  strokeWidth={2.5} 
                />
                <Text style={[
                  styles.scanButtonText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  Scan Now
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activityList}>
              {scanHistory.map((scan) => {
                const scanDate = scan.authenticatedAt?.toDate ? scan.authenticatedAt.toDate() : new Date(scan.authenticatedAt);
                return (
                  <View 
                    key={scan.id} 
                    style={[
                      styles.activityCard,
                      {
                        backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                        borderColor: theme.colors.border,
                      }
                    ]}
                  >
                    <View style={[
                      styles.activityIconCircle,
                      {
                        backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      }
                    ]}>
                      <Icon 
                        name="scan" 
                        size={24} 
                        color={isDark ? '#000000' : '#FFFFFF'} 
                        strokeWidth={2.5} 
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
                        {scan.productInfo?.type || 'Wire Authentication'}
                        {scan.productInfo?.batch && ` - Batch: ${scan.productInfo.batch}`}
                      </Text>
                      <Text style={[styles.activityDate, { color: theme.colors.accent }]}>
                        {scanDate.toLocaleDateString()} {scanDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={[styles.scanCode, { color: theme.colors.accent }]}>
                        Code: {scan.qrCode.substring(0, 20)}...
                      </Text>
                    </View>
                    <View style={styles.activityPointsContainer}>
                      <Text style={[styles.activityPoints, { color: theme.colors.text }]}>
                        +{scan.rewardPoints}
                      </Text>
                      <Text style={[styles.activityPointsLabel, { color: theme.colors.accent }]}>
                        points
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
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
  
  // Points Card
  pointsCard: {
    borderRadius: 28,
    padding: 32,
    marginBottom: 32,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
  },
  pointsCardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsCardContent: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 24,
  },
  pointsCardLabel: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  awardIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  pointsValueContainer: {
    alignItems: 'center',
    gap: 8,
  },
  pointsCardValue: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  pointsCardUnit: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  miniStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 32,
    borderTopWidth: 1.5,
    gap: 16,
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  miniStatValue: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  miniStatLabel: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  miniStatDivider: {
    width: 1.5,
    height: 64,
    opacity: 0.3,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  // Redeem Grid
  redeemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  redeemCard: {
    width: (width - 52) / 2, // 2 cards per row with spacing
    padding: 22,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  redeemIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  redeemCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
  },

  // Activity List
  activityList: {
    gap: 14,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  activityIconCircle: {
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
  activityInfo: {
    flex: 1,
    gap: 6,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  activityDate: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  scanCode: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  activityPointsContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  activityPoints: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  activityPointsLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.8,
  },

  // Empty State
  emptyCard: {
    padding: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    gap: 24,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 26,
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
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 22,
    gap: 14,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    marginTop: 8,
  },
  scanButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
});

export default RewardsScreen;