import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import RegistrationTypeScreen from '../screens/RegistrationTypeScreen';
import RegistrationDetailsScreen from '../screens/RegistrationDetailsScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import KYCScreen from '../screens/KYCScreen';
import GSTVerificationScreen from '../screens/GSTVerificationScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WireAuthenticationScreen from '../screens/WireAuthenticationScreen';
import RewardsScreen from '../screens/RewardsScreen';
import RedeemPointsScreen from '../screens/RedeemPointsScreen';
import TutorialScreen from '../screens/TutorialScreen';
import LedgerScreen from '../screens/LedgerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import AboutScreen from '../screens/AboutScreen';
import PriceListScreen from '../screens/PriceListScreen';
import AddAccountScreen from '../screens/AddAccountScreen';
import SchemesScreen from '../screens/SchemesScreen';
import CouponsScreen from '../screens/CouponsScreen';
import GoldScreen from '../screens/GoldScreen';
import ProductCatalogScreen from '../screens/ProductCatalogScreen';
import SocialMediaScreen from '../screens/SocialMediaScreen';
import StoreLocatorScreen from '../screens/StoreLocatorScreen';
import LeadershipBoardScreen from '../screens/LeadershipBoardScreen';
import ReferAndEarnScreen from '../screens/ReferAndEarnScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  // Always start with splash screen for better UX
  const initialRouteName = 'Splash';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000000' },
          // Note: statusBarStyle and statusBarBackgroundColor are not valid Stack Navigator options
        }}
      >
        {/* Auth flow screens */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="RegistrationType" component={RegistrationTypeScreen} />
        <Stack.Screen name="RegistrationDetails" component={RegistrationDetailsScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="KYC" component={KYCScreen} />
        <Stack.Screen name="GSTVerification" component={GSTVerificationScreen} />
        
        {/* Main app screens */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="WireAuthentication" component={WireAuthenticationScreen} />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
        <Stack.Screen name="RedeemPoints" component={RedeemPointsScreen} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} />
        <Stack.Screen name="Ledger" component={LedgerScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="PriceList" component={PriceListScreen} />
        
        {/* Feature screens */}
        <Stack.Screen name="AddAccount" component={AddAccountScreen} />
        <Stack.Screen name="Schemes" component={SchemesScreen} />
        <Stack.Screen name="Coupons" component={CouponsScreen} />
        <Stack.Screen name="Gold" component={GoldScreen} />
        <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} />
        <Stack.Screen name="SocialMedia" component={SocialMediaScreen} />
        <Stack.Screen name="StoreLocator" component={StoreLocatorScreen} />
        <Stack.Screen name="LeadershipBoard" component={LeadershipBoardScreen} />
        <Stack.Screen name="ReferAndEarn" component={ReferAndEarnScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
