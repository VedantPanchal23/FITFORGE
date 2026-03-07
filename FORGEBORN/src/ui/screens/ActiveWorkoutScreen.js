/**
 * FORGEBORN — ACTIVE WORKOUT SCREEN
 * 
 * Live workout mode inspired by Hevy + Strong.
 * Features:
 * - Table-style set logging (SET | PREVIOUS | KG | REPS | ✓)
 * - Pre-filled values from target reps & previous workouts
 * - All sets editable at once (not sequential)
 * - Auto rest timer between sets
 * - Progress bar + exercise navigation
 * - PR notification
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    TextInput,
    Vibration,
    Animated,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useWorkoutStore from '../../store/workoutStore';

const ActiveWorkoutScreen = ({ navigation }) => {
    const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
    const logSet = useWorkoutStore((s) => s.logSet);
    const startRest = useWorkoutStore((s) => s.startRest);
    const endRest = useWorkoutStore((s) => s.endRest);
    const nextExercise = useWorkoutStore((s) => s.nextExercise);
    const prevExercise = useWorkoutStore((s) => s.prevExercise);
    const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
    const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
    const getLastWorkoutSets = useWorkoutStore((s) => s.getLastWorkoutSets);
    const personalRecords = useWorkoutStore((s) => s.personalRecords);

    const [elapsedTime, setElapsedTime] = useState(0);
    const [restTimeLeft, setRestTimeLeft] = useState(0);
    const [setInputs, setSetInputs] = useState({});
    const [prNotification, setPrNotification] = useState(null);
    const prFadeAnim = useRef(new Animated.Value(0)).current;

    // Elapsed time counter
    useEffect(() => {
        if (!activeWorkout) return;
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - activeWorkout.startedAt) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeWorkout?.startedAt]);

    // Rest timer
    useEffect(() => {
        if (!activeWorkout?.isResting || !activeWorkout?.restEndTime) {
            setRestTimeLeft(0);
            return;
        }

        const interval = setInterval(() => {
            const left = Math.max(0, Math.ceil((activeWorkout.restEndTime - Date.now()) / 1000));
            setRestTimeLeft(left);
            if (left <= 0) {
                endRest();
                Vibration.vibrate([0, 200, 100, 200]);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [activeWorkout?.isResting, activeWorkout?.restEndTime]);

    // Initialize per-set inputs when exercise changes
    useEffect(() => {
        if (!activeWorkout) return;
        const currentExercise = activeWorkout.exercises[activeWorkout.currentExerciseIndex];
        const currentSets = activeWorkout.sets[currentExercise?.id] || [];
        const previousSets = getLastWorkoutSets(currentExercise?.id);

        // Parse target reps (e.g. "8-12" → 10, "10" → 10)
        const targetReps = currentExercise?.reps || currentExercise?.defaultReps || '10';
        const parsedReps = typeof targetReps === 'string' && targetReps.includes('-')
            ? Math.round((parseInt(targetReps.split('-')[0]) + parseInt(targetReps.split('-')[1])) / 2)
            : parseInt(targetReps) || 10;

        const newInputs = {};
        currentSets.forEach((s, i) => {
            if (s.completed) {
                newInputs[i] = { weight: String(s.weight), reps: String(s.reps) };
            } else {
                // Pre-fill from previous workout or target
                const prev = previousSets?.[i];
                newInputs[i] = {
                    weight: prev ? String(prev.weight) : '',
                    reps: prev ? String(prev.reps) : String(parsedReps),
                };
            }
        });
        setSetInputs(newInputs);
    }, [activeWorkout?.currentExerciseIndex]);

    if (!activeWorkout) return null;

    const currentExercise = activeWorkout.exercises[activeWorkout.currentExerciseIndex];
    const currentSets = activeWorkout.sets[currentExercise?.id] || [];
    const completedSets = currentSets.filter(s => s.completed).length;
    const totalExercises = activeWorkout.exercises.length;
    const progress = ((activeWorkout.currentExerciseIndex) / totalExercises) * 100;

    // Calculate total completed sets across all exercises
    let totalCompletedSets = 0;
    let totalAllSets = 0;
    Object.values(activeWorkout.sets).forEach(setArr => {
        totalAllSets += setArr.length;
        totalCompletedSets += setArr.filter(s => s.completed).length;
    });

    // Get previous workout data for this exercise
    const previousSets = getLastWorkoutSets(currentExercise?.id);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const updateSetInput = (setIndex, field, value) => {
        setSetInputs(prev => ({
            ...prev,
            [setIndex]: { ...prev[setIndex], [field]: value },
        }));
    };

    const handleLogSet = (setIndex) => {
        const input = setInputs[setIndex];
        if (!input) return;

        const weight = input.weight || '0';
        const reps = input.reps || '0';

        if (parseInt(reps) <= 0) return;

        // Check for PR before logging
        const volume = (parseFloat(weight) || 0) * (parseInt(reps) || 0);
        const prevPR = personalRecords?.[currentExercise.id];
        const isPR = volume > 0 && (!prevPR || volume > (prevPR.maxVolume || 0));

        logSet(currentExercise.id, setIndex, weight, reps);
        Vibration.vibrate(isPR ? [0, 50, 50, 50, 50, 100, 50, 200] : 50);

        // Show PR notification
        if (isPR) {
            setPrNotification(currentExercise.name);
            prFadeAnim.setValue(0);
            Animated.sequence([
                Animated.timing(prFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(2500),
                Animated.timing(prFadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start(() => setPrNotification(null));
        }

        // Start rest timer after completing a set (if more sets remain)
        const nextUncompleted = currentSets.findIndex((s, i) => i > setIndex && !s.completed);
        if (nextUncompleted !== -1) {
            startRest(currentExercise.rest || 60);
        }
    };

    // Get next exercise for preview
    const nextExerciseData = activeWorkout.currentExerciseIndex < totalExercises - 1
        ? activeWorkout.exercises[activeWorkout.currentExerciseIndex + 1]
        : null;

    const handleFinish = () => {
        Alert.alert(
            'FINISH WORKOUT',
            `Complete ${activeWorkout.dayName}?\n\n${totalCompletedSets}/${totalAllSets} sets done\nTime: ${formatTime(elapsedTime)}`,
            [
                { text: 'KEEP GOING', style: 'cancel' },
                {
                    text: 'FINISH', style: 'destructive',
                    onPress: () => {
                        const record = finishWorkout();
                        Vibration.vibrate([0, 50, 100, 50, 100, 50, 200]);
                        navigation.replace('WorkoutComplete', {
                            duration: elapsedTime,
                            setsCompleted: totalCompletedSets,
                            totalSets: totalAllSets,
                            totalVolume: record?.totalVolume || 0,
                            exercisesDone: record?.exercises?.length || 0,
                            dayName: record?.dayName || activeWorkout.dayName,
                        });
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        Alert.alert(
            'QUIT WORKOUT?',
            'All progress will be lost.',
            [
                { text: 'STAY', style: 'cancel' },
                {
                    text: 'QUIT', style: 'destructive',
                    onPress: () => {
                        cancelWorkout();
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                    <Ionicons name="close" size={22} color={colors.textDim} />
                </TouchableOpacity>
                <View style={styles.timerBox}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                </View>
                <TouchableOpacity onPress={handleFinish} style={styles.finishBtn}>
                    <Ionicons name="checkmark-done" size={16} color="#000" />
                    <Text style={styles.finishBtnText}>FINISH</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {/* PR Notification Banner */}
            {prNotification && (
                <Animated.View style={[styles.prBanner, { opacity: prFadeAnim }]}>
                    <Ionicons name="trophy" size={18} color="#FFD700" />
                    <Text style={styles.prBannerText}>NEW PERSONAL RECORD!</Text>
                    <Ionicons name="trophy" size={18} color="#FFD700" />
                </Animated.View>
            )}

            {/* Exercise Counter */}
            <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseCounter}>
                    EXERCISE {activeWorkout.currentExerciseIndex + 1} OF {totalExercises}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Current Exercise Info */}
                <View style={styles.exerciseCard}>
                    <Text style={styles.exerciseName}>{currentExercise.name}</Text>
                    <View style={styles.exerciseMeta}>
                        <View style={styles.metaBadge}>
                            <Text style={styles.metaBadgeText}>{currentExercise.muscle}</Text>
                        </View>
                        <View style={[styles.metaBadge, { borderColor: colors.textDim }]}>
                            <Text style={[styles.metaBadgeText, { color: colors.textDim }]}>
                                {currentExercise.equipment}
                            </Text>
                        </View>
                    </View>
                    {currentExercise.instructions && (
                        <Text style={styles.instructions}>{currentExercise.instructions}</Text>
                    )}
                </View>

                {/* Rest Timer */}
                {activeWorkout.isResting && restTimeLeft > 0 && (
                    <View style={styles.restCard}>
                        <View style={styles.restTop}>
                            <View style={styles.restHeader}>
                                <Ionicons name="timer-outline" size={18} color={colors.primary} />
                                <Text style={styles.restLabel}>REST</Text>
                            </View>
                            <Text style={styles.restTimer}>{restTimeLeft}s</Text>
                            <TouchableOpacity
                                style={styles.skipRestBtn}
                                onPress={() => endRest()}
                            >
                                <Text style={styles.skipRestText}>SKIP</Text>
                                <Ionicons name="play-forward" size={14} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {nextExerciseData && (
                            <View style={styles.nextPreview}>
                                <Text style={styles.nextLabel}>UP NEXT</Text>
                                <Text style={styles.nextName}>{nextExerciseData.name}</Text>
                                <Text style={styles.nextMuscle}>
                                    {nextExerciseData.muscle} • {nextExerciseData.sets || nextExerciseData.defaultSets} sets × {nextExerciseData.reps || nextExerciseData.defaultReps}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* ─── SET TABLE (Hevy/Strong style) ─── */}
                <View style={styles.setTable}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.setCellSmall]}>SET</Text>
                        <Text style={[styles.headerCell, styles.prevCell]}>PREVIOUS</Text>
                        <Text style={[styles.headerCell, styles.inputCell]}>KG</Text>
                        <Text style={[styles.headerCell, styles.inputCell]}>REPS</Text>
                        <View style={styles.checkCell} />
                    </View>

                    {/* Set Rows */}
                    {currentSets.map((s, index) => {
                        const prev = previousSets?.[index];
                        const input = setInputs[index] || { weight: '', reps: '' };

                        return (
                            <View
                                key={index}
                                style={[
                                    styles.setRow,
                                    s.completed && styles.setRowDone,
                                ]}
                            >
                                {/* Set Number */}
                                <View style={[styles.setCellSmall, styles.setNumBox]}>
                                    <Text style={[
                                        styles.setNumText,
                                        s.completed && { color: colors.success }
                                    ]}>
                                        {index + 1}
                                    </Text>
                                </View>

                                {/* Previous */}
                                <View style={styles.prevCell}>
                                    <Text style={styles.prevText}>
                                        {prev
                                            ? `${prev.weight > 0 ? prev.weight + ' kg' : 'BW'} × ${prev.reps}`
                                            : '—'
                                        }
                                    </Text>
                                </View>

                                {/* Weight Input */}
                                <View style={styles.inputCell}>
                                    {s.completed ? (
                                        <Text style={styles.completedValue}>
                                            {s.weight > 0 ? s.weight : 'BW'}
                                        </Text>
                                    ) : (
                                        <TextInput
                                            style={styles.input}
                                            value={input.weight}
                                            onChangeText={(v) => updateSetInput(index, 'weight', v)}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={colors.textMuted}
                                            selectTextOnFocus
                                        />
                                    )}
                                </View>

                                {/* Reps Input */}
                                <View style={styles.inputCell}>
                                    {s.completed ? (
                                        <Text style={styles.completedValue}>{s.reps}</Text>
                                    ) : (
                                        <TextInput
                                            style={styles.input}
                                            value={input.reps}
                                            onChangeText={(v) => updateSetInput(index, 'reps', v)}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={colors.textMuted}
                                            selectTextOnFocus
                                        />
                                    )}
                                </View>

                                {/* Check Button */}
                                <View style={styles.checkCell}>
                                    {s.completed ? (
                                        <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleLogSet(index)}
                                            style={styles.checkBtn}
                                            activeOpacity={0.6}
                                        >
                                            <Ionicons name="checkmark-circle-outline" size={28} color={colors.textDim} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Target info */}
                <View style={styles.targetInfo}>
                    <View style={styles.targetRow}>
                        <Ionicons name="information-circle-outline" size={14} color={colors.textDim} />
                        <Text style={styles.targetText}>
                            TARGET: {currentExercise.sets || currentExercise.defaultSets} sets × {currentExercise.reps || currentExercise.defaultReps} reps
                        </Text>
                    </View>
                    <View style={styles.targetRow}>
                        <Ionicons name="timer-outline" size={14} color={colors.textDim} />
                        <Text style={styles.targetText}>
                            REST: {currentExercise.rest || 60}s between sets
                        </Text>
                    </View>
                    {currentExercise.tips && (
                        <View style={styles.targetRow}>
                            <Ionicons name="bulb-outline" size={14} color={colors.warning} />
                            <Text style={[styles.targetText, { color: colors.warning }]}>
                                {currentExercise.tips}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={[styles.navBtn, activeWorkout.currentExerciseIndex === 0 && styles.navBtnDisabled]}
                    onPress={prevExercise}
                    disabled={activeWorkout.currentExerciseIndex === 0}
                >
                    <Ionicons name="chevron-back" size={22} color={
                        activeWorkout.currentExerciseIndex === 0 ? colors.textMuted : colors.text
                    } />
                    <Text style={[styles.navBtnText, activeWorkout.currentExerciseIndex === 0 && { color: colors.textMuted }]}>
                        PREV
                    </Text>
                </TouchableOpacity>

                <View style={styles.setsProgress}>
                    <Text style={styles.setsProgressNum}>{totalCompletedSets}</Text>
                    <Text style={styles.setsProgressLabel}>/ {totalAllSets} SETS</Text>
                </View>

                <TouchableOpacity
                    style={[styles.navBtn,
                    activeWorkout.currentExerciseIndex === totalExercises - 1 && styles.navBtnDisabled
                    ]}
                    onPress={nextExercise}
                    disabled={activeWorkout.currentExerciseIndex === totalExercises - 1}
                >
                    <Text style={[styles.navBtnText,
                    activeWorkout.currentExerciseIndex === totalExercises - 1 && { color: colors.textMuted }
                    ]}>
                        NEXT
                    </Text>
                    <Ionicons name="chevron-forward" size={22} color={
                        activeWorkout.currentExerciseIndex === totalExercises - 1 ? colors.textMuted : colors.text
                    } />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    // Top bar
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: spacing[10],
        paddingBottom: spacing[2],
    },
    cancelBtn: {
        padding: spacing[1],
    },
    timerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    timerText: {
        ...textStyles.h3,
        color: colors.textSecondary,
    },
    finishBtn: {
        backgroundColor: colors.success,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    finishBtnText: {
        ...textStyles.button,
        color: '#000',
        fontSize: 12,
    },

    // Progress
    progressBar: {
        height: 3,
        backgroundColor: colors.surface,
        marginHorizontal: screen.paddingHorizontal,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },

    // PR Notification
    prBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        backgroundColor: '#FFD70020',
        borderWidth: 1,
        borderColor: '#FFD700',
        marginHorizontal: screen.paddingHorizontal,
        marginTop: spacing[2],
        paddingVertical: spacing[2],
    },
    prBannerText: {
        ...textStyles.label,
        color: '#FFD700',
        fontSize: 13,
        letterSpacing: 2,
    },

    // Exercise header
    exerciseHeader: {
        paddingHorizontal: screen.paddingHorizontal,
        paddingVertical: spacing[2],
    },
    exerciseCounter: {
        ...textStyles.caption,
        color: colors.textDim,
        textAlign: 'center',
        letterSpacing: 2,
    },

    // Scroll
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: screen.paddingHorizontal,
    },

    // Exercise card
    exerciseCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: spacing[4],
        marginBottom: spacing[4],
    },
    exerciseName: {
        ...textStyles.h2,
        color: colors.text,
        fontSize: 20,
        marginBottom: spacing[2],
    },
    exerciseMeta: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    metaBadge: {
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 2,
        paddingHorizontal: spacing[2],
    },
    metaBadgeText: {
        ...textStyles.caption,
        color: colors.primary,
        fontSize: 9,
    },
    instructions: {
        ...textStyles.body,
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
    },

    // Rest timer
    restCard: {
        backgroundColor: colors.primaryMuted,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: spacing[3],
        marginBottom: spacing[4],
    },
    restTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    restHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    restLabel: {
        ...textStyles.label,
        color: colors.primary,
        fontSize: 12,
    },
    restTimer: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.primary,
    },
    skipRestBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
        borderWidth: 1,
        borderColor: colors.textDim,
    },
    skipRestText: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },
    nextPreview: {
        borderTopWidth: 1,
        borderTopColor: colors.primary,
        paddingTop: spacing[2],
        marginTop: spacing[2],
    },
    nextLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        letterSpacing: 2,
        marginBottom: 2,
    },
    nextName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 13,
    },
    nextMuscle: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },

    // ─── SET TABLE ────────────────────────────────────────────────
    setTable: {
        marginBottom: spacing[3],
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[1],
        marginBottom: spacing[1],
    },
    headerCell: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        textAlign: 'center',
    },
    setCellSmall: {
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    prevCell: {
        flex: 1,
        paddingHorizontal: 4,
    },
    inputCell: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCell: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Set rows
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[1],
        marginBottom: spacing[1],
        minHeight: 48,
    },
    setRowDone: {
        borderColor: colors.success,
        backgroundColor: 'rgba(46, 204, 113, 0.05)',
    },
    setNumBox: {
        width: 28,
        height: 28,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    setNumText: {
        fontSize: 13,
        fontWeight: '900',
        color: colors.textDim,
    },
    prevText: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 11,
        textAlign: 'center',
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderLight,
        color: colors.text,
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        paddingVertical: 4,
        paddingHorizontal: 2,
        width: 52,
    },
    completedValue: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.success,
        textAlign: 'center',
    },
    checkBtn: {
        padding: 2,
    },

    // Target
    targetInfo: {
        padding: spacing[2],
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing[1],
    },
    targetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    targetText: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },

    // Nav bar
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: screen.paddingHorizontal,
        paddingVertical: spacing[3],
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: '#000',
    },
    navBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[3],
    },
    navBtnDisabled: {
        opacity: 0.3,
    },
    navBtnText: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    setsProgress: {
        backgroundColor: colors.surface,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3],
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    setsProgressNum: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.text,
    },
    setsProgressLabel: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },
});

export default ActiveWorkoutScreen;
