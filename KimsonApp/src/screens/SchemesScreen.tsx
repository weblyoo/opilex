import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { schemeService, Scheme, SchemeJoinRecord } from '../services/schemes';

const { width: screenWidth } = Dimensions.get('window');
const CARD_GAP = 12;
const H_PADDING = 20;
const CARD_WIDTH = (screenWidth - H_PADDING * 2 - CARD_GAP) / 2;

type SchemesNavigationProp = StackNavigationProp<RootStackParamList, 'Schemes'>;

interface Props {
  navigation: SchemesNavigationProp;
}

const SchemesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, refreshUser } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [myJoins, setMyJoins] = useState<SchemeJoinRecord[]>([]);
  const [loadingJoins, setLoadingJoins] = useState(false);

  const rewardPoints = user?.rewardPoints || 0;
  const walletBalance = user?.walletBalance ?? 0;
  const userCategory = user?.userType || 'electrician';

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadSchemes();
        loadMyJoins();
      }
    }, [user?.id])
  );

  const loadMyJoins = async () => {
    if (!user?.id) return;
    try {
      setLoadingJoins(true);
      const joins = await schemeService.getMySchemeJoins(user.id);
      setMyJoins(joins);
    } catch (e) {
      console.error('Error loading scheme joins:', e);
      setMyJoins([]);
    } finally {
      setLoadingJoins(false);
    }
  };

  const loadSchemes = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const activeSchemes = await schemeService.getActiveSchemes(
        user.id,
        walletBalance,
        userCategory
      );
      setSchemes(activeSchemes);
    } catch (error) {
      console.error('Error loading schemes:', error);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const amountRequired = (scheme: Scheme) => scheme.minPoints ?? 0;
  const minWalletToJoin = (scheme: Scheme) => scheme.pointsRequired ?? 0;
  const isEligible = (scheme: Scheme) => walletBalance >= minWalletToJoin(scheme) && walletBalance >= amountRequired(scheme);
  const eligibleSchemes = schemes.filter(isEligible).length;
  const bannerSchemes = schemes.filter(s => s.bannerImageUrl);
  const now = new Date();
  const completedJoins = myJoins.filter((j) => {
    const end = j.schemeEndDate ? (j.schemeEndDate instanceof Date ? j.schemeEndDate : new Date((j.schemeEndDate as any)?.seconds * 1000)) : null;
    return end != null && end < now;
  });
  const formatJoinDate = (d: Date | any) => {
    if (d instanceof Date) return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    if (d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    return '—';
  };

  const openSchemeModal = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setShowSchemeModal(true);
  };

  const closeSchemeModal = () => {
    setShowSchemeModal(false);
    setSelectedScheme(null);
  };

  const handleJoinConfirm = async () => {
    if (!user?.id || !selectedScheme) return;
    const scheme = selectedScheme;
    const balance = user?.walletBalance ?? 0;
    if (balance < minWalletToJoin(scheme)) {
      setErrorModalMessage(
        `Not eligible to join. Min wallet required: ₹${minWalletToJoin(scheme).toLocaleString()}. Your balance: ₹${balance.toLocaleString()}.`
      );
      setShowErrorModal(true);
      return;
    }
    const amount = amountRequired(scheme);
    setJoiningId(scheme.id ?? null);
    try {
      const { walletAfter } = await schemeService.joinScheme(
        user.id,
        user.name || '',
        user.phoneNumber || '',
        scheme.id!,
        balance
      );
      await refreshUser();
      loadSchemes();
      closeSchemeModal();
      setSuccessModalTitle('Joined');
      setSuccessModalMessage(`You joined "${scheme.name}". ₹${amount.toLocaleString()} deducted. New wallet balance: ₹${walletAfter.toFixed(2)}.`);
      setShowSuccessModal(true);
    } catch (e: any) {
      setErrorModalMessage(e?.message || 'Failed to join scheme.');
      setShowErrorModal(true);
    } finally {
      setJoiningId(null);
    }
  };

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / screenWidth);
    if (index >= 0 && index !== bannerIndex) setBannerIndex(index);
  };

  const bg = isDark ? '#0D0D0D' : '#F5F5F5';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = isDark ? '#A0A0A0' : '#6B6B6B';
  const borderColor = isDark ? '#2A2A2A' : '#E5E5E5';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bg} translucent />
      <Header
        title="Schemes"
        showBackButton
        onBackPress={() => navigation.goBack()}
        backgroundColor={bg}
        textColor={textPrimary}
        isDarkMode={isDark}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
      >
        {/* Promotional banner – carousel from scheme banners or placeholder */}
        <View style={styles.bannerSection}>
          {bannerSchemes.length > 0 ? (
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              onMomentumScrollEnd={onBannerScroll}
              showsHorizontalScrollIndicator={false}
              style={styles.bannerScroll}
            >
              {bannerSchemes.map((s) => (
                <View key={s.id} style={[styles.bannerSlide, { width: screenWidth }]}>
                  <Image source={{ uri: s.bannerImageUrl }} style={styles.bannerImage} resizeMode="cover" />
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerTitle}>{s.name}</Text>
                    <Text style={styles.bannerSubtitle}>Amount: ₹{((s as Scheme).minPoints ?? 0).toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.promoBannerPlaceholder}>
              <View style={styles.promoBannerContent}>
                <Text style={styles.promoBannerLabel}>REWARDS</Text>
                <Text style={styles.promoBannerTitle}>Get cashback on your purchases</Text>
                <Text style={styles.promoBannerSubtitle}>Earn points every day. Shop now and save.</Text>
                <TouchableOpacity style={styles.shopNowButton} activeOpacity={0.8}>
                  <Text style={styles.shopNowText}>Shop now</Text>
                </TouchableOpacity>
                <Text style={styles.promoTerms}>Terms and conditions apply</Text>
              </View>
            </View>
          )}
          {(bannerSchemes.length > 1 || bannerSchemes.length === 0) && (
            <View style={styles.bannerDots}>
              {(bannerSchemes.length > 0 ? bannerSchemes : [1]).map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, bannerIndex === i ? styles.dotActive : {}, { backgroundColor: bannerIndex === i ? '#FFF' : 'rgba(255,255,255,0.5)' }]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Schemes For You */}
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Schemes For You</Text>

        {/* Wallet & Eligibility card */}
        <View style={[styles.pointsCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.pointsCardLeft, { borderRightColor: borderColor }]}>
            <Text style={[styles.pointsValue, { color: textPrimary }]}>₹{walletBalance.toFixed(2)}</Text>
            <Text style={[styles.pointsLabel, { color: textSecondary }]}>Your Wallet</Text>
          </View>
          <View style={styles.pointsCardRight}>
            <Text style={[styles.pointsValue, { color: textPrimary }]}>{eligibleSchemes}</Text>
            <Text style={[styles.pointsLabel, { color: textSecondary }]}>Schemes Eligibility</Text>
          </View>
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={[styles.loadingText, { color: textSecondary }]}>Loading schemes...</Text>
          </View>
        ) : schemes.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: cardBg, borderColor }]}>
            <Icon name="gift-box" size={48} color={textSecondary} strokeWidth={2} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Active Schemes</Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary }]}>Keep scanning to earn points and unlock schemes!</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {schemes.map((scheme) => (
              <TouchableOpacity
                key={scheme.id}
                style={[styles.schemeCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => openSchemeModal(scheme)}
                activeOpacity={0.9}
              >
                {scheme.imageUrl ? (
                  <Image source={{ uri: scheme.imageUrl }} style={styles.schemeCardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.schemeCardImagePlaceholder, { backgroundColor: borderColor }]}>
                    <Icon name="gift-box" size={32} color={textSecondary} strokeWidth={2} />
                  </View>
                )}
                <Text style={[styles.schemeCardTitle, { color: textPrimary }]} numberOfLines={2}>
                  {scheme.name}
                </Text>
                <Text style={[styles.schemeCardPoints, { color: textSecondary }]}>
                  Amount Required: ₹{(amountRequired(scheme)).toLocaleString()} · Min wallet: ₹{(minWalletToJoin(scheme)).toLocaleString()}
                </Text>
                <TouchableOpacity
                  style={[styles.addButton, joiningId === scheme.id && styles.addButtonDisabled, !isEligible(scheme) && styles.addButtonDisabled]}
                  onPress={() => openSchemeModal(scheme)}
                  activeOpacity={0.8}
                  disabled={!!joiningId}
                >
                  <Text style={styles.addButtonText}>
                    {joiningId === scheme.id ? '…' : isEligible(scheme) ? 'Join' : 'Not eligible'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Joined schemes timeline */}
        <Text style={[styles.sectionTitle, { color: textPrimary, marginTop: 28 }]}>Joined schemes timeline</Text>
        {loadingJoins ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={theme.colors.accent} />
            <Text style={[styles.loadingText, { color: textSecondary, fontSize: 13 }]}>Loading timeline...</Text>
          </View>
        ) : myJoins.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: cardBg, borderColor, padding: 24 }]}>
            <Icon name="calendar" size={36} color={textSecondary} strokeWidth={2} />
            <Text style={[styles.emptyTitle, { color: textPrimary, fontSize: 16 }]}>No joins yet</Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary, fontSize: 13 }]}>Join a scheme above to see it here.</Text>
          </View>
        ) : (
          <View style={[styles.timelineList, { borderColor }]}>
            {myJoins.map((j, idx) => (
              <View key={j.id} style={[styles.timelineRow, { backgroundColor: cardBg, borderColor }, idx === myJoins.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.timelineRowLeft}>
                  <Text style={[styles.timelineSchemeName, { color: textPrimary }]} numberOfLines={1}>{j.schemeName}</Text>
                  <Text style={[styles.timelineMeta, { color: textSecondary }]}>
                    Joined {formatJoinDate(j.joinedAt)} · ₹{j.amountRequired.toLocaleString()} deducted
                  </Text>
                </View>
                <Text style={[styles.timelineWallet, { color: textSecondary }]}>₹{(j.walletBalanceAfter ?? 0).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Completed schemes */}
        <Text style={[styles.sectionTitle, { color: textPrimary, marginTop: 28 }]}>Completed schemes</Text>
        {completedJoins.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: cardBg, borderColor, padding: 24 }]}>
            <Icon name="check-circle" size={36} color={textSecondary} strokeWidth={2} />
            <Text style={[styles.emptyTitle, { color: textPrimary, fontSize: 16 }]}>No completed schemes</Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary, fontSize: 13 }]}>Schemes you joined that have ended will appear here.</Text>
          </View>
        ) : (
          <View style={[styles.timelineList, { borderColor }]}>
            {completedJoins.map((j, idx) => {
              const endDate = j.schemeEndDate instanceof Date ? j.schemeEndDate : (j.schemeEndDate as any)?.seconds ? new Date((j.schemeEndDate as any).seconds * 1000) : null;
              return (
                <View key={j.id} style={[styles.timelineRow, { backgroundColor: cardBg, borderColor }, idx === completedJoins.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.timelineRowLeft}>
                    <Text style={[styles.timelineSchemeName, { color: textPrimary }]} numberOfLines={1}>{j.schemeName}</Text>
                    <Text style={[styles.timelineMeta, { color: textSecondary }]}>
                      Ended {endDate ? endDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} · ₹{j.amountRequired.toLocaleString()} joined
                    </Text>
                  </View>
                  <Icon name="check-circle" size={22} color={theme.colors.accent} strokeWidth={2} />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Scheme detail / Join modal - same design as other app modals */}
      <Modal
        visible={showSchemeModal}
        transparent
        animationType="fade"
        onRequestClose={closeSchemeModal}
      >
        <Pressable style={styles.schemeModalOverlay} onPress={closeSchemeModal}>
          <Pressable style={[styles.schemeModalContent, { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderColor: isDark ? '#FFFFFF' : '#000000' }]} onPress={e => e.stopPropagation()}>
            {selectedScheme && (
              <>
                <View style={[styles.schemeModalIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>
                  <Icon name="gift-box" size={40} color={theme.colors.accent} strokeWidth={2} />
                </View>
                <Text style={[styles.schemeModalTitle, { color: theme.colors.text }]} numberOfLines={2}>
                  {selectedScheme.name}
                </Text>
                {selectedScheme.description ? (
                  <Text style={[styles.schemeModalDesc, { color: theme.colors.accent }]}>{selectedScheme.description}</Text>
                ) : null}
                <View style={styles.schemeModalRow}>
                  <Text style={[styles.schemeModalLabel, { color: theme.colors.accent }]}>Amount Required</Text>
                  <Text style={[styles.schemeModalValue, { color: theme.colors.text }]}>₹{(amountRequired(selectedScheme)).toLocaleString()}</Text>
                </View>
                <View style={styles.schemeModalRow}>
                  <Text style={[styles.schemeModalLabel, { color: theme.colors.accent }]}>Min wallet to join</Text>
                  <Text style={[styles.schemeModalValue, { color: theme.colors.text }]}>₹{(selectedScheme.pointsRequired ?? 0).toLocaleString()}</Text>
                </View>
                <View style={styles.schemeModalRow}>
                  <Text style={[styles.schemeModalLabel, { color: theme.colors.accent }]}>Your wallet</Text>
                  <Text style={[styles.schemeModalValue, { color: theme.colors.text }]}>₹{walletBalance.toLocaleString()}</Text>
                </View>
                <View style={styles.schemeModalRow}>
                  <Text style={[styles.schemeModalLabel, { color: theme.colors.accent }]}>Valid until</Text>
                  <Text style={[styles.schemeModalValue, { color: theme.colors.text }]}>
                    {selectedScheme.endDate instanceof Date ? selectedScheme.endDate.toLocaleDateString() : selectedScheme.endDate?.toDate?.()?.toLocaleDateString() ?? 'N/A'}
                  </Text>
                </View>
                {!isEligible(selectedScheme) ? (
                  <Text style={[styles.schemeModalNote, { color: theme.colors.error || '#c62828' }]}>
                    Not eligible to join. Your wallet (₹{walletBalance.toLocaleString()}) is below the min required (₹{(selectedScheme.pointsRequired ?? 0).toLocaleString()}).
                  </Text>
                ) : (
                  <Text style={[styles.schemeModalNote, { color: theme.colors.accent }]}>
                    ₹{(amountRequired(selectedScheme)).toLocaleString()} will be deducted from your wallet when you join.
                  </Text>
                )}
                <View style={styles.schemeModalButtons}>
                  <TouchableOpacity
                    style={[styles.schemeModalBtnCancel, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}
                    onPress={closeSchemeModal}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.schemeModalBtnCancelText, { color: theme.colors.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.schemeModalBtnJoin, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }, !isEligible(selectedScheme) && { opacity: 0.5 }]}
                    onPress={handleJoinConfirm}
                    activeOpacity={0.8}
                    disabled={!!joiningId || !isEligible(selectedScheme)}
                  >
                    <Text style={[styles.schemeModalBtnJoinText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                      {joiningId === selectedScheme?.id ? 'Joining…' : isEligible(selectedScheme) ? 'Join' : 'Not eligible'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success modal - same design as Wire Auth / Redeem Points */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.resultModalOverlay}>
          <View style={[styles.resultModalContainer, { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderColor: isDark ? '#FFFFFF' : '#000000' }]}>
            <View style={[styles.resultModalIconOuter, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>
              <View style={[styles.resultModalIconInner, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
                <Icon name="check" size={40} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
            </View>
            <View style={[styles.resultModalBadge, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}>
              <Text style={[styles.resultModalBadgeText, { color: isDark ? '#000000' : '#FFFFFF' }]}>SUCCESS</Text>
            </View>
            <Text style={[styles.resultModalTitle, { color: theme.colors.text }]}>{successModalTitle}</Text>
            <Text style={[styles.resultModalMessage, { color: theme.colors.accent }]}>{successModalMessage}</Text>
            <TouchableOpacity
              style={[styles.resultModalButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
              onPress={() => setShowSuccessModal(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.resultModalButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.resultModalOverlay}>
          <View style={[styles.resultModalContainer, { backgroundColor: isDark ? '#000000' : '#FFFFFF', borderColor: isDark ? '#FFFFFF' : '#000000' }]}>
            <View style={[styles.resultModalIconOuter, { backgroundColor: isDark ? 'rgba(255,100,100,0.2)' : 'rgba(200,50,50,0.1)', borderColor: isDark ? 'rgba(255,100,100,0.5)' : 'rgba(200,50,50,0.3)' }]}>
              <View style={[styles.resultModalIconInner, { backgroundColor: '#C62828' }]}>
                <Icon name="close" size={40} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <View style={[styles.resultModalBadge, { backgroundColor: '#C62828' }]}>
              <Text style={[styles.resultModalBadgeText, { color: '#FFFFFF' }]}>ERROR</Text>
            </View>
            <Text style={[styles.resultModalTitle, { color: theme.colors.text }]}>Error</Text>
            <Text style={[styles.resultModalMessage, { color: theme.colors.accent }]}>{errorModalMessage}</Text>
            <TouchableOpacity
              style={[styles.resultModalButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
              onPress={() => setShowErrorModal(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.resultModalButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: H_PADDING, paddingTop: 16 },
  bannerSection: { marginBottom: 20 },
  bannerScroll: { borderRadius: 16, overflow: 'hidden' },
  bannerSlide: { height: 160, position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  bannerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  promoBannerPlaceholder: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  promoBannerContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  promoBannerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  promoBannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  promoBannerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  shopNowButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  shopNowText: {
    color: '#0D0D0D',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  promoTerms: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 12,
    letterSpacing: 0.2,
  },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Ubuntu-Bold',
  },
  pointsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  pointsCardLeft: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRightWidth: 1,
  },
  pointsCardRight: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pointsValue: { fontSize: 28, fontWeight: '800', fontFamily: 'Ubuntu-Bold' },
  pointsLabel: { fontSize: 13, marginTop: 4, fontFamily: 'Ubuntu-Medium' },
  loadingBox: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 12, fontSize: 15 },
  emptyBox: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  timelineList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  timelineRowLeft: { flex: 1, marginRight: 12 },
  timelineSchemeName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
  },
  timelineMeta: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Ubuntu-Regular',
  },
  timelineWallet: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  schemeCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 48,
  },
  schemeCardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    backgroundColor: '#E0E0E0',
  },
  schemeCardImagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schemeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  schemeCardPoints: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Medium',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  // Scheme detail / Join modal - same design as Wire Auth / Redeem Points
  schemeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  schemeModalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
  },
  schemeModalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
    borderWidth: 2,
  },
  schemeModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  schemeModalDesc: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    marginBottom: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
  schemeModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  schemeModalLabel: {
    fontSize: 13,
    fontFamily: 'Ubuntu-Medium',
  },
  schemeModalValue: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Bold',
  },
  schemeModalNote: {
    fontSize: 12,
    fontFamily: 'Ubuntu-Regular',
    marginTop: 8,
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.85,
  },
  schemeModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  schemeModalBtnCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  schemeModalBtnCancelText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
  },
  schemeModalBtnJoin: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  schemeModalBtnJoinText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
  },
  // Success / Error modals - same as Wire Auth result modal
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

export default SchemesScreen;
