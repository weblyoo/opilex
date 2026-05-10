import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../src/config/firebase';

const { width, height } = Dimensions.get('window');

interface AdminLoginProps {
  onLoginSuccess?: (adminData: any) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
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
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <Text style={styles.brandTagline}>Admin Portal</Text>
            <View style={styles.logoDivider} />
            <Text style={styles.brandSubtitle}>Wire Authentication System</Text>
          </View>
        </View>

        {/* Right Half - Login Form */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
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
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
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
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
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
  );
};

const styles = StyleSheet.create({
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '900',
    fontFamily: 'Ubuntu-Bold',
    color: '#000000',
    letterSpacing: 2,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '900',
    fontFamily: 'Ubuntu-Bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    color: '#CCCCCC',
    letterSpacing: 2,
    marginBottom: 24,
  },
  logoDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    opacity: 0.3,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Ubuntu-Regular',
    color: '#999999',
    textAlign: 'center',
    letterSpacing: 1,
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
    maxWidth: 400,
  },
  welcomeTitle: {
    fontSize: 32,
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
    marginBottom: 40,
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Ubuntu-Medium',
    color: '#000000',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    height: 56,
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
    fontSize: 20,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEB2B2',
    borderRadius: 8,
    padding: 12,
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
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
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
    letterSpacing: 0.3,
  },
});

export default AdminLogin;
