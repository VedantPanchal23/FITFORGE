import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography, shadows } from '../theme';

export const Button = ({
    title,
    onPress,
    variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
    size = 'md', // 'sm', 'md', 'lg'
    icon,
    loading = false,
    disabled = false,
    style,
    textStyle,
    hapticFeedback = true,
}) => {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';
    const isDanger = variant === 'danger';

    const scale = useRef(new Animated.Value(1)).current;

    const getBackgroundColor = () => {
        if (disabled) return colors.border; // Lighter disabled color for light theme
        if (isDanger) return colors.danger;
        if (isPrimary) return colors.primary;
        if (isSecondary) return colors.primaryMuted;
        return 'transparent';
    };

    const getTextColor = () => {
        if (disabled) return colors.textDim;
        if (isDanger) return colors.textInverse;
        if (isPrimary) return colors.textInverse;
        if (isSecondary) return colors.primary;
        if (isOutline) return colors.text;
        if (isGhost) return colors.text;
        return colors.textInverse;
    };

    const getHeight = () => {
        if (size === 'sm') return 40; // Slightly taller touch targets for modern UI
        if (size === 'lg') return 60;
        return 52; // md, taller for better hit zones
    };

    const handlePressIn = () => {
        if (disabled || loading) return;
        if (hapticFeedback) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 30,
            bounciness: 12,
        }).start();
    };

    const handlePressOut = () => {
        if (disabled || loading) return;
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 12,
        }).start();
    };

    const handlePress = () => {
        if (disabled || loading) return;
        if (hapticFeedback) {
            Haptics.impactAsync(
                isPrimary || isDanger ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
            );
        }
        if (onPress) onPress();
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.9}
        >
            <Animated.View
                style={[
                    styles.button,
                    {
                        backgroundColor: getBackgroundColor(),
                        height: getHeight(),
                        borderWidth: isOutline ? 1 : 0,
                        borderColor: isOutline ? colors.border : 'transparent',
                        opacity: disabled ? 0.7 : 1,
                        transform: [{ scale }]
                    },
                    (isPrimary || isDanger) && !disabled ? styles.buttonShadow : {},
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={getTextColor()} />
                ) : (
                    <View style={styles.content}>
                        {icon && <View style={styles.iconContainer}>{icon}</View>}
                        <Text
                            style={[
                                typography.textStyles.buttonText,
                                {
                                    color: getTextColor(),
                                    marginLeft: icon ? spacing[2] : 0,
                                    fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
                                    fontWeight: '700'
                                },
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                    </View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: spacing[6],
    },
    buttonShadow: {
        shadowColor: colors.primary, // Tinted shadow
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2, // Stronger but softer shadow
        shadowRadius: 16,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: spacing[2],
    },
});
