import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/services/themeContext';
import {
  Check,
  Copy,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  CheckCircle,
} from 'lucide-react-native';

export default function ReportSubmittedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const params = useLocalSearchParams<{
    reportId?: string;
    ticketNumber?: string;
    category?: string;
    severity?: string;
    address?: string;
  }>();

  const [copied, setCopied] = useState(false);

  const ticketNumber = params.ticketNumber || '#CC20241026';
  const category = params.category || 'Pothole';
  const severity = params.severity || 'High';
  const address = params.address || 'MG Road, Andheri West, Mumbai';
  const reportId = params.reportId || 'rep_1026';

  const handleCopyId = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackReport = () => {
    router.replace({
      pathname: '/report-details',
      params: { id: reportId },
    });
  };

  const handleSubmitAnother = () => {
    router.replace('/report-issue');
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom + 15 }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        {/* Top Spacer */}
        <View style={{ height: 20 }} />

        {/* Success Illustration & Heading */}
        <View style={styles.headerSection}>
          <View style={styles.successBadgeCircle}>
            <Check size={40} color="#FFFFFF" strokeWidth={3.5} />
          </View>
          <Text style={[styles.headline, isDark && { color: colors.text }]}>Report Submitted!</Text>
          <Text style={[styles.subtext, isDark && { color: colors.textSecondary }]}>
            Your issue has been successfully reported and is being processed by AI.
          </Text>
        </View>

        {/* Structured Summary Card (Matches Screen 6 in image.png) */}
        <View style={[styles.summaryCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          {/* Row 1: Report ID */}
          <View style={[styles.summaryRow, isDark && { borderBottomColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.iconBox, isDark && { backgroundColor: colors.card }]}>
                <Text style={[styles.idSymbol, isDark && { color: colors.tint }]}>#</Text>
              </View>
              <View>
                <Text style={[styles.rowLabel, isDark && { color: colors.textSecondary }]}>Report ID</Text>
                <Text style={[styles.rowValueHighlight, isDark && { color: colors.tint }]}>{ticketNumber}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.copyButton, isDark && { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              onPress={handleCopyId}>
              {copied ? (
                <CheckCircle size={18} color={CivicCareColors.success} />
              ) : (
                <Copy size={18} color={isDark ? colors.textSecondary : CivicCareColors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Row 2: Detected Category */}
          <View style={[styles.summaryRow, isDark && { borderBottomColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(234, 88, 12, 0.18)' : '#FFEDD5' }]}>
                <AlertTriangle size={18} color="#EA580C" />
              </View>
              <View>
                <Text style={[styles.rowLabel, isDark && { color: colors.textSecondary }]}>Detected Category</Text>
                <Text style={[styles.rowValue, isDark && { color: colors.text }]}>{category}</Text>
              </View>
            </View>
          </View>

          {/* Row 3: Severity */}
          <View style={[styles.summaryRow, isDark && { borderBottomColor: colors.border }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(220, 38, 38, 0.18)' : '#FEE2E2' }]}>
                <ShieldAlert size={18} color="#DC2626" />
              </View>
              <View>
                <Text style={[styles.rowLabel, isDark && { color: colors.textSecondary }]}>Severity</Text>
                <View style={[styles.severityBadge, isDark && { backgroundColor: 'rgba(220, 38, 38, 0.2)' }]}>
                  <Text style={[styles.severityBadgeText, isDark && { color: '#EF4444' }]}>{severity}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Row 4: Location */}
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <View style={styles.rowLabelGroup}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(30, 96, 213, 0.18)' : '#E0F2FE' }]}>
                <MapPin size={18} color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
              </View>
              <View style={{ flex: 1, paddingRight: Spacing.two }}>
                <Text style={[styles.rowLabel, isDark && { color: colors.textSecondary }]}>Location</Text>
                <Text style={[styles.rowValue, isDark && { color: colors.text }]} numberOfLines={2}>
                  {address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryTrackButton}
            activeOpacity={0.88}
            onPress={handleTrackReport}>
            <Text style={styles.primaryTrackButtonText}>Track This Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            activeOpacity={0.75}
            onPress={handleSubmitAnother}>
            <Text style={[styles.secondaryButtonText, isDark && { color: colors.text }]}>Submit Another Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  successBadgeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: CivicCareColors.textMain,
    marginBottom: Spacing.one,
  },
  subtext: {
    fontSize: 14,
    color: CivicCareColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.four,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    ...Shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idSymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: CivicCareColors.brandPrimary,
  },
  rowLabel: {
    fontSize: 12,
    color: CivicCareColors.textTertiary,
    marginBottom: 2,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: CivicCareColors.textMain,
  },
  rowValueHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: CivicCareColors.brandPrimary,
  },
  copyButton: {
    padding: 8,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  actionsContainer: {
    gap: Spacing.two,
  },
  primaryTrackButton: {
    backgroundColor: CivicCareColors.brandPrimary,
    height: 52,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CivicCareColors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryTrackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: CivicCareColors.brandPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
