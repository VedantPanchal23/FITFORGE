/**
 * FORGEBORN THEME — TYPOGRAPHY
 * 
 * Bold. Condensed. Commanding.
 * Headlines scream. Body obeys.
 * Critical messages: ALL CAPS.
 */

import { Platform } from 'react-native';

// Font families
export const fontFamily = {
    regular: Platform.select({
        ios: 'Inter-Regular',
        android: 'Inter-Regular',
        default: 'Inter',
    }),
    medium: Platform.select({
        ios: 'Inter-Medium',
        android: 'Inter-Medium',
        default: 'Inter',
    }),
    semiBold: Platform.select({
        ios: 'Inter-SemiBold',
        android: 'Inter-SemiBold',
        default: 'Inter',
    }),
    bold: Platform.select({
        ios: 'Inter-Bold',
        android: 'Inter-Bold',
        default: 'Inter',
    }),
    black: Platform.select({
        ios: 'Inter-Black',
        android: 'Inter-Black',
        default: 'Inter',
    }),
};

// Font sizes
export const fontSize = {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    massive: 96,
};

// Line heights
export const lineHeight = {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
};

// Letter spacing
export const letterSpacing = {
    tight: -0.5,
    normal: 0,
    wide: 1,
    wider: 2,
    widest: 4,
    extreme: 8,
};

// Pre-built text styles
export const textStyles = {
    // THE CREED - massive, commanding
    creed: {
        fontSize: fontSize['4xl'],
        fontWeight: '900',
        letterSpacing: letterSpacing.widest,
        textTransform: 'uppercase',
        lineHeight: fontSize['4xl'] * lineHeight.tight,
    },

    // Headlines
    h1: {
        fontSize: fontSize['3xl'],
        fontWeight: '800',
        letterSpacing: letterSpacing.wider,
        textTransform: 'uppercase',
        lineHeight: fontSize['3xl'] * lineHeight.tight,
    },

    h2: {
        fontSize: fontSize['2xl'],
        fontWeight: '700',
        letterSpacing: letterSpacing.wide,
        textTransform: 'uppercase',
        lineHeight: fontSize['2xl'] * lineHeight.tight,
    },

    h3: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        letterSpacing: letterSpacing.wide,
        lineHeight: fontSize.xl * lineHeight.tight,
    },

    // Body text
    body: {
        fontSize: fontSize.base,
        fontWeight: '400',
        letterSpacing: letterSpacing.normal,
        lineHeight: fontSize.base * lineHeight.normal,
    },

    bodyLarge: {
        fontSize: fontSize.md,
        fontWeight: '400',
        letterSpacing: letterSpacing.normal,
        lineHeight: fontSize.md * lineHeight.normal,
    },

    // Labels
    label: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        letterSpacing: letterSpacing.wide,
        textTransform: 'uppercase',
        lineHeight: fontSize.sm * lineHeight.tight,
    },

    // Captions
    caption: {
        fontSize: fontSize.xs,
        fontWeight: '500',
        letterSpacing: letterSpacing.wide,
        textTransform: 'uppercase',
        lineHeight: fontSize.xs * lineHeight.tight,
    },

    // Numbers (countdown, stats)
    number: {
        fontSize: fontSize['5xl'],
        fontWeight: '900',
        letterSpacing: letterSpacing.tight,
        lineHeight: fontSize['5xl'] * lineHeight.tight,
    },

    numberMassive: {
        fontSize: fontSize.massive,
        fontWeight: '900',
        letterSpacing: letterSpacing.tight,
        lineHeight: fontSize.massive * lineHeight.tight,
    },

    // Button text
    button: {
        fontSize: fontSize.md,
        fontWeight: '800',
        letterSpacing: letterSpacing.wider,
        textTransform: 'uppercase',
        lineHeight: fontSize.md * lineHeight.tight,
    },

    buttonSmall: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        letterSpacing: letterSpacing.wide,
        textTransform: 'uppercase',
        lineHeight: fontSize.sm * lineHeight.tight,
    },

    // Critical/Warning messages
    critical: {
        fontSize: fontSize.lg,
        fontWeight: '900',
        letterSpacing: letterSpacing.widest,
        textTransform: 'uppercase',
        lineHeight: fontSize.lg * lineHeight.tight,
    },
};

export default {
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing,
    textStyles,
};
