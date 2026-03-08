/**
 * FORGEBORN THEME — TYPOGRAPHY
 * 
 * Clean, incredibly readable, and rigorously structured.
 * Follows Apple Human Interface Guidelines for sizing and hierarchy.
 * Drops the "gamer" aesthetic for pure instrument-level professionalism.
 */

import { Platform } from 'react-native';
import colors from './colors';

// Font families (Inter is excellent, we just need to use its lighter weights)
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
};

// Standardized sizing (iOS scale)
export const fontSize = {
    xs: 12,       // Caption 2
    sm: 13,       // Footnote / Caption 1
    base: 15,     // Subheadline
    md: 17,       // Body / Headline (Standard iOS body text)
    lg: 20,       // Title 3
    xl: 22,       // Title 2
    '2xl': 28,    // Title 1
    '3xl': 34,    // Large Title
    massive: 64,  // Data display (timer, rep counter)
};

// Highly controlled, professional letter spacing
export const letterSpacing = {
    tight: -0.5,
    normal: 0,
    wide: 0.5, // Reduced drastically from previous iteration to avoid spread-out looks
};

export const lineHeight = {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5,
};

// Pre-built, standard text styles
export const textStyles = {

    // Page Header (massive, crisp)
    largeTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['3xl'],
        letterSpacing: letterSpacing.tight,
        color: colors.text,
    },

    // Section Header
    title1: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['2xl'],
        letterSpacing: letterSpacing.tight,
        color: colors.text,
    },

    // Card Header
    title2: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xl,
        letterSpacing: letterSpacing.normal,
        color: colors.text,
    },

    // Strong Body / List Header
    headline: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text,
    },

    // Standard readable text
    body: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        lineHeight: Math.round(fontSize.md * lineHeight.relaxed),
        color: colors.textSecondary,
    },

    // Secondary information
    subheadline: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.base,
        color: colors.textSecondary,
    },

    // Buttons and Actions
    buttonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.textInverse, // Assume black button, white text
        textAlign: 'center',
    },

    // Tiny labels
    caption: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.textDim,
    },

    // Data Focus (Massive numbers, e.g., Timer or Rep count)
    dataDisplay: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.massive,
        letterSpacing: letterSpacing.tight,
        color: colors.text,
        lineHeight: fontSize.massive * lineHeight.tight,
    },
};

export default {
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing,
    textStyles,
};
