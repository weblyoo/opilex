import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import QRCodeScanner from '../components/QRCodeScanner';
import { parseScannedCode, processWireAuth, verifyRewardQRForProductVerification, lookupRewardByCode } from '../services/scanHandlers';

type NavProp = StackNavigationProp<RootStackParamList, 'AuthenticateProduct'>;

interface Props {
  navigation: NavProp;
}

/**
 * Dedicated screen: Authenticate Product (product verification only).
 * Same reward QR codes can be scanned here to verify product is genuine — no points, code not marked used.
 * Use "Scan Rewards" to claim reward points.
 */
const AuthenticateProductScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const showResult = (title: string, message: string, error: boolean) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsError(error);
    setShowModal(true);
    setVerifying(false);
  };

  const handleScan = async (code: string) => {
    if (!user?.id) {
      showResult('Error', 'Please log in to authenticate.', true);
      return;
    }
    setVerifying(true);
    const parsed = parseScannedCode(code);

    if (parsed.type === 'reward' && parsed.rewardData) {
      await new Promise<void>((resolve) => {
        verifyRewardQRForProductVerification(parsed.rewardData!.rewardId, (result) => {
          if (!result.verified) {
            showResult('Invalid code', 'This QR code was not found. Use a valid Opilex product QR.', true);
            resolve();
            return;
          }
          if (result.used && result.usedAt) {
            const dateStr = result.usedAt.toLocaleDateString(undefined, { dateStyle: 'medium' });
            showResult(
              'Product verified',
              `Genuine Opilex product.\n\nThis code was already used on ${dateStr}. Use "Scan Rewards" to claim points on reward QR codes.`,
              false
            );
          } else {
            showResult(
              'Product verified',
              `Genuine Opilex product.\n\n${result.productName || 'Opilex product'} verified. Use "Scan Rewards" screen to claim reward points for this QR.`,
              false
            );
          }
          resolve();
        });
      });
      return;
    }

    if (parsed.type === 'wire' && parsed.wireData) {
      const { code: rawCode, points, wireInfo, wireData } = parsed.wireData;
      await processWireAuth(rawCode, points, wireInfo, wireData, user.id, {
        refreshUser,
        onSuccess: (t, m) => showResult(t, m, false),
        onError: (t, m) => showResult(t, m, true),
      });
      return;
    }

    const rewardData = await lookupRewardByCode(parsed.rawCode);
    if (rewardData) {
      await new Promise<void>((resolve) => {
        verifyRewardQRForProductVerification(rewardData.rewardId, (result) => {
          if (!result.verified) {
            showResult('Invalid code', 'This QR code was not found.', true);
            resolve();
            return;
          }
          if (result.used && result.usedAt) {
            const dateStr = result.usedAt.toLocaleDateString(undefined, { dateStyle: 'medium' });
            showResult('Product verified', `Genuine Opilex product. Code was used on ${dateStr}. Use "Scan Rewards" to claim points.`, false);
          } else {
            showResult('Product verified', `Genuine Opilex product. Use "Scan Rewards" to claim reward points for this QR.`, false);
          }
          resolve();
        });
      });
      return;
    }

    showResult(
      'Invalid code',
      'This QR was not recognized. Use a valid Opilex product or reward QR code.',
      true
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <Header
        title="Authenticate Product"
        showBackButton
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <View style={styles.scannerWrap}>
        <QRCodeScanner onScan={handleScan} onClose={() => navigation.goBack()} />
      </View>
      {verifying && (
        <View style={styles.verifyingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.verifyingText, { color: theme.colors.text }]}>Verifying...</Text>
        </View>
      )}

      {/* Result modal - same design as Schemes / Wire Auth / Redeem */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <View style={styles.resultModalOverlay}>
          <View style={[styles.resultModalContainer, { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderColor: isDark ? '#FFFFFF' : '#000000' }]}>
            <View style={[styles.resultModalIconOuter, isError ? { backgroundColor: isDark ? 'rgba(255,100,100,0.2)' : 'rgba(200,50,50,0.1)', borderColor: isDark ? 'rgba(255,100,100,0.5)' : 'rgba(200,50,50,0.3)' } : { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>
              <View style={[styles.resultModalIconInner, { backgroundColor: isError ? '#C62828' : isDark ? '#FFFFFF' : '#000000' }]}>
                <Icon name={isError ? 'close' : 'check'} size={40} color={isError ? '#FFFFFF' : isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
            </View>
            <View style={[styles.resultModalBadge, { backgroundColor: isError ? '#C62828' : isDark ? '#FFFFFF' : '#000000' }]}>
              <Text style={[styles.resultModalBadgeText, { color: isError ? '#FFFFFF' : isDark ? '#000000' : '#FFFFFF' }]}>{isError ? 'ERROR' : 'SUCCESS'}</Text>
            </View>
            <Text style={[styles.resultModalTitle, { color: theme.colors.text }]}>{modalTitle}</Text>
            <Text style={[styles.resultModalMessage, { color: theme.colors.accent }]}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.resultModalButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
              onPress={handleCloseModal}
              activeOpacity={0.8}
            >
              <Text style={[styles.resultModalButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>{isError ? 'OK' : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scannerWrap: { flex: 1, minHeight: 300 },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyingText: { marginTop: 12, fontSize: 16 },
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
  resultModalIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 14,
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

export default AuthenticateProductScreen;
