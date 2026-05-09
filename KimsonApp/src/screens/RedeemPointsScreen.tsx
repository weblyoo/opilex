import React, { useState, useMemo } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/firestore';

type RedeemPointsNavigationProp = StackNavigationProp<RootStackParamList, 'RedeemPoints'>;

const BASE_WIDTH = 375;

const RedeemPointsScreen: React.FC = () => {
  const navigation = useNavigation<RedeemPointsNavigationProp>();
  const { theme, isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [redeemAmount, setRedeemAmount] = useState('');
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scale = Math.min(screenWidth / BASE_WIDTH, 1.2);
  const scaled = (n: number) => Math.round(n * scale);

  const styles = useMemo(() => createStyles(scaled), [scale]);

  const availablePoints = user?.rewardPoints ?? 0;
  const minRedeem = 100;

  const handleRedeem = async () => {
    if (!redeemAmount.trim()) {
      Alert.alert('Error', 'Please enter points to redeem');
      return;
    }

    const amount = parseInt(redeemAmount, 10);
    if (isNaN(amount) || amount < minRedeem) {
      Alert.alert('Error', `Minimum redeem amount is ${minRedeem} points`);
      return;
    }
    if (amount > availablePoints) {
      Alert.alert('Error', 'Insufficient points available');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to redeem');
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.redeemPointsToWallet(user.id, amount);
      await refreshUser();
      setShowRedemptionModal(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to redeem points. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseRedemption = () => {
    setShowRedemptionModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Redeem Points"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[
          styles.headerSection,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.headerContent}>
            <View style={[
              styles.iconCircle,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}>
              <Icon name="gift-box" size={scaled(36)} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                Redeem Points
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
                Convert points to wallet balance (1 point = ₹1)
              </Text>
            </View>
          </View>
        </View>

        {/* Information Card */}
        <View style={[
          styles.infoCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoNumber, { color: theme.colors.text }]}>
                {availablePoints}
              </Text>
              <Text style={[styles.infoLabel, { color: theme.colors.accent }]}>
                Available Points
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoNumber, { color: theme.colors.text }]}>
                {minRedeem}
              </Text>
              <Text style={[styles.infoLabel, { color: theme.colors.accent }]}>
                Min. Redeem
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoNumber, { color: theme.colors.text }]}>
                1 = ₹1
              </Text>
              <Text style={[styles.infoLabel, { color: theme.colors.accent }]}>
                Point to Wallet
              </Text>
            </View>
          </View>
        </View>

        {/* Redemption Form Card */}
        <View style={[
          styles.formCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Redeem Points
            </Text>
          </View>

          <View style={styles.formSection}>
            {/* Point Redeem Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Point Redeem</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="gift-box" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                <TextInput
                  style={[styles.inputField, { color: theme.colors.text }]}
                  placeholder="Enter amount"
                  placeholderTextColor={theme.colors.accent}
                  value={redeemAmount}
                  onChangeText={setRedeemAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Redeem Button */}
            <TouchableOpacity 
              style={[
                styles.redeemButton,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#FFFFFF' : '#000000',
                }
              ]} 
              onPress={handleRedeem}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Text style={[
                styles.redeemButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                {isSubmitting ? 'Redeeming...' : 'Redeem Points'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Redemption Success Modal */}
        <Modal
          visible={showRedemptionModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseRedemption}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.redemptionModalContainer,
              {
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}>
              {/* Icon Container */}
              <View style={styles.redemptionModalIconContainer}>
                <View style={[
                  styles.redemptionModalIconOuter,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  }
                ]}>
                  <View style={[
                    styles.redemptionModalIconInner,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    }
                  ]}>
                    <Icon name="check" size={scaled(40)} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                  </View>
                </View>
              </View>

              {/* Success Badge */}
              <View style={[
                styles.redemptionModalBadge,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                }
              ]}>
                <Text style={[
                  styles.redemptionModalBadgeText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  SUCCESS
                </Text>
              </View>

              {/* Title */}
              <Text style={[styles.redemptionModalTitle, { color: theme.colors.text }]}>
                Points Redeemed
              </Text>
              
              {/* Message */}
              <Text style={[styles.redemptionModalMessage, { color: theme.colors.accent }]}>
                {redeemAmount} points have been added to your wallet balance as ₹{redeemAmount} (1 point = ₹1).
              </Text>

              {/* Action Button */}
              <TouchableOpacity 
                style={[
                  styles.redemptionModalButton,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]} 
                onPress={handleCloseRedemption}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.redemptionModalButtonText,
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

const createStyles = (s: (n: number) => number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: s(16),
      paddingTop: s(16),
      paddingBottom: s(80),
    },
    headerSection: {
      borderRadius: s(20),
      padding: s(18),
      marginBottom: s(16),
      borderWidth: 1.5,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: s(14),
      elevation: 10,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(14),
    },
    iconCircle: {
      width: s(56),
      height: s(56),
      borderRadius: s(16),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: s(10),
      elevation: 6,
    },
    headerText: {
      flex: 1,
    },
    headerTitle: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(20),
      fontWeight: '700',
      marginBottom: s(4),
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontFamily: 'Ubuntu-Regular',
      fontSize: s(13),
      fontWeight: '400',
      letterSpacing: 0.3,
      opacity: 0.7,
      lineHeight: s(18),
    },
    infoCard: {
      borderRadius: s(20),
      padding: s(16),
      marginBottom: s(20),
      borderWidth: 1.5,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: s(12),
      elevation: 8,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    infoItem: {
      flex: 1,
      alignItems: 'center',
    },
    infoDivider: {
      width: 1.5,
      height: s(40),
      opacity: 0.3,
      marginHorizontal: s(4),
    },
    infoNumber: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(22),
      fontWeight: '700',
      marginBottom: s(4),
      letterSpacing: 0.5,
    },
    infoLabel: {
      fontFamily: 'Ubuntu-Medium',
      fontSize: s(10),
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      opacity: 0.7,
    },
    formCard: {
      borderRadius: s(20),
      padding: s(20),
      marginBottom: s(16),
      borderWidth: 1.5,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: s(14),
      elevation: 10,
    },
    cardHeader: {
      marginBottom: s(20),
      alignItems: 'center',
    },
    cardTitle: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(20),
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    formSection: {
      width: '100%',
    },
    inputGroup: {
      marginBottom: s(16),
    },
    inputLabel: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(12),
      fontWeight: '600',
      marginBottom: s(8),
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: s(14),
      paddingHorizontal: s(14),
      height: s(52),
      gap: s(10),
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: s(8),
      elevation: 5,
    },
    countryPrefix: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(14),
      fontWeight: '600',
      marginRight: s(8),
    },
    inputSeparator: {
      width: 1.5,
      height: s(22),
      marginRight: s(8),
      opacity: 0.3,
    },
    inputField: {
      flex: 1,
      fontFamily: 'Ubuntu-Medium',
      fontSize: s(14),
      fontWeight: '500',
      paddingVertical: 0,
    },
    redeemButton: {
      borderRadius: s(14),
      paddingVertical: s(16),
      paddingHorizontal: s(24),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(10),
      borderWidth: 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: s(12),
      elevation: 8,
    },
    redeemButtonText: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(15),
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: s(20),
    },
    redemptionModalContainer: {
      borderRadius: s(20),
      padding: s(24),
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
      borderWidth: 2,
    },
    redemptionModalIconContainer: {
      marginBottom: s(14),
    },
    redemptionModalIconOuter: {
      width: s(80),
      height: s(80),
      borderRadius: s(40),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
    redemptionModalIconInner: {
      width: s(56),
      height: s(56),
      borderRadius: s(28),
      justifyContent: 'center',
      alignItems: 'center',
    },
    redemptionModalBadge: {
      paddingHorizontal: s(18),
      paddingVertical: s(6),
      borderRadius: s(16),
      marginBottom: s(12),
      borderWidth: 2,
    },
    redemptionModalBadgeText: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(11),
      fontWeight: '700',
      letterSpacing: 1,
    },
    redemptionModalTitle: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(18),
      fontWeight: '700',
      marginBottom: s(8),
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    redemptionModalMessage: {
      fontFamily: 'Ubuntu-Regular',
      fontSize: s(14),
      fontWeight: '400',
      marginBottom: s(18),
      textAlign: 'center',
      lineHeight: s(20),
      letterSpacing: 0.3,
      opacity: 0.8,
    },
    redemptionModalDetailsContainer: {
      width: '100%',
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(18),
      borderWidth: 1.5,
    },
    redemptionModalDetailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(14),
    },
    redemptionModalDetailIconContainer: {
      width: s(42),
      height: s(42),
      borderRadius: s(12),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
    redemptionModalDetailTextContainer: {
      flex: 1,
    },
    redemptionModalDetailTitle: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(14),
      fontWeight: '700',
      marginBottom: s(4),
      letterSpacing: 0.3,
    },
    redemptionModalDetailDescription: {
      fontFamily: 'Ubuntu-Regular',
      fontSize: s(13),
      lineHeight: s(18),
      letterSpacing: 0.2,
      opacity: 0.8,
    },
    redemptionModalButton: {
      borderRadius: s(12),
      paddingVertical: s(12),
      paddingHorizontal: s(28),
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    redemptionModalButtonText: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: s(14),
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });

export default RedeemPointsScreen;




