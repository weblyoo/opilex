import React, { useEffect, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootStackParamList, WireAuthentication, Reward } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, darkTheme } from '../contexts/ThemeContext';
import ImageSlider from '../components/ImageSlider';
import Header from '../components/Header';
import { listSlides, type SliderItem } from '../services/sliders';
import Icon from '../components/Icon';
import NotificationDrawer from '../components/NotificationDrawer';
import { globalTextStyles } from '../styles/globalStyles';
import { fonts } from '../config/fonts';
import mockAuthService from '../services/mockAuth';
// import { wireAuthService, rewardService } from '../services/firestore';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardNavigationProp;
}

interface DashboardItem {
  id: string;
  title: string;
  iconName: string;
  route?: keyof RootStackParamList;
  action?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: () => void;
}

const { width, height: screenHeight } = Dimensions.get('window');

// Responsive fallback for scroll padding when fixed section height not yet measured
const FIXED_SECTION_FALLBACK_PADDING = Math.max(200, Math.min(screenHeight * 0.32, 280));

// Banner/slider display heights (match admin recommended sizes: Tips 1200×370, Offers 1200×486, Promos 1200×615)
const BANNER_HEIGHT_TIPS = 120;
const BANNER_HEIGHT_OFFERS = 158;
const BANNER_HEIGHT_PROMOS = 200;

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refreshUser, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Measured height of greeting + rewards section so scroll content starts below it (prevents card overlap)
  const [fixedSectionHeight, setFixedSectionHeight] = useState(0);
  
  // Create styles with theme
  const styles = createStyles(theme);
  
  // Simple and reliable button size calculation
  const containerMargin = 48; // 24px on each side
  const containerPadding = 32; // 16px on each side  
  const separatorSpace = 30; // 3 separators with smaller margins
  const availableSpace = width - containerMargin - containerPadding - separatorSpace;
  const buttonSize = Math.floor(availableSpace / 4);
  const [recentAuthentications, setRecentAuthentications] = useState<WireAuthentication[]>([]);
  const [recentRewards, setRecentRewards] = useState<Reward[]>([]);
  const [monthlyPoints, setMonthlyPoints] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [latestUserType, setLatestUserType] = useState<string | null>(null);
  // Sliders from admin (Firestore) - tips, offers, deals (admin upload/update shows here on next focus)
  const [tipSlidesFromApi, setTipSlidesFromApi] = useState<Array<{ id: string; title: string; subtitle?: string; imageSource?: any; imageUrl?: string; backgroundColor?: string; textColor?: string; gradientColors?: string[] }>>([]);
  const [offerSlidesFromApi, setOfferSlidesFromApi] = useState<Array<{ id: string; title: string; subtitle?: string; imageSource?: any; imageUrl?: string; backgroundColor?: string; textColor?: string; gradientColors?: string[] }>>([]);
  const [dealSlidesFromApi, setDealSlidesFromApi] = useState<Array<{ id: string; title: string; subtitle?: string; imageSource?: any; imageUrl?: string; backgroundColor?: string; textColor?: string; gradientColors?: string[] }>>([]);
  const [promosSlidesFromApi, setPromosSlidesFromApi] = useState<Array<{ id: string; title: string; subtitle?: string; imageSource?: any; imageUrl?: string; backgroundColor?: string; textColor?: string; gradientColors?: string[] }>>([]);
  
  // Scroll animation for Scan Now button
  const scrollY = useRef(new Animated.Value(0)).current;
  const buttonWidth = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [width * 0.45, 56], // From 45% width to 56px (rectangle icon only)
    extrapolate: 'clamp',
  });
  const buttonBorderRadius = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [25, 12], // From fully rounded to light corners
    extrapolate: 'clamp',
  });
  const textOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const textWidth = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const NOTIFICATION_READ_KEY = '@opilex_notification_read_ids';

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    AsyncStorage.getItem(NOTIFICATION_READ_KEY).then((raw) => {
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(id)) {
        AsyncStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify([...ids, id]));
      }
    }).catch(() => {});
  };

  const handleClearAllNotifications = () => {
    const ids = notifications.map(n => n.id);
    if (ids.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    AsyncStorage.getItem(NOTIFICATION_READ_KEY).then((raw) => {
      const existing: string[] = raw ? JSON.parse(raw) : [];
      const merged = [...new Set([...existing, ...ids])];
      AsyncStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(merged));
    }).catch(() => {});
  };

  const buildNotificationsFromData = async (rewardsList: Reward[]) => {
    if (!user) return;
    const raw = await AsyncStorage.getItem(NOTIFICATION_READ_KEY);
    const readIds: string[] = raw ? JSON.parse(raw) : [];
    const toDate = (val: unknown): Date => {
      if (val instanceof Date) return val;
      if (val && typeof (val as { toDate?: () => Date }).toDate === 'function') return (val as { toDate: () => Date }).toDate();
      if (typeof val === 'number') return new Date(val);
      return new Date(String(val));
    };
    const list: Notification[] = rewardsList.slice(0, 20).map(r => ({
      id: r.id,
      title: r.type === 'wire_authentication' ? 'Wire Authentication' : 'Points earned',
      message: `${r.description || 'Reward'}. +${r.points} points`,
      type: 'success' as const,
      timestamp: toDate((r as Reward & { createdAt: unknown }).createdAt),
      read: readIds.includes(r.id),
      action: () => navigation.navigate('Rewards'),
    }));
    if (user.kycVerified && !list.some(n => n.id === 'kyc-welcome')) {
      list.push({
        id: 'kyc-welcome',
        title: 'Welcome Bonus!',
        message: 'You earned 100 points for completing KYC verification.',
        type: 'success',
        timestamp: user.createdAt ? toDate(user.createdAt) : new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: readIds.includes('kyc-welcome'),
        action: () => navigation.navigate('Rewards'),
      });
    }
    try {
      const { schemeService } = await import('../services/schemes');
      const schemes = await schemeService.getActiveSchemes(user.id, user.rewardPoints || 0, user.userType || 'electrician');
      if (schemes.length > 0 && !list.some(n => n.id === 'scheme-available')) {
        list.push({
          id: 'scheme-available',
          title: 'New Scheme Available',
          message: 'Check out the latest rewards scheme.',
          type: 'info',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: readIds.includes('scheme-available'),
          action: () => navigation.navigate('Schemes'),
        });
      }
    } catch (_) { /* ignore */ }
    list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setNotifications(list);
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.action) {
      notification.action();
    }
    setIsNotificationDrawerOpen(false);
  };

  // Fallback slider data when admin has not added any (Wire & Cable themed)
  const specialOfferSlidesFallback = [
    {
      id: '1',
      title: 'We don\'t just manufacture cables.',
      subtitle: 'We build connections.',
      backgroundColor: theme.colors.overlayColor,
      textColor: '#FFFFFF',
      gradientColors: [theme.colors.overlayLight, theme.colors.overlayDark],
      imageSource: require('../../assets/banners/6.jpg'),
    },
    {
      id: '2',
      title: 'Every cable we manufacture is designed to enhance',
      subtitle: 'the way communities live, work, and thrive.',
      backgroundColor: theme.colors.overlayColor,
      textColor: '#FFFFFF',
      gradientColors: [theme.colors.overlayLight, theme.colors.overlayDark],
      imageSource: require('../../assets/banners/7.jpg'),
    },
    {
      id: '3',
      title: 'Our Certifications',
      subtitle: 'Certified by leading agencies and labs, Opilex ensures quality, strength, and lasting durability.',
      backgroundColor: theme.colors.overlayColor,
      textColor: '#FFFFFF',
      gradientColors: [theme.colors.overlayLight, theme.colors.overlayDark],
      imageSource: require('../../assets/banners/8.jpg'),
    },
    {
      id: '4',
      title: 'Over 45 years of trusted excellence and innovation.',
      subtitle: '45+',
      backgroundColor: theme.colors.overlayColor,
      textColor: '#FFFFFF',
      gradientColors: [theme.colors.overlayLight, theme.colors.overlayDark],
      imageSource: require('../../assets/banners/9.jpg'),
    },
  ];

  const tipSlidesFallback = [
    {
      id: '1',
      title: '45+ years',
      subtitle: 'Over 45 years of excellence',
      backgroundColor: theme.colors.overlayColor,
      textColor: '#FFFFFF',
      gradientColors: [theme.colors.overlayLight, theme.colors.overlayDark],
      imageSource: require('../../assets/banners/1.jpg'),
    },
    {
      id: '2',
      title: 'VERIFY AUTHENTICITY',
      subtitle: 'Always check for ISI certification marks',
      backgroundColor: theme.colors.overlayColor,
      textColor: '#FFFFFF',
      gradientColors: [theme.colors.overlayLight, theme.colors.overlayDark],
      imageSource: require('../../assets/banners/6.jpg'),
    },
  ];

  // Use admin sliders from Firestore when available, otherwise fallback. Electrician: 2 sliders (Tips, Promos). Dealer: 3 sliders (Tips, Offers, Deals).
  const tipSlides = tipSlidesFromApi.length > 0 ? tipSlidesFromApi : tipSlidesFallback;
  const promosSlides = promosSlidesFromApi.length > 0 ? promosSlidesFromApi : tipSlidesFallback; // electrician 2nd slider
  const specialOfferSlides = offerSlidesFromApi.length > 0 ? offerSlidesFromApi : specialOfferSlidesFallback;
  const dealSlides = dealSlidesFromApi.length > 0 ? dealSlidesFromApi : tipSlidesFallback; // dealer 3rd slot

  // Dashboard Items Configuration based on User Type
  // Electrician: 12 buttons (excluding Scheme, Price List, Ledger)
  // Dealer: 15 buttons + 2 sliders (including Scheme, Price List, Ledger)
  
  // Fetch latest userType from Firestore to ensure we have the correct type
  const fetchLatestUserType = async () => {
    if (!user?.id) return;
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      
      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userTypeFromFirestore = userData.userType ? userData.userType.toLowerCase().trim() : null;
        setLatestUserType(userTypeFromFirestore);
        
        console.log('🔍 [DASHBOARD] Latest userType from Firestore:', {
          userTypeFromContext: user?.userType,
          userTypeFromFirestore: userTypeFromFirestore,
          userId: user.id,
        });
        
        // If userType changed, refresh the user context
        if (userTypeFromFirestore && userTypeFromFirestore !== user?.userType) {
          console.log('🔄 [DASHBOARD] UserType mismatch detected, refreshing user context...');
          await refreshUser();
        }
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Error fetching latest userType:', error);
      // Fallback to context userType
      setLatestUserType(user?.userType || null);
    }
  };
  
  // Load tips, promos, offers sliders from Firestore (admin-managed). Dealer: 2 banners (Tips, Offers). Electrician: 2 (Tips, Promos).
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const load = async () => {
        try {
          const [tips, promos, offers] = await Promise.all([
            listSlides('tips'),
            listSlides('promos'),
            listSlides('offers'),
          ]);
          if (cancelled) return;
          const active = (arr: SliderItem[]) => arr.filter((t) => t.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const toSlide = (t: SliderItem) => ({
            id: t.id ?? '',
            title: t.title ?? '',
            subtitle: t.subtitle,
            imageUrl: t.imageUrl,
            backgroundColor: theme.colors.overlayColor,
            textColor: '#FFFFFF',
            gradientColors: [theme.colors.overlayLight, theme.colors.overlayDark],
          });
          setTipSlidesFromApi(active(tips).map(toSlide));
          setPromosSlidesFromApi(active(promos).map(toSlide));
          setOfferSlidesFromApi(active(offers).map(toSlide));
          setDealSlidesFromApi([]);
        } catch (e) {
          if (!cancelled) {
            setTipSlidesFromApi([]);
            setPromosSlidesFromApi([]);
            setOfferSlidesFromApi([]);
            setDealSlidesFromApi([]);
          }
        }
      };
      load();
      return () => { cancelled = true; };
    }, [theme.colors.overlayColor, theme.colors.overlayLight, theme.colors.overlayDark])
  );

  // Use latest userType from Firestore if available, otherwise fallback to context
  const currentUserType = latestUserType || user?.userType;
  const isDealer = currentUserType === 'dealer';
  
  // Debug logging
  console.log('🔍 Dashboard User Type Check:', {
    userTypeFromContext: user?.userType,
    userTypeFromFirestore: latestUserType,
    currentUserType: currentUserType,
    isDealer: isDealer,
    userId: user?.id,
  });
  
  // Electrician buttons (12 total - exact order as specified)
  const electricianButtons: DashboardItem[] = [
    {
      id: 'add-account',
      title: 'Add Account',
      iconName: 'bank',
      route: 'AddAccount',
    },
    {
      id: 'wallet',
      title: 'Wallet',
      iconName: 'wallet',
      route: 'Wallet',
    },
    {
      id: 'redeem-upi',
      title: 'Redeem Points',
      iconName: 'gift-box',
      route: 'RedeemPoints',
    },
    {
      id: 'transaction',
      title: 'Transaction',
      iconName: 'history',
      route: 'Transaction',
    },
    {
      id: 'purchase-history',
      title: 'Purchase History',
      iconName: 'purchase-history',
      route: 'PurchaseHistory',
    },
    {
      id: 'catalogs',
      title: 'Catalogs',
      iconName: 'product-catalogue',
      route: 'ProductCatalog',
    },
    {
      id: 'authenticate',
      title: 'Authenticate',
      iconName: 'authenticate',
      route: 'AuthenticateProduct',
    },
    {
      id: 'refer',
      title: 'Refer',
      iconName: 'share',
      action: () => handleReferPress(),
    },
    {
      id: 'social-media',
      title: 'Social Media',
      iconName: 'social-media',
      route: 'SocialMedia',
    },
    {
      id: 'leadership',
      title: 'Leadership',
      iconName: 'leadership-board',
      route: 'LeadershipBoard',
    },
    {
      id: 'tutorial',
      title: 'Tutorial',
      iconName: 'watch-tutorial',
      route: 'Tutorial',
    },
    {
      id: 'scratch-rewards',
      title: 'Scratch Rewards',
      iconName: 'gift-box',
      route: 'ScratchRewards',
    },
  ];

  // Dealer buttons (15 total): Row 1 = Add Account, Wallet, Redeem Points; Row 2 = Transaction, Purchase history, etc.
  const dealerButtons: DashboardItem[] = [
    {
      id: 'add-account',
      title: 'Add Account',
      iconName: 'bank',
      route: 'AddAccount',
    },
    {
      id: 'wallet',
      title: 'Wallet',
      iconName: 'wallet',
      route: 'Wallet',
    },
    {
      id: 'redeem-upi',
      title: 'Redeem Points',
      iconName: 'gift-box',
      route: 'RedeemPoints',
    },
    {
      id: 'transaction',
      title: 'Transaction',
      iconName: 'history',
      route: 'Transaction',
    },
    {
      id: 'purchase-history',
      title: 'Purchase History',
      iconName: 'purchase-history',
      route: 'PurchaseHistory',
    },
    {
      id: 'price-list',
      title: 'Price List',
      iconName: 'price-list',
      route: 'PriceList',
    },
    {
      id: 'catalogs',
      title: 'Catalogs',
      iconName: 'product-catalogue',
      route: 'ProductCatalog',
    },
    {
      id: 'authenticate',
      title: 'Authenticate',
      iconName: 'authenticate',
      route: 'AuthenticateProduct',
    },
    {
      id: 'refer',
      title: 'Refer',
      iconName: 'share',
      action: () => handleReferPress(),
    },
    {
      id: 'ledger',
      title: 'Ledger',
      iconName: 'history',
      route: 'Ledger',
    },
    {
      id: 'social-media',
      title: 'Social Media',
      iconName: 'social-media',
      route: 'SocialMedia',
    },
    {
      id: 'leadership',
      title: 'Leadership',
      iconName: 'leadership-board',
      route: 'LeadershipBoard',
    },
    {
      id: 'tutorial',
      title: 'Tutorial',
      iconName: 'watch-tutorial',
      route: 'Tutorial',
    },
    {
      id: 'scratch-rewards',
      title: 'Scratch Rewards',
      iconName: 'gift-box',
      route: 'ScratchRewards',
    },
    {
      id: 'scheme',
      title: 'Scheme',
      iconName: 'schemes',
      route: 'Schemes',
    },
  ];

  // Select buttons based on user type
  const allButtons = isDealer ? dealerButtons : electricianButtons;
  
  console.log('📊 Dashboard Buttons:', {
    userType: user?.userType,
    isDealer: isDealer,
    totalButtons: allButtons.length,
    buttonTitles: allButtons.map(b => b.title),
  });

  // Organize buttons into rows of 3 items each with more spacing
  // Electrician: 12 buttons = 4 rows (3+3+3+3)
  // Dealer: 15 buttons = 5 rows (3+3+3+3+3)
  const row1Items: DashboardItem[] = allButtons.slice(0, 3);
  const row2Items: DashboardItem[] = allButtons.slice(3, 6);
  const row3Items: DashboardItem[] = allButtons.slice(6, 9);
  const row4Items: DashboardItem[] = allButtons.slice(9, 12);
  const row5Items: DashboardItem[] = allButtons.slice(12, 15); // Only for dealers (3 items: Social Media, Leadership, Tutorial, Scratch Rewards)
  
  console.log('📋 Button Rows:', {
    row1: row1Items.map(b => b.title),
    row2: row2Items.map(b => b.title),
    row3: row3Items.map(b => b.title),
    row4: row4Items.map(b => b.title),
    row5: row5Items.map(b => b.title),
  });

  // Handler functions for buttons
  const handleReferPress = () => {
    navigation.navigate('ReferAndEarn');
  };


  const handleSupportPress = () => {
    Alert.alert(
      'Customer Support',
      'For support, please contact:\n\n📞 Phone: +91-1234567890\n✉️ Email: support@opilex.com\n🌐 Website: www.opilex.com',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleSettingsPress = () => {
    Alert.alert(
      'Settings',
      'Settings panel coming soon!\n\nAvailable features:\n• Language preferences\n• Notification settings\n• Account preferences',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAboutPress = () => {
    navigation.navigate('About');
  };

  const handleAddAccount = () => {
    navigation.navigate('AddAccount');
  };

  const handleGoldInvestment = () => {
    navigation.navigate('Gold');
  };

  const handleSchemesPress = () => {
    navigation.navigate('Schemes');
  };

  const handleCouponsPress = () => {
    navigation.navigate('Coupons');
  };

  const handlePriceListPress = () => {
    navigation.navigate('PriceList');
  };

  const handleProductCataloguePress = () => {
    navigation.navigate('ProductCatalog');
  };

  const handleSocialMediaPress = () => {
    navigation.navigate('SocialMedia');
  };

  const handleStoreLocatorPress = () => {
    navigation.navigate('StoreLocator');
  };

  const handleLeadershipBoardPress = () => {
    navigation.navigate('LeadershipBoard');
  };

  const handleWatchTutorialPress = () => {
    navigation.navigate('Tutorial');
  };

  const handleDrawerToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Menu option handlers
  const handleHelpSupport = () => {
    setIsMenuOpen(false);
    navigation.navigate('HelpSupport');
  };

  const handleBankSettings = () => {
    setIsMenuOpen(false);
    navigation.navigate('AddAccount');
  };

  const handleProfileSettings = () => {
    setIsMenuOpen(false);
    navigation.navigate('Profile');
  };

  const handleReferEarn = () => {
    setIsMenuOpen(false);
    navigation.navigate('ReferAndEarn');
  };

  const handleScratchRewards = () => {
    setIsMenuOpen(false);
    navigation.navigate('ScratchRewards');
  };

  const handleFollowSubscribe = () => {
    setIsMenuOpen(false);
    navigation.navigate('SocialMedia');
  };

  const handleChangeLanguage = () => {
    setIsMenuOpen(false);
    Alert.alert(
      'Change Language',
      'Language change feature coming soon!\n\nYou will be able to:\n• Select preferred language\n• Change app locale\n• View in regional languages',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAboutApp = () => {
    setIsMenuOpen(false);
    navigation.navigate('About');
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutPress = () => {
    setIsMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
      navigation.replace('Splash');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Track last refresh time to prevent excessive refreshes
  const lastRefreshTime = useRef<number>(0);
  const REFRESH_COOLDOWN = 2000; // 2 seconds cooldown between refreshes

  useEffect(() => {
    // Fetch latest userType from Firestore when user changes
    if (user?.id) {
      fetchLatestUserType();
    }
  }, [user?.id]);
  
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Refresh data when screen comes into focus (e.g., returning from wire authentication)
  // But only if enough time has passed since last refresh to prevent infinite loops
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTime.current;
        
        // Only refresh if cooldown period has passed
        if (timeSinceLastRefresh > REFRESH_COOLDOWN) {
          console.log('🔄 [DASHBOARD] Screen focused, refreshing data...');
          lastRefreshTime.current = now;
          
          // Fetch latest userType first, then refresh user data
          fetchLatestUserType().then(() => {
            // Refresh user data to get latest points and userType
            return refreshUser();
          }).then(() => {
            loadDashboardData();
          }).catch((error) => {
            console.error('❌ [DASHBOARD] Error refreshing user:', error);
            // Still load dashboard data even if refresh fails
            loadDashboardData();
          });
        } else {
          console.log('⏭️ [DASHBOARD] Skipping refresh - too soon since last refresh');
          // Still fetch latest userType to ensure correct dashboard
          fetchLatestUserType();
          // Just load dashboard data without refreshing user
          loadDashboardData();
        }
      }
    }, [user?.id]) // Only depend on user ID, not the entire user object
  );

  // Set status bar to light content for dark dashboard
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      return () => {
        // Reset to default when leaving dashboard
        StatusBar.setBarStyle('dark-content');
      };
    }, [])
  );

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      console.log('📊 [DASHBOARD] Loading dashboard data for user:', user.id);
      console.log('📊 [DASHBOARD] Current user points:', user.rewardPoints || 0);
      
      // Try to load from Firestore first (production)
      try {
        const { rewardService, wireAuthService } = await import('../services/firestore');
        
        // Load rewards from Firestore
        const rewards = await rewardService.getUserRewards(user.id);
        console.log('✅ [DASHBOARD] Loaded rewards from Firestore:', rewards.length);
        
        // Load authentications from Firestore
        const authentications = await wireAuthService.getUserAuthentications(user.id);
        console.log('✅ [DASHBOARD] Loaded authentications from Firestore:', authentications.length);
        
        setRecentAuthentications(authentications.slice(0, 3));
        setRecentRewards(rewards.slice(0, 3));

        // Calculate monthly points from Firestore data
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRewards = rewards.filter(reward => {
          const raw = reward.createdAt as Date | { toDate?: () => Date } | number | string;
          const rewardDate = raw instanceof Date
            ? raw
            : raw && typeof (raw as { toDate?: () => Date }).toDate === 'function'
              ? (raw as { toDate: () => Date }).toDate()
              : new Date(raw as number);
          return rewardDate.getMonth() === currentMonth && rewardDate.getFullYear() === currentYear;
        });
        const monthlyTotal = monthlyRewards.reduce((sum, reward) => sum + (reward.points || 0), 0);
        setMonthlyPoints(monthlyTotal);
        console.log('✅ [DASHBOARD] Monthly points calculated:', monthlyTotal);
        await buildNotificationsFromData(rewards);
      } catch (firestoreError: any) {
        console.warn('⚠️ [DASHBOARD] Firestore error, falling back to mock:', firestoreError.message);
        // Fallback to mock service if Firestore fails
        const authentications = await mockAuthService.getRecentAuthentications(user.id);
        const rewards = await mockAuthService.getRecentRewards(user.id);
        
        setRecentAuthentications(authentications);
        setRecentRewards(rewards.slice(0, 3));

        // Calculate monthly points
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRewards = rewards.filter(reward => {
          const rewardDate = new Date(reward.createdAt);
          return rewardDate.getMonth() === currentMonth && rewardDate.getFullYear() === currentYear;
        });
        const monthlyTotal = monthlyRewards.reduce((sum, reward) => sum + reward.points, 0);
        setMonthlyPoints(monthlyTotal);
        await buildNotificationsFromData(rewards);
      }

    } catch (error) {
      console.error('❌ [DASHBOARD] Error loading dashboard data:', error);
      // Set empty arrays as fallback
      setRecentAuthentications([]);
      setRecentRewards([]);
      setMonthlyPoints(0);
      setNotifications([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleItemPress = (item: DashboardItem) => {
    if (item.route) {
      navigation.navigate(item.route as any);
    } else if (item.action) {
      item.action();
    }
  };

  const handleOfferSlidePress = (slide: any) => {
    // Handle special offer slide press
    console.log('Offer slide pressed:', slide.title);
    // You can navigate to specific offer details or show modal
  };

  const handleDealSlidePress = (slide: any) => {
    // Handle deals slide press (dealer only)
    console.log('Deal slide pressed:', slide.title);
  };

  const handlePromoSlidePress = (slide: any) => {
    // Handle promos slide press (electrician 2nd slider)
    console.log('Promo slide pressed:', slide.title);
  };

  const handleTipSlidePress = (slide: any) => {
    // Handle tip slide press
    console.log('Tip slide pressed:', slide.title);
    // You can show detailed tips or navigate to help section
  };

  const renderDashboardButton = (item: DashboardItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.dashboardButton}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.buttonIconContainer}>
        <Icon 
          name={item.iconName} 
          size={24} 
          color={theme.colors.iconColor}
          strokeWidth={2}
        />
      </View>
      <Text style={[styles.buttonTitle, { color: theme.colors.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderIndividualButtonBox = (item: DashboardItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.buttonContainer}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <View style={styles.buttonIconWrapper}>
            <Icon 
              name={item.iconName} 
              size={30} 
              color="#000000"
              strokeWidth={2.5}
            />
          </View>
          <Text style={[styles.individualButtonTitle, { color: theme.colors.text }]}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderIndividualButtonGrid = (items: DashboardItem[]) => {
    if (items.length === 0) return null;
    
    // For 3 buttons per row, always use space-between for even spacing
    return (
      <View style={styles.individualButtonGrid}>
        {items.map((item) => renderIndividualButtonBox(item))}
      </View>
    );
  };

  const renderButtonRowWithSeparators = (items: DashboardItem[]) => (
    <View style={styles.buttonRow}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {renderDashboardButton(item)}
          {index < items.length - 1 && (
            <View style={[styles.separator, { backgroundColor: theme.colors.separatorColor }]} />
          )}
        </React.Fragment>
      ))}
      </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, globalTextStyles.body]}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
  );
  }

  const renderNotificationButton = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={() => setIsNotificationDrawerOpen(true)}
        activeOpacity={0.6}
      >
        <Icon 
          name="bell" 
          size={22} 
          color="#FFFFFF"
          strokeWidth={2.5}
        />
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeaderRight = () => (
    <View style={styles.headerRightContainer}>
      {renderNotificationButton()}
    </View>
  );

  const renderHamburgerMenu = () => (
    <TouchableOpacity 
      style={styles.hamburgerButton} 
      onPress={handleDrawerToggle}
      activeOpacity={0.6}
    >
      <View style={styles.hamburgerIconContainer}>
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </View>
    </TouchableOpacity>
  );

  const renderDrawer = () => {
    if (!isMenuOpen) return null;

  return (
      <View style={styles.drawerOverlay}>
        {/* Background Overlay */}
        <TouchableOpacity 
          style={styles.drawerBackdrop} 
          onPress={() => setIsMenuOpen(false)}
          activeOpacity={1}
        />
        
        {/* Drawer Content */}
        <View style={[styles.drawerContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: theme.colors.border }]}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.colors.surface }]}>
              <Icon name="scan" size={24} color={theme.colors.iconColor} strokeWidth={2} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, globalTextStyles.h4, { color: theme.colors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.profilePhone, globalTextStyles.body, { color: theme.colors.accent }]}>
                {user?.phoneNumber || '+91 XXXXXXXXXX'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('Profile');
              }}
              activeOpacity={0.7}
            >
              <Icon name="settings" size={20} color={theme.colors.iconColor} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.drawerContent}>
            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={handleHelpSupport}
              activeOpacity={0.7}
            >
              <Icon name="support" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={handleBankSettings}
              activeOpacity={0.7}
            >
              <Icon name="bank" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>Bank A/c & UPI Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={handleProfileSettings}
              activeOpacity={0.7}
            >
              <Icon name="settings" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>Profile Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={handleReferEarn}
              activeOpacity={0.7}
            >
              <Icon name="add-account" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>Refer & Earn</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={handleScratchRewards}
              activeOpacity={0.7}
            >
              <Icon name="gift-box" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>Scratch Rewards</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={handleFollowSubscribe}
              activeOpacity={0.7}
            >
              <Icon name="social-media" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>Follow & Subscribe</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={handleChangeLanguage}
              activeOpacity={0.7}
            >
              <Icon name="globe" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>Change Language</Text>
            </TouchableOpacity>

            {/* Dark Mode Toggle */}
            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={() => {
                setIsMenuOpen(false);
                toggleTheme();
              }}
              activeOpacity={0.7}
            >
              <Icon 
                name={isDark ? 'sun' : 'moon'} 
                size={20} 
                color={theme.colors.iconColor} 
                strokeWidth={2} 
              />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>Dark Mode</Text>
              <View style={[styles.toggleSwitch, { backgroundColor: isDark ? theme.colors.text : theme.colors.border }]}>
                <View style={[
                  styles.toggleButton, 
                  { 
                    backgroundColor: theme.colors.background,
                    transform: [{ translateX: isDark ? 14 : 0 }]
                  }
                ]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerMenuItem} 
              onPress={handleAboutApp}
              activeOpacity={0.7}
            >
              <Icon name="info" size={20} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.drawerMenuText, globalTextStyles.body, { color: theme.colors.text }]}>About Us</Text>
            </TouchableOpacity>
          </View>

          {/* Footer with Logout */}
          <View style={[styles.drawerFooter, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                {
                  backgroundColor: theme.colors.error ? `${theme.colors.error}18` : 'rgba(198, 40, 40, 0.1)',
                  borderColor: theme.colors.error || '#C62828',
                },
              ]}
              onPress={handleLogoutPress}
              activeOpacity={0.7}
            >
              <Icon name="log-out" size={22} color={theme.colors.error || '#C62828'} strokeWidth={2.5} />
              <Text style={[styles.logoutButtonText, { color: theme.colors.error || '#C62828' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={darkTheme.colors.background} />
      <Header 
        title="OPILEX"
        showBackButton={false}
        leftElement={renderHamburgerMenu()}
        rightElement={renderHeaderRight()}
        backgroundColor="#000000"
        textColor={darkTheme.colors.text}
        isDarkMode={true}
      />
      {/* Fixed Welcome & Rewards Section - measured so scroll content starts below it */}
      <View
        style={styles.fixedWelcomeSection}
        onLayout={(e) => setFixedSectionHeight(e.nativeEvent.layout.height)}
      >
        {/* Hello Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.helloText}>
            Hello!{'\n'}
            <Text style={styles.userNameText}>{user?.name || 'User'}</Text>
          </Text>
        </View>

        {/* Rewards Display */}
        <View style={styles.rewardsContainer}>
          <View style={styles.rewardsHeader}>
            <View style={styles.rewardsTitleRow}>
              <Icon name="gift-box" size={22} color={theme.colors.iconColor} strokeWidth={2} />
              <Text style={[styles.rewardsTitle, globalTextStyles.h3, { color: theme.colors.text }]}>Your Rewards</Text>
            </View>
            <TouchableOpacity style={[styles.refreshButton, { backgroundColor: theme.colors.surface }]}>
              <Icon name="refresh" size={16} color={theme.colors.iconColor} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.balanceDisplay}>
            <View style={styles.balanceTwoColumns}>
              {/* Column 1: Trophy Icon */}
              <View style={styles.awardCupContainer}>
                <Text style={styles.awardCupEmoji}>🏆</Text>
              </View>
              
              {/* Column 2: Total Points & Value */}
              <View style={styles.balanceTextColumn}>
                <Text style={[styles.balanceLabel, globalTextStyles.caption]}>TOTAL BALANCE</Text>
                <View style={styles.pointsRow}>
                  <Text style={[styles.balanceValue, globalTextStyles.h2]}>
                    {(user?.rewardPoints || 0).toLocaleString()}
                  </Text>
                  <Text style={[styles.balanceUnit, globalTextStyles.body]}>Points</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: (fixedSectionHeight > 0 ? fixedSectionHeight + 16 : FIXED_SECTION_FALLBACK_PADDING + 16) },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor={theme.colors.secondary}
          />
        }
      >

        {/* Main Services Card - Login Screen Style */}
        <View style={styles.mainCardContainer}>
          <View style={[styles.mainCard, { backgroundColor: theme.colors.background }]}>
            
            {/* First Slider - Both Electrician and Dealer */}
            <View style={styles.cardSection}>
              <View style={styles.sliderRoundedContainer}>
                <ImageSlider
                  data={tipSlides}
                  height={BANNER_HEIGHT_TIPS}
                  autoPlay={true}
                  autoPlayInterval={5000}
                  showDots={true}
                  onSlidePress={handleTipSlidePress}
                />
              </View>
            </View>
            
            {/* Dashboard Buttons - Row 1 */}
            <View style={styles.cardSection}>
              {renderIndividualButtonGrid(row1Items)}
            </View>

            {/* Dashboard Buttons - Row 2 */}
            <View style={styles.cardSection}>
              {renderIndividualButtonGrid(row2Items)}
            </View>

            {/* Dashboard Buttons - Row 3 */}
            <View style={styles.cardSection}>
              {renderIndividualButtonGrid(row3Items)}
            </View>

            {/* Dashboard Buttons - Row 4 */}
            {/* For dealers: Leadership, Tutorial, Scratch Rewards */}
            {/* For electricians: Notification, Social, Price List */}
            {row4Items.length > 0 && (
              <View style={styles.cardSection}>
                {renderIndividualButtonGrid(row4Items)}
              </View>
            )}

            {/* Dashboard Buttons - Row 5 (Only for dealers - 3 items: Add Account, Wallet, Redeem Points) */}
            {isDealer && row5Items.length > 0 && (
              <View style={styles.cardSection}>
                {renderIndividualButtonGrid(row5Items)}
              </View>
            )}

            {/* Second Slider - Only for Dealers */}
            {isDealer && (
              <View style={styles.cardSection}>
                <View style={styles.sliderRoundedContainer}>
                  <ImageSlider
                    data={specialOfferSlides}
                    height={BANNER_HEIGHT_OFFERS}
                    autoPlay={true}
                    autoPlayInterval={5000}
                    showDots={true}
                    onSlidePress={handleOfferSlidePress}
                  />
                </View>
              </View>
            )}

            {/* KYC Status Section */}
            {!user.kycVerified && (
              <View style={styles.cardSection}>
                <View style={[styles.kycBanner, { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border 
                }]}>
                  <View style={styles.kycContent}>
                    <View style={[styles.kycIcon, { backgroundColor: theme.colors.background }]}>
                      <Icon name="scan" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                    </View>
                    <View style={styles.kycTextContainer}>
                      <Text style={[styles.kycTitle, globalTextStyles.h5, { color: theme.colors.text }]}>Complete KYC</Text>
                      <Text style={[styles.kycText, globalTextStyles.body, { color: theme.colors.accent }]}>
                        Verify your identity to unlock all features
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.kycButton, { backgroundColor: theme.colors.text }]}
                      onPress={() => navigation.navigate('KYC')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.kycButtonText, globalTextStyles.button, { color: theme.colors.background }]}>Verify</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Third Slider - Electrician only: Promos (2nd slider, square). Dealer has 2 banners (Tips, Offers). */}
            {!isDealer && (
              <View style={styles.sliderSquareSection}>
                <View style={styles.sliderSquareContainer}>
                  <ImageSlider
                    data={promosSlides}
                    height={BANNER_HEIGHT_PROMOS}
                    autoPlay={true}
                    autoPlayInterval={5000}
                    showDots={true}
                    onSlidePress={handlePromoSlidePress}
                    squareCorners={true}
                  />
                </View>
              </View>
            )}

            {/* Footer with Copyright - Inside Card */}
            <View style={styles.footerSpace}>
              <Text style={[styles.footerText, globalTextStyles.caption, { color: theme.colors.accent }]}>
                © 2026 Opilex. All rights reserved.
              </Text>
            </View>

          </View>
        </View>
      </ScrollView>
      
      {/* Fixed button – Scan (opens Scan Rewards / reward QR code screen) */}
      <Animated.View
        style={[
          styles.fixedScanButton,
          {
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.scanButtonBorder,
            width: buttonWidth,
            borderRadius: buttonBorderRadius,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.scanButtonTouchable}
          onPress={() => navigation.navigate('ScanRewards')}
          activeOpacity={0.8}
        >
          <View style={styles.scanButtonContent}>
            <Icon 
              name="scan" 
              size={24} 
              color={theme.colors.iconColor}
              strokeWidth={2.5}
            />
            <Animated.View
              style={{
                width: textWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 86],
                }),
                marginLeft: textWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 6],
                }),
                overflow: 'hidden',
              }}
            >
              <Animated.Text 
                style={[
                  styles.scanButtonText, 
                  globalTextStyles.button, 
                  { 
                    color: theme.colors.text,
                    opacity: textOpacity,
                  },
                ]}
              >
                Scan Now
              </Animated.Text>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* App Drawer */}
      {renderDrawer()}

      {/* Notification Drawer */}
      <NotificationDrawer
        isVisible={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAllNotifications}
      />

      {/* Logout confirmation modal - same design as Schemes / Wire Auth result modals */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.logoutModalOverlay}>
          <View style={[styles.logoutModalContainer, { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderColor: isDark ? '#FFFFFF' : '#000000' }]}>
            <View style={[styles.logoutModalIconOuter, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>
              <View style={[styles.logoutModalIconInner, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
                <Icon name="log-out" size={40} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
            </View>
            <Text style={[styles.logoutModalTitle, { color: theme.colors.text }]}>Logout?</Text>
            <Text style={[styles.logoutModalMessage, { color: theme.colors.accent }]}>Are you sure you want to logout?</Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={[styles.logoutModalBtnCancel, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.logoutModalBtnCancelText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logoutModalBtnLogout, { backgroundColor: theme.colors.error || '#C62828' }]}
                onPress={handleLogoutConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutModalBtnLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Create styles function that accepts theme
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    position: 'absolute',
    top: 115, // Below header so scroll content aligns; paddingTop keeps card below fixed section
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5000,
    elevation: 5000,
  },
  scrollContent: {
    paddingBottom: 0, // paddingTop set dynamically from fixedSectionHeight so card never overlaps rewards
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  notificationBadgeText: {
    fontFamily: 'Ubuntu-Bold',
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 12,
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  hamburgerIconContainer: {
    width: 22,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  // Fixed Welcome Section Styles - responsive so card never overlaps rewards
  fixedWelcomeSection: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: Math.max(16, width * 0.045),
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  // Greeting Section
  greetingSection: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  helloText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  userNameText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  // Modern Section Styles
  modernSection: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  welcomeText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '300',
    opacity: 0.7,
  },
  userNameHighlight: {
    fontFamily: 'Ubuntu-Medium',
    color: theme.colors.text,
    fontWeight: '600',
  },
  rewardsContainer: {
    backgroundColor: theme.colors.background,
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardsTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
  },
  refreshButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
  },
  balanceDisplay: {
    alignItems: 'flex-start',
    minHeight: 56,
  },
  balanceTwoColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceTextColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  balanceLabel: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 9,
    fontWeight: '500',
    color: theme.colors.text,
    opacity: 0.6,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  balanceValue: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  balanceUnit: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    opacity: 0.7,
  },
  // Rewards Section - Compact Style
  rewardsSection: {
    marginHorizontal: 24,
    marginBottom: 14,
  },
  compactCard: {
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 7,
  },
  rewardsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  compactRefreshButton: {
    padding: 8,
    borderRadius: 12,
  },
  compactBalanceContainer: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  balanceGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.1,
    top: -20,
  },
  balanceInfo: {
    alignItems: 'center',
    marginBottom: 12, // Reduced from 20 for height reduction
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  awardCupContainer: {
    marginRight: 0,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.awardCupBackground,
    borderRadius: 16,
    shadowColor: theme.colors.awardCupShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  awardCupEmoji: {
    fontSize: 36,
  },
  compactBalanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  compactBalanceValue: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -1,
  },
  compactBalanceUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
  },
  glassActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  glassActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  glassActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sliderContainer: {
    marginBottom: 24,
    marginHorizontal: 0,
  },
  tipsSliderContainer: {
    marginBottom: 24,
    marginHorizontal: 0,
  },
  sliderFullWidth: {
    marginBottom: 20,
    marginLeft: -20, // More aggressive negative margin
    marginRight: -24, // Even more aggressive for right edge
    width: '100%',
    paddingHorizontal: 0,
    alignItems: 'stretch', // Changed from 'center' to 'stretch'
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  sliderOutsideCard: {
    marginBottom: 20,
    marginLeft: -16, // Counteract main card padding
    marginRight: -16, // Counteract main card padding
    width: '100%',
    paddingHorizontal: 0,
    alignSelf: 'stretch',
  },
  sliderFresh: {
    marginBottom: 20,
    marginLeft: -16,
    marginRight: -24, // Much more aggressive for right side
    width: '100%',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  sliderOutsideMainCard: {
    marginBottom: 20,
    marginHorizontal: 0,
    width: '100%',
    paddingHorizontal: 0,
  },
  sliderRoundedContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    width: '100%',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sliderSquareContainer: {
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '100%',
    alignSelf: 'stretch',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Main Card Container - Full Width to Bottom with Zero Margins
  mainCardContainer: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
    marginTop: 0,
    marginHorizontal: 0,
  },
  mainCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 2,
    paddingHorizontal: 16,
    paddingBottom: 0,
    marginBottom: 0, // Touch bottom edge with zero space
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5000, // Very high elevation to ensure it appears above rewards section
    zIndex: 5000, // Very high z-index to ensure it appears above rewards section
  },
  cardSection: {
    marginBottom: 20,
  },
  sliderSquareSection: {
    marginBottom: 0,
    marginLeft: -16,
    marginRight: -16,
    marginTop: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: width, // Full screen width
    alignSelf: 'stretch',
  },
  bottomSliderSection: {
    marginBottom: 150,
  },
  leadershipTutorialSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  leadershipTutorialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  leadershipTutorialButton: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    backgroundColor: theme.colors.buttonBoxBackground,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  leadershipTutorialIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  leadershipTutorialTitle: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: 0.2,
    flexWrap: 'nowrap',
    paddingHorizontal: 4,
    maxWidth: '100%',
  },
  sectionTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  individualButtonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  incompleteRow: {
    justifyContent: 'flex-start',
  },
  singleButtonGrid: {
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconWrapper: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  individualButtonTitle: {
    fontFamily: 'Ubuntu-Medium',
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 0,
    paddingHorizontal: 2,
    flexWrap: 'wrap',
    maxWidth: 90,
    letterSpacing: 0.3,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    gap: 4,
  },
  separator: {
    width: 1,
    height: 55,
    marginHorizontal: 3,
  },
  dashboardButton: {
    width: 70,
    height: 70,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    marginHorizontal: 1,
  },
  buttonIconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 12,
    paddingHorizontal: 2,
    flexWrap: 'wrap',
  },
  // Fixed Scan Now Button - Centered and Highlighted with Scroll Animation
  fixedScanButton: {
    position: 'absolute',
    bottom: 35,
    alignSelf: 'center',
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scanButtonTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scanButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kycBanner: {
    marginHorizontal: 16, // Reduced from 24 to increase width by 8%
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  kycContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  kycIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  kycIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  kycTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  kycText: {
    fontSize: 12,
    lineHeight: 16,
  },
  kycButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  kycButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.loadingBackground,
  },
  loadingText: {
    fontSize: 20,
    color: theme.colors.text,
    textAlign: 'center',
  },
  // App Drawer Styles
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.drawerBackdrop,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    marginTop: 50,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  drawerMenuText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  toggleSwitch: {
    width: 32,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleButton: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  drawerFooter: {
    borderTopWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    width: '100%',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    fontFamily: fonts.bold,
  },
  footerSpace: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 80,
  },
  footerText: {
    fontFamily: 'Ubuntu-Light',
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'center',
    opacity: 0.7,
  },
  // Logout confirmation modal - same design as Schemes / Wire Auth result modals
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutModalContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
  },
  logoutModalIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 14,
  },
  logoutModalIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  logoutModalMessage: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutModalBtnCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  logoutModalBtnCancelText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
  },
  logoutModalBtnLogout: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalBtnLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

// Export styles function
export default DashboardScreen;



