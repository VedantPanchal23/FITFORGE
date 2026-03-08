import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

export const ScreenWrapper = ({
    children,
    style,
    contentContainerStyle,
    delay = 0,
    staggerScale = 1
}) => {
    return (
        <View style={[styles.container, style]}>
            {React.Children.map(children, (child, index) => {
                if (!React.isValidElement(child)) return child;
                return (
                    <AnimatableChild
                        key={index}
                        index={index}
                        delay={delay}
                        staggerScale={staggerScale}
                        style={contentContainerStyle}
                    >
                        {child}
                    </AnimatableChild>
                );
            })}
        </View>
    );
};

const AnimatableChild = ({ children, index, delay, staggerScale, style }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: delay + (index * 50 * staggerScale),
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: delay + (index * 50 * staggerScale),
                useNativeDriver: true,
            })
        ]).start();
    }, [delay, index, staggerScale]);

    return (
        <Animated.View style={[
            style,
            {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
            }
        ]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
