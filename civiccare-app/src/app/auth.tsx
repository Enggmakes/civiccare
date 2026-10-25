import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/services/auth';
import { useAppTheme } from '@/services/themeContext';
import {
  detectCivicBodyFromGPS,
  POPULAR_CIVIC_BODIES,
  DetectedCivicLocation,
} from '@/services/civicLocation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  ChevronDown,
  Check,
  Sparkles,
  Compass,
  X,
} from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [ward, setWard] = useState('Pune Municipal Corporation (PMC)');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [detectedGps, setDetectedGps] = useState<DetectedCivicLocation | null>(null);
  const [showWardModal, setShowWardModal] = useState(false);

  const autoDetectTried = useRef(false);
  const wardEditedByUser = useRef(false);

  const handleAutoDetectGPS = async (showAlert = true) => {
    setIsDetectingGps(true);
    try {
      const res = await detectCivicBodyFromGPS();
      if (res.status === 'ok') {
        setDetectedGps(res.location);
        if (showAlert || !wardEditedByUser.current) {
          setWard(res.location.civicBody);
        }
        if (showAlert) {
          Alert.alert(
            'GPS Location Detected',
            `Assigned to: ${res.location.civicBody}\n(City/District: ${res.location.shortCity})`
          );
        }
      } else if (res.status === 'denied') {
        if (showAlert) {
          Alert.alert(
            'Location Permission Denied',
            'Please enable location permission in your device settings to auto-detect your local Municipal Corporation or Gram Panchayat.'
          );
        }
      } else {
        if (showAlert) {
          Alert.alert(
            'Detection Failed',
            'Could not detect civic location from GPS. Please select your municipal corporation or gram panchayat from the list.'
          );
        }
      }
    } catch (err) {
      if (showAlert) {
        Alert.alert('GPS Error', 'Could not detect location. You can select your civic body from the dropdown.');
      }
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Auto-detect GPS civic body once when user switches to Sign Up
  useEffect(() => {
    if (isSignUp && !autoDetectTried.current) {
      autoDetectTried.current = true;
      handleAutoDetectGPS(false);
    }
  }, [isSignUp]);

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
    <View style={[styles.safeArea, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          style={[styles.scrollView, isDark && { backgroundColor: colors.background }]}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}>
          
          {/* Header Brand Logo */}
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/civiccare/01_civiccare_logo_mark.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.brandTitle, isDark && { color: colors.text }]}>CivicCare</Text>
            <Text style={[styles.welcomeHeading, isDark && { color: colors.text }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={[styles.welcomeSubtext, isDark && { color: colors.textSecondary }]}>
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
                <Text style={[styles.fieldLabel, isDark && { color: colors.text }]}>Full Name</Text>
                <View style={[styles.inputWrapper, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <User size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, isDark && { color: colors.text }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={isDark ? colors.textTertiary : CivicCareColors.textTertiary}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>
            )}

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, isDark && { color: colors.text }]}>Email Address</Text>
              <View style={[styles.inputWrapper, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Mail size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, isDark && { color: colors.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={isDark ? colors.textTertiary : CivicCareColors.textTertiary}
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
                <Text style={[styles.fieldLabel, isDark && { color: colors.text }]}>Mobile Number</Text>
                <View style={[styles.inputWrapper, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <Phone size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, isDark && { color: colors.text }]}
                    placeholder="+91 98201 12345"
                    placeholderTextColor={isDark ? colors.textTertiary : CivicCareColors.textTertiary}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>
            )}

            {/* Municipal Corporation / Gram Panchayat (Sign Up Only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <View style={styles.labelWithGpsRow}>
                  <Text style={[styles.fieldLabel, isDark && { color: colors.text }]}>
                    Civic Body / Ward
                  </Text>
                  <TouchableOpacity
                    style={[styles.gpsAutoDetectBtn, isDark && { backgroundColor: '#1E293B', borderColor: colors.border }]}
                    onPress={() => handleAutoDetectGPS(true)}
                    activeOpacity={0.7}
                    disabled={isDetectingGps}>
                    {isDetectingGps ? (
                      <ActivityIndicator size="small" color={CivicCareColors.brandPrimary} />
                    ) : (
                      <>
                        <Compass size={13} color={CivicCareColors.brandPrimary} />
                        <Text style={styles.gpsAutoDetectText}>Auto-Detect GPS</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Dropdown Selector Wrapper */}
                <TouchableOpacity
                  style={[styles.inputWrapper, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  activeOpacity={0.8}
                  onPress={() => setShowWardModal(true)}>
                  <MapPin size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} style={styles.inputIcon} />
                  <Text
                    style={[styles.dropdownSelectedText, isDark && { color: colors.text }]}
                    numberOfLines={1}>
                    {ward || 'Select Municipal Corporation or Gram Panchayat'}
                  </Text>
                  <ChevronDown size={18} color={isDark ? colors.textSecondary : CivicCareColors.textSecondary} />
                </TouchableOpacity>

                {/* Modal for Selecting Municipal Corporation or Gram Panchayat */}
                <Modal
                  visible={showWardModal}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowWardModal(false)}>
                  <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && { backgroundColor: '#18181B', borderColor: colors.border }]}>
                      {/* Modal Header */}
                      <View style={[styles.modalHeader, isDark && { borderBottomColor: colors.border }]}>
                        <View>
                          <Text style={[styles.modalTitle, isDark && { color: colors.text }]}>
                            Select Local Civic Body
                          </Text>
                          <Text style={[styles.modalSubtitle, isDark && { color: colors.textSecondary }]}>
                            Municipal Corporation, Council, or Gram Panchayat
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.modalCloseBtn}
                          onPress={() => setShowWardModal(false)}>
                          <X size={20} color={isDark ? colors.textSecondary : '#64748B'} />
                        </TouchableOpacity>
                      </View>

                      <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                        {/* GPS Auto-Detect Option at Top */}
                        <TouchableOpacity
                          style={[
                            styles.modalItem,
                            styles.gpsModalItem,
                            isDark && { backgroundColor: '#1E293B', borderColor: '#3B82F6' },
                          ]}
                          onPress={() => {
                            handleAutoDetectGPS(true);
                          }}>
                          <View style={styles.modalItemLeft}>
                            <Sparkles size={18} color="#3B82F6" />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.modalItemText, { color: '#3B82F6', fontWeight: '700' }]}>
                                {isDetectingGps ? 'Detecting GPS Coordinates...' : (detectedGps ? `GPS: ${detectedGps.civicBody}` : 'Auto-Detect via GPS')}
                              </Text>
                              <Text style={[styles.modalItemSubtext, isDark && { color: colors.textTertiary }]}>
                                Uses GPS coordinates to find your exact municipality / gram panchayat
                              </Text>
                            </View>
                          </View>
                          {detectedGps && ward === detectedGps.civicBody && (
                            <Check size={18} color="#3B82F6" />
                          )}
                        </TouchableOpacity>

                        <Text style={[styles.modalGroupTitle, isDark && { color: colors.textSecondary }]}>
                          POPULAR MUNICIPAL BODIES
                        </Text>

                        {POPULAR_CIVIC_BODIES.map(item => {
                          const isSelected = ward === item;
                          return (
                            <TouchableOpacity
                              key={item}
                              style={[
                                styles.modalItem,
                                isDark && { borderBottomColor: colors.border },
                                isSelected && (isDark ? { backgroundColor: '#27272A' } : { backgroundColor: '#EFF6FF' }),
                              ]}
                              onPress={() => {
                                wardEditedByUser.current = true;
                                setWard(item);
                                setShowWardModal(false);
                              }}>
                              <View style={styles.modalItemLeft}>
                                <MapPin
                                  size={16}
                                  color={isSelected ? CivicCareColors.brandPrimary : (isDark ? colors.textTertiary : '#94A3B8')}
                                />
                                <Text
                                  style={[
                                    styles.modalItemText,
                                    isDark && { color: colors.text },
                                    isSelected && { color: CivicCareColors.brandPrimary, fontWeight: '700' },
                                  ]}>
                                  {item}
                                </Text>
                              </View>
                              {isSelected && <Check size={18} color={CivicCareColors.brandPrimary} />}
                            </TouchableOpacity>
                          );
                        })}

                        {/* Custom Ward / Neighborhood Input */}
                        <View style={{ paddingVertical: 14 }}>
                          <Text style={[styles.modalGroupTitle, isDark && { color: colors.textSecondary }]}>
                            OR TYPE CUSTOM WARD / GRAM PANCHAYAT:
                          </Text>
                          <TextInput
                            style={[
                              styles.modalCustomInput,
                              isDark && { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
                            ]}
                            placeholder="e.g. Wagholi Gram Panchayat, Kothrud Ward"
                            placeholderTextColor={isDark ? colors.textTertiary : '#94A3B8'}
                            value={ward}
                            onChangeText={text => {
                              wardEditedByUser.current = true;
                              setWard(text);
                            }}
                          />
                          <TouchableOpacity
                            style={styles.modalConfirmBtn}
                            onPress={() => setShowWardModal(false)}>
                            <Text style={styles.modalConfirmBtnText}>Save Selection</Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              </View>
            )}

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, isDark && { color: colors.text }]}>Password</Text>
              <View style={[styles.inputWrapper, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Lock size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, isDark && { color: colors.text }]}
                  placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  placeholderTextColor={isDark ? colors.textTertiary : CivicCareColors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} />
                  ) : (
                    <Eye size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPasswordRow}
                onPress={() => Alert.alert('Password Reset', 'Password reset instructions have been sent to your registered email.')}>
                <Text style={[styles.forgotPasswordText, isDark && { color: colors.tint }]}>Forgot Password?</Text>
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
              <Text style={[styles.togglePrompt, isDark && { color: colors.textSecondary }]}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={[styles.toggleActionText, isDark && { color: colors.tint }]}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  labelWithGpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gpsAutoDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  gpsAutoDetectText: {
    fontSize: 11,
    fontWeight: '700',
    color: CivicCareColors.brandPrimary,
  },
  dropdownSelectedText: {
    flex: 1,
    fontSize: 14,
    color: CivicCareColors.textMain,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalList: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
  },
  gpsModalItem: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    marginBottom: 10,
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalItemSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  modalCustomInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalConfirmBtn: {
    backgroundColor: CivicCareColors.brandPrimary,
    height: 46,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
