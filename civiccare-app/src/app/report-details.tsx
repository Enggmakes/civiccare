import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useReports } from '@/services/reportsStore';
import { useAppTheme } from '@/services/themeContext';
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  ShieldAlert,
  Building,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ReportDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { getReportById } = useReports();
  const { isDark, colors } = useAppTheme();

  const report = getReportById(params.id || 'rep_1026') || getReportById('rep_1026');

  if (!report) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, isDark && { color: colors.text }]}>Report not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ color: colors.tint }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `CivicCare Report ${report.ticket_number}: ${report.title} located at ${report.location_address}. Status: ${report.status}`,
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Navigation */}
      <View style={[styles.navBar, isDark && { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.navIconButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <ArrowLeft size={22} color={isDark ? colors.text : CivicCareColors.textMain} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, isDark && { color: colors.text }]}>Report Details</Text>

        <TouchableOpacity
          style={styles.navIconButton}
          activeOpacity={0.7}
          onPress={handleShare}>
          <Share2 size={20} color={isDark ? colors.text : CivicCareColors.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scrollView, isDark && { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Large Photo Header with Floating Status Pill */}
        <View style={styles.heroImageContainer}>
          <Image source={{ uri: report.image_url }} style={styles.heroImage} />
          
          <View
            style={[
              styles.floatingStatusPill,
              report.status === 'Resolved'
                ? styles.statusResolved
                : styles.statusInProgress,
            ]}>
            <Text
              style={[
                styles.floatingStatusText,
                report.status === 'Resolved'
                  ? styles.statusResolvedText
                  : styles.statusInProgressText,
              ]}>
              {report.status}
            </Text>
          </View>
        </View>

        {/* Title & Ticket Number */}
        <View style={styles.titleSection}>
          <Text style={[styles.issueTitle, isDark && { color: colors.text }]}>{report.title}</Text>
          <Text style={[styles.ticketNumberText, isDark && { color: colors.tint }]}>{report.ticket_number}</Text>
        </View>

        {/* Info Badges Row */}
        <View style={styles.badgesRow}>
          <View style={[styles.badgeItem, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <MapPin size={14} color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
            <Text style={[styles.badgeText, isDark && { color: colors.textSecondary }]} numberOfLines={1}>
              {report.location_address.split(',')[0]}
            </Text>
          </View>
          <View style={[styles.badgeItem, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FECACA' }]}>
            <ShieldAlert size={14} color="#DC2626" />
            <Text style={[styles.badgeText, { color: '#EF4444', fontWeight: '700' }]}>
              {report.severity} Severity
            </Text>
          </View>
        </View>

        {/* Timeline Header */}
        <View style={styles.timelineHeaderRow}>
          <Text style={[styles.timelineSectionTitle, isDark && { color: colors.text }]}>Progress Timeline</Text>
          <View style={[styles.liveIndicator, isDark && { backgroundColor: 'rgba(22, 163, 74, 0.15)' }]}>
            <View style={styles.liveDot} />
            <Text style={[styles.liveText, isDark && { color: '#4ADE80' }]}>Live Tracking</Text>
          </View>
        </View>

        {/* Vertical Chronological Timeline (Matches Screen 7 in image.png) */}
        <View style={[styles.timelineContainer, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          {report.timeline.map((step, idx) => {
            const isLast = idx === report.timeline.length - 1;
            const isCompleted = step.is_completed;
            const isActive = step.is_active;

            return (
              <View key={step.step} style={styles.timelineRow}>
                {/* Left Indicator & Connecting Line */}
                <View style={styles.indicatorColumn}>
                  <View
                    style={[
                      styles.indicatorCircle,
                      isCompleted && styles.indicatorCompleted,
                      isActive && styles.indicatorActivePulse,
                      !isCompleted && !isActive && styles.indicatorPending,
                      !isCompleted && !isActive && isDark && { backgroundColor: colors.card, borderColor: colors.border },
                    ]}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} color="#FFFFFF" />
                    ) : isActive ? (
                      <View style={styles.activePulseInner} />
                    ) : (
                      <Circle size={14} color={isDark ? colors.border : '#CBD5E1'} />
                    )}
                  </View>

                  {!isLast && (
                    <View
                      style={[
                        styles.connectingLine,
                        isCompleted ? styles.lineCompleted : styles.linePending,
                        !isCompleted && isDark && { backgroundColor: colors.border },
                      ]}
                    />
                  )}
                </View>

                {/* Right Milestone Content */}
                <View style={styles.milestoneContent}>
                  <View style={styles.milestoneTitleRow}>
                    <Text
                      style={[
                        styles.milestoneTitle,
                        isDark && { color: colors.text },
                        isActive && { color: colors.tint },
                      ]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.milestoneTime, isDark && { color: colors.textTertiary }]}>{step.timestamp}</Text>
                  </View>

                  <Text style={[styles.milestoneDescription, isDark && { color: colors.textSecondary }]}>{step.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Description Section */}
        <View style={[styles.detailsSection, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Text style={[styles.detailsHeader, isDark && { color: colors.text }]}>Description</Text>
          <Text style={[styles.detailsBody, isDark && { color: colors.textSecondary }]}>{report.description}</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: CivicCareColors.border,
  },
  navIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: CivicCareColors.textMain,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: Spacing.eight,
  },
  heroImageContainer: {
    position: 'relative',
    width: '100%',
    height: 230,
    backgroundColor: '#E2E8F0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingStatusPill: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  floatingStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusInProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusInProgressText: {
    color: '#D97706',
  },
  statusResolved: {
    backgroundColor: '#DCFCE7',
  },
  statusResolvedText: {
    color: '#16A34A',
  },
  titleSection: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.one,
  },
  issueTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: CivicCareColors.textMain,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  ticketNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: CivicCareColors.brandPrimary,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CivicCareColors.brandSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    color: CivicCareColors.brandPrimary,
    fontWeight: '600',
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  timelineSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CivicCareColors.textMain,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  timelineContainer: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    minHeight: 64,
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 28,
  },
  indicatorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  indicatorCompleted: {
    backgroundColor: '#16A34A',
  },
  indicatorActivePulse: {
    backgroundColor: CivicCareColors.brandPrimary,
  },
  activePulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  indicatorPending: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  connectingLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: '#16A34A',
  },
  linePending: {
    backgroundColor: '#E2E8F0',
  },
  milestoneContent: {
    flex: 1,
    paddingBottom: Spacing.three,
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginBottom: 4,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: CivicCareColors.textMain,
    lineHeight: 19,
  },
  milestoneTime: {
    fontSize: 11,
    fontWeight: '600',
    color: CivicCareColors.textTertiary,
    flexShrink: 0,
    textAlign: 'right',
    paddingTop: 1,
  },
  milestoneDescription: {
    fontSize: 13,
    color: CivicCareColors.textSecondary,
    lineHeight: 18,
  },
  detailsSection: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  detailsHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: CivicCareColors.textMain,
    marginBottom: 6,
  },
  detailsBody: {
    fontSize: 14,
    color: CivicCareColors.textSecondary,
    lineHeight: 21,
    backgroundColor: CivicCareColors.bgSubtle,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  notFoundText: {
    fontSize: 16,
    color: CivicCareColors.textSecondary,
  },
  backButton: {
    padding: Spacing.two,
  },
});
