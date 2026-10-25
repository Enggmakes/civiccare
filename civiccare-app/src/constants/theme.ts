import { Platform } from 'react-native';

export const CivicCareColors = {
  // Brand tokens from Document 03 and image.png
  brandPrimary: '#1E60D5',
  brandHover: '#154FB3',
  brandSubtle: '#EFF6FF',
  brandGlow: 'rgba(30, 96, 213, 0.15)',

  // Neutral & Canvas tokens
  bgCanvas: '#FFFFFF',
  bgSubtle: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Typography tokens
  textMain: '#0F172A', // Deep navy
  textSecondary: '#64748B', // Slate muted
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Semantic Status & Severity tokens
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  info: '#0284C7',
  infoBg: '#E0F2FE',

  // Category Accent colors
  categoryPothole: '#EA580C',
  categoryGarbage: '#16A34A',
  categoryStreetlight: '#EAB308',
  categoryWaterLeak: '#0284C7',
  categoryBrokenRoad: '#7C3AED',
  categoryOthers: '#64748B',
} as const;

export const Colors = {
  light: {
    text: CivicCareColors.textMain,
    textSecondary: CivicCareColors.textSecondary,
    background: CivicCareColors.bgSubtle,
    backgroundElement: CivicCareColors.bgCanvas,
    backgroundSelected: CivicCareColors.brandSubtle,
    tint: CivicCareColors.brandPrimary,
    border: CivicCareColors.border,
    card: CivicCareColors.bgCard,
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    background: '#0B0F19',
    backgroundElement: '#131B2E',
    backgroundSelected: '#1E293B',
    tint: '#3B82F6',
    border: '#1E293B',
    card: '#131B2E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  quarter: 2,
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 20,
  five: 24,
  six: 32,
  seven: 40,
  eight: 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const BottomTabInset = Platform.select({ ios: 60, android: 75 }) ?? 0;
export const MaxContentWidth = 800;
