import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/firestore';

type TransactionNavigationProp = StackNavigationProp<RootStackParamList, 'Transaction'>;

interface Props {
  navigation: TransactionNavigationProp;
}

const TransactionScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = React.useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        transactionService.getUserTransactions(user.id).then(setTransactions).catch(() => setTransactions([]));
      }
    }, [user?.id])
  );

  // Only company payment: (1) payment request sent to company (withdrawal), (2) payment received from company (reward/credit)
  const paymentOnly = transactions.filter(
    (t) => t.type === 'withdrawal' || t.type === 'reward' || (!t.type && t.amount != null)
  );

  const totalSent = paymentOnly
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalReceived = paymentOnly
    .filter((t) => t.type !== 'withdrawal')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} translucent={true} />
      <Header
        title="Transaction"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />

      {/* Header summary: Received | Sent */}
      <View style={[styles.summaryBar, { backgroundColor: isDark ? '#000000' : '#F5F5F5', borderColor: theme.colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.accent }]}>Received</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₹{totalReceived.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.accent }]}>Sent</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₹{totalSent.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {paymentOnly.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="history" size={48} color={theme.colors.accent} strokeWidth={2} />
            <Text style={[styles.emptyText, { color: theme.colors.accent }]}>
              No payment transactions yet
            </Text>
          </View>
        ) : (
          paymentOnly.map((t) => {
            const reqAt = t.requestedAt?.toDate?.() || t.requestedAt;
            const dateStr = reqAt
              ? (reqAt instanceof Date ? reqAt : new Date(reqAt)).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '—';
            const isWithdrawal = t.type === 'withdrawal';
            const amount = Number(t.amount) || 0;
            const label = isWithdrawal ? 'Payment request sent' : 'Payment received';
            return (
              <View
                key={t.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark ? '#000000' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
                  <Icon
                    name={isWithdrawal ? 'bank' : 'gift-box'}
                    size={22}
                    color={isDark ? '#000000' : '#FFFFFF'}
                    strokeWidth={2.5}
                  />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
                  <Text style={[styles.date, { color: theme.colors.accent }]}>
                    {dateStr} {t.status ? `· ${t.status}` : ''}
                  </Text>
                </View>
                <Text style={[styles.amount, { color: theme.colors.text }]}>
                  {isWithdrawal ? '-' : '+'}₹{amount.toLocaleString('en-IN')}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    opacity: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  amount: {
    fontSize: 16,
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
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    marginTop: 16,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
});

export default TransactionScreen;
