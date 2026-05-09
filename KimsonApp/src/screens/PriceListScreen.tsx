import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
  Image,
  Modal,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../components/Icon';
import Header from '../components/Header';
import { getPriceLists, type AdminDocMeta } from '../services/documents';

type PriceListItem = AdminDocMeta & { id: string };

type PriceListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PriceList'>;

interface Props {
  navigation: PriceListScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const CARD_PADDING = 24;
const CARD_WIDTH = width - CARD_PADDING * 2;
const GAP = 16;

const PriceListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PriceListItem | null>(null);
  const [list, setList] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await getPriceLists();
      setList(data);
    } catch (e) {
      setList([]);
      setLoadError('Unable to load price lists. Pull to retry.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        await load();
        if (!cancelled) setLoading(false);
      })();
      return () => { cancelled = true; };
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openPDFModal = (item: PriceListItem) => {
    setSelectedItem(item);
    setShowPDFModal(true);
  };

  const handleOpenPDF = async () => {
    setShowPDFModal(false);
    const pdfUrl = selectedItem?.url?.trim();
    setSelectedItem(null);
    if (!pdfUrl) {
      Alert.alert('Error', 'No PDF link available.');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert(
          'Cannot Open PDF',
          'Please install a PDF viewer app to view the price list.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open PDF. Please try again later.', [{ text: 'OK' }]);
    }
  };

  const handleClosePDF = () => {
    setShowPDFModal(false);
    setSelectedItem(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} translucent />
      <Header
        title="Price List"
        showBackButton
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.text} />
        }
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.text} />
            <Text style={[styles.loadingText, { color: theme.colors.accent }]}>Loading price lists...</Text>
          </View>
        ) : loadError ? (
          <View style={[styles.emptyCard, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{loadError}</Text>
            <Text style={[styles.emptySub, { color: theme.colors.accent }]}>Pull down to retry</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
            <Icon name="price-list" size={48} color={theme.colors.accent} strokeWidth={2} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No price lists yet</Text>
            <Text style={[styles.emptySub, { color: theme.colors.accent }]}>
              When admin adds price lists, they will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {list.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={2}>
                  {item.title || 'Price List'}
                </Text>
                {item.imageUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => item.url && openPDFModal(item)}
                    style={styles.imageWrap}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ) : null}
                {item.url ? (
                  <TouchableOpacity
                    style={[
                      styles.pdfRow,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                      },
                    ]}
                    onPress={() => openPDFModal(item)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.pdfIconWrap, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
                      <Icon name="download" size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                    </View>
                    <View style={styles.pdfTextWrap}>
                      <Text style={[styles.pdfLabel, { color: theme.colors.text }]}>Today's price list (PDF)</Text>
                      <Text style={[styles.pdfHint, { color: theme.colors.accent }]}>Tap to open</Text>
                    </View>
                    <Icon name="arrow-right" size={22} color={theme.colors.accent} strokeWidth={2} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showPDFModal} transparent animationType="fade" onRequestClose={handleClosePDF}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.pdfModalContainer,
              {
                backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              },
            ]}
          >
            <View style={[styles.pdfModalIconOuter, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
              <Icon name="info" size={48} color={theme.colors.text} strokeWidth={2.5} />
            </View>
            <Text style={[styles.pdfModalTitle, { color: theme.colors.text }]}>Price List PDF</Text>
            <Text style={[styles.pdfModalMessage, { color: theme.colors.accent }]}>
              Open this price list in your browser or PDF app?
            </Text>
            <View style={styles.pdfModalActions}>
              <TouchableOpacity
                style={[styles.pdfModalBtnCancel, { borderColor: theme.colors.accent }]}
                onPress={handleClosePDF}
                activeOpacity={0.8}
              >
                <Text style={[styles.pdfModalBtnCancelText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pdfModalButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                onPress={handleOpenPDF}
                activeOpacity={0.8}
              >
                <Text style={[styles.pdfModalButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Open PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: CARD_PADDING, paddingTop: 20, paddingBottom: 100 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: { fontSize: 14, fontFamily: 'Ubuntu-Regular' },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
    opacity: 0.85,
  },
  list: { gap: GAP },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  imageWrap: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  pdfIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfTextWrap: { flex: 1 },
  pdfLabel: { fontSize: 15, fontFamily: 'Ubuntu-Bold', marginBottom: 2 },
  pdfHint: { fontSize: 12, fontFamily: 'Ubuntu-Regular', opacity: 0.85 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pdfModalContainer: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
  },
  pdfModalIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pdfModalTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 22,
    marginBottom: 10,
    textAlign: 'center',
  },
  pdfModalMessage: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  pdfModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  pdfModalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfModalBtnCancelText: { fontSize: 15, fontFamily: 'Ubuntu-Bold' },
  pdfModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfModalButtonText: { fontSize: 15, fontFamily: 'Ubuntu-Bold' },
});

export default PriceListScreen;
