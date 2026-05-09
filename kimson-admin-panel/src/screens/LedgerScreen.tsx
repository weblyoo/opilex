import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

type LedgerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Ledger'>;

const LedgerScreen: React.FC = () => {
  const navigation = useNavigation<LedgerScreenNavigationProp>();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [gstData, setGstData] = useState<{ gstNumber?: string; verified?: boolean } | null>(null);
  const [gstDataLoaded, setGstDataLoaded] = useState(false);

  useEffect(() => {
    loadGSTData();
  }, [user]);

  const loadGSTData = async () => {
    if (!user) return;
    
    // Only load GST data for dealers
    if (user.userType !== 'dealer') {
      setGstDataLoaded(true);
      return;
    }
    
    try {
      const gstDoc = await getDoc(doc(db, 'gst_verifications', user.id));
      if (gstDoc.exists()) {
        const data = gstDoc.data();
        setGstData({
          gstNumber: data.gstNumber,
          verified: data.verified || false,
        });
      }
      setGstDataLoaded(true);
    } catch (error: any) {
      // Silently handle permission errors - user may not have GST data yet
      if (error?.code === 'permission-denied' || error?.code === 'missing-or-insufficient-permissions') {
        // Permission denied - user may not have GST verification yet, this is okay
        setGstDataLoaded(true);
        return;
      }
      // Only log unexpected errors
      console.error('Error loading GST data:', error);
      setGstDataLoaded(true);
    }
  };

  // Sample ledger data
  const ledgerEntries = [
    {
      id: 1,
      date: '2025-01-15',
      type: 'credit',
      description: 'Wire Authentication Reward',
      wireCode: 'WR-2025-0115',
      points: 50,
      balance: 3950,
    },
    {
      id: 2,
      date: '2025-01-14',
      type: 'credit',
      description: 'Wire Authentication Reward',
      wireCode: 'WR-2025-0114',
      points: 50,
      balance: 3900,
    },
    {
      id: 3,
      date: '2025-01-12',
      type: 'debit',
      description: 'Points Redeemed via UPI',
      wireCode: 'RD-2025-0112',
      points: -100,
      balance: 3850,
    },
    {
      id: 4,
      date: '2025-01-10',
      type: 'credit',
      description: 'Wire Authentication Reward',
      wireCode: 'WR-2025-0110',
      points: 50,
      balance: 3950,
    },
    {
      id: 5,
      date: '2025-01-08',
      type: 'credit',
      description: 'Bonus Points - Monthly Target',
      wireCode: 'BP-2025-0108',
      points: 200,
      balance: 3900,
    },
    {
      id: 6,
      date: '2025-01-05',
      type: 'credit',
      description: 'Wire Authentication Reward',
      wireCode: 'WR-2025-0105',
      points: 50,
      balance: 3700,
    },
  ];

  const filterButtons = [
    { id: 'all', label: 'All', icon: 'history' },
    { id: 'credit', label: 'Credit', icon: 'gift-box' },
    { id: 'debit', label: 'Debit', icon: 'bank' },
  ];

  const filteredEntries = ledgerEntries.filter(entry => 
    selectedFilter === 'all' ? true : entry.type === selectedFilter
  );

  const totalCredits = ledgerEntries
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + e.points, 0);

  const totalDebits = Math.abs(ledgerEntries
    .filter(e => e.type === 'debit')
    .reduce((sum, e) => sum + e.points, 0));

  const currentBalance = ledgerEntries[0]?.balance || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Ledger"
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
        {/* Summary Card */}
        <View style={styles.headerSection}>
          <View style={[
            styles.summaryCard,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Account Summary
            </Text>
            
            {/* GST Section */}
            {user?.userType === 'dealer' && gstDataLoaded && (
              <View style={[styles.gstSection, { borderBottomColor: theme.colors.border }]}>
                {gstData && gstData.verified ? (
                  <View style={styles.gstRow}>
                    <View style={styles.gstInfo}>
                      <Text style={[styles.gstLabel, { color: theme.colors.accent }]}>GST Number</Text>
                      <Text style={[styles.gstNumber, { color: theme.colors.text }]}>
                        {gstData.gstNumber || 'N/A'}
                      </Text>
                    </View>
                    <View style={[
                      styles.gstStatusBadge,
                      {
                        backgroundColor: isDark ? '#FFFFFF' : '#000000',
                        borderColor: theme.colors.border,
                      }
                    ]}>
                      <Icon 
                        name="check" 
                        size={16} 
                        color={isDark ? '#000000' : '#FFFFFF'} 
                        strokeWidth={3}
                      />
                      <Text style={[
                        styles.gstStatusText,
                        { color: isDark ? '#000000' : '#FFFFFF' }
                      ]}>
                        Verified
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.gstEmptyContainer}>
                    <Text style={[styles.gstEmptyLabel, { color: theme.colors.accent }]}>
                      GST Number Not Added
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.gstVerifyButton,
                        {
                          backgroundColor: isDark ? '#FFFFFF' : '#000000',
                        }
                      ]}
                      onPress={() => navigation.navigate('GSTVerification')}
                      activeOpacity={0.8}
                    >
                      <Icon name="check" size={18} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                      <Text style={[
                        styles.gstVerifyButtonText,
                        { color: isDark ? '#000000' : '#FFFFFF' }
                      ]}>
                        Verify GST
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.accent }]}>Total Credits</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {totalCredits}
                  </Text>
                  <Text style={[styles.summaryUnit, { color: theme.colors.accent }]}>pts</Text>
                </View>
              </View>
              
              <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.accent }]}>Total Debits</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {totalDebits}
                  </Text>
                  <Text style={[styles.summaryUnit, { color: theme.colors.accent }]}>pts</Text>
                </View>
              </View>
            </View>

            <View style={[styles.currentBalanceSection, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.currentBalanceLabel, { color: theme.colors.accent }]}>
                CURRENT BALANCE
              </Text>
              <Text style={[styles.currentBalanceValue, { color: theme.colors.text }]}>
                {currentBalance}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterSection}>
          <View style={[
            styles.filterRow,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
              borderColor: theme.colors.border,
            }
          ]}>
            {filterButtons.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  {
                    borderColor: theme.colors.border,
                  },
                  selectedFilter === filter.id && {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#FFFFFF' : '#000000',
                  },
                  selectedFilter !== filter.id && {
                    backgroundColor: 'transparent',
                  }
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.8}
              >
                <Icon 
                  name={filter.icon} 
                  size={20} 
                  color={
                    selectedFilter === filter.id
                      ? (isDark ? '#000000' : '#FFFFFF')
                      : theme.colors.iconColor
                  }
                  strokeWidth={2.5}
                />
                <Text style={[
                  styles.filterButtonText,
                  {
                    color: selectedFilter === filter.id
                      ? (isDark ? '#000000' : '#FFFFFF')
                      : theme.colors.text,
                  }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ledger Entries */}
        <View style={styles.ledgerList}>
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <View 
                key={entry.id} 
                style={[
                  styles.ledgerCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                {/* Header */}
                <View style={styles.ledgerHeader}>
                  <Text style={[styles.ledgerDate, { color: theme.colors.text }]}>
                    {entry.date}
                  </Text>
                  <View style={[
                    styles.ledgerBadge,
                    {
                      backgroundColor: entry.type === 'credit'
                        ? (isDark ? '#FFFFFF' : '#000000')
                        : (isDark ? '#1a1a1a' : '#F5F5F5'),
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Text style={[
                      styles.ledgerBadgeText,
                      {
                        color: entry.type === 'credit'
                          ? (isDark ? '#000000' : '#FFFFFF')
                          : theme.colors.text,
                      }
                    ]}>
                      {entry.type.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={[styles.ledgerDescription, { color: theme.colors.text }]}>
                  {entry.description}
                </Text>
                <Text style={[styles.ledgerCode, { color: theme.colors.accent }]}>
                  {entry.wireCode}
                </Text>

                {/* Footer */}
                <View style={[styles.ledgerFooter, { borderTopColor: theme.colors.border }]}>
                  <Text style={[
                    styles.ledgerPoints,
                    {
                      color: entry.type === 'credit'
                        ? theme.colors.text
                        : theme.colors.accent,
                    }
                  ]}>
                    {entry.points > 0 ? '+' : ''}{entry.points} pts
                  </Text>
                  <View style={styles.ledgerBalance}>
                    <Text style={[styles.balanceLabel, { color: theme.colors.accent }]}>Balance</Text>
                    <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
                      {entry.balance}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={[
              styles.emptyState,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                borderColor: theme.colors.border,
              }
            ]}>
              <View style={[
                styles.emptyIconContainer,
                {
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="history" size={48} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No {selectedFilter === 'all' ? '' : selectedFilter} transactions found
              </Text>
            </View>
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
  headerSection: {
    marginBottom: 32,
  },
  summaryCard: {
    borderRadius: 28,
    padding: 32,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  summaryTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 28,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1.5,
    height: 60,
    opacity: 0.3,
    marginHorizontal: 8,
  },
  summaryLabel: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  summaryValue: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
  },
  summaryUnit: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    opacity: 0.7,
  },
  currentBalanceSection: {
    alignItems: 'center',
    paddingTop: 28,
    borderTopWidth: 1.5,
  },
  currentBalanceLabel: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  currentBalanceValue: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  gstSection: {
    marginTop: 0,
    marginBottom: 28,
    paddingBottom: 28,
    borderBottomWidth: 1.5,
  },
  gstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  gstInfo: {
    flex: 1,
  },
  gstLabel: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  gstNumber: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gstStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 10,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gstStatusText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  gstEmptyContainer: {
    alignItems: 'center',
    gap: 16,
  },
  gstEmptyLabel: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  gstVerifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 10,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gstVerifyButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1.5,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  filterButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ledgerList: {
    gap: 14,
  },
  ledgerCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ledgerDate: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ledgerBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  ledgerBadgeText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  ledgerDescription: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 10,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  ledgerCode: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  ledgerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1.5,
  },
  ledgerPoints: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  ledgerBalance: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.3,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyState: {
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
    width: 100,
    height: 100,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  emptyText: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.3,
    opacity: 0.7,
    lineHeight: 24,
  },
});

export default LedgerScreen;

