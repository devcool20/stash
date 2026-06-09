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
  glassBg: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
  glassShadow: 'rgba(0, 0, 0, 0.5)',
  glassBgStrong: 'rgba(255, 255, 255, 0.08)',
  glassBorderStrong: 'rgba(255, 255, 255, 0.14)',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
  borderActive: '#FFFFFF',

  // Accents
  accentCoral: '#FFFFFF',
  accentCoralSoft: 'rgba(255, 255, 255, 0.08)',
  accentBrown: '#FFFFFF',
  accentBrownSoft: 'rgba(255, 255, 255, 0.08)',
  accentGreen: '#FFFFFF',
  accentGreenSoft: 'rgba(255, 255, 255, 0.08)',

  // Category icon tints (monochrome white/gray)
  catOrange: '#FFFFFF',
  catAmber: '#FFFFFF',
  catEmerald: '#FFFFFF',
  catViolet: '#FFFFFF',
  catFuchsia: '#FFFFFF',
  catBlue: '#FFFFFF',

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
  display: 'Lato-Bold',
  // Body (sans-serif)
  body: 'Lato-Regular',
  // Monospace
  mono: 'Lato-Medium',
};

import { Platform } from 'react-native';
