import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Vibration,
    BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Typography, Button, ProgressBar } from '../components';
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
    const glowAnim = useRef(new Animated.Value(0.1)).current;

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
                    toValue: 0.25,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.1,
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
                <Typography variant="title1" color={colors.textDim}>NO ACTIVE OBLIGATION</Typography>
            </View>
        );
    }

    const unitsRemaining = obligation.unitsRequired - obligation.unitsCompleted;
    const progress = obligation.unitsCompleted / obligation.unitsRequired;

    return (
        <View style={styles.container}>
            {/* Background glow (Red for danger/urgency) */}
            <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

            {/* Lock indicator */}
            <View style={styles.lockIndicator}>
                <Ionicons name="lock-closed" size={16} color={colors.danger} />
                <Typography variant="body" color={colors.danger} style={{ fontWeight: 'bold', marginLeft: 6 }}>
                    LOCKED
                </Typography>
            </View>

            {/* Obligation name */}
            <Typography variant="largeTitle" style={{ textAlign: 'center', marginBottom: spacing[2], textTransform: 'uppercase' }}>
                {obligation.name}
            </Typography>
            <Typography variant="subheadline" color={colors.textDim} style={{ marginBottom: spacing[8], textTransform: 'uppercase', letterSpacing: 1 }}>
                {obligation.type}
            </Typography>

            {/* Progress */}
            <View style={styles.progressContainer}>
                <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing[2], letterSpacing: 1 }}>
                    PROGRESS
                </Typography>
                <ProgressBar progress={progress} color={colors.danger} />
                <Typography variant="headline" style={{ textAlign: 'center', marginTop: spacing[3] }}>
                    {obligation.unitsCompleted} / {obligation.unitsRequired}
                </Typography>
            </View>

            {/* Units remaining - BIG */}
            <View style={styles.unitsContainer}>
                <Typography variant="largeTitle" style={{ fontSize: 130, lineHeight: 140, fontWeight: '900', color: colors.danger }}>
                    {unitsRemaining}
                </Typography>
                <Typography variant="label" color={colors.textSecondary} style={{ letterSpacing: 2 }}>
                    UNITS REMAINING
                </Typography>
            </View>

            {/* Time remaining */}
            <View style={styles.timerContainer}>
                <Typography variant="caption" color={colors.danger} style={{ marginBottom: spacing[1], letterSpacing: 1 }}>
                    TIME UNTIL FAILURE
                </Typography>
                <Typography variant="title1" color={colors.danger} style={{ fontFamily: 'monospace', letterSpacing: 2 }}>
                    {timeRemaining}
                </Typography>
            </View>

            {/* Execute button */}
            <Animated.View style={[styles.executeContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Button
                    title="EXECUTE"
                    onPress={handleExecute}
                    style={{
                        backgroundColor: colors.danger,
                        paddingVertical: spacing[5],
                        paddingHorizontal: spacing[12],
                        borderRadius: radius.full
                    }}
                    textStyle={{ fontSize: 28, letterSpacing: 2, fontWeight: '900', color: colors.textInverse }}
                />
                <Typography variant="caption" style={{ textAlign: 'center', marginTop: spacing[3], color: colors.danger, fontWeight: 'bold' }}>
                    +1 UNIT
                </Typography>
            </Animated.View>

            {/* Escape attempts warning */}
            {activeLock && activeLock.escapeAttempts > 0 && (
                <Typography variant="caption" color={colors.danger} style={{ marginBottom: spacing[4], fontWeight: 'bold' }}>
                    ESCAPE ATTEMPTS: {activeLock.escapeAttempts}
                </Typography>
            )}

            {/* Bottom creed */}
            <Typography variant="caption" color={colors.textDim} style={{ position: 'absolute', bottom: 40, letterSpacing: 3 }}>
                THERE IS NO ESCAPE
            </Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing[6],
    },

    glow: {
        position: 'absolute',
        width: '150%',
        height: '150%',
        backgroundColor: colors.danger,
        borderRadius: 1000,
    },

    lockIndicator: {
        position: 'absolute',
        top: 60,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderRadius: radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },

    progressContainer: {
        width: '100%',
        marginBottom: spacing[6],
        alignItems: 'center',
    },

    unitsContainer: {
        alignItems: 'center',
        marginBottom: spacing[6],
    },

    timerContainer: {
        alignItems: 'center',
        marginBottom: spacing[10],
    },

    executeContainer: {
        marginBottom: spacing[6],
    },
});

export default LockScreen;
