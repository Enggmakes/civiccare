import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/services/auth';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSignedIn, isLoaded, userId } = useAuth();

  React.useEffect(() => {
    if (isLoaded && isSignedIn && userId && userId !== 'guest_citizen') {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, userId]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Full-Screen Edge-to-Edge City Illustration with Built-in CivicCare Branding */}
      <ImageBackground
        source={require('@/assets/civiccare/welcome_background.png')}
        style={styles.backgroundImage}
        resizeMode="cover">
        
        {/* Soft White Gradient Overlay at the bottom matching Reference Image 1 */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.35)',
            'rgba(255, 255, 255, 0.75)',
            'rgba(255, 255, 255, 0.96)',
            '#FFFFFF',
          ]}
          locations={[0, 0.25, 0.55, 0.8, 1]}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />

        {/* Bottom Call to Action Section */}
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
          {/* Primary "Get Started" Pill Button */}
          <TouchableOpacity
            style={styles.getStartedButton}
            activeOpacity={0.88}
            onPress={() => router.replace('/onboarding')}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          {/* "Already have an account? Sign In" Row */}
          <TouchableOpacity
            style={styles.signInRow}
            activeOpacity={0.7}
            onPress={() => router.replace('/auth')}>
            <Text style={styles.signInPrompt}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4FE',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: Math.round(height * 0.36),
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  getStartedButton: {
    width: width * 0.88,
    height: 56,
    backgroundColor: '#0066FF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  signInPrompt: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  signInLink: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '700',
  },
});
