import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CivicCareColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/services/themeContext';
import { ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Report Issues',
    description: 'Click a photo, add a description and location to report civic issues in your city.',
    image: require('@/assets/civiccare/04_onboarding_report_issues.png'),
  },
  {
    id: 2,
    title: 'AI Powered\nFaster Resolution',
    description: 'Our AI automatically classifies your report and routes it to the right department.',
    image: require('@/assets/civiccare/05_onboarding_ai_resolution.png'),
  },
  {
    id: 3,
    title: 'Track & Stay Updated',
    description: 'Get real-time status updates and be part of a cleaner, better city.',
    image: require('@/assets/civiccare/06_onboarding_track_updates.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/auth');
    }
  };

  const handleSkip = () => {
    router.replace('/auth');
  };

  const slide = ONBOARDING_SLIDES[currentSlide];
  const isLastSlide = currentSlide === ONBOARDING_SLIDES.length - 1;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom + 15 }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        {/* Top Header with Skip Button */}
        <View style={styles.headerRow}>
          <View style={{ width: 40 }} />
          <TouchableOpacity activeOpacity={0.7} onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, isDark && { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Central Graphic Illustration */}
        <View style={styles.graphicContainer}>
          <Image
            source={slide.image}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* Text Content */}
        <View style={styles.contentSection}>
          <Text style={[styles.titleText, isDark && { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.descriptionText, isDark && { color: colors.textSecondary }]}>{slide.description}</Text>

          {/* Pagination Dots (4 dots matching design system) */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((dotIdx) => (
              <View
                key={dotIdx}
                style={[
                  styles.dot,
                  currentSlide === dotIdx
                    ? styles.activeDot
                    : [styles.inactiveDot, isDark && { backgroundColor: colors.border }],
                ]}
              />
            ))}
          </View>
        </View>

        {/* Bottom Actions matching Screen 2, 3, 4 */}
        <View style={styles.bottomSection}>
          {isLastSlide ? (
            <TouchableOpacity
              style={styles.getStartedButton}
              activeOpacity={0.88}
              onPress={handleNext}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.arrowRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={styles.nextCircleButton}
                activeOpacity={0.85}
                onPress={handleNext}>
                <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: Spacing.one,
    paddingBottom: Spacing.five,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.one,
  },
  skipButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  skipText: {
    color: CivicCareColors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  graphicContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  illustrationImage: {
    width: width * 0.85,
    height: width * 0.75,
    maxHeight: 320,
  },
  contentSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: CivicCareColors.textMain,
    textAlign: 'center',
    marginBottom: Spacing.two,
    lineHeight: 30,
  },
  descriptionText: {
    fontSize: 14,
    color: CivicCareColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.two,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.four,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 22,
    backgroundColor: CivicCareColors.brandPrimary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: Spacing.two,
    minHeight: 56,
    justifyContent: 'center',
  },
  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  nextCircleButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: CivicCareColors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CivicCareColors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  getStartedButton: {
    backgroundColor: CivicCareColors.brandPrimary,
    height: 52,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CivicCareColors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
