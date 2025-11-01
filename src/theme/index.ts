// Claude.ai Design System
import { Platform } from 'react-native';

export const colors = {
  background: '#1c1c1c', // Very dark neutral gray (almost black, neutral tone)
  surface: '#262626', // Slightly lighter neutral dark gray
  surfaceElevated: '#2e2e2e', // Elevated surfaces
  primary: '#da7756', // Terra Cotta - Claude's warm, muted orange
  primaryHover: '#c86945', // Slightly darker terra cotta on hover
  textPrimary: '#f5f5f0', // Warm white
  textSecondary: '#a8a8a0', // Muted warm gray
  textTertiary: '#6b6b66', // Very muted gray
  border: '#333333', // Subtle neutral borders
  success: '#10b981',
  error: '#ef4444',
};

export const typography = {
  // Serif fonts for headings (will use system serif or Georgia as fallback)
  heading: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  // Sans-serif for body text
  body: {
    fontFamily: Platform.select({
      ios: '-apple-system',
      android: 'sans-serif',
      default: 'system',
    }),
  },
  // Monospace for numbers
  mono: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
};

export const fontSizes = {
  appTitle: 32,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  label: 11,
  number: 18,
  numberLarge: 32,
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 10,
  md: 12,
  lg: 16,
  full: 9999,
};

