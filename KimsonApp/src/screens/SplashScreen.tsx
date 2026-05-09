import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

// Random characters pool for rolling effect - weighted for variety
const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
const SPECIAL_CHARS = '@#$%&*0123456789';

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(1)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Animated values for static OPILEX text bounce effect
  const staticOpilexAnims = useRef(
    ['K', 'I', 'M', 'S', 'O', 'N'].map(() => new Animated.Value(0))
  ).current;
  
  // Create animated values for each letter in OPILEX
  const letterAnims = useRef(
    ['K', 'I', 'M', 'S', 'O', 'N'].map(() => new Animated.Value(0))
  ).current;
  
  // Generate rolling character sequences - only same letter repeating
  const [rollingSequences] = useState(() => {
    const targetLetters = ['K', 'I', 'M', 'S', 'O', 'N'];
    return targetLetters.map((letter, index) => {
      // Each letter rolls 18-28 times before settling
      const rollCount = 18 + Math.floor(Math.random() * 10);
      const chars = [];
      
      // Add multiple copies of the same letter
      for (let i = 0; i < rollCount; i++) {
        chars.push(letter);
      }
      
      // Add the target letter at the end
      chars.push(letter);
      
      return { 
        chars, 
        rollCount,
        // Each letter gets unique timing with randomization
        duration: 1400 + (index * 180) + Math.floor(Math.random() * 400),
      };
    });
  });
  
  // Hooks must be called unconditionally
  const themeContext = useTheme();
  const authContext = useAuth();
  
  // Safely extract values with fallbacks - ensure theme is always valid
  const theme = themeContext?.theme || { 
    colors: { 
      background: '#000000', 
      text: '#FFFFFF',
      primary: '#000000',
      secondary: '#FFFFFF',
      surface: '#000000',
      textInverse: '#FFFFFF',
      border: 'rgba(255, 255, 255, 0.3)',
      accent: '#FFFFFF',
      success: '#FFFFFF',
      warning: '#FFFFFF',
      error: '#FFFFFF',
      cardBackground: '#000000',
      buttonBackground: '#000000',
      iconColor: '#FFFFFF',
      separatorColor: 'rgba(255, 255, 255, 0.3)',
      scanButtonBorder: '#FFFFFF',
      shadowColor: '#000000',
      overlayColor: '#000000',
      overlayLight: '#FFFFFF',
      overlayDark: '#000000',
      sliderBackground: '#000000',
      sliderBorder: '#FFFFFF',
      buttonBoxBackground: '#000000',
      drawerBackdrop: '#000000',
      loadingBackground: '#000000',
      awardCupBackground: '#000000',
      awardCupShadow: '#000000',
    } 
  };
  const isDark = themeContext?.isDark ?? true;
  const user = authContext?.user || null;
  
  // Debug logging in dev mode
  if (__DEV__) {
    console.log('SplashScreen rendered:', {
      hasTheme: !!themeContext,
      hasAuth: !!authContext,
      hasUser: !!user,
      themeBackground: theme.colors.background,
    });
  }

  useEffect(() => {
    const letterHeight = 60; // Height of each character in the roll
    
    // Create staggered rolling animations with multiple phases
    const letterAnimations = letterAnims.map((anim, index) => {
      const { rollCount, duration } = rollingSequences[index];
      const finalPosition = -rollCount * letterHeight;
      
      return Animated.sequence([
        // Staggered start - each letter begins at different time
        Animated.delay(index * 100),
        
        // Phase 1: Fast initial roll (60% of characters)
        Animated.timing(anim, {
          toValue: finalPosition * 0.6,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
        
        // Phase 2: Medium speed roll (80% of characters)
        Animated.timing(anim, {
          toValue: finalPosition * 0.8,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
        
        // Phase 3: Slow down and settle (final characters)
        Animated.timing(anim, {
          toValue: finalPosition * 0.95,
          duration: duration * 0.2,
          useNativeDriver: true,
        }),
        
        // Phase 4: Final spring landing for stable positioning
        Animated.spring(anim, {
          toValue: finalPosition,
          tension: 50,
          friction: 12,
          useNativeDriver: true,
        }),
      ]);
    });

    // Start all letter animations in parallel
    Animated.parallel(letterAnimations).start();

    // Start fade and scale animations
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Start tagline animation after rolling completes
    setTimeout(() => {
      Animated.spring(taglineFadeAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 2200);

    // Animate static OPILEX text (up-down bounce effect)
    const staticOpilexAnimations = staticOpilexAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100), // Staggered start
          Animated.timing(anim, {
            toValue: -20, // Move up 20px
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 20, // Move down 20px (40px total range)
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0, // Return to original position
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    });

    // Start the bounce animations
    Animated.parallel(staticOpilexAnimations).start();

    // Stop the bounce animations after 2 seconds
    setTimeout(() => {
      staticOpilexAnims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2000);

    // Show logo immediately after rolling animation completes (keep text visible)
    setTimeout(() => {
      Animated.timing(logoOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 2200);

    // Navigate to appropriate screen after 6 seconds
    const timer = setTimeout(() => {
      if (user) {
        // User is already logged in, go directly to dashboard
        navigation.replace('Dashboard');
      } else {
        // No user, start the onboarding flow
        navigation.replace('LanguageSelection');
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, letterAnims, taglineFadeAnim, textOpacityAnim, logoOpacityAnim, staticOpilexAnims, user, rollingSequences]);

  // Ensure theme.colors exists
  const backgroundColor = theme?.colors?.background || '#000000';
  const textColor = theme?.colors?.text || '#FFFFFF';

  if (__DEV__) {
    console.log('SplashScreen render:', {
      backgroundColor,
      textColor,
      hasUser: !!user,
      hasNavigation: !!navigation,
    });
  }

  // Safety check - ensure we have valid values
  if (!theme || !theme.colors || !theme.colors.background) {
    if (__DEV__) {
      console.error('⚠️ Invalid theme in SplashScreen, using defaults');
    }
    return (
      <View 
        style={styles.container}
        collapsable={false}
        removeClippedSubviews={false}
      >
        <Text 
          style={{ color: '#FFFFFF', fontSize: 20 }}
          allowFontScaling={false}
          selectable={false}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View 
      style={[styles.container, { backgroundColor }]}
      collapsable={false}
      removeClippedSubviews={false}
    >
      {/* Debug indicator in dev mode */}
      {__DEV__ && (
        <View 
          style={{ position: 'absolute', top: 50, left: 10, backgroundColor: 'rgba(255,0,0,0.5)', padding: 5 }}
          collapsable={false}
          removeClippedSubviews={false}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 10 }}>Splash</Text>
        </View>
      )}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        collapsable={false}
        removeClippedSubviews={false}
        needsOffscreenAlphaCompositing={false}
      >
        {/* Rolling OPILEX Text - Letter by Letter */}
        <Animated.View 
          style={{ opacity: textOpacityAnim }}
          collapsable={false}
          removeClippedSubviews={false}
          needsOffscreenAlphaCompositing={false}
        >
          <View 
            style={styles.rollingTextContainer}
            collapsable={false}
            removeClippedSubviews={false}
          >
            {rollingSequences.map((sequence, index) => (
              <View 
                key={index} 
                style={styles.letterWrapper}
                collapsable={false}
                removeClippedSubviews={false}
              >
                <Animated.View
                  style={[
                    styles.rollingColumn,
                    {
                      transform: [{ translateY: letterAnims[index] }],
                    },
                  ]}
                  collapsable={false}
                  removeClippedSubviews={false}
                  needsOffscreenAlphaCompositing={false}
                >
                  {sequence.chars.map((char, charIndex) => (
                    <Text
                      key={charIndex}
                      style={[
                        styles.logoLetter,
                        { color: textColor },
                      ]}
                      allowFontScaling={false}
                      selectable={false}
                    >
                      {char}
                    </Text>
                  ))}
                </Animated.View>
              </View>
            ))}
          </View>
        </Animated.View>
        
        {/* Tagline */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: taglineFadeAnim,
            },
          ]}
          collapsable={false}
          removeClippedSubviews={false}
        >
          <Text
            style={[
              styles.tagline,
              { color: textColor },
            ]}
            allowFontScaling={false}
            selectable={false}
          >
            FORMING CONNECTIONS SINCE 1978
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollingTextContainer: {
    flexDirection: 'row',
    marginBottom: -10,
    height: 60, // Fixed height for single letter visibility
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  letterWrapper: {
    height: 60,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  rollingColumn: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoLetter: {
    fontFamily: 'Briller-Bold',
    fontSize: 70,
    letterSpacing: 2,
    textAlign: 'center',
    height: 60,
    lineHeight: 55,
    fontWeight: '600',
  },
  taglineContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  tagline: {
    fontFamily: 'Briller-Bold',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 1,
    fontWeight: '600',
    marginTop: 20,
  },
  staticOpilexContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  staticOpilexText: {
    fontFamily: 'Briller-Bold',
    fontSize: 50,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  logoImageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 380,
    height: 100,
  },
});

export default SplashScreen;




