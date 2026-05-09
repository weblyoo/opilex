import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';

type StoreLocatorNavigationProp = StackNavigationProp<RootStackParamList, 'StoreLocator'>;

interface Props {
  navigation: StoreLocatorNavigationProp;
}

const StoreLocatorScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [searchLocation, setSearchLocation] = useState('');

  const nearbyStores = [
    {
      id: '1',
      name: 'Kimson Electrical Hub',
      address: 'Shop 12, Electrical Market, Chandni Chowk, Delhi - 110006',
      distance: '2.3 km',
      phone: '+91 98765 43210',
      rating: 4.8,
      timing: '9:00 AM - 8:00 PM',
      type: 'Authorized Dealer',
    },
    {
      id: '2',
      name: 'Metro Wires & Cables',
      address: 'Plot 45, Industrial Area, Sector 8, Gurgaon - 122001',
      distance: '4.7 km',
      phone: '+91 87654 32109',
      rating: 4.6,
      timing: '10:00 AM - 7:00 PM',
      type: 'Distributor',
    },
    {
      id: '3',
      name: 'City Electrical Store',
      address: 'Building 23, Commercial Complex, Lajpat Nagar, Delhi - 110024',
      distance: '6.1 km',
      phone: '+91 76543 21098',
      rating: 4.7,
      timing: '9:30 AM - 9:00 PM',
      type: 'Dealer',
    },
    {
      id: '4',
      name: 'Power Electronics',
      address: 'Unit 8, Trade Center, Karol Bagh, Delhi - 110005',
      distance: '7.8 km',
      phone: '+91 65432 10987',
      rating: 4.5,
      timing: '8:00 AM - 8:30 PM',
      type: 'Authorized Dealer',
    },
  ];

  const storeTypes = [
    { id: '1', name: 'All Stores', count: 25, icon: 'store-locator' },
    { id: '2', name: 'Authorized Dealers', count: 12, icon: 'authenticate' },
    { id: '3', name: 'Distributors', count: 8, icon: 'settings' },
    { id: '4', name: 'Dealers', count: 5, icon: 'support' },
  ];

  const handleStorePress = (store: any) => {
    Alert.alert(
      store.name,
      `${store.address}\n\nPhone: ${store.phone}\nRating: ${store.rating}/5\nTiming: ${store.timing}\nType: ${store.type}\n\nDistance: ${store.distance}`,
      [
        { text: 'Call Store', onPress: () => Alert.alert('Calling...', `Dialing ${store.phone}`) },
        { text: 'Get Directions', onPress: () => Alert.alert('Directions', 'Opening maps...') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleSearch = () => {
    if (!searchLocation.trim()) {
      Alert.alert('Enter Location', 'Please enter a location to search for stores.');
      return;
    }
    Alert.alert('Searching...', `Finding stores near ${searchLocation}`);
  };

  const handleStoreTypePress = (type: any) => {
    Alert.alert(
      type.name,
      `Found ${type.count} ${type.name.toLowerCase()} in your area.\n\nFilter applied successfully!`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getTypeColor = (type: string) => {
    return theme.colors.text;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Store Locator"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={theme.colors.background}
        textColor={theme.colors.text}
        isDarkMode={isDark}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[
          styles.headerCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={[
            styles.headerIcon,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
              borderColor: theme.colors.border,
            }
          ]}>
            <Icon name="store-locator" size={36} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Store Locator
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.accent }]}>
            Find authorized Kimson dealers and distributors near you
          </Text>
        </View>

        {/* Search Section */}
        <View style={[
          styles.searchCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <Text style={[styles.searchTitle, { color: theme.colors.text }]}>
            Search Location
          </Text>
          <View style={styles.searchContainer}>
            <View style={[
              styles.searchInputContainer,
              {
                borderColor: theme.colors.border,
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
              }
            ]}>
              <Icon name="store-locator" size={20} color={theme.colors.accent} strokeWidth={2.5} />
              <TextInput
                placeholder="Enter city, area or pincode"
                placeholderTextColor={theme.colors.accent}
                value={searchLocation}
                onChangeText={setSearchLocation}
                style={[styles.searchInput, { color: theme.colors.text }]}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.searchButton,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <Icon name="scan" size={20} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Types Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Store Types
          </Text>
          <View style={styles.filterGrid}>
            {storeTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.filterCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleStoreTypePress(type)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.filterIcon,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <Icon name={type.icon as any} size={20} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                </View>
                <Text style={[styles.filterName, { color: theme.colors.text }]}>
                  {type.name}
                </Text>
                <Text style={[styles.filterCount, { color: theme.colors.accent }]}>
                  {type.count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nearby Stores */}
        <View style={styles.storesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nearby Stores
          </Text>
          
          {nearbyStores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={[
                styles.storeCard,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => handleStorePress(store)}
              activeOpacity={0.8}
            >
              <View style={styles.storeHeader}>
                <View style={[
                  styles.storeIcon,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <Icon name="store-locator" size={24} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={[styles.storeName, { color: theme.colors.text }]}>
                    {store.name}
                  </Text>
                  <View style={[
                    styles.storeTypeBadge,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                      borderColor: theme.colors.border,
                    }
                  ]}>
                    <Text style={[
                      styles.storeTypeText,
                      { color: isDark ? '#000000' : '#FFFFFF' }
                    ]}>
                      {store.type}
                    </Text>
                  </View>
                </View>
                <View style={styles.storeDistance}>
                  <Text style={[styles.distanceText, { color: theme.colors.text }]}>
                    {store.distance}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color={theme.colors.text} strokeWidth={2.5} />
                    <Text style={[styles.ratingText, { color: theme.colors.accent }]}>
                      {store.rating}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text style={[styles.storeAddress, { color: theme.colors.accent }]}>
                {store.address}
              </Text>
              
              <View style={[styles.storeFooter, { borderTopColor: theme.colors.border }]}>
                <View style={styles.contactInfo}>
                  <Icon name="phone" size={16} color={theme.colors.accent} strokeWidth={2.5} />
                  <Text style={[styles.phoneText, { color: theme.colors.accent }]}>
                    {store.phone}
                  </Text>
                </View>
                <Text style={[styles.timingText, { color: theme.colors.accent }]}>
                  {store.timing}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: 32,
    padding: 32,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  headerIcon: {
    width: 88,
    height: 88,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
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
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  searchCard: {
    padding: 28,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 14,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
  },
  searchButton: {
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
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  filterCard: {
    width: '48%',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  filterIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  filterName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  filterCount: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  storesSection: {
    marginBottom: 32,
  },
  storeCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  storeIcon: {
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
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  storeTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeTypeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    letterSpacing: 0.5,
  },
  storeDistance: {
    alignItems: 'flex-end',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
  },
  storeAddress: {
    fontSize: 15,
    fontFamily: 'Ubuntu-Regular',
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1.5,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  timingText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
});

export default StoreLocatorScreen;
