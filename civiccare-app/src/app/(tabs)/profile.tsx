import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Linking,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useReports } from '@/services/reportsStore';
import { useUser, useAuth } from '@/services/clerk';
import { useAppTheme } from '@/services/themeContext';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import {
  User,
  Phone,
  Mail,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building,
  PhoneCall,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Sun,
  Moon,
  Edit3,
  X,
} from 'lucide-react-native';
import { detectCivicBodyFromGPS } from '@/services/civicLocation';

const getCivicHelpline = (ward: string) => {
  const lower = (ward || '').toLowerCase();
  if (lower.includes('pune') || lower.includes('pmc')) {
    return { name: 'PMC 24x7 Citizen Care Helpline', number: '18001030222', desc: 'Potholes, sanitation & water supply' };
  }
  if (lower.includes('pimpri') || lower.includes('pcmc')) {
    return { name: 'PCMC Sarathi Grievance Center', number: '02067333333', desc: 'Drainage, waste & road repairs' };
  }
  if (lower.includes('navi mumbai') || lower.includes('nmmc')) {
    return { name: 'NMMC Citizen Grievance Cell', number: '1800222309', desc: 'Municipal complaints & disaster dispatch' };
  }
  if (lower.includes('thane') || lower.includes('tmc')) {
    return { name: 'TMC Disaster & Grievance Control', number: '1800222391', desc: 'Civic hazards & municipal aid' };
  }
  if (lower.includes('mumbai') || lower.includes('bmc') || lower.includes('andheri')) {
    return { name: 'BMC 24x7 Civic Disaster & Grievance', number: '1916', desc: 'Potholes, flooding, open manholes' };
  }
  if (lower.includes('ahilyanagar') || lower.includes('ahmednagar')) {
    return { name: 'Ahilyanagar Municipal Corporation', number: '18002330241', desc: 'Civic grievances & 24x7 control room' };
  }
  if (lower.includes('junnar')) {
    return { name: 'Junnar Municipal Council Control', number: '02132222035', desc: 'Taluka municipal & civic helpline' };
  }
  if (lower.includes('parner')) {
    return { name: 'Parner Nagar Panchayat Control', number: '02488221235', desc: 'Taluka civic & emergency control' };
  }
  if (lower.includes('palghar')) {
    return { name: 'Palghar Municipal Council Control', number: '02525252322', desc: 'Civic grievances & local council' };
  }
  if (lower.includes('panchayat') || lower.includes('gram')) {
    return { name: 'District Panchayat & Rural Disaster Control', number: '1077', desc: 'Zilla Parishad & Gram Panchayat emergency' };
  }
  return { name: 'State Civic Disaster Grievance (112)', number: '112', desc: 'All-in-one emergency & public hazards' };
};

