import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({
    score = 0,
    size = 120,
    strokeWidth = 12,
    label = "LIFE SCORE"
}) => {
    const { theme } = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Animation
    const progress = useSharedValue(0);

    useEffect(() => {
        // Animate to score (0 to 1)
        progress.value = withTiming(score / 100, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });
    }, [score]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference * (1 - progress.value);
        return {
            strokeDashoffset,
        };
    });

    // Color logic based on score
    const getScoreColor = () => {
        if (score >= 80) return theme.success;
        if (score >= 50) return theme.warning;
        return theme.error;
    };

    const color = getScoreColor();

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={[styles.innerContent, { width: size, height: size }]}>
                <Text style={[styles.scoreValue, { color: theme.text }]}>{score}</Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>{label}</Text>
            </View>

            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    {/* Background Circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={theme.cardBorder}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    innerContent: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 36
    },
    scoreLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginTop: 4,
        opacity: 0.8
    }
});

export default ProgressRing;
