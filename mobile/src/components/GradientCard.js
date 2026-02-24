import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme';

/**
 * GradientCard
 * 
 * A premium card component that adapts to Light/Dark modes.
 * 
 * Features:
 * - Glassmorphism support
 * - Gradient backgrounds (optional)
 * - Premium borders
 * - Elevated shadows in Light mode
 */
const GradientCard = ({
    children,
    onPress,
    style,
    variant = 'glass', // 'glass', 'solid', 'primary', 'elevated'
    gradientColors,
    disabled = false
}) => {
    const { theme } = useTheme();
    const isDark = theme.name === 'dark';

    // Base Container Style
    const containerStyle = [
        styles.card,
        { borderRadius: radius.lg },
        style
    ];

    // Determine Background & Border
    let bgColors = [theme.card, theme.card];
    let borderColor = theme.cardBorder;
    let borderWidth = 1;
    let shadowStyle = {};

    if (variant === 'glass') {
        bgColors = isDark
            ? ['rgba(24, 24, 27, 0.7)', 'rgba(24, 24, 27, 0.4)'] // Dark Glass
            : ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.5)']; // Light Frost

        borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255, 0.6)';
    } else if (variant === 'primary') {
        bgColors = [theme.primary, theme.primaryLight];
        borderColor = 'transparent';
        borderWidth = 0;
    } else if (variant === 'elevated') {
        bgColors = [theme.card, theme.card];
        // Add shadow only in light mode mostly, or subtle in dark
        shadowStyle = isDark ? {} : styles.lightShadow;
        borderColor = theme.cardBorder;
    }

    // Override if gradientColors provided
    if (gradientColors) {
        bgColors = gradientColors;
        borderWidth = 0;
    }

    const Content = (
        <LinearGradient
            colors={bgColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.gradient,
                {
                    borderColor,
                    borderWidth,
                    borderRadius: radius.lg
                },
                shadowStyle
            ]}
        >
            {children}
        </LinearGradient>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={containerStyle}
                disabled={disabled}
            >
                {Content}
            </TouchableOpacity>
        );
    }

    return <View style={containerStyle}>{Content}</View>;
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
        // Overflow visible for shadows to work if needed, but usually hidden for inner overflow
        // We'll trust the wrapper to handle layout
    },
    gradient: {
        padding: spacing.md,
        width: '100%',
    },
    lightShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    }
});

export default GradientCard;
