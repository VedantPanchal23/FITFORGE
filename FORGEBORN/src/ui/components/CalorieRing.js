/**
 * FORGEBORN — CALORIE RING (SVG)
 * 
 * Animated circular progress ring showing calories consumed vs target.
 * Built with react-native-svg for smooth rendering.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius } from '../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CalorieRing = ({
    consumed = 0,
    target = 2200,
    size = 130,
    strokeWidth = 8,
    color = colors.primary,
    label = 'CONSUMED',
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const progress = Math.min(1, consumed / target);

    const center = size / 2;
    const r = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * r;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    const ringColor = progress >= 1 ? colors.success : color;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background ring */}
                <Circle
                    cx={center}
                    cy={center}
                    r={r}
                    stroke={colors.surfaceLight}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress ring */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={r}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${center}, ${center}`}
                />
            </Svg>
            {/* Center text */}
            <View style={styles.centerText}>
                <Text style={styles.number}>{consumed}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerText: {
        position: 'absolute',
        alignItems: 'center',
    },
    number: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.text,
    },
    label: {
        fontSize: 8,
        fontWeight: '600',
        color: colors.textDim,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});

export default CalorieRing;
