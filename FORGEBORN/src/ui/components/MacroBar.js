/**
 * FORGEBORN — MACRO BAR
 * 
 * Animated horizontal progress bar for macro tracking.
 * Shows label, current/target, and percentage.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, radius } from '../theme/colors';

const MacroBar = ({
    label = 'PROTEIN',
    current = 0,
    target = 100,
    unit = 'g',
    color = colors.protein,
    height = 10,
}) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;
    const progress = Math.min(1, current / target);

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: progress,
            duration: 600,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const width = animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.label, { color }]}>{label}</Text>
                <Text style={styles.values}>
                    {current}{unit} / {target}{unit}
                </Text>
            </View>
            <View style={[styles.barBg, { height, borderRadius: height / 2 }]}>
                <Animated.View style={[styles.barFill, {
                    width,
                    height,
                    borderRadius: height / 2,
                    backgroundColor: color,
                }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    values: {
        fontSize: 10,
        fontWeight: '500',
        color: colors.textSecondary,
        letterSpacing: 0.5,
    },
    barBg: {
        backgroundColor: colors.surfaceLight,
        overflow: 'hidden',
    },
    barFill: {},
});

export default MacroBar;
