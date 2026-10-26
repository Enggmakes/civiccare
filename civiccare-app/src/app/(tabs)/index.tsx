import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows, getReportStatusStyles } from '@/constants/theme';
import { useReports } from '@/services/reportsStore';
import { useUser, useAuth } from '@/services/auth';
import { useAppTheme } from '@/services/themeContext';
import {
  getShortCityName,
  detectCivicBodyFromGPS,
} from '@/services/civicLocation';
import {
  MapPin,
  Search,
  Camera,
  Clock,
  Navigation,
  CheckCircle2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// 9 Official Issue Categories with Clean High-Resolution Flaticon Colored Icons
const CATEGORIES = [
  { id: 'Pothole', name: 'Pothole', image: require('@/assets/civiccare/icons/pothole.png') },
  { id: 'Garbage', name: 'Garbage', image: require('@/assets/civiccare/icons/garbage.png') },
  { id: 'Streetlight', name: 'Streetlight', image: require('@/assets/civiccare/icons/streetlight.png') },
  { id: 'Water Leak', name: 'Water Leak', image: require('@/assets/civiccare/icons/water_leak.png') },
  { id: 'Broken Road', name: 'Broken Road', image: require('@/assets/civiccare/icons/broken_road.png') },
  { id: 'Sewage', name: 'Sewage', image: require('@/assets/civiccare/icons/sewage.png') },
  { id: 'Illegal Dumping', name: 'Illegal Dumping', image: require('@/assets/civiccare/icons/illegal_dumping.png') },
  { id: 'Encroachment', name: 'Encroachment', image: require('@/assets/civiccare/icons/encroachment.png') },
  { id: 'Others', name: 'Others', image: require('@/assets/civiccare/icons/others.png') },
];

export default function HomeScreen() {
  const router = useRouter();
  const { reports, setFilterCategory, filterCategory } = useReports();
  const { user } = useUser();
  const { isDark, colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isLocatingCity, setIsLocatingCity] = useState(false);

  // Dynamic city name resolved directly from user profile (e.g. Pune for Rit), user selection, or GPS
  const displayCity = selectedCity || getShortCityName(user?.ward) || 'Pune';

  const handleAutoDetectCity = async () => {
    setIsLocatingCity(true);
    try {
      const res = await detectCivicBodyFromGPS();
      if (res.status === 'ok') {
        setSelectedCity(res.location.shortCity);
        Alert.alert(
          'Browsing Location Updated',
          `Viewing complaints for: ${res.location.shortCity}\n(${res.location.civicBody})\n\n(Your permanent home profile remains unchanged.)`
        );
      } else if (res.status === 'denied') {
        Alert.alert('Location Permission Denied', 'Please enable location permissions in your device settings.');
      } else {
        Alert.alert('Detection Error', 'Could not detect current location from GPS.');
      }
    } catch {
      Alert.alert('GPS Error', 'Could not detect current location.');
    } finally {
      setIsLocatingCity(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (searchQuery.trim().length > 0) {
      return (
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location_address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const { isSignedIn } = useAuth();

  const handleReportIssuePress = () => {
    const isRealCitizen = isSignedIn && user && user.id && user.id !== 'guest_citizen';
    if (!isRealCitizen) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to file and track civic issues.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }
    router.push('/report-issue');
  };

  const handleCategoryPress = (categoryName: string) => {
    if (filterCategory === categoryName) {
      setFilterCategory(null);
    } else {
      setFilterCategory(categoryName);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        style={[styles.scrollView, isDark && { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 115 }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Top Header: Location Selector & User Avatar */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.locationSelector, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={handleAutoDetectCity}
            disabled={isLocatingCity}>
            {isLocatingCity ? (
              <ActivityIndicator size="small" color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
            ) : (
              <MapPin size={18} color={isDark ? colors.tint : CivicCareColors.brandPrimary} />
            )}
            <Text style={[styles.locationText, isDark && { color: colors.text }]}>
              {isLocatingCity ? 'Detecting...' : displayCity}
            </Text>
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.avatarButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/profile')}>
              <Image
                source={
                  user?.imageUrl && !user.imageUrl.includes('unsplash')
                    ? { uri: user.imageUrl }
                    : require('@/assets/images/default-avatar.png')
                }
                style={[styles.avatarImage, isDark && { borderColor: colors.border }]}
              />
              <View style={styles.onlineBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, isDark && { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Search size={18} color={isDark ? colors.textTertiary : CivicCareColors.textTertiary} />
          <TextInput
            placeholder="Search for issues near you..."
            placeholderTextColor={isDark ? colors.textTertiary : CivicCareColors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, isDark && { color: colors.text }]}
          />
        </View>

        {/* Official Civic Hero Banner (Asset 07) */}
        <View style={styles.heroBannerCard}>
          <Image
            source={require('@/assets/civiccare/07_home_screen_hero_banner.png')}
            style={styles.heroBannerImage}
            resizeMode="cover"
          />
          <View style={styles.heroBannerOverlay}>
            <Text style={styles.bannerTitle}>Together for a{"\n"}Cleaner, Safer City</Text>
            <Text style={styles.bannerSubtitle}>Report civic issues and{"\n"}help make a difference.</Text>
          </View>
        </View>

        {/* Big Prominent Action Button: Report an Issue */}
        <TouchableOpacity
          style={styles.reportActionButton}
          activeOpacity={0.9}
          onPress={handleReportIssuePress}>
          <View style={styles.cameraIconBadge}>
            <Camera size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.reportActionText}>Report an Issue</Text>
        </TouchableOpacity>

        {/* Issue Categories Grid (9 Authentic Categories) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, isDark && { color: colors.text }]}>Categories</Text>
          {filterCategory && (
            <TouchableOpacity onPress={() => setFilterCategory(null)}>
              <Text style={styles.clearFilterText}>Clear filter</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.categoriesGrid}>
          {CATEGORIES.map(cat => {
            const isSelected = filterCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                  isSelected && styles.categoryCardSelected,
                  isSelected && isDark && { backgroundColor: colors.backgroundSelected, borderColor: colors.tint },
                ]}
                activeOpacity={0.75}
                onPress={() => handleCategoryPress(cat.name)}>
                <Image
                  source={cat.image}
                  style={styles.categoryIconImg}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    isDark && { color: colors.textSecondary },
                    isSelected && styles.categoryLabelSelected,
                    isSelected && isDark && { color: colors.tint },
                  ]}
                  numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Reports Nearby Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, isDark && { color: colors.text }]}>Recent Reports Nearby</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reports')}>
            <Text style={[styles.viewAllLink, isDark && { color: colors.tint }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Report Cards Feed — Zero dummy records */}
        <View style={styles.reportsFeed}>
          {filteredReports.length === 0 ? (
            <View style={[styles.emptyFeedCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, isDark && { backgroundColor: 'rgba(22, 163, 74, 0.15)' }]}>
                <CheckCircle2 size={32} color="#16A34A" />
              </View>
              <Text style={[styles.emptyFeedTitle, isDark && { color: colors.text }]}>No civic issues found</Text>
              <Text style={[styles.emptyFeedSubtitle, isDark && { color: colors.textSecondary }]}>
                {filterCategory
                  ? `No active ${filterCategory} reports found. Tap "Clear filter" to see all reports.`
                  : 'Your neighborhood looks clear! Tap "Report an Issue" to report a problem.'}
              </Text>
              {filterCategory && (
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={() => setFilterCategory(null)}>
                  <Text style={styles.clearFilterBtnText}>Show All Categories</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredReports.map(report => (
              <TouchableOpacity
                key={report.id}
                style={[styles.reportCard, isDark && { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/report-details', params: { id: report.id } })}>
                <Image source={{ uri: report.image_url }} style={styles.reportThumbnail} />
                
                <View style={styles.reportInfoColumn}>
                  <View style={styles.reportTitleRow}>
                    <Text style={[styles.reportTitle, isDark && { color: colors.text }]} numberOfLines={1}>
                      {report.title}
                    </Text>
                    {(() => {
                      const badgeStyle = getReportStatusStyles(report.status, isDark);
                      return (
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor: badgeStyle.bg,
                              borderColor: badgeStyle.border,
                              borderWidth: 1,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: badgeStyle.text },
                            ]}>
                            {report.status}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>

                  <Text style={[styles.reportAddress, isDark && { color: colors.textSecondary }]} numberOfLines={1}>
                    {report.location_address}
                  </Text>

                  <View style={styles.reportMetaRow}>
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
              </TouchableOpacity>
            ))
          )}
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
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Spacing.two,
    backgroundColor: CivicCareColors.brandSubtle,
    borderRadius: BorderRadius.full,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: CivicCareColors.textMain,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarButton: {
    position: 'relative',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: CivicCareColors.bgSubtle,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.three,
    height: 46,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: CivicCareColors.textMain,
  },
  heroBannerCard: {
    position: 'relative',
    height: 140,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#EBF4FF',
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroBannerOverlay: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: CivicCareColors.textMain,
    lineHeight: 23,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: CivicCareColors.textSecondary,
    lineHeight: 16,
    fontWeight: '500',
  },
  reportActionButton: {
    backgroundColor: CivicCareColors.brandPrimary,
    height: 52,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
    shadowColor: CivicCareColors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  cameraIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: CivicCareColors.textMain,
  },
  clearFilterText: {
    fontSize: 13,
    color: CivicCareColors.brandPrimary,
    fontWeight: '600',
  },
  viewAllLink: {
    fontSize: 13,
    color: CivicCareColors.brandPrimary,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two + 2,
    marginBottom: Spacing.four,
  },
  categoryCard: {
    width: (width - Spacing.four * 2 - Spacing.two * 2) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  categoryCardSelected: {
    borderColor: CivicCareColors.brandPrimary,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
  },
  categoryIconImg: {
    width: 38,
    height: 38,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: CivicCareColors.brandPrimary,
    fontWeight: '800',
  },
  reportsFeed: {
    gap: Spacing.three,
  },
  emptyFeedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    marginTop: Spacing.two,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  emptyFeedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CivicCareColors.textMain,
    marginBottom: 4,
  },
  emptyFeedSubtitle: {
    fontSize: 13,
    color: CivicCareColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  clearFilterBtn: {
    backgroundColor: CivicCareColors.brandSubtle,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
  },
  clearFilterBtnText: {
    color: CivicCareColors.brandPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    ...Shadows.sm,
  },
  reportThumbnail: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#E2E8F0',
  },
  reportInfoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: CivicCareColors.textMain,
    flex: 1,
    marginRight: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusInProgress: {
    backgroundColor: CivicCareColors.warningBg,
  },
  statusInProgressText: {
    color: CivicCareColors.warning,
    fontSize: 11,
    fontWeight: '700',
  },
  statusResolved: {
    backgroundColor: CivicCareColors.successBg,
  },
  statusResolvedText: {
    color: CivicCareColors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  reportAddress: {
    fontSize: 12,
    color: CivicCareColors.textSecondary,
    marginBottom: 6,
  },
  reportMetaRow: {
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
});
