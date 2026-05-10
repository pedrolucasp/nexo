/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Primary Colors
const NEON_GREEN = '#13ec5b';
const PRIMARY_DARK = '#0f172a';

// Surface & Background
const BACKGROUND_LIGHT = '#f6f8f6';
const SURFACE_LIGHT = '#ffffff';

// Text Colors
const TEXT_PRIMARY = '#0f172a';
const TEXT_SECONDARY = '#64748b';
const TEXT_PLACEHOLDER = '#94A3B8';

// Borders & Accents
const BORDER_SUBTLE = '#f1f5f9';
const BORDER_SUBTLE_GRAY = '#E5E7EB';
const STATUS_ACTIVE_BG = 'rgba(19, 236, 91, 0.1)';

// Semantic Color Pills and stuff
const PILL_BLUE = '#dbeafe';
const PILL_INDIGO = '#e0e7ff';
const PILL_PURPLE = '#f3e8ff';

const tintColorLight = '#12ED5C';
const tintColorSecondary = '#618A70';
const black = '#0F172A';
const gray = '#475569';
const lightGray = '#64748B'

export const Colors = {
  light: {
    // Primary Actions & Focus
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    background: BACKGROUND_LIGHT,
    surface: SURFACE_LIGHT,
    tint: NEON_GREEN,

    // Interactive States
    icon: TEXT_SECONDARY,
    tabIconDefault: TEXT_SECONDARY,
    tabIconSelected: NEON_GREEN,

    // Form Inputs
    inputBackgroundColor: SURFACE_LIGHT,
    inputBorderColor: BORDER_SUBTLE_GRAY,
    inputFocusBorderColor: NEON_GREEN,
    inputPlaceholderColor: TEXT_PLACEHOLDER,

    // Cards & Containers
    cardBackground: SURFACE_LIGHT,
    cardBorder: BORDER_SUBTLE,
    cardShadow: 'rgba(0, 0, 0, 0.05)',

    // Active / Inactive States
    activeBackground: STATUS_ACTIVE_BG,
    inactiveOpacity: 0.7,

    // Semantic Accents (for categorization)
    accentBlue: PILL_BLUE,
    accentIndigo: PILL_INDIGO,
    accentPurple: PILL_PURPLE,

    // Disabled / Secondary
    disabled: '#cbd5e1',
    divider: BORDER_SUBTLE,
  },
};

export const Typography = {
  // Headlines
  headlineXg: {
    fontFamily: Platform.select({
      android: 'Inter_900Black',
      default: 'Inter',
    }),
    fontSize: 36,
    fontWeight: '900' as const,
    lineHeight: 40,
  },
  headlineLg: {
    fontFamily: Platform.select({
      android: 'Inter_900Black',
      default: 'Inter',
    }),
    fontSize: 20,
    fontWeight: '900' as const,
    lineHeight: 28,
    letterSpacing: -0.02,
  },
  headlineMd: {
    fontFamily: Platform.select({
      android: 'Inter',
      default: 'Inter',
    }),
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },

  // Body
  bodyLg: {
    fontFamily: Platform.select({
      android: 'Inter',
      default: 'Inter',
    }),
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  bodyMd: {
    fontFamily: Platform.select({
      android: 'Inter',
      default: 'Inter',
    }),
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  
  // Labels
  labelSm: {
    fontFamily: Platform.select({
      android: 'Inter',
      default: 'Inter',
    }),
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.05,
  },
};

export const Spacing = {
  containerPadding: 16, // 1rem
  sectionGap: 32, // 2rem
  inlineGapSm: 8, // 0.5rem
  cardGap: 12 // 0.75rem
};

export const BorderRadius = {
  sm: 4, // 0.25rem
  default: 8, // 0.5rem
  md: 12, // 0.75rem
  lg: 16, // 1rem
  xl: 24, // 1.5rem
  full: 9999, // pill-shaped
};

export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  default: {
    sans: 'Inter',
    serif: 'serif',
    rounded: 'Inter',
    mono: 'monospace',
  },
});
