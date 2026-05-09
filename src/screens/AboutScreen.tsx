import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Icon from '../components/Icon';

type AboutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

interface Props {
  navigation: AboutScreenNavigationProp;
}

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="About Kimson"
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
        {/* About Image - 100% Width at Top */}
        <Image 
          source={require('../../assets/about.jpg')}
          style={styles.topImage}
          resizeMode="cover"
        />

        {/* Leadership/Team Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Our Leadership Team
          </Text>
          
          <View style={styles.leadershipGrid}>
            <View style={[
              styles.leadershipCard,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                borderColor: theme.colors.border,
              }
            ]}>
              <View style={[
                styles.leadershipIcon,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="profile" size={36} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.leadershipName, { color: theme.colors.text }]}>
                Mr. Champak Shah
              </Text>
              <Text style={[styles.leadershipTitle, { color: theme.colors.accent }]}>
                Chairman & Founder
              </Text>
              <Text style={[styles.leadershipDesc, { color: theme.colors.accent }]}>
                With more than five decades of industry experience, he is the visionary who established Kimson on a foundation of commitment and purpose.
              </Text>
            </View>

            <View style={[
              styles.leadershipCard,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                borderColor: theme.colors.border,
              }
            ]}>
              <View style={[
                styles.leadershipIcon,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="profile" size={36} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.leadershipName, { color: theme.colors.text }]}>
                Mr. Mahavir Shah
              </Text>
              <Text style={[styles.leadershipTitle, { color: theme.colors.accent }]}>
                Founder & Managing Director
              </Text>
              <Text style={[styles.leadershipDesc, { color: theme.colors.accent }]}>
                Backed by 25+ years in the industry, he has been instrumental in driving innovation and sustained growth.
              </Text>
            </View>

            <View style={[
              styles.leadershipCard,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#F8F8F8',
                borderColor: theme.colors.border,
              }
            ]}>
              <View style={[
                styles.leadershipIcon,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  borderColor: theme.colors.border,
                }
              ]}>
                <Icon name="profile" size={36} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <Text style={[styles.leadershipName, { color: theme.colors.text }]}>
                Mr. Jash Shah
              </Text>
              <Text style={[styles.leadershipTitle, { color: theme.colors.accent }]}>
                Founder & Managing Director
              </Text>
              <Text style={[styles.leadershipDesc, { color: theme.colors.accent }]}>
                The next generation of leadership, with fresh ideas, a forward thinking mindset, and a strong passion for innovation. Driving the company toward future growth.
              </Text>
            </View>
          </View>
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
    paddingBottom: 100,
  },
  topImage: {
    width: '100%',
    height: 400,
    marginTop: 0,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 32,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  leadershipGrid: {
    gap: 24,
  },
  leadershipCard: {
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
  leadershipIcon: {
    width: 100,
    height: 100,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  leadershipName: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  leadershipTitle: {
    fontFamily: 'Ubuntu-Bold',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  leadershipDesc: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
});

export default AboutScreen;