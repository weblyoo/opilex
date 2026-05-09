import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import QRCodeScanner from '../components/QRCodeScanner';

type ScannerNavigationProp = StackNavigationProp<RootStackParamList, 'Scanner'>;
type ScannerRouteProp = RouteProp<RootStackParamList, 'Scanner'>;

interface Props {
  navigation: ScannerNavigationProp;
  route: ScannerRouteProp;
}

/**
 * Dedicated full-screen scanner for product verification or rewards scan.
 * On scan, passes code and scanPurpose to WireAuthentication which shows the appropriate popup.
 */
const ScannerScreen: React.FC<Props> = ({ navigation, route }) => {
  const scanPurpose = route.params?.scanPurpose ?? 'authenticate';

  const handleScan = (code: string) => {
    navigation.navigate('WireAuthentication', { scannedCode: code, scanPurpose });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <QRCodeScanner onScan={handleScan} onClose={handleClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default ScannerScreen;
