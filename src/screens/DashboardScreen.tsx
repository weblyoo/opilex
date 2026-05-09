import React, { useEffect, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootStackParamList, WireAuthentication, Reward } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, darkTheme } from '../contexts/ThemeContext';
import ImageSlider from '../components/ImageSlider';
import Header from '../components/Header';
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

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refreshUser, signOut } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  
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

  // Initialize sample notifications
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        title: 'Welcome Bonus!',
        message: 'You earned 100 points for completing KYC verification.',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        action: () => navigation.navigate('Rewards'),
      },
      {
        id: '2',
        title: 'Wire Authentication',
        message: 'Successfully authenticated Kimson Copper Wire. +50 points earned!',
        type: 'success',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false,
        action: () => navigation.navigate('WireAuthentication'),
      },
      {
        id: '3',
        title: 'New Scheme Available',
        message: 'Check out the latest rewards scheme for electricians.',
        type: 'info',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        action: () => navigation.navigate('Schemes'),
      },
      {
        id: '4',
        title: 'Profile Update',
        message: 'Your profile information has been updated successfully.',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
        action: () => navigation.navigate('Profile'),
      },
    ];
    setNotifications(sampleNotifications);
  }, []);

  // Notification management functions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
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

  // Special offer slider data - Wire & Cable themed with images
  const specialOfferSlides = [
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
      subtitle: 'Certified by leading agencies and labs, Kimson ensures quality, strength, and lasting durability.',
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

  // Tip slider data - Wire & Cable tips with images
  const tipSlides = [
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

  // Dashboard Items Configuration based on User Type
  // Electrician: 12 buttons (excluding Scheme, Price List, Ledger)
  // Dealer: 15 buttons + 2 sliders (including Scheme, Price List, Ledger)
  
  const isDealer = user?.userType === 'dealer';
  
  // Debug logging
  console.log('🔍 Dashboard User Type Check:', {
    userType: user?.userType,
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
      title: 'Redeem UPI',
      iconName: 'gift-box',
      route: 'RedeemPoints',
    },
    {
      id: 'purchase-history',
      title: 'Purchase History',
      iconName: 'purchase-history',
      route: 'Rewards',
    },
    {
      id: 'transaction',
      title: 'Transaction',
      iconName: 'history',
      action: () => handleTransactionHistoryPress(),
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
      route: 'WireAuthentication',
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
      id: 'qr-scan',
      title: 'QR Scan',
      iconName: 'scan',
      route: 'WireAuthentication',
    },
  ];

  // Dealer buttons (15 total - reordered to match user requirements)
  // Priority buttons: Price List ⭐, Catalogs, Authenticate, Refer, Ledger ⭐, Social Media, Leadership, Tutorial, QR Scan
  const dealerButtons: DashboardItem[] = [
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
      route: 'WireAuthentication',
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
      id: 'qr-scan',
      title: 'QR Scan',
      iconName: 'scan',
      route: 'WireAuthentication',
    },
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
      title: 'Redeem UPI',
      iconName: 'gift-box',
      route: 'RedeemPoints',
    },
    {
      id: 'purchase-history',
      title: 'Purchase History',
      iconName: 'purchase-history',
      route: 'Rewards',
    },
    {
      id: 'transaction',
      title: 'Transaction',
      iconName: 'history',
      action: () => handleTransactionHistoryPress(),
    },
    {
      id: 'scheme',
      title: 'Scheme',
      iconName: 'gift-box',
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
  const row5Items: DashboardItem[] = allButtons.slice(12, 15); // Only for dealers (3 items: Add Account, Wallet, Redeem UPI)
  
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

  const handleTransactionHistoryPress = () => {
    navigation.navigate('Wallet');
  };

  const handleSupportPress = () => {
    Alert.alert(
      'Customer Support',
      'For support, please contact:\n\n📞 Phone: +91-1234567890\n✉️ Email: support@kimson.com\n🌐 Website: www.kimson.com',
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

  const handleLogout = () => {
    setIsMenuOpen(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut();
              // Navigate directly to splash screen after logout
              navigation.replace('Splash');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Refresh data when screen comes into focus (e.g., returning from wire authentication)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadDashboardData();
      }
    }, [user])
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
      // Load dynamic data from mock service
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

      // Uncomment for production with Firebase:
      // const authentications = await wireAuthService.getUserAuthentications(user.id);
      // const rewards = await rewardService.getUserRewards(user.id);
      // setRecentAuthentications(authentications.slice(0, 3));
      // setRecentRewards(rewards.slice(0, 3));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays as fallback
      setRecentAuthentications([]);
      setRecentRewards([]);
      setMonthlyPoints(0);
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
              style={[styles.logoutMenuItem, { backgroundColor: theme.colors.surface }]} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Icon name="log-out" size={20} color={theme.colors.text} strokeWidth={2} />
              <Text style={[styles.logoutText, globalTextStyles.body, { color: theme.colors.text }]}>Logout</Text>
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
        title="KIMSON"
        showBackButton={false}
        leftElement={renderHamburgerMenu()}
        rightElement={renderHeaderRight()}
        backgroundColor="#000000"
        textColor={darkTheme.colors.text}
        isDarkMode={true}
      />
      {/* Fixed Welcome & Rewards Section */}
      <View style={styles.fixedWelcomeSection}>
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
                    {user.rewardPoints || 0}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
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
                  height={120}
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
            {/* For dealers: Leadership, Tutorial, QR Scan */}
            {/* For electricians: Notification, Social, Price List */}
            {row4Items.length > 0 && (
              <View style={styles.cardSection}>
                {renderIndividualButtonGrid(row4Items)}
              </View>
            )}

            {/* Dashboard Buttons - Row 5 (Only for dealers - 3 items: Add Account, Wallet, Redeem UPI) */}
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
                    height={158}
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

            {/* Third Slider - Double Height with Square Corners (Both Electrician and Dealer) */}
            <View style={styles.sliderSquareSection}>
              <View style={styles.sliderSquareContainer}>
                <ImageSlider
                  data={tipSlides}
                  height={200}
                  autoPlay={true}
                  autoPlayInterval={5000}
                  showDots={true}
                  onSlidePress={handleTipSlidePress}
                  squareCorners={true}
                />
              </View>
            </View>

            {/* Footer with Copyright - Inside Card */}
            <View style={styles.footerSpace}>
              <Text style={[styles.footerText, globalTextStyles.caption, { color: theme.colors.accent }]}>
                © 2026 Kimson. All rights reserved.
              </Text>
            </View>

          </View>
        </View>
      </ScrollView>
      
      {/* Fixed Scan Now Button - Centered and Highlighted with Scroll Animation */}
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
          onPress={() => navigation.navigate('WireAuthentication')}
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
    top: 115, // Approximate height of the header
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5000,
    elevation: 5000,
  },
  scrollContent: {
    paddingTop: Dimensions.get('window').height / 4, // Quarter screen position
    paddingBottom: 0, // No bottom padding, allows card to touch bottom
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
  // Fixed Welcome Section Styles
  fixedWelcomeSection: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
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
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footerSpace: {
    height: 100,
    justifyContent: 'flex-start',
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
});

// Export styles function
export default DashboardScreen;