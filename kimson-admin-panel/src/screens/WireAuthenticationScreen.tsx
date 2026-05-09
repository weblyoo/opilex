import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import QRCodeScanner from '../components/QRCodeScanner';
import { useAuth } from '../contexts/AuthContext';
import mockAuthService from '../services/mockAuth';

type WireAuthenticationNavigationProp = StackNavigationProp<RootStackParamList, 'WireAuthentication'>;

interface Props {
  navigation: WireAuthenticationNavigationProp;
}

const WireAuthenticationScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showScanner, setShowScanner] = useState(true); // Start with scanner open

  const handleStartScan = () => {
    setShowScanner(true);
  };

  const handleScanResult = async (code: string) => {
    setShowScanner(false);
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

    setIsVerifying(true);
    
    try {
      // Try to parse as JSON first
      try {
        const parsedData = JSON.parse(code);
        
        // Check if it's a reward QR code
        if (parsedData.type === 'opilex_reward' && parsedData.rewardId) {
          await processRewardQR(parsedData);
          return;
        }
        
        // Handle wire authentication QR codes
        if (parsedData.productId && parsedData.rewardPoints) {
          const wireData = parsedData;
          let points = wireData.rewardPoints;
          const wireInfo = `${wireData.wireType} - ${wireData.length}`;
          
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
      } catch (parseError) {
        // Not JSON, check if it's old format wire code
        if (code.startsWith('OPILEX_') && code.length >= 10) {
          await processWireAuthentication(code, 50, 'Opilex Copper Wire', null);
          return;
        }
        
        // If not JSON and not old format, try to import firestore services
        const { rewardService, userService } = await import('../services/firestore');
        const { collection, query, where, getDocs, updateDoc, doc, Timestamp } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        
        // Check if it's a reward QR code ID
        const rewardQRQuery = query(
          collection(db, 'rewardQRCodes'),
          where('rewardId', '==', code)
        );
        const rewardSnapshot = await getDocs(rewardQRQuery);
        
        if (!rewardSnapshot.empty) {
          const rewardDoc = rewardSnapshot.docs[0];
          const rewardData = rewardDoc.data();
          
          if (rewardData.used) {
            Alert.alert('Already Used', 'This reward QR code has already been used.');
            setIsVerifying(false);
            return;
          }
          
          // Mark as used
          await updateDoc(doc(db, 'rewardQRCodes', rewardDoc.id), {
            used: true,
            usedBy: user.id,
            usedAt: Timestamp.now(),
          });
          
          // Add reward points
          await rewardService.createReward(
            user.id,
            rewardData.points,
            'bonus',
            rewardData.description || 'Reward QR Code'
          );
          
          // Update user points
          await userService.updateUserPoints(user.id, rewardData.points);
          
          await refreshUser();
          
          Alert.alert(
            'Reward Received! 🎉',
            `You received ${rewardData.points} points!\n\n${rewardData.description || ''}`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          setIsVerifying(false);
          return;
        }
        
        throw new Error('Invalid QR code format');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'Failed to process QR code');
      setIsVerifying(false);
    }
  };

  const processRewardQR = async (rewardData: any) => {
    if (!user) return;
    
    console.log('🔍 Processing reward QR:', rewardData);
    console.log('👤 Current user (from context):', { 
      id: user.id, 
      userType: user.userType,
      userTypeType: typeof user.userType,
    });
    
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
    const rewardQRQuery = query(
      collection(db, 'rewardQRCodes'),
      where('rewardId', '==', rewardData.rewardId)
    );
    const rewardSnapshot = await getDocs(rewardQRQuery);
    
    if (rewardSnapshot.empty) {
      throw new Error('Invalid reward QR code');
    }
    
    const rewardDoc = rewardSnapshot.docs[0];
    const dbRewardData = rewardDoc.data();
    
    if (dbRewardData.used) {
      Alert.alert('Already Used', 'This reward QR code has already been used.');
      setIsVerifying(false);
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
    await updateDoc(doc(db, 'rewardQRCodes', rewardDoc.id), {
      used: true,
      usedBy: user.id,
      usedAt: Timestamp.now(),
    });
    
    // Add reward points
    await rewardService.createReward(
      user.id,
      rewardData.points,
      'bonus',
      rewardData.description || 'Reward QR Code'
    );
    
    // Update user points
    await userService.updateUserPoints(user.id, rewardData.points);
    
    await refreshUser();
    
    Alert.alert(
      'Reward Received! 🎉',
      `You received ${rewardData.points} points!\n\n${rewardData.description || ''}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
    setIsVerifying(false);
  };

  const processWireAuthentication = async (code: string, points: number, wireInfo: string, wireData: any) => {
    if (!user) return;
    
    try {
      // Mock wire authentication for development
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        
      // Add points to user (mock)
      const updatedUser = await mockAuthService.addRewardPoints(user.id, points);
      console.log('Updated user after adding points:', updatedUser);
      
      // Record the wire authentication
      await mockAuthService.addWireAuthentication(user.id, code, points);
      
      await refreshUser();
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('User refreshed, current user:', user);
      
      const bonusText = wireData?.bonus ? `\n• Bonus Points: ${wireData.bonus}` : '';
      const promoText = wireData?.promotion ? `\n• Promotion: ${wireData.promotion}` : '';
      
      const updatedUserAfterDelay = await refreshUser();
        
      Alert.alert(
        '✅ Authentic Wire Verified!',
        `Congratulations! You've earned ${points} reward points.\n\nWire Details:\n• Product: ${wireInfo}\n• Batch: ${wireData?.batchId || code.split('_')[2] || 'Unknown'}\n• Authentication Date: ${new Date().toLocaleDateString()}${bonusText}${promoText}\n\nNew Balance: ${updatedUser.rewardPoints} points`,
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
              setShowScanner(true);
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
              setShowScanner(true);
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
        title="Wire Authentication"
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
          {/* Header Section */}
          <View style={[
            styles.headerSection,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
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
              Authenticate Wire
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
              Scan QR code or enter the authentication code manually
            </Text>
          </View>

          {/* Mode Selector */}
          <View style={[
            styles.modeSelector,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5',
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

          {scanMode === 'qr' ? (
            <View style={styles.scanContainer}>
              <View style={[
                styles.scanArea,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}>
                <View style={styles.scanPlaceholder}>
                  <View style={[
                    styles.scanIconContainer,
                    {
                      backgroundColor: isDark ? '#000000' : '#FFFFFF',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Icon name="scan" size={48} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
                    Ready to Scan
                  </Text>
                  <Text style={[styles.placeholderText, { color: theme.colors.accent }]}>
                    Position the QR code within the camera frame
                  </Text>
                  <View style={[
                    styles.scanFramePreview,
                    {
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <View style={[styles.frameCorner, { borderColor: theme.colors.text }]} />
                    <View style={[styles.frameCorner, styles.frameCornerTR, { borderColor: theme.colors.text }]} />
                    <View style={[styles.frameCorner, styles.frameCornerBL, { borderColor: theme.colors.text }]} />
                    <View style={[styles.frameCorner, styles.frameCornerBR, { borderColor: theme.colors.text }]} />
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}
                onPress={handleStartScan}
                activeOpacity={0.8}
              >
                <Icon name="scan" size={22} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                <Text style={[
                  styles.scanButtonText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  Start Camera Scan
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
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
                disabled={isVerifying}
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
          )}

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
        </View>
        
        <Modal
          visible={showScanner}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <QRCodeScanner
            onScan={handleScanResult}
            onClose={() => {
              setShowScanner(false);
              navigation.goBack();
            }}
          />
        </Modal>
      </KeyboardAvoidingView>
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
});

export default WireAuthenticationScreen;