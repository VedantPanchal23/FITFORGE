/**
 * FORGEBORN THEME — COLORS
 * 
 * Dark. Aggressive. Military.
 * No soft colors. No friendly tones.
 * This is a forge, not a spa.
 */

export const colors = {
    // Core
    background: '#000000',      // Pure black - the void
    surface: '#0A0A0A',         // Near black - elevated surfaces
    surfaceLight: '#111111',    // Slightly lighter for cards

    // Primary
    primary: '#FF0000',         // Blood red - commitment, action
    primaryDark: '#CC0000',     // Darker red for pressed states
    primaryMuted: '#330000',    // Very dark red for backgrounds

    // Warning/Alert
    warning: '#FF4400',         // Orange-red - urgency
    warningDark: '#CC3300',     // Darker warning

    // Success (Earned, not given)
    success: '#00FF00',         // Neon green - victory
    successDark: '#00CC00',     // Darker success
    successMuted: '#003300',    // Very dark green accent

    // Text
    text: '#FFFFFF',            // Pure white - commands
    textSecondary: '#AAAAAA',   // Gray - secondary info
    textDim: '#666666',         // Dark gray - disabled/muted
    textMuted: '#333333',       // Very dark - barely visible

    // Borders
    border: '#1A1A1A',          // Subtle border
    borderLight: '#2A2A2A',     // Lighter border

    // Danger
    danger: '#FF0000',          // Same as primary - failure is visible

    // Lock state
    locked: '#FF0000',          // Red glow when locked
    unlocked: '#00FF00',        // Green when free

    // Pressure levels
    pressure: {
        P0: '#FFFFFF',            // Normal - white
        P1: '#FFFF00',            // Elevated - yellow
        P2: '#FF8800',            // High - orange
        P3: '#FF4400',            // Critical - orange-red
        P4: '#FF0000',            // Terminal - blood red
    },

    // Transparent overlays
    overlay: 'rgba(0, 0, 0, 0.8)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export default colors;
