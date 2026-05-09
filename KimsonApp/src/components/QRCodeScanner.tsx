import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../config/theme';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  /** When this value changes, scanner resets and is ready for the next scan (e.g. pass a counter that increments when result modal closes). */
  resetTrigger?: number;
}

const { width, height } = Dimensions.get('window');

function getDataFromScanResult(result: any): string {
  if (typeof result === 'string') return result.trim();
  if (!result || typeof result !== 'object') return '';
  const data =
    result.data ??
    result.raw ??
    result.value ??
    result.content ??
    (result.nativeEvent && (result.nativeEvent.data ?? result.nativeEvent.raw ?? result.nativeEvent.value));
  return typeof data === 'string' ? data.trim() : '';
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose, resetTrigger }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const hasScannedRef = useRef(false);
  const prevResetTriggerRef = useRef(resetTrigger);

  // Request permission once on mount so scanner works after first grant (fixes expo/expo#28758)
  useEffect(() => {
    requestPermission();
  }, []);

  // When parent signals reset (e.g. result modal closed), allow next scan without tapping "Scan Again"
  useEffect(() => {
    if (resetTrigger === undefined) return;
    if (prevResetTriggerRef.current !== resetTrigger) {
      prevResetTriggerRef.current = resetTrigger;
      setScanned(false);
      hasScannedRef.current = false;
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (permission?.granted && !scanned) {
      startScanLineAnimation();
    }
  }, [permission?.granted, scanned]);

  useEffect(() => {
    if (!scanned) hasScannedRef.current = false;
  }, [scanned]);

  const startScanLineAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBarCodeScanned = useCallback(
    (result: any) => {
      if (hasScannedRef.current) return;
      const data = getDataFromScanResult(result);
      if (!data) return;
      hasScannedRef.current = true;
      setScanned(true);
      // Defer so native callback can finish; avoids issues on some Android devices
      const toSend = data;
      setTimeout(() => {
        onScan(toSend);
      }, 0);
    },
    [onScan]
  );

  if (permission === null || permission === undefined) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access is needed to scan QR codes</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
      />
      {/* Overlay as sibling so CameraView has no children (fixes CameraView children warning) */}
      <View style={[styles.overlay, styles.overlayAbsolute]} pointerEvents="box-none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              {!scanned && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, scanAreaSize - 50],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.instructionText}>
            Position the QR code within the frame
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          {scanned && (
            <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
              <Text style={styles.rescanButtonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const scanAreaSize = 280;
const overlayColor = 'rgba(0, 0, 0, 0.8)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: theme.fontSize.large,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlayAbsolute: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: scanAreaSize,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: scanAreaSize - 40,
    height: scanAreaSize - 40,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderRadius: 4,
  },
  topLeft: {
    top: -5,
    left: -5,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -5,
    right: -5,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -5,
    left: -5,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -5,
    right: -5,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: overlayColor,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.xl,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    color: '#000000',
    fontSize: theme.fontSize.medium,
    fontWeight: '700',
  },
  rescanButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  rescanButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default QRCodeScanner;




