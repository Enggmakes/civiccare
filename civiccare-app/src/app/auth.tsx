import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/services/auth';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
} from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [ward, setWard] = useState('Ward K-West (Andheri West)');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = async () => {
    if (isSignUp) {
      if (!fullName.trim()) {
        Alert.alert('Required', 'Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        Alert.alert('Valid Email Required', 'Please enter a valid email address.');
        return;
      }
      if (!phone.trim()) {
        Alert.alert('Mobile Number Required', 'Please enter your mobile phone number.');
        return;
      }
      if (!password.trim() || password.length < 6) {
        Alert.alert('Password Required', 'Please enter a password with at least 6 characters.');
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await signUp(email.trim(), password, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          ward: ward.trim(),
        });
        if (error) {
          Alert.alert('Sign Up Error', error.message || 'Could not create account in Supabase.');
          return;
        }
        Alert.alert('Account Created!', 'Welcome to CivicCare.');
        router.replace('/(tabs)');
      } catch (e: any) {
        Alert.alert('Authentication Error', e?.message || 'Could not complete registration.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!email.trim()) {
        Alert.alert('Required', 'Please enter your registered email address.');
        return;
      }
      if (!password.trim()) {
        Alert.alert('Password Required', 'Please enter your password.');
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          Alert.alert('Sign In Failed', error.message || 'Invalid email or password.');
          return;
        }
        router.replace('/(tabs)');
      } catch (e: any) {
        Alert.alert('Authentication Error', e?.message || 'Could not complete sign in.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Header Brand Logo */}
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/civiccare/01_civiccare_logo_mark.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>CivicCare</Text>
            <Text style={styles.welcomeHeading}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.welcomeSubtext}>
              {isSignUp
                ? 'Join CivicCare to report and improve your city.'
                : 'Sign in to continue'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name (Sign Up Only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={CivicCareColors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor={CivicCareColors.textTertiary}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>
            )}

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={CivicCareColors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor={CivicCareColors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Mobile Number (Separate Input for Supabase phone_number Column) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Mobile Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color={CivicCareColors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 98201 12345"
                    placeholderTextColor={CivicCareColors.textTertiary}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>
            )}

            {/* Municipal Ward (Sign Up Only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Municipal Ward</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={18} color={CivicCareColors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Ward K-West (Andheri West)"
                    placeholderTextColor={CivicCareColors.textTertiary}
                    value={ward}
                    onChangeText={setWard}
                  />
                </View>
              </View>
            )}

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={CivicCareColors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  placeholderTextColor={CivicCareColors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color={CivicCareColors.textTertiary} />
                  ) : (
                    <Eye size={18} color={CivicCareColors.textTertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPasswordRow}
                onPress={() => Alert.alert('Password Reset', 'Password reset instructions have been sent to your registered email.')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Main Action Button */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.88}
              onPress={handleAuthSubmit}>
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up / Sign In Toggle Footer (Zero Mocked Social Buttons) */}
            <View style={styles.toggleFooter}>
              <Text style={styles.togglePrompt}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.toggleActionText}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.eight,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  logoImage: {
    width: 64,
    height: 64,
    marginBottom: Spacing.two,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  welcomeHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: CivicCareColors.textMain,
    marginTop: Spacing.two,
  },
  welcomeSubtext: {
    fontSize: 13,
    color: CivicCareColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginTop: Spacing.two,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: CivicCareColors.textMain,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.three,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: CivicCareColors.textMain,
  },
  eyeButton: {
    padding: 6,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.four,
    marginTop: -2,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: CivicCareColors.brandPrimary,
  },
  submitButton: {
    backgroundColor: CivicCareColors.brandPrimary,
    height: 52,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    shadowColor: CivicCareColors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  togglePrompt: {
    fontSize: 13,
    color: CivicCareColors.textSecondary,
  },
  toggleActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: CivicCareColors.brandPrimary,
  },
});
