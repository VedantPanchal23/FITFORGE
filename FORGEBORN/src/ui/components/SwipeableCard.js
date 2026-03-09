import React, { useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function SwipeableCard({
    children,
    onSwipeRight,
    onSwipeLeft,
    rightActionColor = colors.success,
    rightActionIcon = 'checkmark',
    leftActionColor = colors.danger,
    leftActionIcon = 'trash',
    style
}) {
    const swipeableRef = useRef(null);

    const renderLeftActions = (progress, dragX) => {
        if (!onSwipeLeft) return null;
        const scale = dragX.interpolate({
            inputRange: [0, 50, 100],
            outputRange: [0, 0.5, 1],
            extrapolate: 'clamp',
        });
        const opacity = dragX.interpolate({
            inputRange: [0, 20, 50],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp',
        });
        return (
            <View style={[styles.actionContainer, { backgroundColor: leftActionColor }]}>
                <Animated.View style={{ transform: [{ scale }], opacity }}>
                    <Ionicons name={leftActionIcon} size={28} color={colors.surface} />
                </Animated.View>
            </View>
        );
    };

    const renderRightActions = (progress, dragX) => {
        if (!onSwipeRight) return null;
        const scale = dragX.interpolate({
            inputRange: [-100, -50, 0],
            outputRange: [1, 0.5, 0],
            extrapolate: 'clamp',
        });
        const opacity = dragX.interpolate({
            inputRange: [-50, -20, 0],
            outputRange: [1, 0, 0],
            extrapolate: 'clamp',
        });
        return (
            <View style={[styles.rightActionContainer, { backgroundColor: rightActionColor }]}>
                <Animated.View style={{ transform: [{ scale }], opacity }}>
                    <Ionicons name={rightActionIcon} size={28} color={colors.surface} />
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={style}>
            <Swipeable
                ref={swipeableRef}
                friction={1.5}
                leftThreshold={50}
                rightThreshold={50}
                onSwipeableWillOpen={(direction) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }}
                onSwipeableOpen={(direction) => {
                    if (direction === 'left' && onSwipeLeft) {
                        onSwipeLeft();
                    } else if (direction === 'right' && onSwipeRight) {
                        onSwipeRight();
                    }
                    swipeableRef.current?.close();
                }}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                containerStyle={styles.swipeableContainer}
            >
                {children}
            </Swipeable>
        </View>
    );
}

const styles = StyleSheet.create({
    swipeableContainer: {
        width: '100%',
    },
    actionContainer: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightActionContainer: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
