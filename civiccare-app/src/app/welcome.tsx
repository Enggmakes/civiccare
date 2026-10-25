import React from 'react';
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
import { CivicCareColors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/services/auth';
import { useAppTheme } from '@/services/themeContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const { isSignedIn, isLoaded } = useAuth();

  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn]);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom + 15 }, isDark && { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        {/* Top Logo & Tagline Lockup */}
        <View style={styles.brandHeader}>
          <Image
            source={require('@/assets/civiccare/02_civiccare_logo_with_tagline.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Central City Highway Background Illustration */}
        <View style={[styles.illustrationCard, isDark && { backgroundColor: colors.backgroundElement }]}>
          <Image
            source={require('@/assets/civiccare/03_splash_city_background.png')}
            style={styles.cityBgImage}
            resizeMode="cover"
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={() => router.replace('/onboarding')}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInRow}
            activeOpacity={0.7}
            onPress={() => router.replace('/auth')}>
            <Text style={[styles.signInPrompt, isDark && { color: colors.textSecondary }]}>Already have an account? </Text>
            <Text style={[styles.signInLink, isDark && { color: colors.tint }]}>Sign In</Text>
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  brandHeader: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  logoImage: {
    width: width * 0.72,
    height: 100,
  },
  illustrationCard: {
    flex: 1,
    width: '100%',
    marginVertical: Spacing.two,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityBgImage: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    width: '100%',
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  signInPrompt: {
    color: CivicCareColors.textSecondary,
    fontSize: 14,
  },
  signInLink: {
    color: CivicCareColors.brandPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
