/**
 * colors.js
 * ----------------------------------------------------
 * SINGLE SOURCE OF TRUTH for every color in StoreQL.
 * Derived 1:1 from storeql-frontend/src/theme/colors.js.
 *
 * Palette philosophy: warm off-whites / deep charcoal
 * (not pure black), one confident accent, no gradients.
 * ----------------------------------------------------
 */

export const palette = {
  // Neutrals
  white: '#FFFFFF',
  cream: '#FAF9F6',
  fog: '#F2F1ED',
  mist: '#E7E5DF',
  stone: '#C9C6BE',
  ash: '#8A877F',
  slate: '#5A574F',
  charcoal: '#2A2823',
  ink: '#17160F',
  black: '#0B0A08',

  // Accent — a single confident, muted accent (no gradients)
  accent: '#B5451B', // warm terracotta
  accentSoft: '#E7C7B4',
  accentDeep: '#7E2F11',

  // Semantic
  success: '#3F7A54',
  warning: '#B8862C',
  danger: '#B23A34',
};

export const lightTheme = {
  mode: 'light',

  background: palette.cream,
  surface: palette.white,
  surfaceAlt: palette.fog,
  border: palette.mist,

  textPrimary: palette.ink,
  textSecondary: palette.slate,
  textMuted: palette.ash,
  textInverse: palette.cream,

  accent: palette.accent,
  accentSoft: palette.accentSoft,
  accentDeep: palette.accentDeep,

  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,

  shadow: 'rgba(23, 22, 15, 0.08)',
  shadowElevated: '0 12px 32px -12px rgba(23, 22, 15, 0.12)',
  overlay: 'rgba(11, 10, 8, 0.45)',
};

export const darkTheme = {
  mode: 'dark',

  background: palette.ink,
  surface: palette.charcoal,
  surfaceAlt: '#211F1A',
  border: '#37342C',

  textPrimary: palette.cream,
  textSecondary: palette.stone,
  textMuted: palette.ash,
  textInverse: palette.ink,

  accent: '#D97A4C', // slightly brighter for dark bg legibility
  accentSoft: '#4A2E22',
  accentDeep: palette.accentDeep,

  success: '#5FAE78',
  warning: '#D9A24E',
  danger: '#D9635C',

  shadow: 'rgba(0, 0, 0, 0.35)',
  shadowElevated: '0 12px 32px -12px rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export default palette;