const UNIVERSAL_HELPLINES = [
  { name: 'Ambulance & Medical Emergency', number: '108', desc: 'Emergency medical dispatch' },
  { name: 'Police Control Room', number: '100', desc: 'Law enforcement & public safety' },
  { name: 'Fire Control Room', number: '101', desc: 'Fire hazard & rescue services' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn, signOut, signIn, updateWard } = useAuth();
  const { getUserReports } = useReports();
  const { isDark, toggleTheme, colors } = useAppTheme();

  const isGuest = !isSignedIn || !user || user.id === 'guest_citizen';
  const currentUserId = isGuest ? 'guest_citizen' : user.id;
  const userContext = user ? { fullName: user.fullName, email: user.primaryEmailAddress?.emailAddress } : null;
  const myReports = getUserReports(currentUserId, userContext);

  // Dynamic Metrics isolated specifically for this logged-in citizen
  const totalSubmitted = myReports.length;
  const inProgressCount = myReports.filter(r => r.status === 'In Progress' || r.status === 'Submitted' || r.status === 'AI Classification' || r.status === 'Sent to Department').length;
  const resolvedCount = myReports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;

  const citizenName = user?.fullName || (isSignedIn ? 'Citizen' : 'Guest Citizen');
  const citizenWard = user?.ward || 'Palghar, Maharashtra';
  const citizenPhone = user?.primaryPhoneNumber?.phoneNumber || (isSignedIn ? 'No phone linked' : 'Tap Sign In to link');
  const citizenEmail = user?.primaryEmailAddress?.emailAddress || (isSignedIn ? 'No email linked' : 'Sign in to sync reports');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  // Edit Ward State (Option 2: Home & Profile Isolated)
  const [showWardModal, setShowWardModal] = useState(false);
  const [editingWard, setEditingWard] = useState('');
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [isSavingWard, setIsSavingWard] = useState(false);

  // Dynamic Supabase Cloud Helpline (0 KB bundle size)
  const [dbHelpline, setDbHelpline] = useState<{ name: string; number: string; desc: string } | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchDbHelpline = async () => {
      try {
        const cityKeyword = citizenWard.split(/[,( -]/)[0].trim();
        if (!cityKeyword) return;
        // 1. Check Supabase Cache (Instant 5ms)
        const { data, error } = await supabase
          .from('civic_helplines')
          .select('name, number, desc_text')
          .or(`city.ilike.%${cityKeyword}%,district.ilike.%${cityKeyword}%`)
          .limit(1)
          .maybeSingle();

        if (!error && data && !isCancelled) {
          setDbHelpline({
            name: data.name,
            number: data.number,
            desc: data.desc_text,
          });
          return;
        }

        // 2. If not in Supabase, dynamically query AI Backend Auto-Discovery
        const aiBackendBase = Platform.OS === 'web' ? 'http://localhost:8000' : 'http://192.168.7.9:8000';
        const aiRes = await fetch(`${aiBackendBase}/civic-helpline?city=${encodeURIComponent(cityKeyword)}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData?.name && aiData?.number && !isCancelled) {
            setDbHelpline({
              name: aiData.name,
              number: aiData.number,
              desc: aiData.desc,
            });
          }
        }
      } catch {
        // Fallback gracefully to offline helper
      }
    };
    fetchDbHelpline();
    return () => {
      isCancelled = true;
    };
  }, [citizenWard]);

  const activeHelplines = [dbHelpline || getCivicHelpline(citizenWard), ...UNIVERSAL_HELPLINES];

  const handleOpenWardModal = () => {
    setEditingWard(citizenWard);
    setShowWardModal(true);
  };

  const handleGpsDetectForProfile = async () => {
    setIsGpsLocating(true);
    try {
      const res = await detectCivicBodyFromGPS();
      if (res.status === 'ok') {
        setEditingWard(res.location.civicBody);
      } else if (res.status === 'denied') {
        Alert.alert('Permission Denied', 'Please grant location permission to detect your current ward.');
      } else {
        Alert.alert('Detection Error', 'Could not detect your current GPS location.');
      }
    } catch {
      Alert.alert('GPS Error', 'Could not detect current location.');
    } finally {
      setIsGpsLocating(false);
    }
  };

  const handleSaveWard = async () => {
    if (!editingWard.trim()) {
      Alert.alert('Required', 'Please enter your municipal corporation, council, or gram panchayat.');
      return;
    }
    setIsSavingWard(true);
    try {
      await updateWard(editingWard.trim());
      setShowWardModal(false);
      Alert.alert(
        'Profile Ward Updated',
        `Your permanent residential ward is now set to:\n${editingWard.trim()}`
      );
    } finally {
      setIsSavingWard(false);
    }
  };

  const handleCallHelpline = (number: string, name: string) => {
    if (Platform.OS === 'web') {
      Alert.alert(
        `Dial Helpline: ${number}`,
        `${name}\n\nOn a mobile phone, this initiates a direct call to ${number}.`
      );
    } else {
      Linking.openURL(`tel:${number}`).catch(() => {
        Alert.alert('Call Failed', `Could not initiate call to ${number}`);
      });
    }
  };

  const handleSignOutToggle = async () => {
    if (isSignedIn) {
      await signOut();
      Alert.alert('Signed Out', 'You have been signed out of your CivicCare account.');
      router.replace('/welcome');
    } else {
      router.push('/welcome');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.headerBar, isDark && { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, isDark && { color: colors.text }]}>Profile & Settings</Text>
      </View>

      <ScrollView
        style={[styles.scrollView, isDark && { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}>
        
        {/* User Profile Card */}
        <View style={[styles.profileCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={styles.avatarRow}>
            <Image
              source={
                user?.imageUrl && !user.imageUrl.includes('unsplash')
                  ? { uri: user.imageUrl }
                  : require('@/assets/images/default-avatar.png')
              }
              style={styles.profileAvatar}
            />
            <View style={styles.profileNameCol}>
              <Text style={[styles.profileName, isDark && { color: colors.text }]}>{citizenName}</Text>
              <TouchableOpacity
                style={[styles.wardBadge, isDark && { backgroundColor: '#1E293B', borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={handleOpenWardModal}>
                <MapPin size={12} color={CivicCareColors.brandPrimary} />
                <Text style={[styles.profileRole, isDark && { color: colors.textSecondary }]} numberOfLines={1}>
                  {citizenWard}
                </Text>
                <Edit3 size={11} color={CivicCareColors.brandPrimary} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.contactDivider, isDark && { backgroundColor: colors.border }]} />

          <View style={styles.contactInfoRow}>
            <Phone size={14} color={isDark ? colors.textSecondary : CivicCareColors.textSecondary} />
            <Text style={[styles.contactText, isDark && { color: colors.textSecondary }]}>{citizenPhone}</Text>
          </View>

          <View style={styles.contactInfoRow}>
            <Mail size={14} color={isDark ? colors.textSecondary : CivicCareColors.textSecondary} />
            <Text style={[styles.contactText, isDark && { color: colors.textSecondary }]}>
              {citizenEmail}
            </Text>
          </View>
        </View>

        {/* Dynamic Activity Metric Counters */}
        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={[styles.metricCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/reports')}>
            <Text style={styles.metricNumber}>{totalSubmitted}</Text>
            <Text style={[styles.metricLabel, isDark && { color: colors.textSecondary }]}>Total Filed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/reports')}>
            <Text style={[styles.metricNumber, { color: '#F59E0B' }]}>{inProgressCount}</Text>
            <Text style={[styles.metricLabel, isDark && { color: colors.textSecondary }]}>Active / In Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/reports')}>
            <Text style={[styles.metricNumber, { color: '#10B981' }]}>{resolvedCount}</Text>
            <Text style={[styles.metricLabel, isDark && { color: colors.textSecondary }]}>Resolved</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance & Theme Toggle (Custom Animated Day/Night Switch) */}
        <Text style={[styles.sectionHeading, isDark && { color: colors.textSecondary }]}>Appearance & Theme</Text>
        <View style={[styles.settingsGroup, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
            <View style={styles.rowIconText}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#262626' : '#FEF3C7' }]}>
                {isDark ? (
                  <Moon size={18} color="#93C5FD" />
                ) : (
                  <Sun size={18} color="#D97706" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsLabel, isDark && { color: colors.text }]}>
                  {isDark ? 'Dark Theme' : 'Light Theme'}
                </Text>
                <Text style={[styles.helplineDesc, isDark && { color: colors.textSecondary }]}>
                  {isDark ? 'Night sky mode active' : 'Day sky mode active'}
                </Text>
              </View>
            </View>
            <ThemeSwitch isDark={isDark} onToggle={toggleTheme} />
          </View>
        </View>

        {/* Emergency Civic Helplines */}
        <Text style={[styles.sectionHeading, isDark && { color: colors.textSecondary }]}>Emergency Civic Helplines</Text>
        <View style={[styles.settingsGroup, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          {activeHelplines.map((hl, idx) => (
            <TouchableOpacity
              key={`${hl.name}-${hl.number}`}
              style={[
                styles.settingsRow,
                idx === activeHelplines.length - 1 && { borderBottomWidth: 0 },
                isDark && { borderBottomColor: colors.border },
              ]}
              activeOpacity={0.7}
              onPress={() => handleCallHelpline(hl.number, hl.name)}>
              <View style={styles.rowIconText}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}>
                  <PhoneCall size={18} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingsLabel, isDark && { color: colors.text }]}>{hl.name}</Text>
                  <Text style={[styles.helplineDesc, isDark && { color: colors.textSecondary }]}>{hl.desc}</Text>
                </View>
              </View>
              <View style={[styles.callBadge, isDark && { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
                <Text style={styles.callBadgeText}>{hl.number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Citizen Notification Preferences */}
        <Text style={[styles.sectionHeading, isDark && { color: colors.textSecondary }]}>Notification Preferences</Text>
        <View style={[styles.settingsGroup, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={[styles.settingsRow, isDark && { borderBottomColor: colors.border }]}>
            <View style={styles.rowIconText}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#DCFCE7' }]}>
                <Bell size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsLabel, isDark && { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.helplineDesc, isDark && { color: colors.textSecondary }]}>Live updates when city crew dispatches</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: isDark ? '#343434' : '#E2E8F0', true: '#93C5FD' }}
              thumbColor={pushEnabled ? CivicCareColors.brandPrimary : '#94A3B8'}
            />
          </View>

          <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
            <View style={styles.rowIconText}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(2, 132, 199, 0.15)' : '#E0F2FE' }]}>
                <Phone size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingsLabel, isDark && { color: colors.text }]}>SMS & WhatsApp Alerts</Text>
                <Text style={[styles.helplineDesc, isDark && { color: colors.textSecondary }]}>Receive ticket progress on mobile</Text>
              </View>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: isDark ? '#343434' : '#E2E8F0', true: '#93C5FD' }}
              thumbColor={smsEnabled ? CivicCareColors.brandPrimary : '#94A3B8'}
            />
          </View>
        </View>

        {/* Authentication & Account Actions */}
        <View style={styles.authActionSection}>
          <TouchableOpacity
            style={[
              styles.authButton,
              isSignedIn ? styles.authButtonSignOut : styles.authButtonSignIn,
              isDark && isSignedIn && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.35)' },
            ]}
            activeOpacity={0.8}
            onPress={handleSignOutToggle}>
            <LogOut size={18} color={isSignedIn ? '#EF4444' : '#FFFFFF'} />
            <Text
              style={[
                styles.authButtonText,
                isSignedIn ? { color: '#EF4444' } : { color: '#FFFFFF' },
              ]}>
              {isSignedIn ? 'Sign Out of Account' : 'Sign In with Phone'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Edit Permanent Profile Location Modal */}
      <Modal
        visible={showWardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWardModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && { backgroundColor: '#18181B', borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, isDark && { color: colors.text }]}>
                  Home Ward & Municipality
                </Text>
                <Text style={[styles.modalSubtitle, isDark && { color: colors.textSecondary }]}>
                  Permanent residence for official civic council services
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowWardModal(false)}>
                <X size={20} color={isDark ? colors.textSecondary : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Auto-Detect Live GPS button */}
            <TouchableOpacity
              style={[
                styles.modalGpsBtn,
                isDark && { backgroundColor: '#1E293B', borderColor: '#3B82F6' },
              ]}
              onPress={handleGpsDetectForProfile}
              disabled={isGpsLocating}>
              {isGpsLocating ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <MapPin size={16} color="#3B82F6" />
              )}
              <Text style={styles.modalGpsBtnText}>
                {isGpsLocating ? 'Detecting Current Location...' : 'Auto-Detect via Live GPS'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.modalInputLabel, isDark && { color: colors.textSecondary }]}>
              OR TYPE CUSTOM CITY / WARD / GRAM PANCHAYAT:
            </Text>

            <View style={[styles.modalInputWrapper, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <MapPin size={16} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} />
              <TextInput
                style={[styles.modalInput, isDark && { color: colors.text }]}
                value={editingWard}
                onChangeText={setEditingWard}
                placeholder="e.g. Pune Municipal Corporation (PMC)"
                placeholderTextColor={isDark ? colors.textTertiary : '#94A3B8'}
              />
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, isDark && { borderColor: colors.border }]}
                onPress={() => setShowWardModal(false)}>
                <Text style={[styles.modalCancelBtnText, isDark && { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveWard}
                disabled={isSavingWard}>
                {isSavingWard ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Save Permanent Ward</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: CivicCareColors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: CivicCareColors.textMain,
  },
  authBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  authBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: Spacing.four,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    marginBottom: Spacing.four,
    ...Shadows.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: CivicCareColors.brandPrimary,
  },
  profileNameCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: CivicCareColors.textMain,
    marginBottom: 4,
  },
  wardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 2,
  },
  profileRole: {
    fontSize: 12,
    color: CivicCareColors.textMain,
    fontWeight: '600',
    maxWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    marginBottom: Spacing.three,
  },
  modalGpsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: Spacing.four,
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 2,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSaveBtn: {
    backgroundColor: CivicCareColors.brandPrimary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: Spacing.two,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  contactText: {
    fontSize: 13,
    color: CivicCareColors.textSecondary,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  metricCard: {
    flex: 1,
    backgroundColor: CivicCareColors.bgSubtle,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CivicCareColors.border,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: CivicCareColors.brandPrimary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: CivicCareColors.textSecondary,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: CivicCareColors.textSecondary,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    marginBottom: Spacing.four,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CivicCareColors.textMain,
  },
  helplineDesc: {
    fontSize: 11,
    color: CivicCareColors.textTertiary,
    marginTop: 2,
  },
  callBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  callBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  authActionSection: {
    marginTop: Spacing.two,
  },
  authButton: {
    height: 48,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  authButtonSignOut: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  authButtonSignIn: {
    backgroundColor: CivicCareColors.brandPrimary,
  },
  authButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
