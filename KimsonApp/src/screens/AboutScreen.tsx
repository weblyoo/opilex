import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageSourcePropType,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

type AboutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

interface Props {
  navigation: AboutScreenNavigationProp;
}

interface LeadershipMember {
  name: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

const LEADERSHIP: LeadershipMember[] = [
  {
    name: 'Mr. Champak Shah',
    title: 'Chairman & Founder',
    description: 'With more than five decades of industry experience, he is the visionary who established Opilex on a foundation of commitment and purpose.',
    image: require('../../assets/Mr_Champak_Shah.png'),
  },
  {
    name: 'Mr. Mahavir Shah',
    title: 'Founder & Managing Director',
    description: 'Backed by 25+ years in the industry, he has been instrumental in driving innovation and sustained growth.',
    image: require('../../assets/Mr_Mahavir_Shah.png'),
  },
  {
    name: 'Mr. Jash Shah',
    title: 'Founder & Managing Director',
    description: 'The next generation of leadership, with fresh ideas, a forward thinking mindset, and a strong passion for innovation. Driving the company toward future growth.',
    image: require('../../assets/Mr_Jash_Shah.png'),
  },
];

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} translucent={true} />
      <Header 
        title="About Opilex"
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

        {/* Leadership/Team Section - images with names */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Our Leadership Team
          </Text>
          
          <View style={styles.leadershipGrid}>
            {LEADERSHIP.map((member) => (
              <View
                key={member.name}
                style={[
                  styles.leadershipCard,
                  {
                    backgroundColor: isDark ? '#000000' : '#F8F8F8',
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <Image
                  source={member.image}
                  style={styles.leadershipImage}
                  resizeMode="cover"
                />
                <Text style={[styles.leadershipName, { color: theme.colors.text }]}>
                  {member.name}
                </Text>
                <Text style={[styles.leadershipTitle, { color: theme.colors.accent }]}>
                  {member.title}
                </Text>
                <Text style={[styles.leadershipDesc, { color: theme.colors.accent }]}>
                  {member.description}
                </Text>
              </View>
            ))}
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
  leadershipImage: {
    width: 120,
    height: 120,
    borderRadius: 26,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
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



