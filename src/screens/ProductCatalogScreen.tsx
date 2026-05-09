import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
  Image,
  Modal,
  StatusBar,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';

type ProductCatalogNavigationProp = StackNavigationProp<RootStackParamList, 'ProductCatalog'>;

interface Props {
  navigation: ProductCatalogNavigationProp;
}

const { width } = Dimensions.get('window');

const ProductCatalogScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [showPDFModal, setShowPDFModal] = useState(false);

  const galleryItems = [
    { id: '1', title: 'Catalog 1', image: require('../../assets/product3.jpeg') },
    { id: '2', title: 'Catalog 2', image: require('../../assets/product4.jpeg') },
    { id: '3', title: 'Catalog 3', image: require('../../assets/product1.jpeg') },
    { id: '4', title: 'Catalog 4', image: require('../../assets/product2.jpeg') },
    { id: '5', title: 'Catalog 5', image: require('../../assets/product3.jpeg') },
    { id: '6', title: 'Catalog 6', image: require('../../assets/product4.jpeg') },
  ];

  const handlePDFPress = (title: string) => {
    setShowPDFModal(true);
  };

  const handleOpenPDF = async () => {
    setShowPDFModal(false);
    
    // Product catalog PDF URL
    const pdfUrl = 'https://discontented-owl.static.domains/312d3d58719d2fdd157513f4d15e688c.pdf';
    
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert(
          'Cannot Open PDF',
          'Please install a PDF viewer app to view product catalogs.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open PDF file. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClosePDF = () => {
    setShowPDFModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Product Catalog"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.galleryContainer}>
          {galleryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.galleryCard,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => handlePDFPress(item.title)}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={item.image}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>
              <View style={[
                styles.cardFooter,
                {
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  borderTopColor: theme.colors.border,
                }
              ]}>
                <Icon name="download" size={20} color={isDark ? '#FFFFFF' : '#000000'} strokeWidth={2.5} />
                <Text style={[
                  styles.cardTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* PDF Modal */}
      <Modal
        visible={showPDFModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClosePDF}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.pdfModalContainer,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
              borderColor: isDark ? '#FFFFFF' : '#000000',
            }
          ]}>
            {/* Icon Container */}
            <View style={styles.pdfModalIconContainer}>
              <View style={[
                styles.pdfModalIconOuter,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                }
              ]}>
                <View style={[
                  styles.pdfModalIconInner,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}>
                  <Icon name="product-catalogue" size={48} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={3} />
                </View>
              </View>
            </View>

            {/* Badge */}
            <View style={[
              styles.pdfModalBadge,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]}>
              <Text style={[
                styles.pdfModalBadgeText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                PDF READY
              </Text>
            </View>

            {/* Title */}
            <Text style={[styles.pdfModalTitle, { color: theme.colors.text }]}>
              Product Catalog
            </Text>
            
            {/* Message */}
            <Text style={[styles.pdfModalMessage, { color: theme.colors.accent }]}>
              Ready to view the latest product catalog in PDF format
            </Text>

            {/* Details Container */}
            <View style={[
              styles.pdfModalDetailsContainer,
              {
                backgroundColor: isDark ? '#000000' : '#F5F5F5',
                borderColor: theme.colors.border,
              }
            ]}>
              <View style={styles.pdfModalDetailRow}>
                <View style={[
                  styles.pdfModalDetailIconContainer,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}>
                  <Icon name="product-catalogue" size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                </View>
                <View style={styles.pdfModalDetailTextContainer}>
                  <Text style={[styles.pdfModalDetailTitle, { color: theme.colors.text }]}>
                    Complete Catalog
                  </Text>
                  <Text style={[styles.pdfModalDetailDescription, { color: theme.colors.accent }]}>
                    All products with detailed specifications
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              style={[
                styles.pdfModalButton,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                }
              ]} 
              onPress={handleOpenPDF}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.pdfModalButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                Open PDF
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  galleryCard: {
    width: (width - 64) / 2,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 12,
    borderTopWidth: 1.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // PDF Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pdfModalContainer: {
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 30,
  },
  pdfModalIconContainer: {
    marginBottom: 24,
  },
  pdfModalIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  pdfModalIconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  pdfModalBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  pdfModalBadgeText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  pdfModalTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  pdfModalMessage: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  pdfModalDetailsContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  pdfModalDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
  },
  pdfModalDetailIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  pdfModalDetailTextContainer: {
    flex: 1,
  },
  pdfModalDetailTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  pdfModalDetailDescription: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  pdfModalButton: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  pdfModalButtonText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default ProductCatalogScreen;