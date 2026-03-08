/**
 * FORGEBORN THEME — LIGHT THEME OVERHAUL
 * 
 * Clean. Professional. Minimal.
 * Inspired by: Apple Fitness, Nike Training Club, Real-world professional tools.
 * Focuses on typography hierarchy, negative space, and a pure, distraction-free environment.
 */

export const colors = {
    // Core Backgrounds
    background: '#F9FAFB',         // Light off-white for the main app background
    surface: '#FFFFFF',            // Pure white for cards and floating elements
    surfaceHighlight: '#F3F4F6',   // Hover or pressed state for surfaces

    // Primary Accents
    primary: '#000000',            // Pure black for primary buttons, active tabs (sleek, serious)
    primaryLight: '#374151',       // Softer black for secondary active states
    primaryMuted: '#E5E7EB',       // Subtle tint/background for primary elements

    // Secondary / Accent Colors (Used extremely sparingly for specific contexts)
    accent: '#3B82F6',             // Professional iOS Blue (e.g., links, secondary calls to action)

    // Status Colors (Subdued versions, not harsh neons)
    warning: '#F59E0B',            // Amber — warnings, mid-progress
    danger: '#EF4444',             // Red — destructive actions, failures (used sparingly)
    success: '#10B981',            // Emerald Green — completion, success
    info: '#3B82F6',               // Blue — informational

    // Typography (High Contrast to Low Contrast)
    text: '#111827',               // Almost black for stark readability (Headings, primary data)
    textSecondary: '#4B5563',      // Medium gray for body copy, secondary info
    textDim: '#9CA3AF',            // Light gray for subtle labels, disabled states, timestamps
    textMuted: '#D1D5DB',          // Extremely light gray (placeholders, dividers)
    textInverse: '#FFFFFF',        // White text on primary/black backgrounds

    // Borders & Dividers
    border: '#E5E7EB',             // Soft gray for dividing lines and subtle card boundaries
    borderLight: '#F3F4F6',        // Very subtle border for deeply nested items
    borderActive: '#D1D5DB',       // Slightly darker border for focus/active states

    // Transparent Overlays
    overlay: 'rgba(0, 0, 0, 0.4)',      // Modal backgrounds
    overlayLight: 'rgba(0, 0, 0, 0.1)', // Very subtle overlay
};

// ─── Design Tokens ────────────────────────────────────────────

// Extremely refined, modern rounding
export const radius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999, // Pills
};

// Professional, soft, diffuse shadows (not harsh drops)
export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    // Used for active buttons or small floating elements
    sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    // Standard card shadow (very diffuse, mostly downwards)
    md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    // Large overlays, modals
    lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
    },
};

export default colors;
