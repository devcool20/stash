export const colors = {
  // Pure black canvas
  bg: '#000000',
  bgSoft: '#0A0A0A',
  bgCard: 'rgba(255, 255, 255, 0.03)',
  bgCardMuted: 'rgba(255, 255, 255, 0.02)',
  bgDark: '#000000',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8A8A93',
  textTertiary: '#6E6E76',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.7)',

  // Glass / Frosted (for glassy buttons)
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassShadow: 'rgba(0, 0, 0, 0.5)',
  glassBgStrong: 'rgba(255, 255, 255, 0.06)',
  glassBorderStrong: 'rgba(255, 255, 255, 0.12)',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
  borderActive: '#34D399',

  // Accents
  accentCoral: '#34D399',
  accentCoralSoft: 'rgba(52, 211, 153, 0.1)',
  accentBrown: '#FFFFFF',
  accentBrownSoft: 'rgba(255, 255, 255, 0.08)',
  accentGreen: '#34D399',
  accentGreenSoft: 'rgba(52, 211, 153, 0.1)',

  // Category icon tints
  catOrange: '#F43F5E',
  catAmber: '#F59E0B',
  catEmerald: '#34D399',
  catViolet: '#8B5CF6',
  catFuchsia: '#D946EF',
  catBlue: '#3B82F6',

  // Shadows
  shadowSoft: 'rgba(0, 0, 0, 0.5)',
  shadowMed: 'rgba(0, 0, 0, 0.7)',
  shadowGlass: 'rgba(0, 0, 0, 0.3)',

  // Overlays
  overlayDim: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const fonts = {
  // Display (serif) — used for "STASH", titles, brand
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }) as string,
  // Body (sans-serif)
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) as string,
  // Monospace
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Menlo',
  }) as string,
};

import { Platform } from 'react-native';
