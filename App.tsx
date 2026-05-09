import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Ubuntu_300Light,
  Ubuntu_400Regular,
  Ubuntu_500Medium,
  Ubuntu_700Bold,
} from '@expo-google-fonts/ubuntu';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { setupRecaptcha } from './src/utils/recaptcha';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize language preference (must be done early)
        const { initializeLanguage } = await import('./src/utils/i18n');
        await initializeLanguage();
        
        // Setup reCAPTCHA for web platform (required for Firebase Phone Auth on web)
        setupRecaptcha();
        
        // Load Ubuntu fonts and custom fonts
        await Font.loadAsync({
          'Ubuntu-Light': Ubuntu_300Light,
          'Ubuntu-Regular': Ubuntu_400Regular,
          'Ubuntu-Medium': Ubuntu_500Medium,
          'Ubuntu-Bold': Ubuntu_700Bold,
          // Load Briller fonts
          'Briller-Bold': require('./assets/fonts/Briller-Bold.ttf'),
          'Briller-Black': require('./assets/fonts/Briller-Black.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
