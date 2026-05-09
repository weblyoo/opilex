import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import QRCodeScanner from '../components/QRCodeScanner';
import { useAuth } from '../contexts/AuthContext';
import mockAuthService from '../services/mockAuth';

type WireAuthenticationNavigationProp = StackNavigationProp<RootStackParamList, 'WireAuthentication'>;
type WireAuthenticationRouteProp = RouteProp<RootStackParamList, 'WireAuthentication'>;

interface Props {
  navigation: WireAuthenticationNavigationProp;
  route: WireAuthenticationRouteProp;
}

/**
 * Product verification screen (one of two scanning screens).
 * This screen: inline QR scanner + manual code entry. ScannerScreen is the other (full-screen scanner).
 * Both use reward QR scan to verify product is genuine/original; already-redeemed scans show a confirmation popup.
 */
const WireAuthenticationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const scanPurpose = route.params?.scanPurpose ?? 'authenticate';
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalTitle, setResultModalTitle] = useState('');
  const [resultModalMessage, setResultModalMessage] = useState('');
  const [resultModalGoBack, setResultModalGoBack] = useState(false);

  const showScanResultModal = (title: string, message: string, goBack: boolean = false) => {
    setResultModalTitle(title);
    setResultModalMessage(message);
    setResultModalGoBack(goBack);
    setShowResultModal(true);
  };
  const handleCloseResultModal = () => {
    const shouldGoBack = resultModalGoBack;
    setShowResultModal(false);
    if (shouldGoBack) navigation.goBack();
    else setIsVerifying(false);
  };

  // When returning from Scanner with a scanned code (if user came from Scanner), run authentication
  useEffect(() => {
    const code = route.params?.scannedCode;
    if (code && user) {
      navigation.setParams({ scannedCode: undefined });
      authenticateWire(code);
    }
  }, [route.params?.scannedCode, user]);

  // Request camera permission when scan mode is QR so the scanner can open on this page
  useEffect(() => {
    if (scanMode === 'qr') {
      Camera.requestCameraPermissionsAsync().catch(() => {});
    }
  }, [scanMode]);

  const handleScanResult = async (code: string) => {
    await authenticateWire(code);
  };

  const handleManualVerification = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Error', 'Please enter the authentication code');
      return;
    }

    await authenticateWire(manualCode);
  };

  const authenticateWire = async (code: string) => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Debug: Log current user state
    console.log('🔍 Authenticate Wire - User State:', {
      userId: user.id,
      userType: user.userType,
      userTypeType: typeof user.userType,
      userTypeLength: user.userType?.length,
      fullUserObject: JSON.stringify({
        id: user.id,
        userType: user.userType,
        name: user.name,
      }, null, 2),
    });

    setIsVerifying(true);
    
    // Clean and trim the code (define outside try for error handling)
    const cleanCode = code.trim();
    console.log('📱 Scanned QR code (raw):', cleanCode);
    console.log('📱 Scanned QR code (length):', cleanCode.length);
    
    try {
      console.log('🔍 [QR-SCAN] Starting QR code validation...');
      console.log('📱 [QR-SCAN] Raw code (first 100 chars):', cleanCode.substring(0, 100));
      console.log('📱 [QR-SCAN] Code length:', cleanCode.length);
      console.log('📱 [QR-SCAN] Code type:', typeof cleanCode);
      
      // Try to parse as JSON first
      let parsedData = null;
      let isJSON = false;
      
      try {
        // Try parsing as-is
        parsedData = JSON.parse(cleanCode);
        isJSON = true;
        console.log('✅ [QR-SCAN] Successfully parsed as JSON');
      } catch (jsonError) {
        // Try removing BOM, whitespace, and extra characters
        try {
          const cleaned = cleanCode
            .replace(/^\uFEFF/, '') // Remove BOM
            .replace(/^[\s\u200B-\u200D\uFEFF]+|[\s\u200B-\u200D\uFEFF]+$/g, '') // Trim all whitespace
            .replace(/[\r\n]+/g, '') // Remove line breaks
            .trim();
          
          if (cleaned !== cleanCode) {
            console.log('🔄 [QR-SCAN] Cleaned code, trying to parse again...');
            parsedData = JSON.parse(cleaned);
            isJSON = true;
            console.log('✅ [QR-SCAN] Successfully parsed cleaned JSON');
          }
        } catch (cleanedError) {
          console.log('⚠️ [QR-SCAN] Not valid JSON format');
          isJSON = false;
        }
      }
      
      // If successfully parsed as JSON
      if (isJSON && parsedData) {
        console.log('📱 [QR-SCAN] Parsed QR data:', JSON.stringify(parsedData, null, 2));
        
        // Check if it's a reward QR code
        if (parsedData.type === 'opilex_reward' && parsedData.rewardId) {
          console.log('✅ [QR-SCAN] Detected reward QR code:', parsedData.rewardId);
          await processRewardQR(parsedData);
          return;
        }
        
        // Handle wire authentication QR codes
        if (parsedData.productId && parsedData.rewardPoints) {
          const wireData = parsedData;
          let points = wireData.rewardPoints;
          const wireInfo = `${wireData.wireType || 'Wire'} - ${wireData.length || 'N/A'}`;
          
          // Handle promotional bonuses
          if (wireData.bonus) {
            points += wireData.bonus;
          }
          
          // Check for already scanned
          if (wireData.alreadyScanned) {
            throw new Error('This wire has already been scanned');
          }
          
          // Check for expired
          if (wireData.expired) {
            throw new Error('This wire has expired');
          }
          
          // Check for invalid
          if (wireData.error || !wireData.verified) {
            throw new Error('Invalid or unverified wire');
          }
          
          await processWireAuthentication(code, points, wireInfo, wireData);
          return;
        }
        
        // If JSON but doesn't match expected formats
        console.warn('⚠️ [QR-SCAN] JSON format but unknown structure:', Object.keys(parsedData));
      }
      
      // Not JSON or didn't match JSON formats, try alternative formats
      console.log('🔄 [QR-SCAN] Trying alternative formats...');
      
      // Check if it's old format wire code
      if (cleanCode.startsWith('OPILEX_') && cleanCode.length >= 10) {
        console.log('✅ [QR-SCAN] Detected old format wire code');
        await processWireAuthentication(cleanCode, 50, 'Opilex Copper Wire', null);
        return;
      }
      
      // Try to lookup as reward QR code ID in Firestore
      console.log('🔍 [QR-SCAN] Checking if it\'s a reward QR code ID in Firestore...');
      try {
        const { rewardService, userService } = await import('../services/firestore');
        const { collection, query, where, getDocs, updateDoc, doc, Timestamp } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        
        // Check if it's a reward QR code ID (just the ID, not JSON)
        const rewardQRQuery = query(
          collection(db, 'rewardQRCodes'),
          where('rewardId', '==', cleanCode)
        );
        const rewardSnapshot = await getDocs(rewardQRQuery);
        
        if (!rewardSnapshot.empty) {
          console.log('✅ [QR-SCAN] Found reward QR code by ID in Firestore');
          const rewardDoc = rewardSnapshot.docs[0];
          const rewardData = rewardDoc.data();
          
          if (rewardData.used) {
            const usedAt = rewardData.usedAt?.toDate?.() ?? rewardData.usedAt;
            const dateStr = usedAt ? new Date(usedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'a previous date';
            if (scanPurpose === 'authenticate') {
              showScanResultModal(
                '✓ Verified Genuine Product',
                `This product is verified as genuine Opilex.\n\nIt was previously scanned on ${dateStr}. No additional points for rescanning.`,
                false
              );
            } else {
              showScanResultModal(
                'Already Used',
                'This QR code has already been used. No reward points will be added.',
                false
              );
            }
            return;
          }
          
          // Create reward data object from database
          // Normalize userType from database
          const normalizedQRUserType = rewardData.userType ? rewardData.userType.toLowerCase().trim() : rewardData.userType;
          const rewardDataObj = {
            type: 'opilex_reward',
            rewardId: rewardData.rewardId,
            points: rewardData.points,
            description: rewardData.description,
            userType: normalizedQRUserType,
          };
          
          console.log('📄 [QR-SCAN] Created reward data from DB:', {
            rewardId: rewardDataObj.rewardId,
            userType: rewardDataObj.userType,
            originalUserType: rewardData.userType,
          });
          
          // Process using the same function
          await processRewardQR(rewardDataObj);
          return;
        } else {
          console.log('⚠️ [QR-SCAN] Reward QR code ID not found in Firestore');
        }
      } catch (firestoreError: any) {
        console.error('❌ [QR-SCAN] Firestore lookup error:', firestoreError);
        // Continue to final error
      }
      
      // If we get here, none of the formats matched
      console.error('❌ [QR-SCAN] Could not parse QR code in any format');
      console.error('❌ [QR-SCAN] Code preview:', cleanCode.substring(0, 200));
      console.error('❌ [QR-SCAN] Code starts with:', cleanCode.substring(0, 20));
      
      // Provide more helpful error message
      let errorMessage = 'Invalid QR code format. Please scan a valid Opilex QR code.\n\n';
      errorMessage += 'Expected formats:\n';
      errorMessage += '• Reward QR code (JSON with type: "opilex_reward")\n';
      errorMessage += '• Wire authentication code (starts with "OPILEX_")\n';
      errorMessage += '• Reward QR code ID from admin panel';
      
      throw new Error(errorMessage);
    } catch (error: any) {
      console.error('❌ [QR-SCAN] Authentication error:', error);
      console.error('❌ [QR-SCAN] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        scannedCode: cleanCode.substring(0, 100),
        codeLength: cleanCode.length,
      });
      
      // Provide user-friendly error message
      let errorTitle = 'Error';
      let errorMessage = error.message || 'Failed to process QR code.';
      const isPermissionError = error?.code === 'permission-denied' ||
        error?.code === 'missing-or-insufficient-permissions' ||
        (error?.message && String(error.message).toLowerCase().includes('missing or insufficient permissions'));

      if (isPermissionError) {
        errorTitle = 'Permission Error';
        errorMessage = 'We couldn\'t complete this scan. Please make sure you\'re logged in and try again. If the problem continues, contact support.';
      } else if (error.message && error.message.includes('Invalid QR code format')) {
        errorTitle = 'Invalid QR Code';
        errorMessage += '\n\nTroubleshooting:\n';
        errorMessage += '• Make sure you\'re scanning a QR code generated by the Opilex admin panel\n';
        errorMessage += '• Check that the QR code is not damaged or partially obscured\n';
        errorMessage += '• Try scanning again with better lighting\n';
        errorMessage += '• If the issue persists, contact support';
      } else if (error.message && error.message.includes('not found')) {
        errorTitle = 'QR Code Not Found';
        errorMessage += '\n\nThis QR code is not registered in the system.';
      } else if (error.message && error.message.includes('already been used')) {
        errorTitle = 'Already Used';
        errorMessage += '\n\nThis QR code has already been scanned and cannot be used again.';
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [{ text: 'OK', onPress: () => setIsVerifying(false) }]
      );
      setIsVerifying(false);
    }
  };

  const processRewardQR = async (rewardData: any) => {
    if (!user) {
      console.error('❌ No user found');
      throw new Error('User not authenticated');
    }
    
    console.log('🔍 Processing reward QR:', rewardData);
    console.log('👤 Current user (from context):', { 
      id: user.id, 
      userType: user.userType,
      userTypeType: typeof user.userType,
    });
    
    try {
      const { rewardService, userService } = await import('../services/firestore');
      const { collection, query, where, getDocs, updateDoc, doc, Timestamp, getDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      
      // IMPORTANT: Fetch latest user data directly from Firestore to ensure we have correct userType
      console.log('🔄 Fetching latest user data from Firestore...');
      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error('❌ User document not found in Firestore');
        throw new Error('User data not found. Please try logging in again.');
      }
      
      const latestUserData = userDoc.data();
      const latestUserType = latestUserData.userType ? latestUserData.userType.toLowerCase().trim() : null;
      
      console.log('👤 Latest user data from Firestore:', {
        id: latestUserData.id,
        userType: latestUserData.userType,
        userTypeNormalized: latestUserType,
        name: latestUserData.name,
      });
      
      // Refresh the user context with latest data
      await refreshUser();
      
      // Check if reward QR code exists and is unused
      console.log('🔍 Searching for rewardId:', rewardData.rewardId);
      const rewardQRQuery = query(
        collection(db, 'rewardQRCodes'),
        where('rewardId', '==', rewardData.rewardId)
      );
      const rewardSnapshot = await getDocs(rewardQRQuery);
      
      if (rewardSnapshot.empty) {
        console.error('❌ Reward QR code not found in database:', rewardData.rewardId);
        throw new Error('Invalid reward QR code. The QR code was not found in the system.');
      }
      
      const rewardDoc = rewardSnapshot.docs[0];
      const dbRewardData = rewardDoc.data();
      console.log('📄 Found reward in database:', dbRewardData);
      
      if (dbRewardData.used) {
        console.warn('⚠️ QR code already used');
        const usedAt = dbRewardData.usedAt?.toDate?.() ?? dbRewardData.usedAt;
        const dateStr = usedAt ? new Date(usedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'a previous date';
        if (scanPurpose === 'authenticate') {
          showScanResultModal(
            '✓ Verified Genuine Product',
            `This product is verified as genuine Opilex.\n\nIt was previously scanned on ${dateStr}. No additional points for rescanning.`,
            false
          );
        } else {
          showScanResultModal(
            'Already Used',
            'This QR code has already been used. No reward points will be added.',
            false
          );
        }
        return;
      }

      // Validate user type matches QR code user type - USE LATEST DATA FROM FIRESTORE
      const qrUserType = rewardData.userType || dbRewardData.userType;
      const currentUserType = latestUserType; // Use the latest userType from Firestore
      
      // Normalize user types to lowercase for comparison (handle case sensitivity issues)
      const normalizedQrType = qrUserType ? qrUserType.toLowerCase().trim() : null;
      const normalizedUserType = currentUserType ? currentUserType.toLowerCase().trim() : null;
      
      console.log('🔍 User type validation:', {
        qrUserType: qrUserType,
        qrUserTypeNormalized: normalizedQrType,
        userTypeFromContext: user.userType,
        userTypeFromFirestore: latestUserType,
        userTypeUsed: currentUserType,
        userTypeNormalized: normalizedUserType,
        userId: user.id,
        rewardId: rewardData.rewardId,
      });
      
      // Only validate if QR code has a userType specified (backward compatibility)
      const qrTypeDisplay = normalizedQrType === 'electrician' ? 'Electrician' : 'Dealer';
      const userTypeDisplay = normalizedUserType === 'electrician' ? 'Electrician' : 'Dealer';

      if (normalizedQrType && normalizedUserType) {
        if (normalizedQrType !== normalizedUserType) {
          console.error('❌ User type mismatch detected:', {
            qrCodeType: qrTypeDisplay,
            userRegisteredType: userTypeDisplay,
            qrUserTypeRaw: qrUserType,
            userTypeRaw: currentUserType,
          });
          
          Alert.alert(
            'Invalid QR Code Type',
            `This QR code is for ${qrTypeDisplay} users only.\n\nYou are registered as a ${userTypeDisplay}.\n\nPlease scan a QR code generated for ${userTypeDisplay} users.`,
            [{ text: 'OK', onPress: () => setIsVerifying(false) }]
          );
          return;
        } else {
          console.log('✅ User type match confirmed:', { type: userTypeDisplay });
        }
      } else if (normalizedQrType && !normalizedUserType) {
        // QR code has type but user doesn't - this shouldn't happen but handle gracefully
        console.warn('⚠️ QR code has userType but user does not:', {
          qrUserType: normalizedQrType,
          userType: currentUserType,
        });
      } else {
        // No userType in QR code - backward compatibility, allow scan
        console.log('ℹ️ QR code has no userType - allowing scan (backward compatibility)');
      }
    
      // Mark as used
      console.log('✅ Marking QR code as used');
      await updateDoc(doc(db, 'rewardQRCodes', rewardDoc.id), {
        used: true,
        usedBy: user.id,
        usedAt: Timestamp.now(),
      });
      
      // Add reward points
      const pointsToAdd = rewardData.points || dbRewardData.points;
      console.log('✅ Adding reward points:', pointsToAdd);
      console.log('👤 Current user points before:', user.rewardPoints || 0);
      
      // Create reward record in Firestore
      await rewardService.createReward(
        user.id,
        pointsToAdd,
        'bonus',
        rewardData.description || dbRewardData.description || 'Reward QR Code'
      );
      console.log('✅ Reward record created in Firestore');
      
      // Update user points in Firestore
      await userService.updateUserPoints(user.id, pointsToAdd);
      console.log('✅ User points updated in Firestore');
      
      // Refresh user data from Firestore to get updated points
      console.log('🔄 Refreshing user data from Firestore...');
      await refreshUser();
      
      // Wait a moment for Firestore to sync
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh again to ensure we have the latest data
      await refreshUser();
      
      const pointsAwarded = pointsToAdd;
      const description = rewardData.description || dbRewardData.description || '';
      
      console.log('🎉 Reward processed successfully:', { 
        pointsAwarded, 
        description,
        userPointsAfter: user.rewardPoints || 0,
      });
      
      // Wait a bit more to ensure Firestore has synced
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh one more time to get the absolute latest points from Firestore
      await refreshUser();
      
      // Wait again and refresh to ensure we have the latest data
      await new Promise(resolve => setTimeout(resolve, 300));
      await refreshUser();
      
      // Calculate expected new points (user object might not be updated in this scope yet)
      const currentPoints = user.rewardPoints || 0;
      const expectedNewPoints = currentPoints + pointsAwarded;
      
      console.log('💰 [QR-SCAN] Points summary:', {
        pointsAwarded,
        currentPointsBefore: currentPoints,
        expectedNewPoints,
        note: 'User object will be updated after refresh completes',
      });
      
      if (scanPurpose === 'authenticate') {
        showScanResultModal(
          '✓ Verified Genuine Product',
          `This product is verified as genuine Opilex.\n\nYou earned ${pointsAwarded.toLocaleString()} points. New balance: ${expectedNewPoints.toLocaleString()} points.`,
          true
        );
      } else {
        showScanResultModal(
          'Rewards Points Added! 🎉',
          `You received ${pointsAwarded.toLocaleString()} points!\n\n${description}\n\nNew Balance: ${expectedNewPoints.toLocaleString()} points`,
          true
        );
      }
      setIsVerifying(false);
    } catch (error: any) {
      console.error('❌ Error processing reward QR:', error);
      setIsVerifying(false);
      throw error; // Re-throw to be caught by outer handler
    }
  };

  const processWireAuthentication = async (code: string, points: number, wireInfo: string, wireData: any) => {
    if (!user) return;
    
    try {
      console.log('🔐 [WIRE-AUTH] Processing wire authentication:', { code, points, userId: user.id });
      console.log('👤 [WIRE-AUTH] Current user points before:', user.rewardPoints || 0);
      
      // Use Firestore service for production
      try {
        const { wireAuthService, rewardService } = await import('../services/firestore');
        
        // Authenticate wire using Firestore service
        const authResult = await wireAuthService.authenticateWire(user.id, code);
        console.log('✅ [WIRE-AUTH] Wire authenticated via Firestore:', authResult.id);
        
        // Refresh user to get updated points
        await refreshUser();
        await new Promise(resolve => setTimeout(resolve, 500));
        await refreshUser();
        
        console.log('✅ [WIRE-AUTH] User refreshed, new points:', user.rewardPoints || 0);
        
      } catch (firestoreError: any) {
        console.warn('⚠️ [WIRE-AUTH] Firestore error, using mock service:', firestoreError.message);
        // Fallback to mock service if Firestore fails
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        
        // Add points to user (mock)
        const updatedUser = await mockAuthService.addRewardPoints(user.id, points);
        console.log('✅ [WIRE-AUTH] Updated user via mock service:', updatedUser.rewardPoints);
        
        // Record the wire authentication
        await mockAuthService.addWireAuthentication(user.id, code, points);
        
        await refreshUser();
        await new Promise(resolve => setTimeout(resolve, 500));
        await refreshUser();
      }
      
      // Get updated user points after refresh
      const updatedUserPoints = user.rewardPoints || 0;
      const bonusText = wireData?.bonus ? `\n• Bonus Points: ${wireData.bonus}` : '';
      const promoText = wireData?.promotion ? `\n• Promotion: ${wireData.promotion}` : '';
        
      Alert.alert(
        '✅ Authentic Wire Verified!',
        `Congratulations! You've earned ${points} reward points.\n\nWire Details:\n• Product: ${wireInfo}\n• Batch: ${wireData?.batchId || code.split('_')[2] || 'Unknown'}\n• Authentication Date: ${new Date().toLocaleDateString()}${bonusText}${promoText}\n\nNew Balance: ${updatedUserPoints.toLocaleString()} points`,
        [
          {
            text: 'View Rewards',
            onPress: () => navigation.navigate('Rewards'),
          },
          {
            text: 'Scan Another',
            onPress: () => {
              setManualCode('');
              setScanMode('qr');
            },
          },
        ]
      );

      // For production, use:
      // const authentication = await wireAuthService.authenticateWire(user.id, code);
      // await analyticsService.logWireAuthentication(user.id, true);
    } catch (error: any) {
      console.error('Wire authentication error:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      let errorTitle = '❌ Verification Failed';
      
      if (error.message.includes('already been scanned')) {
        errorMessage = 'This wire has already been scanned by another user.';
        errorTitle = '⚠️ Already Used';
      } else if (error.message.includes('expired')) {
        errorMessage = 'This wire has expired and is no longer valid.';
        errorTitle = '⏰ Expired Wire';
      } else if (error.message.includes('Invalid') || error.message.includes('unverified')) {
        errorMessage = 'This wire is invalid or not verified. Please check the QR code.';
        errorTitle = '❌ Invalid Wire';
      } else if (error.message.includes('Invalid wire')) {
        errorMessage = 'Invalid authentication code. Please check the code and try again.';
      }
      
      Alert.alert(
        errorTitle,
        `${errorMessage}\n\nPlease check:\n• Code is entered correctly\n• Product is genuine Opilex wire\n• Code format: OPILEX_WIRE_[BATCH]_[YEAR]`,
        [
          {
            text: 'Try Again',
            onPress: () => {
              setManualCode('');
              setScanMode('qr');
            },
          },
        ]
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Product Verification"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contentArea}>
          {/* Scanner at top when in QR mode */}
          {scanMode === 'qr' ? (
            <View style={styles.scannerInline}>
              <QRCodeScanner
                onScan={handleScanResult}
                onClose={() => navigation.goBack()}
              />
            </View>
          ) : null}

          {/* Header Section */}
          <View style={[
            styles.headerSection,
            {
              backgroundColor: isDark ? '#000000' : '#F8F8F8',
              borderColor: theme.colors.border,
            }
          ]}>
            <View style={[
              styles.headerIconContainer,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}>
              <Icon name="authenticate" size={40} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            </View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Verify Product (Reward QR)
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
              Scan reward QR code to verify product is genuine — or enter code manually
            </Text>
          </View>

          {/* Mode Selector */}
          <View style={[
            styles.modeSelector,
            {
              backgroundColor: isDark ? '#000000' : '#F5F5F5',
              borderColor: theme.colors.border,
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                scanMode === 'qr' && {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                },
                scanMode !== 'qr' && {
                  backgroundColor: 'transparent',
                }
              ]}
              onPress={() => setScanMode('qr')}
              activeOpacity={0.8}
            >
              <Icon 
                name="scan" 
                size={24} 
                color={scanMode === 'qr' ? (isDark ? '#000000' : '#FFFFFF') : theme.colors.iconColor} 
                strokeWidth={2.5} 
              />
              <Text style={[
                styles.modeButtonText,
                {
                  color: scanMode === 'qr' ? (isDark ? '#000000' : '#FFFFFF') : theme.colors.text,
                }
              ]}>
                Scan QR Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                { backgroundColor: 'transparent', marginLeft: 8 },
              ]}
              onPress={() => navigation.navigate('Scanner', { scanPurpose })}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeButtonText, { color: theme.colors.accent, fontSize: 13 }]}>
                Full-screen scan →
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                scanMode === 'manual' && {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                },
                scanMode !== 'manual' && {
                  backgroundColor: 'transparent',
                }
              ]}
              onPress={() => setScanMode('manual')}
              activeOpacity={0.8}
            >
              <Icon 
                name="info" 
                size={24} 
                color={scanMode === 'manual' ? (isDark ? '#000000' : '#FFFFFF') : theme.colors.iconColor} 
                strokeWidth={2.5} 
              />
              <Text style={[
                styles.modeButtonText,
                {
                  color: scanMode === 'manual' ? (isDark ? '#000000' : '#FFFFFF') : theme.colors.text,
                }
              ]}>
                Enter Manually
              </Text>
            </TouchableOpacity>
          </View>

          {scanMode === 'manual' ? (
            <View style={styles.manualContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Authentication Code
                </Text>
                <View style={[
                  styles.manualInputContainer,
                  {
                    backgroundColor: isDark ? '#000000' : '#FFFFFF',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <View style={styles.inputIcon}>
                    <Icon name="authenticate" size={20} color={theme.colors.iconColor} strokeWidth={2} />
                  </View>
                  <TextInput
                    style={[styles.manualInput, { color: theme.colors.text }]}
                    placeholder="Enter the code from wire packaging (e.g., OPILEX_WIRE_BATCH123_2024)"
                    placeholderTextColor={theme.colors.accent}
                    value={manualCode}
                    onChangeText={setManualCode}
                    autoCapitalize="characters"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#FFFFFF' : '#000000',
                  },
                  isVerifying && styles.verifyButtonDisabled
                ]}
                onPress={handleManualVerification}
                disabled={Boolean(isVerifying)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.verifyButtonText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  {isVerifying ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {scanMode !== 'qr' && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.backButton,
                  {
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
                  Back to Dashboard
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
      </KeyboardAvoidingView>

      {/* Scan result modal - same design as Redeem Points / Add Account */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseResultModal}
      >
        <View style={styles.resultModalOverlay}>
          <View style={[
            styles.resultModalContainer,
            {
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              borderColor: isDark ? '#FFFFFF' : '#000000',
            }
          ]}>
            <View style={styles.resultModalIconContainer}>
              <View style={[
                styles.resultModalIconOuter,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                }
              ]}>
                <View style={[
                  styles.resultModalIconInner,
                  { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  <Icon name="check" size={40} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                </View>
              </View>
            </View>
            <View style={[
              styles.resultModalBadge,
              { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              <Text style={[
                styles.resultModalBadgeText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                SUCCESS
              </Text>
            </View>
            <Text style={[styles.resultModalTitle, { color: theme.colors.text }]}>
              {resultModalTitle}
            </Text>
            <Text style={[styles.resultModalMessage, { color: theme.colors.accent }]}>
              {resultModalMessage}
            </Text>
            <TouchableOpacity
              style={[
                styles.resultModalButton,
                { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
              ]}
              onPress={handleCloseResultModal}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.resultModalButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  contentArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  // Header Section
  headerSection: {
    borderRadius: 28,
    padding: 32,
    marginBottom: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  headerIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  // Mode Selector
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 32,
    borderRadius: 20,
    padding: 6,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    gap: 6,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.3,
  },
  // Scan Container
  scannerInline: {
    flex: 1,
    minHeight: 400,
  },
  scanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  scanArea: {
    width: '100%',
    minHeight: 320,
    borderRadius: 28,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  scanPlaceholder: {
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  scanIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  placeholderText: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  scanFramePreview: {
    width: 140,
    height: 140,
    position: 'relative',
    borderWidth: 2,
    borderRadius: 12,
  },
  frameCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 3,
    top: -3,
    left: -3,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  frameCornerTR: {
    top: -3,
    right: -3,
    left: 'auto',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  frameCornerBL: {
    bottom: -3,
    left: -3,
    top: 'auto',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 3,
  },
  frameCornerBR: {
    bottom: -3,
    right: -3,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    gap: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    minWidth: 240,
  },
  scanButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  // Manual Container
  manualContainer: {
    flex: 1,
    width: '100%',
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  manualInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 140,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    gap: 14,
  },
  inputIcon: {
    marginTop: 4,
  },
  manualInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    minHeight: 108,
    paddingTop: 0,
    textAlignVertical: 'top',
  },
  verifyButton: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.8,
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.5,
  },
  // Scan result modal - same design as Redeem Points / Add Account
  resultModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultModalContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
  },
  resultModalIconContainer: {
    marginBottom: 14,
  },
  resultModalIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  resultModalIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalBadge: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  resultModalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 1,
  },
  resultModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  resultModalMessage: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  resultModalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  resultModalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
});

export default WireAuthenticationScreen;



