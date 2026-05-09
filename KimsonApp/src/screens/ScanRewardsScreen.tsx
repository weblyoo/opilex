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
import { parseScannedCode, processRewardQR, lookupRewardByCode } from '../services/scanHandlers';

type NavProp = StackNavigationProp<RootStackParamList, 'ScanRewards'>;

interface Props {
  navigation: NavProp;
}

/**
 * Dedicated screen: Scan Rewards only.
 * Own scanner + own popup. Reward QR only; product/wire codes show "Use Authenticate Product".
 */
const ScanRewardsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [scannerResetKey, setScannerResetKey] = useState(0);

  const showResult = (title: string, message: string, error: boolean) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsError(error);
    setShowModal(true);
    setVerifying(false);
  };

  const handleScan = async (code: string) => {
    if (!user?.id) {
      showResult('Error', 'Please log in to claim rewards.', true);
      return;
    }
    setVerifying(true);
    const parsed = parseScannedCode(code);

    if (parsed.type === 'wire') {
      showResult(
        'Wrong screen',
        'This is a product/wire authentication code.\n\nUse "Authenticate Product" screen to verify wires.',
        true
      );
      return;
    }

    if (parsed.type === 'reward' && parsed.rewardData) {
      await processRewardQR(parsed.rewardData, user.id, {
        refreshUser,
        onSuccess: (t, m) => showResult(t, m, false),
        onError: (t, m) => showResult(t, m, true),
      });
      return;
    }

    // Unknown: try lookup by rewardId (plain ID from admin)
    const rewardData = await lookupRewardByCode(parsed.rawCode);
    if (rewardData) {
      await processRewardQR(rewardData, user.id, {
        refreshUser,
        onSuccess: (t, m) => showResult(t, m, false),
        onError: (t, m) => showResult(t, m, true),
      });
      return;
    }

    showResult(
      'Invalid code',
      'This QR is not a reward code.\n\nUse "Scan Rewards" for reward QR codes; use "Authenticate Product" for wires.',
      true
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setScannerResetKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <Header
        title="Scan Rewards"
        showBackButton
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <View style={styles.scannerWrap}>
        <QRCodeScanner onScan={handleScan} onClose={() => navigation.goBack()} resetTrigger={scannerResetKey} />
      </View>
      {verifying && (
        <View style={styles.verifyingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.verifyingText, { color: theme.colors.text }]}>Processing...</Text>
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

export default ScanRewardsScreen;
