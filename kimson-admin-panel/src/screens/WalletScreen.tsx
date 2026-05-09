import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type WalletNavigationProp = StackNavigationProp<RootStackParamList, 'Wallet'>;

interface Props {
  navigation: WalletNavigationProp;
}

const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock balance - replace with actual user balance
  const walletBalance = user?.rewardPoints ? user.rewardPoints * 0.1 : 125.00;

  const handleWithdraw = () => {
    if (!withdrawAmount || parseInt(withdrawAmount) < 100) {
      Alert.alert('Error', 'Minimum withdrawal amount is ₹100');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Withdrawal Request Submitted',
        'Your withdrawal request has been submitted successfully. Amount will be credited to your bank account within 2-3 business days.'
      );
      setWithdrawAmount('');
    }, 2000);
  };

  const transactions = [
    {
      id: '1',
      type: 'withdrawal',
      amount: 500,
      date: '2024-09-15',
      status: 'completed',
    },
    {
      id: '2',
      type: 'reward',
      amount: 100,
      date: '2024-09-10',
      status: 'completed',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Wallet"
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
        {/* Balance Card */}
        <View style={[
          styles.balanceCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.balanceHeader}>
            <View style={[
              styles.walletIconContainer,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}>
              <Icon 
                name="wallet" 
                size={32} 
                color={isDark ? '#000000' : '#FFFFFF'} 
                strokeWidth={2.5} 
              />
            </View>
            <Text style={[styles.balanceLabel, { color: theme.colors.accent }]}>
              Available Balance
            </Text>
          </View>
          <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
            ₹{walletBalance.toFixed(2)}
          </Text>
          <Text style={[styles.balanceSubtext, { color: theme.colors.accent }]}>
            {user?.rewardPoints ? `From ${user.rewardPoints.toLocaleString()} reward points` : 'From reward points'}
          </Text>
        </View>

        {/* Withdraw Section */}
        <View style={styles.withdrawSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Withdraw Money</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Amount (₹)</Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
                borderColor: theme.colors.border,
              }
            ]}>
              <Text style={[styles.currencySymbol, { color: theme.colors.iconColor }]}>₹</Text>
              <TextInput
                placeholder="Enter amount (min ₹100)"
                placeholderTextColor={theme.colors.accent}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                style={[styles.inputText, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.withdrawButton,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                borderColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            onPress={handleWithdraw}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.withdrawButtonText,
              { color: isDark ? '#000000' : '#FFFFFF' }
            ]}>
              {isLoading ? 'Processing...' : 'Request Withdrawal'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Transaction History</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="history" size={48} color={theme.colors.accent} strokeWidth={2} />
              <Text style={[styles.emptyText, { color: theme.colors.accent }]}>
                No transactions yet
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View 
                key={transaction.id} 
                style={[
                  styles.transactionItem,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <View style={[
                  styles.transactionIconContainer,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}>
                  <Icon 
                    name={transaction.type === 'withdrawal' ? 'bank' : 'gift-box'} 
                    size={24} 
                    color={isDark ? '#000000' : '#FFFFFF'} 
                    strokeWidth={2.5} 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionType, { color: theme.colors.text }]}>
                    {transaction.type === 'withdrawal' ? 'Withdrawal' : 'Reward Credit'}
                  </Text>
                  <Text style={[styles.transactionDate, { color: theme.colors.accent }]}>
                    {transaction.date}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: theme.colors.text }
                ]}>
                  {transaction.type === 'withdrawal' ? '-' : '+'}₹{transaction.amount}
                </Text>
              </View>
            ))
          )}
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
  // Balance Card
  balanceCard: {
    marginBottom: 32,
    padding: 32,
    borderRadius: 28,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  walletIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 52,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  balanceSubtext: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    letterSpacing: 0.3,
    opacity: 0.6,
  },
  // Withdraw Section
  withdrawSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 62,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginRight: 14,
  },
  inputText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    paddingVertical: 0,
  },
  withdrawButton: {
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  withdrawButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  // Transaction Section
  transactionsSection: {
    marginBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  transactionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  transactionDate: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    letterSpacing: 0.2,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    marginTop: 16,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
});

export default WalletScreen;
