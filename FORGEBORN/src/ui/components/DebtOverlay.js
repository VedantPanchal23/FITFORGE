import React, { useEffect } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import useCommitmentStore from '../../store/commitmentStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function DebtOverlay() {
    const debtUnits = useCommitmentStore((s) => s.debtUnits);
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: debtUnits > 0 ? 1 : 0,
            duration: 1500, // Slow, menacing fade
            useNativeDriver: true,
        }).start();
    }, [debtUnits]);

    return (
        <Animated.View pointerEvents="none" style={[styles.container, { opacity: opacityAnim }]}>
            {/* Global desaturation effect (pseudo-grayscale) via dark contrast layer */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />

            {/* Blood moon vignette (Debt Protocol visual shift) */}
            <LinearGradient
                colors={['rgba(220, 38, 38, 0.35)', 'transparent']}
                style={styles.topVignette}
            />
            <LinearGradient
                colors={['transparent', 'rgba(220, 38, 38, 0.35)']}
                style={styles.bottomVignette}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999, // Floating above navigation but below Modals
    },
    topVignette: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    bottomVignette: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    }
});
