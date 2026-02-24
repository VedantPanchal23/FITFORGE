/**
 * FORGEBORN — LOCK SCREEN
 * 
 * When an obligation is BOUND (due), this screen takes over.
 * There is NO escape.
 * 
 * The user sees:
 * - Obligation name
 * - Units remaining
 * - Time remaining
 * - EXECUTE button
 * 
 * Nothing else. No navigation. No menu. No escape.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Vibration,
    BackHandler,
} from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useObligationStore from '../../store/obligationStore';

const LockScreen = () => {
    const [timeRemaining, setTimeRemaining] = useState('--:--:--');
    const [pressCount, setPressCount] = useState(0);

    const getLockedObligation = useObligationStore((s) => s.getLockedObligation);
    const logExecution = useObligationStore((s) => s.logExecution);
    const logEscapeAttempt = useObligationStore((s) => s.logEscapeAttempt);
    const activeLock = useObligationStore((s) => s.activeLock);

    const obligation = getLockedObligation();

    // Pulse animation for the execute button
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    // Block back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            logEscapeAttempt();
            Vibration.vibrate([0, 100, 50, 100, 50, 100]);
            return true; // Prevent default
        });

        return () => backHandler.remove();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!obligation) return;

        const updateTimer = () => {
            const now = Date.now();
            const windowEnd = obligation.scheduledAt + obligation.windowDuration;
            const remaining = windowEnd - now;

            if (remaining <= 0) {
                setTimeRemaining('00:00:00');
                return;
            }

            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            setTimeRemaining(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [obligation]);

    // Pulse animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.6,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleExecute = () => {
        if (!obligation) return;

        Vibration.vibrate(50);
        setPressCount(prev => prev + 1);

        // Log 1 unit of execution
        logExecution(obligation.id, 1);
    };

    if (!obligation) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>NO ACTIVE OBLIGATION</Text>
            </View>
        );
    }

    const unitsRemaining = obligation.unitsRequired - obligation.unitsCompleted;
    const progress = obligation.unitsCompleted / obligation.unitsRequired;

    return (
        <View style={styles.container}>
            {/* Background glow */}
            <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

            {/* Lock indicator */}
            <View style={styles.lockIndicator}>
                <Text style={styles.lockText}>🔒 LOCKED</Text>
            </View>

            {/* Obligation name */}
            <Text style={styles.obligationName}>{obligation.name}</Text>
            <Text style={styles.obligationType}>{obligation.type}</Text>

            {/* Progress */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>PROGRESS</Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    {obligation.unitsCompleted} / {obligation.unitsRequired}
                </Text>
            </View>

            {/* Units remaining - BIG */}
            <View style={styles.unitsContainer}>
                <Text style={styles.unitsRemaining}>{unitsRemaining}</Text>
                <Text style={styles.unitsLabel}>UNITS REMAINING</Text>
            </View>

            {/* Time remaining */}
            <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>TIME UNTIL FAILURE</Text>
                <Text style={styles.timer}>{timeRemaining}</Text>
            </View>

            {/* Execute button */}
            <Animated.View style={[styles.executeContainer, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                    style={styles.executeButton}
                    onPress={handleExecute}
                    activeOpacity={0.7}
                >
                    <Text style={styles.executeText}>EXECUTE</Text>
                    <Text style={styles.executeSubtext}>+1 UNIT</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Escape attempts warning */}
            {activeLock && activeLock.escapeAttempts > 0 && (
                <Text style={styles.escapeWarning}>
                    ESCAPE ATTEMPTS: {activeLock.escapeAttempts}
                </Text>
            )}

            {/* Bottom creed */}
            <Text style={styles.creed}>THERE IS NO ESCAPE</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: screen.paddingHorizontal,
    },

    glow: {
        position: 'absolute',
        width: '150%',
        height: '150%',
        backgroundColor: colors.primary,
        borderRadius: 1000,
    },

    lockIndicator: {
        position: 'absolute',
        top: 60,
        backgroundColor: colors.primaryMuted,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderWidth: 1,
        borderColor: colors.primary,
    },

    lockText: {
        ...textStyles.label,
        color: colors.primary,
    },

    obligationName: {
        ...textStyles.h1,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing[1],
    },

    obligationType: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[8],
    },

    progressContainer: {
        width: '100%',
        marginBottom: spacing[6],
    },

    progressLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[2],
    },

    progressBar: {
        height: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing[2],
    },

    progressFill: {
        height: '100%',
        backgroundColor: colors.success,
    },

    progressText: {
        ...textStyles.label,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    unitsContainer: {
        alignItems: 'center',
        marginBottom: spacing[6],
    },

    unitsRemaining: {
        fontSize: 120,
        fontWeight: '900',
        color: colors.primary,
        lineHeight: 130,
    },

    unitsLabel: {
        ...textStyles.label,
        color: colors.textDim,
    },

    timerContainer: {
        alignItems: 'center',
        marginBottom: spacing[8],
    },

    timerLabel: {
        ...textStyles.caption,
        color: colors.warning,
        marginBottom: spacing[1],
    },

    timer: {
        ...textStyles.h2,
        color: colors.warning,
        fontFamily: 'monospace',
    },

    executeContainer: {
        marginBottom: spacing[6],
    },

    executeButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing[5],
        paddingHorizontal: spacing[12],
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
    },

    executeText: {
        ...textStyles.button,
        color: colors.text,
        fontSize: 24,
    },

    executeSubtext: {
        ...textStyles.caption,
        color: colors.text,
        opacity: 0.8,
        marginTop: spacing[1],
    },

    escapeWarning: {
        ...textStyles.caption,
        color: colors.danger,
        marginBottom: spacing[4],
    },

    creed: {
        position: 'absolute',
        bottom: 40,
        ...textStyles.caption,
        color: colors.textDim,
    },

    errorText: {
        ...textStyles.h2,
        color: colors.textDim,
    },
});

export default LockScreen;
