import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CivicCareColors } from '@/constants/theme';
import { useAppTheme } from '@/services/themeContext';
import { Home, FileText, Map, User } from 'lucide-react-native';

export default function TabsLayout() {
  const { isDark, colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#60A5FA' : CivicCareColors.brandPrimary,
        tabBarInactiveTintColor: isDark ? '#737373' : '#64748B',
        tabBarStyle: {
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          borderTopColor: isDark ? '#262626' : '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 58 + insets.bottom : 64,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'My Reports',
          tabBarIcon: ({ color, focused }) => (
            <FileText size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Nearby Map',
          tabBarIcon: ({ color, focused }) => (
            <Map size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
