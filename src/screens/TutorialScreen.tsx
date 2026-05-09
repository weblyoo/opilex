import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type TutorialScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tutorial'>;

const TutorialScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<TutorialScreenNavigationProp>();

  const tutorialCategories = [
    { id: 1, icon: 'scan', title: 'QR Scanning', description: 'Learn how to scan wire authentication codes' },
    { id: 2, icon: 'gift-box', title: 'Rewards', description: 'Discover how to earn and redeem points' },
    { id: 3, icon: 'bank', title: 'Payments', description: 'Manage your UPI and bank accounts' },
    { id: 4, icon: 'profile', title: 'Profile', description: 'Update your account information' },
    { id: 5, icon: 'leadership-board', title: 'Leaderboard', description: 'Compete with other dealers' },
    { id: 6, icon: 'support', title: 'Support', description: 'Get help when you need it' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="Tutorials"
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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
              borderColor: theme.colors.border,
            }
          ]}>
            <Icon name="watch-tutorial" size={64} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Tutorials</Text>
          <Text style={[styles.subtitle, { color: theme.colors.accent }]}>
            Master the KIMSON app with our comprehensive guides
          </Text>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
              borderColor: theme.colors.border,
            }
          ]}>
            <Text style={[
              styles.statusText,
              { color: isDark ? '#000000' : '#FFFFFF' }
            ]}>
              COMING SOON
            </Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={[
          styles.descriptionCard,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>
            What's Coming
          </Text>
          <Text style={[styles.descriptionText, { color: theme.colors.accent }]}>
            We're creating step-by-step video tutorials and interactive guides to help you make the most of every feature in the KIMSON app.
          </Text>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tutorial Topics
          </Text>
          <View style={styles.categoryGrid}>
            {tutorialCategories.map((category) => (
              <View 
                key={category.id} 
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <View style={[
                  styles.categoryIconContainer,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <Icon name={category.icon} size={32} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                </View>
                <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                  {category.title}
                </Text>
                <Text style={[styles.categoryDescription, { color: theme.colors.accent }]}>
                  {category.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Section */}
        <View style={[
          styles.progressSection,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
            borderColor: theme.colors.border,
          }
        ]}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
            Development Progress
          </Text>
          <View style={[
            styles.progressBar,
            {
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              borderColor: theme.colors.border,
            }
          ]}>
            <View style={[
              styles.progressFill,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
              }
            ]} />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            75% Complete
          </Text>
          <Text style={[styles.progressDescription, { color: theme.colors.accent }]}>
            Our team is working hard to bring you high-quality tutorial content. Stay tuned!
          </Text>
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 26,
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
  mainTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statusText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  descriptionCard: {
    borderRadius: 28,
    padding: 32,
    marginBottom: 32,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  descriptionTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  categoriesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 24,
    padding: 24,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  categoryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
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
  categoryTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  categoryDescription: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
    letterSpacing: 0.2,
  },
  progressSection: {
    borderRadius: 28,
    padding: 32,
    borderWidth: 1.5,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  progressTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  progressDescription: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7,
    letterSpacing: 0.2,
  },
});

export default TutorialScreen;
