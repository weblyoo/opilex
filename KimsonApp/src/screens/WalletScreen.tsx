import React, { useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

type WalletNavigationProp = StackNavigationProp<RootStackParamList, 'Wallet'>;

interface Props {
  navigation: WalletNavigationProp;
}

export interface WalletAccount {
  id: string;
  type: 'bank' | 'upi';
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiUserName?: string;
  upiId?: string;
  mobileNumber?: string;
  isPrimary?: boolean;
}

const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  // Wallet balance is separate from reward points (redeem points to add to wallet at 1 point = ₹1)
  const walletBalance = user?.walletBalance ?? 0;

  // Track last refresh time to prevent excessive refreshes
  const lastRefreshTime = useRef<number>(0);
  const REFRESH_COOLDOWN = 2000; // 2 seconds cooldown between refreshes

  // Refresh user data when screen comes into focus (with cooldown to prevent loops)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTime.current;
        
        // Only refresh if cooldown period has passed
        if (timeSinceLastRefresh > REFRESH_COOLDOWN) {
          console.log('🔄 [WALLET] Screen focused, refreshing user data...');
          lastRefreshTime.current = now;
          refreshUser().catch((error) => {
            console.error('❌ [WALLET] Error refreshing user:', error);
          });
        } else {
          console.log('⏭️ [WALLET] Skipping refresh - too soon since last refresh');
        }
      }
    }, [user?.id]) // Only depend on user ID, not the entire user object
  );

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10);
    if (!withdrawAmount || isNaN(amount) || amount < 100) {
      Alert.alert('Error', 'Minimum withdrawal amount is ₹100');
      return;
    }
    if (amount > walletBalance) {
      setShowInsufficientModal(true);
      return;
    }
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to request withdrawal.');
      return;
    }
    const selected = accounts.find((a) => a.id === selectedAccountId);
    if (!selected) {
      Alert.alert('Error', 'Please select a bank or UPI account to withdraw to. Add one in Add Account if needed.');
      return;
    }

    setIsLoading(true);
    try {
      const accountPayload = {
        id: selected.id,
        type: selected.type,
        bankName: selected.bankName,
        accountHolderName: selected.accountHolderName,
        accountNumber: selected.accountNumber,
        ifscCode: selected.ifscCode,
        upiUserName: selected.upiUserName,
        upiId: selected.upiId,
        mobileNumber: selected.mobileNumber,
      };
      await transactionService.createWithdrawalRequest(user.id, amount, accountPayload);
      setSuccessAmount(amount);
      setWithdrawAmount('');
      setShowSuccessModal(true);
      refreshUser().catch(() => {});
      const list = await transactionService.getUserTransactions(user.id);
      setTransactions(list);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Error', err?.message || 'Failed to submit withdrawal request. Please try again.');
      return;
    }
    setIsLoading(false);
  };

  const loadAccounts = React.useCallback(async () => {
    if (!user?.id) return;
    setLoadingAccounts(true);
    try {
      const q = query(
        collection(db, 'bankAccounts'),
        where('userId', '==', user.id)
      );
      const snap = await getDocs(q);
      const list: WalletAccount[] = snap.docs.map((d) => {
        const data = d.data();
        const type = (data.type === 'upi' ? 'upi' : 'bank') as 'bank' | 'upi';
        return {
          id: d.id,
          type,
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          upiUserName: data.upiUserName,
          upiId: data.upiId,
          mobileNumber: data.mobileNumber,
          isPrimary: data.isPrimary,
        };
      });
      list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      setAccounts(list);
    } catch (e) {
      if (e?.code !== 'permission-denied') console.error('Error loading accounts', e);
    } finally {
      setLoadingAccounts(false);
    }
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        loadAccounts();
        transactionService.getUserTransactions(user.id).then(setTransactions).catch(() => {});
      }
    }, [user?.id, loadAccounts])
  );

  React.useEffect(() => {
    if (accounts.length === 0) return;
    const firstId = accounts[0].id;
    setSelectedAccountId((prev) => (prev && accounts.some((a) => a.id === prev)) ? prev : firstId);
  }, [accounts]);

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
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
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
            {user?.rewardPoints ? `From ${(user.rewardPoints || 0).toLocaleString()} reward points` : 'No reward points yet'}
          </Text>
        </View>

        {/* Withdraw Section */}
        <View style={styles.withdrawSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Withdraw Money</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Select Bank or UPI</Text>
            {loadingAccounts ? (
              <Text style={[styles.hintText, { color: theme.colors.accent }]}>Loading accounts...</Text>
            ) : accounts.length === 0 ? (
              <View style={[styles.noAccountsCard, { backgroundColor: isDark ? '#000000' : '#F5F5F5', borderColor: theme.colors.border }]}>
                <Text style={[styles.noAccountsText, { color: theme.colors.accent }]}>No bank or UPI added yet.</Text>
                <TouchableOpacity
                  style={[styles.addAccountLink, { borderColor: theme.colors.border }]}
                  onPress={() => navigation.navigate('AddAccount')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.addAccountLinkText, { color: theme.colors.text }]}>Add Account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.accountList}>
                {accounts.map((acc) => {
                  const isSelected = acc.id === selectedAccountId;
                  const isUpi = acc.type === 'upi';
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.accountOption,
                        {
                          backgroundColor: isDark ? '#000000' : '#F5F5F5',
                          borderColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : theme.colors.border,
                          borderWidth: isSelected ? 2 : 1.5,
                        }
                      ]}
                      onPress={() => setSelectedAccountId(acc.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.accountOptionIcon, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
                        <Icon name={isUpi ? 'gift-box' : 'bank'} size={22} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                      </View>
                      <View style={styles.accountOptionInfo}>
                        <Text style={[styles.accountOptionTitle, { color: theme.colors.text }]} numberOfLines={1}>
                          {isUpi ? (acc.upiUserName || acc.upiId || 'UPI') : (acc.bankName || 'Bank')}
                        </Text>
                        <Text style={[styles.accountOptionDetail, { color: theme.colors.accent }]} numberOfLines={1}>
                          {isUpi ? (acc.upiId || acc.mobileNumber || '') : (`${acc.accountHolderName || ''} · ****${(acc.accountNumber || '').slice(-4)}`)}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={[styles.accountOptionCheck, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
                          <Icon name="check" size={16} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Amount (₹)</Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#000000' : '#F5F5F5',
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
            disabled={Boolean(isLoading) || !selectedAccountId || accounts.length === 0}
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
            transactions.map((transaction) => {
              const reqAt = transaction.requestedAt?.toDate?.() || transaction.requestedAt;
              const dateStr = reqAt ? (reqAt instanceof Date ? reqAt : new Date(reqAt)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              const isSchemeJoin = transaction.type === 'scheme_join';
              const type = isSchemeJoin ? 'scheme' : transaction.type === 'withdrawal' ? 'withdrawal' : 'reward';
              const amount = transaction.amount || 0;
              const label = isSchemeJoin ? `Scheme: ${transaction.schemeName || 'Scheme'}` : (type === 'withdrawal' ? 'Withdrawal' : 'Reward Credit');
              const isDebit = type === 'withdrawal' || isSchemeJoin;
              return (
                <View 
                  key={transaction.id} 
                  style={[
                    styles.transactionItem,
                    {
                      backgroundColor: isDark ? '#000000' : '#F8F8F8',
                      borderColor: theme.colors.border,
                    }
                  ]}
                >
                  <View style={[
                    styles.transactionIconContainer,
                    { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
                  ]}>
                    <Icon 
                      name={type === 'withdrawal' ? 'bank' : type === 'scheme' ? 'gift-box' : 'gift-box'} 
                      size={24} 
                      color={isDark ? '#000000' : '#FFFFFF'} 
                      strokeWidth={2.5} 
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionType, { color: theme.colors.text }]}>
                      {label}
                    </Text>
                    <Text style={[styles.transactionDate, { color: theme.colors.accent }]}>
                      {dateStr} {!isSchemeJoin && transaction.status ? `· ${transaction.status}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: theme.colors.text }]}>
                    {isDebit ? '-' : '+'}₹{amount}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Insufficient Balance Modal - same design as Schemes / Logout error modals */}
      <Modal
        visible={showInsufficientModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInsufficientModal(false)}
      >
        <View style={styles.insufficientModalOverlay}>
          <View style={[styles.insufficientModalContainer, { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderColor: isDark ? '#FFFFFF' : '#000000' }]}>
            <View style={[styles.insufficientModalIconOuter, { backgroundColor: isDark ? 'rgba(255,100,100,0.2)' : 'rgba(200,50,50,0.1)', borderColor: isDark ? 'rgba(255,100,100,0.5)' : 'rgba(200,50,50,0.3)' }]}>
              <View style={[styles.insufficientModalIconInner, { backgroundColor: '#C62828' }]}>
                <Icon name="close" size={40} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <View style={[styles.insufficientModalBadge, { backgroundColor: '#C62828' }]}>
              <Text style={styles.insufficientModalBadgeText}>INSUFFICIENT BALANCE</Text>
            </View>
            <Text style={[styles.insufficientModalTitle, { color: theme.colors.text }]}>Insufficient Balance</Text>
            <Text style={[styles.insufficientModalMessage, { color: theme.colors.accent }]}>
              Your available balance is ₹{walletBalance.toFixed(2)}. Please enter a lower amount.
            </Text>
            <TouchableOpacity
              style={[styles.insufficientModalButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
              onPress={() => setShowInsufficientModal(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.insufficientModalButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdrawal Success Modal - matches app design */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowSuccessModal(false)}
        >
          <Pressable style={styles.modalContentWrap} onPress={e => e.stopPropagation()}>
            <View style={[
              styles.successModalCard,
              {
                backgroundColor: theme.colors.cardBackground || (isDark ? '#000000' : '#FFFFFF'),
                borderColor: theme.colors.border,
              }
            ]}>
              <View style={[
                styles.successIconWrap,
                { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                <Icon name="check" size={56} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.successModalTitle, { color: theme.colors.text }]}>
                Withdrawal Request Submitted
              </Text>
              <Text style={[styles.successModalAmount, { color: theme.colors.text }]}>
                ₹{successAmount.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.successModalMessage, { color: theme.colors.accent }]}>
                Your request has been submitted successfully. Amount will be credited to your bank account within 2–3 business days.
              </Text>
              <TouchableOpacity
                style={[
                  styles.successModalButton,
                  { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
                ]}
                onPress={() => setShowSuccessModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.successModalButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
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
  hintText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    marginTop: 4,
  },
  noAccountsCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 12,
  },
  noAccountsText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Medium',
  },
  addAccountLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  addAccountLinkText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Bold',
  },
  accountList: {
    gap: 12,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    gap: 14,
  },
  accountOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountOptionInfo: {
    flex: 1,
  },
  accountOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 4,
  },
  accountOptionDetail: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Regular',
    opacity: 0.8,
  },
  accountOptionCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Insufficient Balance Modal - same design as Schemes / Logout error modals
  insufficientModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  insufficientModalContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
  },
  insufficientModalIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 14,
  },
  insufficientModalIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insufficientModalBadge: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  insufficientModalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  insufficientModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  insufficientModalMessage: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  insufficientModalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  insufficientModalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  // Success Modal - matches app design
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContentWrap: {
    width: '100%',
    maxWidth: 360,
  },
  successModalCard: {
    borderRadius: 28,
    borderWidth: 1.5,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  successModalAmount: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  successModalMessage: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  successModalButton: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 160,
    alignItems: 'center',
  },
  successModalButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
});

export default WalletScreen;




