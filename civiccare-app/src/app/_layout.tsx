import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, StyleSheet, Platform } from 'react-native';
import { CivicCareAuthProvider } from '@/services/clerk';
import { ReportsProvider } from '@/services/reportsStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <CivicCareAuthProvider>
      <ReportsProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={Platform.OS === 'web' ? styles.webContainer : styles.nativeContainer}>
            <View style={Platform.OS === 'web' ? styles.webShell : styles.nativeContainer}>
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false, gestureEnabled: false }} />
                <Stack.Screen name="report-issue" options={{ headerShown: false, presentation: 'card' }} />
                <Stack.Screen name="ai-analysis" options={{ headerShown: false }} />
                <Stack.Screen name="report-submitted" options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
                <Stack.Screen name="report-details" options={{ headerShown: false }} />
              </Stack>
            </View>
          </View>
        </ThemeProvider>
      </ReportsProvider>
    </CivicCareAuthProvider>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webShell: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
});

