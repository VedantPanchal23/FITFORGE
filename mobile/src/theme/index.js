/**
 * FITFORGE Theme System
 * 
 * DESIGN PHILOSOPHY:
 * 1. Dark Mode: "Midnight Glass" - Deep Zinc 950 backgrounds, vibrant violet/cyan gradients, glassmorphism.
 * 2. Light Mode: "Porcelain Frost" - Off-white Pearl backgrounds, soft shadows, subtle grey gradients, clean typography.
 * 
 * Both themes must feel premium. Light mode avoids pure white (#FFF) for backgrounds to reduce eye strain.
 */

import { Platform } from 'react-native';

// === PALETTES ===

const darkPalette = {
    // Backgrounds
    midnight: '#09090B',    // Zinc 950 - Main App Background
    card: '#18181B',        // Zinc 900 - Card Background
    cardBorder: '#27272A90',  // Zinc 800 (Low Opacity) - Glass Border

    // Gradients & Accents
    primary: '#7C3AED',     // Violet 600
    primaryLight: '#A78BFA', // Violet 400
    accent: '#22D3EE',      // Cyan 400 (Brighter for Dark Mode)

    // Glass Effect
    glassBg: 'rgba(24, 24, 27, 0.6)', // Semi-transparent card
    glassBorder: 'rgba(255, 255, 255, 0.1)',

    // Functional
    success: '#10B981',     // Emerald 500
    warning: '#FBBF24',     // Amber 400
    error: '#EF4444',       // Red 500
    info: '#3B82F6',        // Blue 500

    // Text
    text: '#FAFAFA',        // Zinc 50 - High Emphasis
    textSecondary: '#A1A1AA', // Zinc 400 - Medium Emphasis
    textTertiary: '#52525B',  // Zinc 600 - Low Emphasis
};

const lightPalette = {
    // Backgrounds
    background: '#F8FAFC',   // Slate 50 - Pearl/Off-white (Not harsh white)
    card: '#FFFFFF',         // Pure White Cards for pop
    cardBorder: '#E2E8F0',   // Slate 200 - Soft Border

    // Gradients & Accents (Adjusted for Light Mode contrast)
    primary: '#6D28D9',      // Violet 700 (Darker for readability)
    primaryLight: '#8B5CF6', // Violet 500
    accent: '#0891B2',       // Cyan 600 (Darker for readability)

    // Glass/Frost Effect
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',

    // Functional
    success: '#059669',     // Emerald 600
    warning: '#D97706',     // Amber 600
    error: '#DC2626',       // Red 600
    info: '#2563EB',        // Blue 600

    // Text
    text: '#0F172A',         // Slate 900 - High Emphasis
    textSecondary: '#475569', // Slate 600
    textTertiary: '#94A3B8',  // Slate 400
};

// === THEME DEFINITIONS ===

export const darkTheme = {
    name: 'dark',
    background: darkPalette.midnight,
    backgroundSecondary: darkPalette.card,

    card: darkPalette.card,
    cardBorder: darkPalette.cardBorder,

    glass: {
        bg: darkPalette.glassBg,
        border: darkPalette.glassBorder,
        blur: 10
    },

    primary: darkPalette.primary,
    primaryLight: darkPalette.primaryLight,
    accent: darkPalette.accent,

    success: darkPalette.success,
    warning: darkPalette.warning,
    error: darkPalette.error,
    info: darkPalette.info,

    text: darkPalette.text,
    textSecondary: darkPalette.textSecondary,
    textTertiary: darkPalette.textTertiary,

    border: darkPalette.cardBorder,

    // Specifics
    tabBarBg: 'rgba(9, 9, 11, 0.9)', // Translucent Midnight
    tabBarBorder: darkPalette.cardBorder,
    tabBarActive: darkPalette.primary,
    tabBarInactive: darkPalette.textTertiary,

    // Macro colors (bright for dark mode)
    caloriesColor: '#F97316',  // Orange 500
    proteinColor: '#22C55E',   // Green 500
    carbsColor: '#3B82F6',     // Blue 500
    fatsColor: '#EAB308',      // Yellow 500

    chart: {
        bg: 'transparent',
        line: darkPalette.primary,
        grid: darkPalette.cardBorder
    }
};

export const lightTheme = {
    name: 'light',
    background: lightPalette.background,
    backgroundSecondary: lightPalette.card,

    card: lightPalette.card,
    cardBorder: lightPalette.cardBorder,

    glass: {
        bg: lightPalette.glassBg,
        border: lightPalette.glassBorder,
        blur: 20 // Higher blur for frosty look
    },

    primary: lightPalette.primary,
    primaryLight: lightPalette.primaryLight,
    accent: lightPalette.accent,

    success: lightPalette.success,
    warning: lightPalette.warning,
    error: lightPalette.error,
    info: lightPalette.info,

    text: lightPalette.text,
    textSecondary: lightPalette.textSecondary,
    textTertiary: lightPalette.textTertiary,

    border: lightPalette.cardBorder,

    // Specifics
    tabBarBg: 'rgba(255, 255, 255, 0.9)', // Translucent Pearl
    tabBarBorder: lightPalette.cardBorder,
    tabBarActive: lightPalette.primary,
    tabBarInactive: lightPalette.textTertiary,

    // Macro colors (darker for light mode)
    caloriesColor: '#EA580C',  // Orange 600
    proteinColor: '#16A34A',   // Green 600
    carbsColor: '#2563EB',     // Blue 600
    fatsColor: '#CA8A04',      // Yellow 600

    chart: {
        bg: 'transparent',
        line: lightPalette.primary,
        grid: lightPalette.cardBorder
    }
};

// === RESPONSIVE UTILITIES ===
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

export function normalize(size) {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
}

// === TYPOGRAPHY & SPACING ===

export const spacing = {
    xs: normalize(4),
    sm: normalize(8),
    md: normalize(16),
    lg: normalize(24),
    xl: normalize(32),
    xxl: normalize(48)
};

export const fonts = {
    h1: { fontSize: normalize(34), fontWeight: '800', letterSpacing: -1 },
    h2: { fontSize: normalize(28), fontWeight: '700', letterSpacing: -0.5 },
    h3: { fontSize: normalize(22), fontWeight: '600', letterSpacing: 0 },
    subtitle: { fontSize: normalize(18), fontWeight: '500', letterSpacing: 0.15 },
    body: { fontSize: normalize(16), fontWeight: '400', lineHeight: normalize(24) },
    button: { fontSize: normalize(16), fontWeight: '600', letterSpacing: 0.5 },
    caption: { fontSize: normalize(12), fontWeight: '500', letterSpacing: 0.4 }
};

export const radius = {
    sm: normalize(12),
    md: normalize(20),
    lg: normalize(32),
    full: 999
};
