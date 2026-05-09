import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { scratchRewardService } from '../services/firestore';
import { LinearGradient } from 'expo-linear-gradient';

type ScratchRewardsNavigationProp = StackNavigationProp<RootStackParamList, 'ScratchRewards'>;

interface Props {
  navigation: ScratchRewardsNavigationProp;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_GAP = 14;
const PAD = 20;
const NUM_COLUMNS = 2;
const CARD_SIZE = (screenWidth - PAD * 2 - CARD_GAP) / NUM_COLUMNS;

const ScratchRewardsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [flyerReward, setFlyerReward] = useState<any | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [successPop, setSuccessPop] = useState<{ points: number } | null>(null);
  const flyerScale = useState(new Animated.Value(0.9))[0];
  const flyerOpacity = useState(new Animated.Value(0))[0];
  const successScale = useState(new Animated.Value(0.5))[0];
  const successOpacity = useState(new Animated.Value(0))[0];

  const loadRewards = useCallback(async () => {
    if (!user?.id) return;
    setLoadError(null);
    try {
      const list = await scratchRewardService.getUnclaimedByUser(user.id);
      setRewards(list);
    } catch (e: any) {
      const msg = e?.message || String(e);
      const isPermission = /permission|insufficient/i.test(msg);
      setRewards([]);
      setLoadError(isPermission ? 'Please sign in to view your rewards.' : 'Unable to load rewards. Pull to retry.');
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadRewards().finally(() => setLoading(false));
    }, [loadRewards])
  );

