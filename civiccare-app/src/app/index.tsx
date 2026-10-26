import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@/services/auth';
import { CivicCareColors } from '@/constants/theme';

export default function AppEntry() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    // Only actual authenticated citizens with a Supabase account proceed to tabs directly
    const isRealCitizen = isSignedIn && user && user.id && user.id !== 'guest_citizen';

    if (isRealCitizen) {
      router.replace('/(tabs)');
    } else {
      // Whenever user boots the application unauthenticated, they land on the Welcome/Sign-in screen
      router.replace('/welcome');
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color={CivicCareColors.brandPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
