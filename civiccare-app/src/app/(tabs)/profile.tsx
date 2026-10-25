import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useReports } from '@/services/reportsStore';
import { useUser, useAuth } from '@/services/clerk';
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
} from 'lucide-react-native';

const EMERGENCY_HELPLINES = [
  { name: 'BMC 24x7 Civic Disaster & Grievance', number: '1916', desc: 'Potholes, flooding, open manholes' },
  { name: 'Ambulance & Medical Emergency', number: '108', desc: 'Emergency medical dispatch' },
  { name: 'Police Control Room', number: '100', desc: 'Law enforcement & public safety' },
  { name: 'Fire Control Room', number: '101', desc: 'Fire hazard & rescue services' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn, signOut, signIn } = useAuth();
  const { reports } = useReports();

  // Dynamic Metrics from real reports
  const totalSubmitted = reports.length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress' || r.status === 'Submitted' || r.status === 'AI Classification' || r.status === 'Sent to Department').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  const [citizenName, setCitizenName] = useState(user?.fullName || 'Rajesh Sharma');
  const [citizenWard, setCitizenWard] = useState('Ward K-West (Andheri West)');
  const [citizenPhone, setCitizenPhone] = useState(user?.primaryPhoneNumber?.phoneNumber || '+91 98201 12345');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

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
      router.replace('/auth');
    } else {
      router.push('/auth');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}>
        
        {/* User Profile Card */}
        <View style={styles.profileCard}>
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
              <Text style={styles.profileName}>{citizenName}</Text>
              <View style={styles.wardBadge}>
                <MapPin size={12} color={CivicCareColors.brandPrimary} />
                <Text style={styles.profileRole}>{citizenWard}</Text>
              </View>
            </View>
          </View>

          <View style={styles.contactDivider} />

          <View style={styles.contactInfoRow}>
            <Phone size={14} color={CivicCareColors.textSecondary} />
            <Text style={styles.contactText}>{citizenPhone}</Text>
          </View>

          <View style={styles.contactInfoRow}>
            <Mail size={14} color={CivicCareColors.textSecondary} />
            <Text style={styles.contactText}>
              {user?.primaryEmailAddress?.emailAddress || 'citizen.mumbai@gov.in'}
            </Text>
          </View>
        </View>

        {/* Dynamic Activity Metric Counters */}
        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/reports')}>
            <Text style={styles.metricNumber}>{totalSubmitted}</Text>
            <Text style={styles.metricLabel}>Total Filed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/reports')}>
            <Text style={[styles.metricNumber, { color: '#D97706' }]}>{inProgressCount}</Text>
            <Text style={styles.metricLabel}>Active / In Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/reports')}>
            <Text style={[styles.metricNumber, { color: '#16A34A' }]}>{resolvedCount}</Text>
            <Text style={styles.metricLabel}>Resolved</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Civic Helplines */}
        <Text style={styles.sectionHeading}>Emergency Civic Helplines</Text>
        <View style={styles.settingsGroup}>
          {EMERGENCY_HELPLINES.map((hl, idx) => (
            <TouchableOpacity
              key={hl.number}
              style={[
                styles.settingsRow,
                idx === EMERGENCY_HELPLINES.length - 1 && { borderBottomWidth: 0 },
              ]}
              activeOpacity={0.7}
              onPress={() => handleCallHelpline(hl.number, hl.name)}>
              <View style={styles.rowIconText}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <PhoneCall size={18} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingsLabel}>{hl.name}</Text>
                  <Text style={styles.helplineDesc}>{hl.desc}</Text>
                </View>
              </View>
              <View style={styles.callBadge}>
                <Text style={styles.callBadgeText}>{hl.number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Citizen Notification Preferences */}
        <Text style={styles.sectionHeading}>Notification Preferences</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingsRow}>
            <View style={styles.rowIconText}>
              <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                <Bell size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingsLabel}>Push Notifications</Text>
                <Text style={styles.helplineDesc}>Live updates when city crew dispatches</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
              thumbColor={pushEnabled ? CivicCareColors.brandPrimary : '#94A3B8'}
            />
          </View>

          <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
            <View style={styles.rowIconText}>
              <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                <Phone size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingsLabel}>SMS & WhatsApp Alerts</Text>
                <Text style={styles.helplineDesc}>Receive ticket progress on mobile</Text>
              </View>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
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
            ]}
            activeOpacity={0.8}
            onPress={handleSignOutToggle}>
            <LogOut size={18} color={isSignedIn ? '#DC2626' : '#FFFFFF'} />
            <Text
              style={[
                styles.authButtonText,
                isSignedIn ? { color: '#DC2626' } : { color: '#FFFFFF' },
              ]}>
              {isSignedIn ? 'Sign Out of Account' : 'Sign In with Phone'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  },
  profileRole: {
    fontSize: 12,
    color: CivicCareColors.brandPrimary,
    fontWeight: '600',
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
