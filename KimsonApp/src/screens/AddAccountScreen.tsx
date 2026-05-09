import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';

type AddAccountNavigationProp = StackNavigationProp<RootStackParamList, 'AddAccount'>;

interface Props {
  navigation: AddAccountNavigationProp;
}

interface BankAccount {
  id: string;
  type?: 'bank' | 'upi';
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  bankName?: string;
  upiUserName?: string;
  upiId?: string;
  mobileNumber?: string;
  isPrimary: boolean;
  createdAt: any;
}

const AddAccountScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  // UPI details
  const [upiUserName, setUpiUserName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiMobileNumber, setUpiMobileNumber] = useState('');
  const [isLoadingUpi, setIsLoadingUpi] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  useEffect(() => {
    loadAccounts();
  }, [user]);

  const loadAccounts = async () => {
    const uid = getAuth().currentUser?.uid || user?.id;
    if (!uid) return;
    
    try {
      const accountsQuery = query(
        collection(db, 'bankAccounts'),
        where('userId', '==', uid)
      );
      const querySnapshot = await getDocs(accountsQuery);
      const accountsList: BankAccount[] = [];
      
      querySnapshot.forEach((doc) => {
        accountsList.push({
          id: doc.id,
          ...doc.data(),
        } as BankAccount);
      });
      
      // Sort by primary first, then by creation date
      accountsList.sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return 0;
      });
      
      setAccounts(accountsList);
    } catch (error: any) {
      // Silently handle permission errors
      if (error?.code !== 'permission-denied' && error?.code !== 'missing-or-insufficient-permissions') {
        console.error('Error loading accounts:', error);
      }
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAddAccount = async () => {
    if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const authUid = getAuth().currentUser?.uid || user?.id;
    if (!authUid) {
      Alert.alert('Error', 'Please sign in to add a bank account.');
      return;
    }

    setIsLoading(true);
    
    try {
      // If this is the first account, make it primary
      const isFirstAccount = accounts.length === 0;
      
      // If setting as primary, unset other primary accounts
      if (!isFirstAccount) {
        const updatePromises = accounts
          .filter(acc => acc.isPrimary)
          .map(acc => updateDoc(doc(db, 'bankAccounts', acc.id), { isPrimary: false }));
        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
        }
      }

      // Use Firebase Auth UID so Firestore rules (userId == request.auth.uid) allow the write
      const accountData = {
        userId: authUid,
        type: 'bank',
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        isPrimary: isFirstAccount,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bankAccounts'), accountData);
      
      // Clear form
      setAccountNumber('');
      setIfscCode('');
      setAccountHolderName('');
      setBankName('');
      
      // Reload accounts
      await loadAccounts();
      setSuccessModalTitle('Account Added');
      setSuccessModalMessage('Your bank account has been added for withdrawals.');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error adding account:', error);
      const code = error?.code;
      const msg = error?.message || '';
      let userMessage = 'Failed to add account. Please try again.';
      if (code === 'permission-denied' || code === 'missing-or-insufficient-permissions') {
        userMessage = 'Permission denied. Make sure you are signed in and that your app has the latest Firestore rules deployed.';
      } else if (msg && msg.length < 80) {
        userMessage = `Failed to add account: ${msg}`;
      }
      Alert.alert('Error', userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUpi = async () => {
    if (!upiUserName.trim() || !upiId.trim() || !upiMobileNumber.trim()) {
      Alert.alert('Error', 'Please fill all UPI details');
      return;
    }
    const authUid = getAuth().currentUser?.uid || user?.id;
    if (!authUid) {
      Alert.alert('Error', 'Please sign in to add UPI details.');
      return;
    }
    const mobile = upiMobileNumber.trim().replace(/\D/g, '');
    if (mobile.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoadingUpi(true);
    try {
      const upiAccounts = accounts.filter((a) => a.type === 'upi');
      const isFirstUpi = upiAccounts.length === 0;
      if (!isFirstUpi) {
        const updatePromises = upiAccounts
          .filter((acc) => acc.isPrimary)
          .map((acc) => updateDoc(doc(db, 'bankAccounts', acc.id), { isPrimary: false }));
        if (updatePromises.length > 0) await Promise.all(updatePromises);
      }
      const upiData = {
        userId: authUid,
        type: 'upi',
        upiUserName: upiUserName.trim(),
        upiId: upiId.trim(),
        mobileNumber: mobile,
        isPrimary: isFirstUpi,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'bankAccounts'), upiData);
      setUpiUserName('');
      setUpiId('');
      setUpiMobileNumber('');
      await loadAccounts();
      setSuccessModalTitle('UPI Added');
      setSuccessModalMessage('Your UPI details have been added.');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error adding UPI:', error);
      Alert.alert('Error', error?.message || 'Failed to add UPI details. Please try again.');
    } finally {
      setIsLoadingUpi(false);
    }
  };

  const handleSetPrimary = async (accountId: string) => {
    if (!user) return;
    
    try {
      // Unset all primary accounts
      const updatePromises = accounts
        .filter(acc => acc.isPrimary)
        .map(acc => updateDoc(doc(db, 'bankAccounts', acc.id), { isPrimary: false }));
      await Promise.all(updatePromises);
      
      // Set selected account as primary
      await updateDoc(doc(db, 'bankAccounts', accountId), { isPrimary: true });
      
      // Reload accounts
      await loadAccounts();
    } catch (error: any) {
      console.error('Error setting primary account:', error);
      Alert.alert('Error', 'Failed to set primary account. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Add Account"
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
            }
          ]}>
            <Icon 
              name="bank" 
              size={32} 
              color={isDark ? '#000000' : '#FFFFFF'} 
              strokeWidth={2.5} 
            />
          </View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Add Bank Account
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
            Add your bank account for easy withdrawals
          </Text>
        </View>

        {/* Added Accounts List */}
        {!loadingAccounts && accounts.length > 0 && (
          <View style={[
            styles.accountsListCard,
            {
              backgroundColor: isDark ? '#000000' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            <Text style={[styles.accountsListTitle, { color: theme.colors.text }]}>
              Added Accounts
            </Text>
            {accounts.map((account) => {
              const isUpi = account.type === 'upi';
              return (
              <View 
                key={account.id} 
                style={[
                  styles.accountItem,
                  {
                    backgroundColor: isDark ? '#000000' : '#FFFFFF',
                    borderColor: theme.colors.border,
                  },
                  account.isPrimary && {
                    backgroundColor: isDark ? '#0a0a0a' : '#F0F0F0',
                    borderWidth: 2,
                  }
                ]}
              >
                <View style={[
                  styles.accountIconContainer,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}>
                  <Icon 
                    name={isUpi ? 'gift-box' : 'bank'} 
                    size={24} 
                    color={isDark ? '#000000' : '#FFFFFF'} 
                    strokeWidth={2.5} 
                  />
                </View>
                <View style={styles.accountInfo}>
                  <View style={styles.accountHeader}>
                    <Text style={[styles.accountBankName, { color: theme.colors.text }]}>
                      {isUpi ? (account.upiUserName || 'UPI') : account.bankName}
                    </Text>
                    {account.isPrimary && (
                      <View style={[
                        styles.primaryBadge,
                        {
                          backgroundColor: isDark ? '#FFFFFF' : '#000000',
                        }
                      ]}>
                        <Text style={[
                          styles.primaryBadgeText,
                          { color: isDark ? '#000000' : '#FFFFFF' }
                        ]}>
                          PRIMARY
                        </Text>
                      </View>
                    )}
                  </View>
                  {isUpi ? (
                    <>
                      <Text style={[styles.accountHolderName, { color: theme.colors.accent }]}>
                        {account.upiId}
                      </Text>
                      <Text style={[styles.accountDetails, { color: theme.colors.accent }]}>
                        Mobile: {account.mobileNumber || '—'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.accountHolderName, { color: theme.colors.accent }]}>
                        {account.accountHolderName}
                      </Text>
                      <Text style={[styles.accountDetails, { color: theme.colors.accent }]}>
                        A/C: ****{(account.accountNumber || '').slice(-4)} | IFSC: {account.ifscCode}
                      </Text>
                    </>
                  )}
                </View>
                {!account.isPrimary && (
                  <TouchableOpacity
                    style={[
                      styles.setPrimaryButton,
                      {
                        backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      }
                    ]}
                    onPress={() => handleSetPrimary(account.id)}
                    activeOpacity={0.8}
                  >
                    <Icon 
                      name="check" 
                      size={18} 
                      color={isDark ? '#000000' : '#FFFFFF'} 
                      strokeWidth={2.5} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            );})}
          </View>
        )}

        {/* Account Form */}
        <View style={[
          styles.formCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>
            Account Details
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Account Holder Name
            </Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: theme.colors.border,
              }
            ]}>
              <Icon name="user" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <TextInput
                placeholder="Enter full name as per bank"
                placeholderTextColor={theme.colors.accent}
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                style={[styles.inputText, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Account Number
            </Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: theme.colors.border,
              }
            ]}>
              <Icon name="bank" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <TextInput
                placeholder="Enter account number"
                placeholderTextColor={theme.colors.accent}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                style={[styles.inputText, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              IFSC Code
            </Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: theme.colors.border,
              }
            ]}>
              <Icon name="info" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <TextInput
                placeholder="Enter IFSC code"
                placeholderTextColor={theme.colors.accent}
                value={ifscCode}
                onChangeText={setIfscCode}
                autoCapitalize="characters"
                style={[styles.inputText, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Bank Name
            </Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: theme.colors.border,
              }
            ]}>
              <Icon name="bank" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <TextInput
                placeholder="Enter bank name"
                placeholderTextColor={theme.colors.accent}
                value={bankName}
                onChangeText={setBankName}
                style={[styles.inputText, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                borderColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            onPress={handleAddAccount}
            disabled={Boolean(isLoading)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.addButtonText,
              { color: isDark ? '#000000' : '#FFFFFF' }
            ]}>
              {isLoading ? 'Adding Account...' : 'Add Account'}
            </Text>
          </TouchableOpacity>

          {/* Add UPI details - under Account Details */}
          <Text style={[styles.formTitle, styles.upiSectionTitle, { color: theme.colors.text }]}>
            Add UPI details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              UPI user name
            </Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: theme.colors.border,
              }
            ]}>
              <Icon name="user" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <TextInput
                placeholder="Enter UPI user name"
                placeholderTextColor={theme.colors.accent}
                value={upiUserName}
                onChangeText={setUpiUserName}
                style={[styles.inputText, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              UPI ID
            </Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: theme.colors.border,
              }
            ]}>
              <Icon name="info" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <TextInput
                placeholder="e.g. name@paytm"
                placeholderTextColor={theme.colors.accent}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.inputText, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Mobile number
            </Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: theme.colors.border,
              }
            ]}>
              <Text style={[styles.countryPrefix, { color: theme.colors.iconColor }]}>+91</Text>
              <TextInput
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor={theme.colors.accent}
                value={upiMobileNumber}
                onChangeText={setUpiMobileNumber}
                keyboardType="phone-pad"
                maxLength={10}
                style={[styles.inputText, { color: theme.colors.text }]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
                borderColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            onPress={handleAddUpi}
            disabled={Boolean(isLoadingUpi)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.addButtonText,
              { color: isDark ? '#000000' : '#FFFFFF' }
            ]}>
              {isLoadingUpi ? 'Adding UPI...' : 'Add UPI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
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
            }
          ]}>
            <Icon 
              name="authenticate" 
              size={24} 
              color={isDark ? '#000000' : '#FFFFFF'} 
              strokeWidth={2.5} 
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              Secure & Protected
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.accent }]}>
              Your bank details are encrypted and stored securely. We use bank-grade security.
            </Text>
          </View>
        </View>

        {/* Success Modal - same design as Redeem Points */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.successModalOverlay}>
            <View style={[
              styles.successModalContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}>
              <View style={styles.successModalIconContainer}>
                <View style={[
                  styles.successModalIconOuter,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  }
                ]}>
                  <View style={[
                    styles.successModalIconInner,
                    { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
                  ]}>
                    <Icon name="check" size={40} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                  </View>
                </View>
              </View>
              <View style={[
                styles.successModalBadge,
                { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                <Text style={[
                  styles.successModalBadgeText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  SUCCESS
                </Text>
              </View>
              <Text style={[styles.successModalTitle, { color: theme.colors.text }]}>
                {successModalTitle}
              </Text>
              <Text style={[styles.successModalMessage, { color: theme.colors.accent }]}>
                {successModalMessage}
              </Text>
              <TouchableOpacity
                style={[
                  styles.successModalButton,
                  { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
                ]}
                onPress={() => setShowSuccessModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.successModalButtonText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  // Header Card
  headerCard: {
    marginBottom: 32,
    padding: 32,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  // Accounts List
  accountsListCard: {
    marginBottom: 32,
    padding: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  accountsListTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  accountItem: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  accountItemPrimary: {
    borderWidth: 2,
  },
  accountIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
    flexWrap: 'wrap',
  },
  accountBankName: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  primaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  accountHolderName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 6,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  accountDetails: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    letterSpacing: 0.2,
    opacity: 0.6,
  },
  setPrimaryButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  // Form Card
  formCard: {
    marginBottom: 32,
    padding: 28,
    borderRadius: 28,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  upiSectionTitle: {
    marginTop: 28,
    marginBottom: 24,
  },
  countryPrefix: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Bold',
    marginRight: 8,
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
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    paddingVertical: 0,
  },
  addButton: {
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
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  // Info Card
  infoCard: {
    flexDirection: 'row',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  infoIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
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
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 20,
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  // Success modal - same design as Redeem Points
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModalContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
  },
  successModalIconContainer: {
    marginBottom: 14,
  },
  successModalIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  successModalIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalBadge: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  successModalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 1,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  successModalMessage: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  successModalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  successModalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
});

export default AddAccountScreen;




