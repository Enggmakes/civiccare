import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';
import { Colors, CivicCareColors, MaxContentWidth, Spacing, BorderRadius } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="reports" href="/reports" asChild>
            <TabButton>My Reports</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Nearby Map</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton>Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...(props as any)} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View
        style={[
          styles.tabButtonView,
          isFocused ? styles.tabButtonActive : styles.tabButtonInactive,
        ]}>
        <ThemedText
          type="smallBold"
          style={{
            color: isFocused ? CivicCareColors.brandPrimary : CivicCareColors.textSecondary,
          }}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <ThemedText style={styles.logoLetter}>C</ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.brandText}>
            CivicCare
          </ThemedText>
        </View>

        <View style={styles.triggersRow}>
          {props.children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },
  innerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CivicCareColors.border,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 520,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingRight: Spacing.two,
  },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: CivicCareColors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  brandText: {
    color: CivicCareColors.textMain,
    fontWeight: '700',
  },
  triggersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  tabButton: {
    cursor: 'pointer' as any,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.two,
    borderRadius: BorderRadius.full,
  },
  tabButtonActive: {
    backgroundColor: CivicCareColors.brandSubtle,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
});
