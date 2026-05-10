import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../src/config/firebase';
import Logo from '../src/components/Logo';

const { width, height } = Dimensions.get('window');

interface AdminLoginScreenProps {
  onLoginSuccess?: (adminData: any) => void;
  navigation?: any;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLoginSuccess, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is admin
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (!adminDoc.exists()) {
        await auth.signOut();
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      const adminData = adminDoc.data();
      
      if (onLoginSuccess) {
        onLoginSuccess({
          uid: user.uid,
          email: user.email,
          ...adminData
        });
      }

      // Navigate to admin dashboard if navigation is available
      if (navigation) {
        navigation.replace('AdminDashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.splitContainer}>
          {/* Left Half - Opilex Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>K</Text>
              </View>
              <Text style={styles.brandName}>OPILEX</Text>
              <View style={styles.logoDivider} />
              <Text style={styles.brandTagline}>Admin Portal</Text>
              <Text style={styles.brandSubtitle}>Wire Authentication System</Text>
            </View>
          </View>

          {/* Right Half - Login Form */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to your admin account</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="admin@opilex.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <Text style={styles.eyeButtonText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerText}>
                <Text style={styles.footerTextStyle}>
                  Secure admin access only
                </Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  // Left Half - Logo Section
  logoSection: {
    width: '50%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 15,
  },
  logoText: {
    fontSize: 72,
    fontWeight: '900',
    fontFamily: 'Ubuntu-Bold',
    color: '#000000',
    letterSpacing: 2,
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'Ubuntu-Bold',
    color: '#FFFFFF',
    letterSpacing: 6,
    marginBottom: 16,
  },
  logoDivider: {
    width: 80,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    opacity: 0.4,
  },
  brandTagline: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    color: '#CCCCCC',
    letterSpacing: 2,
    marginBottom: 12,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    color: '#999999',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 20,
  },
  // Right Half - Form Section
  formSection: {
    width: '50%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    color: '#666666',
    marginBottom: 48,
    letterSpacing: 0.3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    color: '#000000',
    marginBottom: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 18,
    height: 60,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    color: '#000000',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  eyeButtonText: {
    fontSize: 22,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FEB2B2',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Ubuntu-Medium',
    color: '#C53030',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#000000',
    borderRadius: 14,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Ubuntu-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  footerText: {
    alignItems: 'center',
  },
  footerTextStyle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    color: '#999999',
    letterSpacing: 0.5,
  },
});

export default AdminLoginScreen;
