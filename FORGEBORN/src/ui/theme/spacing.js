/**
 * FORGEBORN THEME — SPACING
 * 
 * Elegant, breathable, professional space.
 * Generous padding to create clean separation of components.
 */

export const spacing = {
    // Base units
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,     // Standard inset
    5: 20,
    6: 24,     // Large inset
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
};

// Screen padding
export const screen = {
    paddingHorizontal: spacing[4], // Standardize to 16px edges
    paddingVertical: spacing[6],
    paddingTop: spacing[12],
    paddingBottom: spacing[8],
};

// Component spacing
export const component = {
    gap: spacing[4],
    gapSmall: spacing[2],
    gapLarge: spacing[6],
};

// Border radius (Apple Style)
export const radius = {
    none: 0,
    xs: 4,
    sm: 8,     // Tags, small inputs
    md: 12,    // Inner elements
    lg: 16,    // Primary Cards
    xl: 24,    // Large Modals
    full: 9999,// Pills, circular avatars
};

// Z-index layers
export const zIndex = {
    base: 0,
    above: 1,
    dropdown: 10,
    modal: 100,
    lock: 999,
    system: 9999,
};

export default {
    spacing,
    screen,
    component,
    radius,
    zIndex,
};
