import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';

type GoldNavigationProp = StackNavigationProp<RootStackParamList, 'Gold'>;

interface Props {
  navigation: GoldNavigationProp;
}

const GoldScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [goldPrice] = useState(6420); // Current gold price per gram

  const goldPlans = [
    {
      id: '1',
      name: 'Starter Gold Plan',
      monthlyAmount: 1000,
      duration: '12 months',
      goldAccumulation: '1.8g',
      returns: '12-15%',
    },
    {
      id: '2',
      name: 'Premium Gold Plan',
      monthlyAmount: 2500,
      duration: '24 months',
      goldAccumulation: '4.5g',
      returns: '15-18%',
    },
    {
      id: '3',
      name: 'Elite Gold Plan',
      monthlyAmount: 5000,
      duration: '36 months',
      goldAccumulation: '9.2g',
      returns: '18-22%',
    },
  ];

  const handlePlanSelect = (plan: any) => {
    Alert.alert(
      'Invest in Gold',
      `Plan: ${plan.name}\nMonthly Investment: ₹${plan.monthlyAmount}\nDuration: ${plan.duration}\nExpected Returns: ${plan.returns}\n\nStart investing in digital gold today!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Investment', onPress: () => Alert.alert('Success', 'Gold investment plan activated!') },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Gold Investment"
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
              borderColor: theme.colors.border,
            }
          ]}>
            <Icon name="gift-box" size={36} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Digital Gold
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
            Invest in 24K pure digital gold and grow your wealth
          </Text>
        </View>

        {/* Gold Price Card */}
        <View style={[
          styles.priceCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <Text style={[styles.priceLabel, { color: theme.colors.accent }]}>
            Current Gold Price
          </Text>
          <Text style={[styles.priceValue, { color: theme.colors.text }]}>
            ₹{goldPrice.toLocaleString()}
          </Text>
          <Text style={[styles.priceUnit, { color: theme.colors.accent }]}>
            per gram (24K)
          </Text>
          <View style={styles.priceChange}>
            <View style={{ transform: [{ rotate: '-90deg' }] }}>
              <Icon name="arrow-left" size={14} color={theme.colors.text} strokeWidth={2.5} />
            </View>
            <Text style={[styles.priceChangeText, { color: theme.colors.accent }]}>
              +2.3% today
            </Text>
          </View>
        </View>

        {/* Investment Plans */}
        <View style={styles.plansSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Investment Plans
          </Text>
          
          {goldPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: isDark ? '#000000' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => handlePlanSelect(plan)}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <View style={[
                  styles.planIcon,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <Icon name="star" size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, { color: theme.colors.text }]}>
                    {plan.name}
                  </Text>
                  <Text style={[styles.planAmount, { color: theme.colors.text }]}>
                    ₹{plan.monthlyAmount}/month
                  </Text>
                </View>
                <View style={{ transform: [{ rotate: '180deg' }] }}>
                  <Icon name="arrow-left" size={20} color={theme.colors.accent} strokeWidth={2.5} />
                </View>
              </View>
              
              <View style={[styles.planDetails, { borderTopColor: theme.colors.border }]}>
                <View style={styles.planDetailItem}>
                  <Text style={[styles.planDetailLabel, { color: theme.colors.accent }]}>
                    Duration
                  </Text>
                  <Text style={[styles.planDetailValue, { color: theme.colors.text }]}>
                    {plan.duration}
                  </Text>
                </View>
                <View style={[styles.planDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.planDetailItem}>
                  <Text style={[styles.planDetailLabel, { color: theme.colors.accent }]}>
                    Gold Accumulation
                  </Text>
                  <Text style={[styles.planDetailValue, { color: theme.colors.text }]}>
                    {plan.goldAccumulation}
                  </Text>
                </View>
                <View style={[styles.planDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.planDetailItem}>
                  <Text style={[styles.planDetailLabel, { color: theme.colors.accent }]}>
                    Expected Returns
                  </Text>
                  <Text style={[styles.planDetailValue, { color: theme.colors.text }]}>
                    {plan.returns}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits Card */}
        <View style={[
          styles.benefitsCard,
          {
            backgroundColor: isDark ? '#000000' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>
            Why Invest in Gold?
          </Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon name="authenticate" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={[styles.benefitText, { color: theme.colors.accent }]}>
                100% Pure 24K Digital Gold
              </Text>
            </View>
            <View style={[styles.benefitDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.benefitItem}>
              <Icon name="wallet" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={[styles.benefitText, { color: theme.colors.accent }]}>
                No Making Charges
              </Text>
            </View>
            <View style={[styles.benefitDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.benefitItem}>
              <Icon name="store-locator" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={[styles.benefitText, { color: theme.colors.accent }]}>
                Instant Buy/Sell
              </Text>
            </View>
            <View style={[styles.benefitDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.benefitItem}>
              <Icon name="gift-box" size={20} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={[styles.benefitText, { color: theme.colors.accent }]}>
                Get Physical Gold Delivery
              </Text>
            </View>
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
    padding: 36,
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
  priceCard: {
    padding: 32,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 12,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  priceValue: {
    fontSize: 38,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  priceUnit: {
    fontSize: 16,
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 16,
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceChangeText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  plansSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  planCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  planIcon: {
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
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  planAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1.5,
    gap: 16,
  },
  planDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  planDivider: {
    width: 1.5,
    height: '100%',
    opacity: 0.3,
  },
  planDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 8,
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  planDetailValue: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  benefitsCard: {
    padding: 32,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  benefitsList: {
    gap: 0,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  benefitDivider: {
    height: 1.5,
    width: '100%',
    opacity: 0.3,
    marginVertical: 4,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
});

export default GoldScreen;




