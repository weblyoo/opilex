import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Ubuntu_300Light,
  Ubuntu_400Regular,
  Ubuntu_500Medium,
  Ubuntu_700Bold,
} from '@expo-google-fonts/ubuntu';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Enable comprehensive error logging
if (__DEV__) {
  // Log all console errors with native bridge errors
  const originalError = console.error;
  console.error = (...args: any[]) => {
    originalError.apply(console, args);
    // Check for native errors
    const errorStr = args.join(' ');
    if (errorStr.includes('String cannot be cast') || 
        errorStr.includes('java.lang.String') ||
        errorStr.includes('java.lang.Boolean')) {
      originalError('=== NATIVE BRIDGE ERROR DETECTED ===');
      originalError('This is a native Android error, not JavaScript');
      originalError('Check logcat for full native stack trace');
      originalError('Run: adb logcat | grep -i error');
      originalError('===================================');
    }
  };

  // Log all unhandled promise rejections
  if (typeof global !== 'undefined') {
    const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
    if (originalHandler) {
      global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        console.error('=== GLOBAL ERROR HANDLER ===');
        console.error('Error:', error);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('Is Fatal:', isFatal);
        if (error.message?.includes('String cannot be cast')) {
          console.error('⚠️  NATIVE ERROR: This is happening in Android native code!');
          console.error('Check logcat: adb logcat | grep -i "string cannot be cast"');
        }
        console.error('===========================');
        originalHandler(error, isFatal);
      });
    }
  }

  // Intercept React Native bridge errors
  if (typeof global !== 'undefined' && global.__fbBatchedBridge) {
    const originalCallFunctionReturnFlushedQueue = global.__fbBatchedBridge?.callFunctionReturnFlushedQueue;
    if (originalCallFunctionReturnFlushedQueue) {
      global.__fbBatchedBridge.callFunctionReturnFlushedQueue = function(...args: any[]) {
        try {
          return originalCallFunctionReturnFlushedQueue.apply(this, args);
        } catch (error: any) {
          console.error('=== NATIVE BRIDGE CALL ERROR ===');
          console.error('Error:', error);
          console.error('This error is in the native bridge');
          console.error('================================');
          throw error;
        }
      };
    }
  }

  // Log React errors
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
      originalError('=== REACT ERROR/WARNING ===');
      originalError(...args);
      originalError('===========================');
    }
    originalLog.apply(console, args);
  };
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      // Add timeout to prevent hanging forever
      const timeout = setTimeout(() => {
        console.warn('⚠️ App initialization taking too long (>10s), proceeding anyway...');
        setAppIsReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }, 10000); // 10 second timeout

      try {
        // Load Ubuntu fonts first (most critical)
        try {
          await Promise.race([
            Font.loadAsync({
              'Ubuntu-Light': Ubuntu_300Light,
              'Ubuntu-Regular': Ubuntu_400Regular,
              'Ubuntu-Medium': Ubuntu_500Medium,
              'Ubuntu-Bold': Ubuntu_700Bold,
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Font loading timeout')), 5000))
          ]);
          if (__DEV__) {
            console.log('✅ Fonts loaded successfully');
          }
        } catch (fontError: any) {
          console.warn('Font loading error (continuing):', fontError);
        }

        // Initialize language preference (optional, can fail)
        try {
          const { initializeLanguage } = await import('./src/utils/i18n');
          await initializeLanguage();
          if (__DEV__) {
            console.log('✅ Language initialized');
          }
        } catch (langError: any) {
          console.warn('Language initialization error (continuing):', langError);
        }

        // Setup reCAPTCHA (web only, can fail)
        try {
          const { setupRecaptcha } = await import('./src/utils/recaptcha');
          setupRecaptcha();
        } catch (recaptchaError: any) {
          console.warn('reCAPTCHA setup error (continuing):', recaptchaError);
        }
      } catch (error: any) {
        console.error('=== APP INITIALIZATION ERROR ===');
        console.error('Error:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        console.error('Error name:', error?.name);
        console.error('Error type:', typeof error);
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        console.error('================================');
        setInitError(error?.message || 'Initialization failed');
      } finally {
        clearTimeout(timeout);
        setAppIsReady(true);
        if (__DEV__) {
          console.log('✅ App is ready, hiding splash screen');
        }
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('Splash screen hide error:', e);
        }
      }
    }

    prepare();
  }, []);

  // Show error screen if initialization failed
  if (initError) {
    return (
      <View 
        style={styles.errorContainer}
        collapsable={false}
        removeClippedSubviews={false}
      >
        <Text 
          style={styles.errorTitle}
          allowFontScaling={false}
          selectable={false}
        >
          Initialization Error
        </Text>
        <Text 
          style={styles.errorText}
          allowFontScaling={false}
          selectable={false}
        >
          {initError}
        </Text>
      </View>
    );
  }

  // Show loading screen while preparing
  if (!appIsReady) {
    return (
      <View 
        style={styles.loadingContainer}
        collapsable={false}
        removeClippedSubviews={false}
      >
        <ActivityIndicator 
          size="large" 
          color="#FFFFFF" 
          animating={true}
          hidesWhenStopped={false}
        />
      </View>
    );
  }

  // Load main app components lazily
  try {
    const { SafeAreaProvider } = require('react-native-safe-area-context');
    const ErrorBoundary = require('./src/components/ErrorBoundary').default;
    const ThemeProvider = require('./src/contexts/ThemeContext').ThemeProvider;
    const AuthProvider = require('./src/contexts/AuthContext').AuthProvider;
    const AppNavigator = require('./src/navigation/AppNavigator').default;

    // Verify all components loaded correctly
    if (!ErrorBoundary || !ThemeProvider || !AuthProvider || !AppNavigator || !SafeAreaProvider) {
      throw new Error('One or more components failed to load');
    }

    if (__DEV__) {
      console.log('✅ All app components loaded successfully');
      console.log('✅ Rendering app with SafeAreaProvider > ErrorBoundary > ThemeProvider > AuthProvider > AppNavigator');
    }

    return (
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    );
  } catch (importError: any) {
    console.error('=== COMPONENT IMPORT ERROR ===');
    console.error('Error:', importError);
    console.error('Error message:', importError?.message);
    console.error('Error stack:', importError?.stack);
    console.error('Error name:', importError?.name);
    console.error('Error type:', typeof importError);
    console.error('Full error object:', JSON.stringify(importError, Object.getOwnPropertyNames(importError)));
    console.error('==============================');
    return (
      <View 
        style={styles.errorContainer}
        collapsable={false}
        removeClippedSubviews={false}
      >
        <Text 
          style={styles.errorTitle}
          allowFontScaling={false}
          selectable={false}
        >
          Component Loading Error
        </Text>
        <Text 
          style={styles.errorText}
          allowFontScaling={false}
          selectable={false}
        >
          {importError?.message || 'Failed to load app components'}
        </Text>
        {__DEV__ && importError?.stack && (
          <Text 
            style={[styles.errorText, { fontSize: 12, marginTop: 10 }]}
            allowFontScaling={false}
            selectable={false}
          >
            {importError.stack}
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
});
