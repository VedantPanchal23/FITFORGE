import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../theme';

export const Card = ({ children, style, onPress, noPadding = false, ...props }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!onPress) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        if (!onPress) return;
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const handlePress = () => {
        if (!onPress) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    const cardContent = (
        <Animated.View style={[
            styles.card,
            noPadding && styles.noPadding,
            style,
            onPress && { transform: [{ scale }] }
        ]}>
            {children}
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                activeOpacity={0.9}
                {...props}
            >
                {cardContent}
            </TouchableOpacity>
        );
    }

    return cardContent;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing[5],
        marginBottom: spacing[4],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.borderLight + '30',
    },
    noPadding: {
        padding: 0,
    }
});
