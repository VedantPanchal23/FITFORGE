/**
 * FORGEBORN THEME — COLORS V2
 * 
 * Premium dark theme with curated accent colors.
 * Inspired by: Hevy (dark with warm accents), Streaks (clean dark)
 * 
 * V2 Changes: Softer primary red, richer greens, added gradients + radius + shadows.
 */

export const colors = {
    // Core
    background: '#080808',         // Near-black (softer than pure #000)
    surface: '#111111',            // Card surface
    surfaceLight: '#1A1A1A',       // Elevated surface
    surfaceHighlight: '#222222',   // Pressed/hover state

    // Primary — Warm Red (elegant, not aggressive)
    primary: '#E63946',            // Warm red — action, commitment
    primaryDark: '#C1272D',        // Pressed state
    primaryMuted: '#2A0F12',       // Subtle background tint
    primaryLight: '#FF6B7A',       // Light accent

    // Accent — Amber/Gold (achievement, progress)
    accent: '#F4A261',             // Warm amber — rewards, highlights
    accentDark: '#E09340',
    accentMuted: '#2A1E0F',

    // Warning
    warning: '#F77F00',            // Orange — urgency
    warningDark: '#D96B00',
    warningMuted: '#2A1A00',

    // Success (Earned, not given)
    success: '#2ECC71',            // Rich green — victory
    successDark: '#27AE60',
    successMuted: '#0F2A18',

    // Info/Cool
    info: '#4EA8DE',               // Cool blue — hydration, info
    infoDark: '#3D8BC2',
    infoMuted: '#0F1A2A',

    // Text
    text: '#F5F5F5',               // Warm white (not harsh #FFF)
    textSecondary: '#B0B0B0',      // Secondary info
    textDim: '#6B6B6B',            // Muted/disabled
    textMuted: '#3A3A3A',          // Barely visible

    // Borders
    border: '#1E1E1E',             // Subtle border
    borderLight: '#2E2E2E',        // Lighter border
    borderActive: '#3A3A3A',       // Active/focused border

    // Danger
    danger: '#E63946',             // Same as primary
    dangerDark: '#C1272D',

    // Lock state
    locked: '#E63946',
    unlocked: '#2ECC71',

    // Pressure levels
    pressure: {
        P0: '#F5F5F5',
        P1: '#F4A261',
        P2: '#F77F00',
        P3: '#E63946',
        P4: '#C1272D',
    },

    // Macro colors (harmonized)
    protein: '#FF6B6B',            // Soft red
    carbs: '#F4A261',              // Warm amber
    fats: '#4ECDC4',               // Teal

    // Transparent overlays
    overlay: 'rgba(0, 0, 0, 0.85)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',

    // Gradients (for SVG/LinearGradient)
    gradients: {
        primary: ['#E63946', '#C1272D'],
        accent: ['#F4A261', '#E09340'],
        success: ['#2ECC71', '#27AE60'],
        info: ['#4EA8DE', '#3D8BC2'],
        dark: ['#111111', '#080808'],
    },
};

// ─── Design Tokens ────────────────────────────────────────────
export const radius = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    glow: (color) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    }),
};

export default colors;
