import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, radius } from '../theme';

export const ProgressBar = ({
    progress = 0, // 0 to 1
    color = colors.success,
    backgroundColor = colors.borderLight + '50', // Softer track
    height = 8,
    style,
}) => {
    const safeProgress = Math.min(Math.max(progress, 0), 1);
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedWidth, {
            toValue: safeProgress * 100, // percentage 0-100
            useNativeDriver: false, // width cannot use native driver
            bounciness: 4,
            speed: 12,
        }).start();
    }, [safeProgress]);

    return (
        <View style={[styles.container, { backgroundColor, height }, style]}>
            <Animated.View
                style={[
                    styles.fill,
                    {
                        backgroundColor: color,
                        width: animatedWidth.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%']
                        }),
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: radius.full,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: radius.full,
    },
});
