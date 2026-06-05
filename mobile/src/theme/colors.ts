export const colors = {
  // Pure black canvas
  bg: '#000000',
  bgPanel: 'rgba(255,255,255,0.03)',
  bgPanelStrong: 'rgba(255,255,255,0.06)',
  bgPanelHover: 'rgba(255,255,255,0.09)',
  bgDeep: 'rgba(0,0,0,0.4)',
  bgBlack50: 'rgba(0,0,0,0.5)',

  // Premium text
  textPrimary: '#FFFFFF',
  textSecondary: '#8A8A93',
  textMuted: '#6E6E76',
  textFaint: '#4A4A52',

  // Borders
  borderFaint: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.12)',
  borderDiagonal: 'rgba(255,255,255,0.18)',

  // Accent
  emerald: '#34D399',
  emeraldDeep: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  violet: '#8B5CF6',
  fuchsia: '#D946EF',
  red: '#EF4444',

  // Glow tokens
  glowWhite: 'rgba(255,255,255,0.5)',
  glowEmerald: 'rgba(52,211,153,0.3)',

  // Background atmospheric tones
  orbIndigo: 'rgba(18,14,46,0.6)',
  orbEmerald: 'rgba(10,28,22,0.45)',
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
