import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows, getReportStatusStyles } from '@/constants/theme';
import { useReports } from '@/services/reportsStore';
import { useUser, useAuth } from '@/services/auth';
import { useAppTheme } from '@/services/themeContext';
import {
  Clock,
  Navigation,
  ChevronRight,
  Filter,
  Plus,
} from 'lucide-react-native';

export default function MyReportsScreen() {
  const router = useRouter();
  const { getUserReports, refreshReports, isRefreshing } = useReports();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { isDark, colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Resolved'>('All');

  // Trigger data sync whenever user logs in, logs out, or switches accounts
  useEffect(() => {
    refreshReports();
  }, [isSignedIn, user?.id, user?.fullName]);

  const isGuest = !isSignedIn || !user || user.id === 'guest_citizen';
  const currentUserId = isGuest ? 'guest_citizen' : user.id;
  const userContext = user ? { fullName: user.fullName, email: user.primaryEmailAddress?.emailAddress } : null;
  const myReports = getUserReports(currentUserId, userContext);

  const isResolvedOrClosed = (status: string) => status === 'Resolved' || status === 'Closed';

  const filtered = myReports.filter(r => {
    if (activeTab === 'Active') return !isResolvedOrClosed(r.status);
    if (activeTab === 'Resolved') return isResolvedOrClosed(r.status);
    return true;
  });

  const handleNewReportPress = () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to submit and track civic reports.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }
    router.push('/report-issue');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.headerBar, isDark && { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, isDark && { color: colors.text }]}>My Reports</Text>
        <TouchableOpacity
          style={styles.newReportButton}
          activeOpacity={0.8}
          onPress={handleNewReportPress}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.newReportButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Filter Control */}
      <View style={[styles.segmentedContainer, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        {(['All', 'Active', 'Resolved'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.segmentTab,
              activeTab === tab && styles.segmentTabActive,
              activeTab === tab && isDark && { backgroundColor: colors.card },
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.segmentText,
                isDark && { color: colors.textSecondary },
                activeTab === tab && styles.segmentTextActive,
                activeTab === tab && isDark && { color: colors.text },
              ]}>
              {tab} (
              {
                myReports.filter(r =>
                  tab === 'Active'
                    ? !isResolvedOrClosed(r.status)
                    : tab === 'Resolved'
                    ? isResolvedOrClosed(r.status)
                    : true
                ).length
              }
              )
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reports List */}
      <ScrollView
        style={[styles.scrollView, isDark && { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshReports}
            tintColor={CivicCareColors.brandPrimary}
            colors={[CivicCareColors.brandPrimary]}
          />
        }>
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, isDark && { color: colors.text }]}>
              {isGuest ? 'Sign In to View Reports' : 'No reports found'}
            </Text>
            <Text style={[styles.emptySubtext, isDark && { color: colors.textSecondary }]}>
              {isGuest
                ? 'Please sign in with your citizen account to submit, track, and manage civic issues.'
                : `You have no ${activeTab.toLowerCase()} reports filed under your account.`}
            </Text>
            {isGuest && (
              <TouchableOpacity
                style={styles.signInGateBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/auth')}>
                <Text style={styles.signInGateBtnText}>Sign In to CivicCare</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map(report => (
            <TouchableOpacity
              key={report.id}
              style={[styles.card, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/report-details', params: { id: report.id } })}>
              <Image source={{ uri: report.image_url }} style={styles.thumbnail} />

              <View style={styles.infoCol}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, isDark && { color: colors.text }]} numberOfLines={1}>
                    {report.title}
                  </Text>
                  {(() => {
                    const badgeStyle = getReportStatusStyles(report.status, isDark);
                    return (
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: badgeStyle.bg,
                            borderColor: badgeStyle.border,
                            borderWidth: 1,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusText,
                            { color: badgeStyle.text },
                          ]}>
                          {report.status}
                        </Text>
                      </View>
                    );
                  })()}
                </View>

                <Text style={[styles.ticketNum, isDark && { color: colors.tint }]}>{report.ticket_number}</Text>
                <Text style={[styles.address, isDark && { color: colors.textSecondary }]} numberOfLines={1}>
                  {report.location_address}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock size={12} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} />
                    <Text style={[styles.metaText, isDark && { color: colors.textTertiary }]}>{report.time_ago}</Text>
                  </View>
                  <Text style={[styles.metaDot, isDark && { color: colors.border }]}>•</Text>
                  <View style={styles.metaItem}>
                    <Navigation size={12} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} />
                    <Text style={[styles.metaText, isDark && { color: colors.textTertiary }]}>{report.distance_km}</Text>
                  </View>
                </View>
              </View>

              <ChevronRight size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} />
            </TouchableOpacity>
          ))
        )}

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
  newReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CivicCareColors.brandPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  newReportButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: CivicCareColors.bgSubtle,
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.two,
    borderRadius: BorderRadius.lg,
    padding: 3,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  segmentText: {
    fontSize: 13,
    color: CivicCareColors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: CivicCareColors.brandPrimary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    ...Shadows.sm,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E2E8F0',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: CivicCareColors.textMain,
    flex: 1,
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bgPending: {
    backgroundColor: CivicCareColors.warningBg,
  },
  textPending: {
    color: CivicCareColors.warning,
    fontSize: 11,
    fontWeight: '700',
  },
  bgResolved: {
    backgroundColor: CivicCareColors.successBg,
  },
  textResolved: {
    color: CivicCareColors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  ticketNum: {
    fontSize: 12,
    fontWeight: '700',
    color: CivicCareColors.brandPrimary,
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: CivicCareColors.textSecondary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: CivicCareColors.textTertiary,
  },
  metaDot: {
    fontSize: 11,
    color: CivicCareColors.textTertiary,
    marginHorizontal: 2,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CivicCareColors.textMain,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: CivicCareColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  signInGateBtn: {
    marginTop: Spacing.four,
    backgroundColor: CivicCareColors.brandPrimary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  signInGateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
