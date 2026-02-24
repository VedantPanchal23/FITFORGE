/**
 * FORGEBORN THEME — SPACING
 * 
 * Tight. Efficient. No wasted space.
 * Every pixel serves the mission.
 */

export const spacing = {
    // Base units
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
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
    paddingHorizontal: spacing[5],
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

// Border radius (MINIMAL - sharp edges)
export const radius = {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    // No rounded corners in FORGEBORN
    // Buttons, cards - all sharp or minimal
};

// Shadows (subtle, dark)
export const shadows = {
    none: {},
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: (color = '#FF0000') => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    }),
};

// Z-index layers
export const zIndex = {
    base: 0,
    above: 1,
    dropdown: 10,
    modal: 100,
    lock: 999,      // Lock overlay is ALWAYS on top
    system: 9999,
};

export default {
    spacing,
    screen,
    component,
    radius,
    shadows,
    zIndex,
};
