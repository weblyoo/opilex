import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';

type CouponsNavigationProp = StackNavigationProp<RootStackParamList, 'Coupons'>;

interface Props {
  navigation: CouponsNavigationProp;
}

interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  code: string;
  validUntil: string;
  minPurchase: number;
  status: 'available' | 'used' | 'expired';
  category: 'discount' | 'cashback' | 'free-shipping';
}

const CouponsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const coupons: Coupon[] = [
    {
      id: '1',
      title: '20% OFF Premium Wires',
      description: 'Get 20% discount on all premium wire products',
      discount: '20% OFF',
      code: 'WIRE20',
      validUntil: '31 Dec 2024',
      minPurchase: 2000,
      status: 'available',
      category: 'discount',
    },
    {
      id: '2',
      title: 'Free Shipping',
      description: 'Free shipping on orders above ₹1000',
      discount: 'FREE SHIPPING',
      code: 'FREESHIP',
      validUntil: '30 Nov 2024',
      minPurchase: 1000,
      status: 'available',
      category: 'free-shipping',
    },
    {
      id: '3',
      title: '₹500 Cashback',
      description: 'Get ₹500 cashback on bulk orders',
      discount: '₹500 BACK',
      code: 'BULK500',
      validUntil: '15 Oct 2024',
      minPurchase: 5000,
      status: 'used',
      category: 'cashback',
    },
    {
      id: '4',
      title: 'First Time Buyer',
      description: '15% off for new customers',
      discount: '15% OFF',
      code: 'FIRST15',
      validUntil: '31 Jan 2025',
      minPurchase: 500,
      status: 'available',
      category: 'discount',
    },
    {
      id: '5',
      title: 'Weekend Special',
      description: 'Extra 10% off on weekend purchases',
      discount: '10% OFF',
      code: 'WEEKEND10',
      validUntil: '30 Sep 2024',
      minPurchase: 1500,
      status: 'expired',
      category: 'discount',
    },
  ];

  const handleCouponPress = (coupon: Coupon) => {
    if (coupon.status === 'used') {
      Alert.alert('Coupon Used', 'This coupon has already been used.');
      return;
    }
    if (coupon.status === 'expired') {
      Alert.alert('Coupon Expired', 'This coupon has expired.');
      return;
    }

    Alert.alert(
      'Copy Coupon Code',
      `Coupon: ${coupon.title}\nCode: ${coupon.code}\nDiscount: ${coupon.discount}\nMin Purchase: ₹${coupon.minPurchase}\n\nCoupon code copied to clipboard!`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getCategoryColor = (category: string) => {
    return theme.colors.text;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return 'coupons';
      case 'cashback': return 'wallet';
      case 'free-shipping': return 'store-locator';
      default: return 'coupons';
    }
  };

  const getStatusColor = (status: string) => {
    return theme.colors.accent;
  };

  const availableCoupons = coupons.filter(c => c.status === 'available');
  const usedCoupons = coupons.filter(c => c.status === 'used');
  const expiredCoupons = coupons.filter(c => c.status === 'expired');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Coupons"
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
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={[
            styles.headerIcon,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
            }
          ]}>
            <Icon name="coupons" size={36} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            My Coupons
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
            Save money with exclusive discount coupons
          </Text>
        </View>

        {/* Available Coupons */}
        {availableCoupons.length > 0 && (
          <View style={styles.couponsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Available Coupons
            </Text>
            
            {availableCoupons.map((coupon) => (
              <TouchableOpacity
                key={coupon.id}
                style={[
                  styles.couponCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleCouponPress(coupon)}
                activeOpacity={0.8}
              >
                <View style={styles.couponHeader}>
                  <View style={[
                    styles.couponIconContainer,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Icon 
                      name={getCategoryIcon(coupon.category)} 
                      size={24} 
                      color={isDark ? '#000000' : '#FFFFFF'} 
                      strokeWidth={2.5} 
                    />
                  </View>
                  <View style={styles.couponInfo}>
                    <Text style={[styles.couponTitle, { color: theme.colors.text }]}>
                      {coupon.title}
                    </Text>
                    <Text style={[styles.couponCode, { color: theme.colors.accent }]}>
                      Code: {coupon.code}
                    </Text>
                  </View>
                  <View style={[
                    styles.discountBadge,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Text style={[
                      styles.discountText,
                      { color: isDark ? '#000000' : '#FFFFFF' }
                    ]}>
                      {coupon.discount}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.couponDescription, { color: theme.colors.accent }]}>
                  {coupon.description}
                </Text>
                
                <View style={[
                  styles.couponFooter,
                  {
                    borderTopColor: theme.colors.border,
                  }
                ]}>
                  <Text style={[styles.minPurchase, { color: theme.colors.accent }]}>
                    Min purchase: ₹{coupon.minPurchase}
                  </Text>
                  <Text style={[styles.validUntil, { color: theme.colors.accent }]}>
                    Valid until: {coupon.validUntil}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Used Coupons */}
        {usedCoupons.length > 0 && (
          <View style={styles.couponsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Used Coupons
            </Text>
            
            {usedCoupons.map((coupon) => (
              <View
                key={coupon.id}
                style={[
                  styles.couponCard,
                  styles.disabledCoupon,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <View style={styles.couponHeader}>
                  <View style={[
                    styles.couponIconContainer,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Icon 
                      name={getCategoryIcon(coupon.category)} 
                      size={24} 
                      color={isDark ? '#000000' : '#FFFFFF'} 
                      strokeWidth={2.5} 
                    />
                  </View>
                  <View style={styles.couponInfo}>
                    <Text style={[styles.couponTitle, { color: theme.colors.accent, opacity: 0.6 }]}>
                      {coupon.title}
                    </Text>
                    <Text style={[styles.couponCode, { color: theme.colors.accent, opacity: 0.5 }]}>
                      Code: {coupon.code}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: isDark ? '#000000' : '#FFFFFF' }
                    ]}>
                      USED
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Expired Coupons */}
        {expiredCoupons.length > 0 && (
          <View style={styles.couponsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Expired Coupons
            </Text>
            
            {expiredCoupons.map((coupon) => (
              <View
                key={coupon.id}
                style={[
                  styles.couponCard,
                  styles.disabledCoupon,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <View style={styles.couponHeader}>
                  <View style={[
                    styles.couponIconContainer,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Icon 
                      name={getCategoryIcon(coupon.category)} 
                      size={24} 
                      color={isDark ? '#000000' : '#FFFFFF'} 
                      strokeWidth={2.5} 
                    />
                  </View>
                  <View style={styles.couponInfo}>
                    <Text style={[styles.couponTitle, { color: theme.colors.accent, opacity: 0.6 }]}>
                      {coupon.title}
                    </Text>
                    <Text style={[styles.couponCode, { color: theme.colors.accent, opacity: 0.5 }]}>
                      Code: {coupon.code}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: isDark ? '#000000' : '#FFFFFF' }
                    ]}>
                      EXPIRED
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Info Card */}
        <View style={[
          styles.infoCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={[
            styles.infoIcon,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
              borderColor: theme.colors.border,
            }
          ]}>
            <Icon name="info" size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              How to Use Coupons
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.accent }]}>
              • Tap on available coupons to copy code{'\n'}
              • Apply code during checkout{'\n'}
              • Meet minimum purchase requirements{'\n'}
              • Each coupon can be used only once
            </Text>
          </View>
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
  headerCard: {
    marginBottom: 32,
    padding: 32,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  headerIcon: {
    width: 88,
    height: 88,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  couponsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  couponCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  disabledCoupon: {
    opacity: 0.6,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  couponIconContainer: {
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
  couponInfo: {
    flex: 1,
  },
  couponTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  couponCode: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  discountBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  statusBadge: {
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
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 1,
  },
  couponDescription: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1.5,
  },
  minPurchase: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  validUntil: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    gap: 18,
  },
  infoIcon: {
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
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 22,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
});

export default CouponsScreen;
