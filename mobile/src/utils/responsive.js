/**
 * Responsive Sizing Utility
 * Provides dynamic sizing based on screen dimensions for consistent UI across devices
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Base dimensions (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

// Use the smaller scale to ensure content fits
const scale = Math.min(widthScale, heightScale);

/**
 * Scale a size based on screen width
 * @param {number} size - Size in pixels for base device
 * @returns {number} Scaled size
 */
export function wp(size) {
    return Math.round(size * widthScale);
}

/**
 * Scale a size based on screen height
 * @param {number} size - Size in pixels for base device
 * @returns {number} Scaled size
 */
export function hp(size) {
    return Math.round(size * heightScale);
}

/**
 * Moderate scale - for font sizes and padding
 * Uses a factor to prevent over-scaling on large devices
 * @param {number} size - Base size
 * @param {number} factor - Scaling factor (0-1, default 0.5)
 * @returns {number} Scaled size
 */
export function ms(size, factor = 0.5) {
    return Math.round(size + (widthScale - 1) * size * factor);
}

/**
 * Scale font size with pixel ratio consideration
 * @param {number} size - Base font size
 * @returns {number} Scaled font size
 */
export function fs(size) {
    const newSize = size * widthScale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}

/**
 * Check if device is a small phone (< 375px width)
 */
export const isSmallDevice = SCREEN_WIDTH < 375;

/**
 * Check if device is a large phone/tablet (> 428px width)
 */
export const isLargeDevice = SCREEN_WIDTH > 428;

/**
 * Check if device has a notch (rough estimation)
 */
export const hasNotch = SCREEN_HEIGHT >= 812 && Platform.OS === 'ios';

/**
 * Get responsive value based on screen size
 * @param {any} small - Value for small devices
 * @param {any} medium - Value for medium devices
 * @param {any} large - Value for large devices
 */
export function responsive(small, medium, large) {
    if (isSmallDevice) return small;
    if (isLargeDevice) return large;
    return medium;
}

/**
 * Common responsive sizes for buttons, padding, etc.
 */
export const sizes = {
    // Padding
    paddingXs: ms(4),
    paddingSm: ms(8),
    paddingMd: ms(12),
    paddingLg: ms(16),
    paddingXl: ms(20),
    paddingXxl: ms(24),

    // Margins
    marginXs: ms(4),
    marginSm: ms(8),
    marginMd: ms(12),
    marginLg: ms(16),
    marginXl: ms(20),
    marginXxl: ms(24),

    // Border radius
    radiusSm: ms(4),
    radiusMd: ms(8),
    radiusLg: ms(12),
    radiusXl: ms(16),
    radiusFull: 9999,

    // Font sizes
    fontXs: fs(10),
    fontSm: fs(12),
    fontMd: fs(14),
    fontLg: fs(16),
    fontXl: fs(18),
    fontXxl: fs(20),
    fontTitle: fs(24),
    fontHero: fs(28),

    // Button heights
    buttonSm: hp(36),
    buttonMd: hp(44),
    buttonLg: hp(52),

    // Icon sizes
    iconSm: ms(16),
    iconMd: ms(20),
    iconLg: ms(24),
    iconXl: ms(32),

    // Touch targets (minimum 44px for accessibility)
    touchTarget: Math.max(44, hp(44)),

    // Header
    headerHeight: hp(56),
};

/**
 * Screen dimensions
 */
export const screen = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmall: isSmallDevice,
    isLarge: isLargeDevice,
};

export default {
    wp,
    hp,
    ms,
    fs,
    responsive,
    sizes,
    screen,
    isSmallDevice,
    isLargeDevice,
    hasNotch,
};
