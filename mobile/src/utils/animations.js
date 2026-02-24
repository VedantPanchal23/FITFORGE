/**
 * Animation Utilities using Reanimated
 * Provides smooth micro-animations for premium UX
 */

import { useAnimatedStyle, useSharedValue, withSpring, withTiming, withSequence, withDelay, interpolate, Extrapolate, runOnJS } from 'react-native-reanimated';
import { useEffect } from 'react';

// Spring configs for different feelings
export const SPRING_CONFIGS = {
    bouncy: { damping: 10, stiffness: 100 },
    smooth: { damping: 15, stiffness: 150 },
    snappy: { damping: 20, stiffness: 200 },
    gentle: { damping: 25, stiffness: 80 }
};

// Timing configs
export const TIMING_CONFIGS = {
    fast: { duration: 150 },
    normal: { duration: 250 },
    slow: { duration: 400 },
    verySlow: { duration: 600 }
};

/**
 * Fade in animation hook
 */
export function useFadeIn(delay = 0) {
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, TIMING_CONFIGS.normal));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    return animatedStyle;
}

/**
 * Slide up + fade animation hook
 */
export function useSlideUpFade(delay = 0, distance = 20) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(distance);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, TIMING_CONFIGS.normal));
        translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIGS.smooth));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }));

    return animatedStyle;
}

/**
 * Scale pop animation hook
 */
export function useScalePop(trigger = true) {
    const scale = useSharedValue(trigger ? 0.8 : 1);

    useEffect(() => {
        if (trigger) {
            scale.value = withSequence(
                withTiming(0.8, { duration: 0 }),
                withSpring(1, SPRING_CONFIGS.bouncy)
            );
        }
    }, [trigger]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return animatedStyle;
}

/**
 * Progress bar animation hook
 */
export function useProgressAnimation(targetValue, duration = 800) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(targetValue, { duration });
    }, [targetValue]);

    return progress;
}

/**
 * Staggered list animation - returns style for index
 */
export function useStaggeredEntry(index, delay = 50) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(15);

    useEffect(() => {
        const itemDelay = index * delay;
        opacity.value = withDelay(itemDelay, withTiming(1, TIMING_CONFIGS.normal));
        translateY.value = withDelay(itemDelay, withSpring(0, SPRING_CONFIGS.smooth));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }));

    return animatedStyle;
}

/**
 * Check mark animation (for completion states)
 */
export function useCheckAnimation(isChecked) {
    const scale = useSharedValue(isChecked ? 1 : 0);
    const rotate = useSharedValue(isChecked ? 0 : -45);

    useEffect(() => {
        if (isChecked) {
            scale.value = withSequence(
                withTiming(1.2, { duration: 100 }),
                withSpring(1, SPRING_CONFIGS.bouncy)
            );
            rotate.value = withSpring(0, SPRING_CONFIGS.snappy);
        } else {
            scale.value = withTiming(0, TIMING_CONFIGS.fast);
            rotate.value = withTiming(-45, TIMING_CONFIGS.fast);
        }
    }, [isChecked]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotate.value}deg` }
        ]
    }));

    return animatedStyle;
}

/**
 * Success celebration animation
 */
export function useCelebration() {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    const celebrate = () => {
        opacity.value = 1;
        scale.value = withSequence(
            withSpring(1.3, SPRING_CONFIGS.bouncy),
            withTiming(1, TIMING_CONFIGS.normal)
        );
        setTimeout(() => {
            opacity.value = withTiming(0, TIMING_CONFIGS.slow);
        }, 1500);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    return { animatedStyle, celebrate };
}

/**
 * Mode switch transition animation
 */
export function useModeTransition(currentMode) {
    const backgroundColor = useSharedValue(0);
    const scale = useSharedValue(1);

    const MODE_COLORS = {
        normal: 0,
        travel: 1,
        sick: 2,
        exam: 3,
        festival: 4
    };

    useEffect(() => {
        const modeIndex = MODE_COLORS[currentMode] || 0;
        backgroundColor.value = withTiming(modeIndex, TIMING_CONFIGS.slow);
        scale.value = withSequence(
            withTiming(0.98, { duration: 100 }),
            withSpring(1, SPRING_CONFIGS.gentle)
        );
    }, [currentMode]);

    return { backgroundColor, scale };
}

/**
 * Chart bar animation hook
 */
export function useChartBarAnimation(value, index, maxHeight = 100) {
    const height = useSharedValue(0);

    useEffect(() => {
        height.value = withDelay(
            index * 80,
            withSpring(value * maxHeight / 100, SPRING_CONFIGS.smooth)
        );
    }, [value]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value
    }));

    return animatedStyle;
}

/**
 * Score counter animation
 */
export function useScoreCounter(targetScore, duration = 1000) {
    const displayValue = useSharedValue(0);

    useEffect(() => {
        displayValue.value = withTiming(targetScore, { duration });
    }, [targetScore]);

    return displayValue;
}

export default {
    SPRING_CONFIGS,
    TIMING_CONFIGS,
    useFadeIn,
    useSlideUpFade,
    useScalePop,
    useProgressAnimation,
    useStaggeredEntry,
    useCheckAnimation,
    useCelebration,
    useModeTransition,
    useChartBarAnimation,
    useScoreCounter
};
