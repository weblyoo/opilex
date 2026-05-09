import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type RedeemPointsNavigationProp = StackNavigationProp<RootStackParamList, 'RedeemPoints'>;

const RedeemPointsScreen: React.FC = () => {
  const navigation = useNavigation<RedeemPointsNavigationProp>();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [upiId, setUpiId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);

  const availablePoints = user?.rewardPoints || 3950;
  const minRedeem = 100;
  const businessDays = '2-3';

  const handleRedeem = () => {
    if (!upiId.trim()) {
      Alert.alert('Error', 'Please enter your UPI ID');
      return;
    }
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }
    if (!redeemAmount.trim()) {
      Alert.alert('Error', 'Please enter redeem amount');
      return;
    }

    const amount = parseInt(redeemAmount);
    if (amount < minRedeem) {
      Alert.alert('Error', `Minimum redeem amount is ${minRedeem} points`);
      return;
    }
    if (amount > availablePoints) {
      Alert.alert('Error', 'Insufficient points available');
      return;
    }

    // Show modern black and white modal instead of alert
    setShowRedemptionModal(true);
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
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
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
              <Icon name="gift-box" size={40} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                Redeem Points
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
                Convert your earned points into UPI payment
              </Text>
            </View>
          </View>
        </View>

        {/* Information Card */}
        <View style={[
          styles.infoCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
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
                {businessDays}
              </Text>
              <Text style={[styles.infoLabel, { color: theme.colors.accent }]}>
                Business Days
              </Text>
            </View>
          </View>
        </View>

        {/* Redemption Form Card */}
        <View style={[
          styles.formCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Redeem Points
            </Text>
          </View>

          <View style={styles.formSection}>
            {/* UPI Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>UPI ID</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="info" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                <TextInput
                  style={[styles.inputField, { color: theme.colors.text }]}
                  placeholder="Enter UPI ID"
                  placeholderTextColor={theme.colors.accent}
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Mobile Number Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Mobile Number</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Text style={[styles.countryPrefix, { color: theme.colors.iconColor }]}>+91</Text>
                <View style={[styles.inputSeparator, { backgroundColor: theme.colors.border }]} />
                <Icon name="phone" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                <TextInput
                  style={[styles.inputField, { color: theme.colors.text }]}
                  placeholder="Enter mobile number"
                  placeholderTextColor={theme.colors.accent}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

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
            >
              <Text style={[
                styles.redeemButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                Redeem Points
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
                backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
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
                    <Icon name="check" size={48} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={3} />
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
                Redemption Request
              </Text>
              
              {/* Message */}
              <Text style={[styles.redemptionModalMessage, { color: theme.colors.accent }]}>
                Your redemption request for {redeemAmount} points has been submitted successfully.
              </Text>

              {/* Details Container */}
              <View style={[
                styles.redemptionModalDetailsContainer,
                {
                  backgroundColor: isDark ? '#000000' : '#F5F5F5',
                  borderColor: theme.colors.border,
                }
              ]}>
                <View style={styles.redemptionModalDetailRow}>
                  <View style={[
                    styles.redemptionModalDetailIconContainer,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    }
                  ]}>
                    <Icon name="clock" size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                  </View>
                  <View style={styles.redemptionModalDetailTextContainer}>
                    <Text style={[styles.redemptionModalDetailTitle, { color: theme.colors.text }]}>
                      Processing Time
                    </Text>
                    <Text style={[styles.redemptionModalDetailDescription, { color: theme.colors.accent }]}>
                      You will receive the payment in {businessDays} business days
                    </Text>
                  </View>
                </View>
              </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  headerSection: {
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: 28,
    padding: 28,
    marginBottom: 32,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
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
    height: 60,
    opacity: 0.3,
    marginHorizontal: 8,
  },
  infoNumber: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  infoLabel: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  formCard: {
    borderRadius: 28,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  cardHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    fontWeight: '600',
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
  countryPrefix: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  inputSeparator: {
    width: 1.5,
    height: 26,
    marginRight: 10,
    opacity: 0.3,
  },
  inputField: {
    flex: 1,
    fontFamily: 'Ubuntu-Medium',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  redeemButton: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
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
  redeemButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  // Redemption Modal Styles
  redemptionModalContainer: {
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 30,
  },
  redemptionModalIconContainer: {
    marginBottom: 24,
  },
  redemptionModalIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  redemptionModalIconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  redemptionModalBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  redemptionModalBadgeText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  redemptionModalTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  redemptionModalMessage: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  redemptionModalDetailsContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  redemptionModalDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
  },
  redemptionModalDetailIconContainer: {
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
  redemptionModalDetailTextContainer: {
    flex: 1,
  },
  redemptionModalDetailTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  redemptionModalDetailDescription: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  redemptionModalButton: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  redemptionModalButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default RedeemPointsScreen;
