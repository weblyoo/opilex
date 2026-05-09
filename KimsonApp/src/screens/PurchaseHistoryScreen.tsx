import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { rewardService } from '../services/firestore';
import { COLLECTIONS } from '../services/firestore';

type PurchaseHistoryNavigationProp = StackNavigationProp<RootStackParamList, 'PurchaseHistory'>;

interface Props {
  navigation: PurchaseHistoryNavigationProp;
}

/** Unified item: product name only (e.g. 2mm wire) + reward points, no description */
export interface PurchaseHistoryItem {
  id: string;
  productName: string;
  rewardPoints: number;
  date: Date | any;
  source: 'wire_auth' | 'reward_qr';
}

const PurchaseHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [items, setItems] = useState<PurchaseHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const lastRefresh = useRef<number>(0);
  const COOLDOWN = 2000;

  const loadHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const list: PurchaseHistoryItem[] = [];

      // 1. Wire authentication scans (product QR) – product name + reward points
      try {
        const wireQ = query(
          collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
          where('userId', '==', user.id),
          orderBy('authenticatedAt', 'desc'),
          limit(200)
        );
        const wireSnap = await getDocs(wireQ);
        wireSnap.forEach((docSnap) => {
          const d = docSnap.data();
          const date = d.authenticatedAt?.toDate ? d.authenticatedAt.toDate() : d.authenticatedAt;
          const productName = (d.productInfo?.type || d.productInfo?.name || '').trim() || 'Product';
          list.push({
            id: `wire-${docSnap.id}`,
            productName,
            rewardPoints: d.rewardPoints ?? 0,
            date,
            source: 'wire_auth',
          });
        });
      } catch (wireErr: any) {
        if (wireErr?.code === 'failed-precondition' || wireErr?.message?.includes('index')) {
          const wireQ = query(
            collection(db, COLLECTIONS.WIRE_AUTHENTICATIONS),
            where('userId', '==', user.id),
            limit(200)
          );
          const wireSnap = await getDocs(wireQ);
          wireSnap.forEach((docSnap) => {
            const d = docSnap.data();
            const date = d.authenticatedAt?.toDate ? d.authenticatedAt.toDate() : d.authenticatedAt;
            const productName = (d.productInfo?.type || d.productInfo?.name || '').trim() || 'Product';
            list.push({
              id: `wire-${docSnap.id}`,
              productName,
              rewardPoints: d.rewardPoints ?? 0,
              date,
              source: 'wire_auth',
            });
          });
        }
      }

      // 2. Reward QR scans (bonus) – product name only, not description
      const rewards = await rewardService.getUserRewards(user.id);
      const bonusRewards = rewards.filter((r: any) => r.type === 'bonus');
      bonusRewards.forEach((r: any) => {
        const date = r.createdAt?.toDate ? r.createdAt.toDate() : r.createdAt;
        const productName = (r.productName || r.description || '').trim() || 'Reward QR';
        list.push({
          id: `reward-${r.id}`,
          productName,
          rewardPoints: r.points ?? 0,
          date,
          source: 'reward_qr',
        });
      });

      list.sort((a, b) => {
        const tA = a.date instanceof Date ? a.date.getTime() : (a.date?.toDate?.()?.getTime() ?? (a.date?.seconds ? a.date.seconds * 1000 : 0));
        const tB = b.date instanceof Date ? b.date.getTime() : (b.date?.toDate?.()?.getTime() ?? (b.date?.seconds ? b.date.seconds * 1000 : 0));
        return tB - tA;
      });

      setItems(list);
    } catch (e) {
      setItems([]);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      const now = Date.now();
      if (now - lastRefresh.current > COOLDOWN) {
        lastRefresh.current = now;
        loadHistory();
      }
    }, [user?.id, loadHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const today = new Date();
  const todayItems = items.filter((s) => {
    const d = s.date instanceof Date ? s.date : (s.date?.toDate ? s.date.toDate() : new Date(s.date || 0));
    return d.toDateString && d.toDateString() === today.toDateString();
  });
  const todayPoints = todayItems.reduce((sum, s) => sum + (s.rewardPoints || 0), 0);
  const totalPoints = items.reduce((sum, s) => sum + (s.rewardPoints || 0), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} translucent={true} />
      <Header
        title="Purchase History"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />

      {/* Top: today / total points / total scanned */}
      <View style={[styles.topBar, { backgroundColor: isDark ? '#000000' : '#F5F5F5', borderColor: theme.colors.border }]}>
        <Text style={[styles.topText, { color: theme.colors.accent }]}>
          Today: {todayPoints} pts · Total: {totalPoints} pts · Scanned: {items.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.text} colors={[theme.colors.text]} />
        }
      >
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="scan" size={48} color={theme.colors.accent} strokeWidth={2} />
            <Text style={[styles.emptyText, { color: theme.colors.accent }]}>No scans yet. Scan a product or reward QR to see history here.</Text>
          </View>
        ) : (
          <>
            {items.map((item) => {
              const dateObj = item.date instanceof Date ? item.date : (item.date?.toDate ? item.date.toDate() : new Date(item.date || 0));
              const dateStr = dateObj.toLocaleDateString ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              return (
                <View
                  key={item.id}
                  style={[
                    styles.row,
                    {
                      backgroundColor: isDark ? '#000000' : '#F8F8F8',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
                    <Icon name={item.source === 'reward_qr' ? 'gift-box' : 'scan'} size={20} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={[styles.rowProduct, { color: theme.colors.text }]} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={[styles.rowDate, { color: theme.colors.accent }]}>
                      {dateStr}
                    </Text>
                  </View>
                  <Text style={[styles.rowPoints, { color: theme.colors.text }]}>
                    +{item.rewardPoints} pts
                  </Text>
                </View>
              );
            })}
            {/* Bottom Total */}
            <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total reward points</Text>
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>{totalPoints} pts</Text>
            </View>
          </>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  topText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowProduct: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  rowDate: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  rowPoints: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
    borderTopWidth: 1.5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    marginTop: 16,
    letterSpacing: 0.3,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default PurchaseHistoryScreen;