  useEffect(() => {
    if (flyerReward) {
      Animated.parallel([
        Animated.spring(flyerScale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 150 }),
        Animated.timing(flyerOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      flyerScale.setValue(0.9);
      flyerOpacity.setValue(0);
    }
  }, [flyerReward]);

  useEffect(() => {
    if (successPop) {
      successScale.setValue(0.5);
      successOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 120 }),
        Animated.timing(successOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      successScale.setValue(0.5);
      successOpacity.setValue(0);
    }
  }, [successPop]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRewards();
    setRefreshing(false);
  };

  const openFlyer = (reward: any) => {
    setFlyerReward(reward);
  };

  const closeFlyer = () => {
    Animated.parallel([
      Animated.timing(flyerScale, { toValue: 0.92, duration: 150, useNativeDriver: true }),
      Animated.timing(flyerOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start(() => setFlyerReward(null));
  };

  const handleClaim = async () => {
    if (!user?.id || !flyerReward) return;
    setClaimingId(flyerReward.id);
    try {
      const result = await scratchRewardService.claimScratchReward(flyerReward.id, user.id);
      if (result.success && result.points != null) {
        await refreshUser();
        setFlyerReward(null);
        setRewards((prev) => prev.filter((r) => r.id !== flyerReward.id));
        setSuccessPop({ points: result.points });
      } else {
        Alert.alert('Error', 'Could not claim reward. It may already be claimed.');
        await loadRewards();
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      await loadRewards();
    } finally {
      setClaimingId(null);
    }
  };

  const closeSuccessPop = () => setSuccessPop(null);

  const walletBalance = user?.walletBalance ?? 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} translucent />
      <Header
        title="Scratch Rewards"
        showBackButton
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.text} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
          <View style={styles.statsLeft}>
            <Text style={[styles.statsLabel, { color: theme.colors.accent }]}>Gifts to claim</Text>
            <Text style={[styles.statsValue, { color: theme.colors.text }]}>{loading ? '—' : rewards.length}</Text>
          </View>
          <View style={[styles.statsDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]} />
          <View style={styles.statsRight}>
            <Text style={[styles.statsLabel, { color: theme.colors.accent }]}>Your balance</Text>
            <Text style={[styles.statsValue, { color: theme.colors.text }]}>₹{walletBalance.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.accent }]}>
          Tap a gift to open and claim reward points sent by admin
        </Text>

        {loading ? (
          <View style={styles.skeletonWrap}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.skeletonCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={[styles.skeletonCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
                <View style={[styles.skeletonLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
              </View>
            ))}
          </View>
        ) : loadError ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <Icon name="gift-box" size={44} color={theme.colors.accent} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{loadError}</Text>
            <Text style={[styles.emptySub, { color: theme.colors.accent }]}>Pull down to retry</Text>
          </View>
        ) : rewards.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <Icon name="gift-box" size={44} color={theme.colors.accent} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No gifts yet</Text>
            <Text style={[styles.emptySub, { color: theme.colors.accent }]}>When admin sends you reward points, they’ll appear here as gifts.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {rewards.map((reward) => (
              <TouchableOpacity
                key={reward.id}
                style={[
                  styles.giftCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    ...Platform.select({
                      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.08, shadowRadius: 8 },
                      android: { elevation: 3 },
                    }),
                  },
                ]}
                onPress={() => openFlyer(reward)}
                activeOpacity={0.8}
              >
                <View style={[styles.giftIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Icon name="gift-box" size={40} color={theme.colors.accent} strokeWidth={2} />
                </View>
                <Text style={[styles.giftLabel, { color: theme.colors.accent }]}>Open gift</Text>
                <Text style={[styles.giftSub, { color: theme.colors.accent }]}>{reward.points ?? 0} pts</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Flyer modal – modern reward reveal */}
      <Modal visible={!!flyerReward} transparent animationType="fade" onRequestClose={closeFlyer}>
        <Pressable style={styles.flyerOverlay} onPress={closeFlyer}>
          <Animated.View style={[styles.flyerAnimatedWrap, { opacity: flyerOpacity }]}>
            <Pressable
              style={[
                styles.flyerCard,
                {
                  backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                  ...Platform.select({
                    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 24 },
                    android: { elevation: 12 },
                  }),
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <Animated.View style={{ transform: [{ scale: flyerScale }] }}>
                <View style={styles.flyerBadgeWrap}>
                  <View style={[styles.flyerBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }]}>
                    <Text style={[styles.flyerBadgeText, { color: theme.colors.accent }]}>REWARD</Text>
                  </View>
                </View>
                <View style={[styles.flyerIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                  <Icon name="gift-box" size={52} color={theme.colors.accent} strokeWidth={2} />
                </View>
                <Text style={[styles.flyerTitle, { color: theme.colors.text }]}>You received</Text>
                <LinearGradient
                  colors={isDark ? ['#FFFFFF', 'rgba(255,255,255,0.85)'] : ['#1a1a1a', '#333']}
                  style={styles.flyerPointsGradient}
                >
                  <Text style={[styles.flyerPoints, { color: isDark ? '#000' : '#FFF' }]}>+{flyerReward?.points ?? 0}</Text>
                  <Text style={[styles.flyerPointsUnit, { color: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }]}>points</Text>
                </LinearGradient>
                <Text style={[styles.flyerHint, { color: theme.colors.accent }]}>These points will be added to your wallet when you claim.</Text>
                <View style={styles.flyerActions}>
                  <TouchableOpacity
                    style={[styles.flyerBtnCancel, { borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }]}
                    onPress={closeFlyer}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.flyerBtnCancelText, { color: theme.colors.text }]}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.flyerBtnClaim, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                    onPress={handleClaim}
                    disabled={!!claimingId}
                    activeOpacity={0.8}
                  >
                    {claimingId ? (
                      <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
                    ) : (
                      <Text style={[styles.flyerBtnClaimText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Claim</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Gift claim success pop */}
      <Modal visible={!!successPop} transparent animationType="fade" onRequestClose={closeSuccessPop}>
        <Pressable style={styles.successOverlay} onPress={closeSuccessPop}>
          <Animated.View style={[styles.successCardWrap, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
            <Pressable
              style={[
                styles.successCard,
                {
                  backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  ...Platform.select({
                    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 20 },
                    android: { elevation: 10 },
                  }),
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.successIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }]}>
                <Icon name="check" size={56} color={theme.colors.text} strokeWidth={2.5} />
              </View>
              <Text style={[styles.successTitle, { color: theme.colors.text }]}>Claimed!</Text>
              <LinearGradient
                colors={isDark ? ['#FFFFFF', 'rgba(255,255,255,0.85)'] : ['#1a1a1a', '#333']}
                style={styles.successPointsGradient}
              >
                <Text style={[styles.successPoints, { color: isDark ? '#000' : '#FFF' }]}>+{successPop?.points ?? 0}</Text>
                <Text style={[styles.successPointsUnit, { color: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }]}>points</Text>
              </LinearGradient>
              <Text style={[styles.successSub, { color: theme.colors.accent }]}>
                Added to your reward points
              </Text>
              <Text style={[styles.successBalance, { color: theme.colors.text }]}>
                New balance: {((user?.rewardPoints ?? 0) + (successPop?.points ?? 0)).toLocaleString()} pts
              </Text>
              <TouchableOpacity
                style={[styles.successDoneBtn, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                onPress={closeSuccessPop}
                activeOpacity={0.85}
              >
                <Text style={[styles.successDoneText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Done</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: PAD, paddingTop: 12, paddingBottom: 100 },
  statsStrip: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  statsLeft: { flex: 1, alignItems: 'center' },
  statsDivider: { width: 1, height: 32, borderRadius: 1 },
  statsRight: { flex: 1, alignItems: 'center' },
  statsLabel: {
    fontSize: 11,
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.5,
    marginBottom: 4,
    opacity: 0.9,
  },
  statsValue: {
    fontSize: 20,
    fontFamily: 'Ubuntu-Bold',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 18,
    opacity: 0.85,
  },
  skeletonWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  skeletonCard: {
    width: CARD_SIZE,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  skeletonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  skeletonLine: {
    width: 60,
    height: 10,
    borderRadius: 5,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
    opacity: 0.8,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  giftCard: {
    width: CARD_SIZE,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 152,
  },
  giftIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  giftLabel: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  giftSub: {
    fontSize: 11,
    fontFamily: 'Ubuntu-Medium',
    marginTop: 4,
    opacity: 0.85,
  },
  flyerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  flyerAnimatedWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyerCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  flyerBadgeWrap: { marginBottom: 12 },
  flyerBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  flyerBadgeText: {
    fontSize: 10,
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 1.2,
    opacity: 0.95,
  },
  flyerIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  flyerTitle: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 8,
    opacity: 0.9,
  },
  flyerPointsGradient: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  flyerPoints: {
    fontSize: 36,
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: -0.5,
  },
  flyerPointsUnit: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Medium',
    marginTop: 2,
  },
  flyerHint: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 24,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  flyerActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  flyerBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyerBtnCancelText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Bold',
  },
  flyerBtnClaim: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  flyerBtnClaimText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Bold',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCardWrap: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 12,
  },
  successPointsGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  successPoints: {
    fontSize: 28,
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: -0.5,
  },
  successPointsUnit: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Medium',
    marginTop: 2,
  },
  successSub: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 6,
    opacity: 0.9,
  },
  successBalance: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 20,
    opacity: 0.85,
  },
  successDoneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDoneText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Bold',
  },
});

export default ScratchRewardsScreen;
