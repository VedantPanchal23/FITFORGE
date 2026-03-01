/**
 * FORGEBORN — ACTIVE WORKOUT SCREEN
 * 
 * Live workout mode inspired by Hevy + Strong.
 * Features:
 * - Current exercise with instructions
 * - Set-by-set logging (weight × reps)
 * - Auto rest timer between sets
 * - Progress bar at top
 * - Swipe to next/prev exercise
 * - PR notification
 * - Distraction-free dark full-screen mode
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

const ActiveWorkoutScreen = ({ onFinish, onCancel }) => {
    const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
    const logSet = useWorkoutStore((s) => s.logSet);
    const startRest = useWorkoutStore((s) => s.startRest);
    const endRest = useWorkoutStore((s) => s.endRest);
    const nextExercise = useWorkoutStore((s) => s.nextExercise);
    const prevExercise = useWorkoutStore((s) => s.prevExercise);
    const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
    const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);

    const [elapsedTime, setElapsedTime] = useState(0);
    const [restTimeLeft, setRestTimeLeft] = useState(0);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [showPR, setShowPR] = useState(false);

    const prAnim = useRef(new Animated.Value(0)).current;

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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLogSet = () => {
        if (!weight && !reps) return;

        const setIndex = currentSets.findIndex(s => !s.completed);
        if (setIndex === -1) return;

        logSet(currentExercise.id, setIndex, weight, reps);
        Vibration.vibrate(50);

        // Start rest timer
        if (setIndex < currentSets.length - 1) {
            startRest(currentExercise.rest || 60);
        }

        // Clear inputs for next set
        setWeight('');
        setReps('');
    };

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
                        onFinish && onFinish(record);
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
                        onCancel && onCancel();
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
                <TouchableOpacity onPress={handleCancel}>
                    <Ionicons name="close" size={24} color={colors.textDim} />
                </TouchableOpacity>
                <View style={styles.timerBox}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                </View>
                <TouchableOpacity onPress={handleFinish} style={styles.finishBtn}>
                    <Text style={styles.finishBtnText}>FINISH</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {/* Day Name */}
            <Text style={styles.dayName}>{activeWorkout.dayName}</Text>
            <Text style={styles.exerciseCounter}>
                Exercise {activeWorkout.currentExerciseIndex + 1} of {totalExercises}
            </Text>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Current Exercise */}
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
                    <Text style={styles.instructions}>{currentExercise.instructions}</Text>
                    <Text style={styles.tips}>💡 {currentExercise.tips}</Text>
                </View>

                {/* Rest Timer */}
                {activeWorkout.isResting && restTimeLeft > 0 && (
                    <View style={styles.restCard}>
                        <Text style={styles.restLabel}>REST</Text>
                        <Text style={styles.restTimer}>{restTimeLeft}</Text>
                        <Text style={styles.restUnit}>SECONDS</Text>
                        <TouchableOpacity
                            style={styles.skipRestBtn}
                            onPress={() => endRest()}
                        >
                            <Text style={styles.skipRestText}>SKIP REST →</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Set Logging */}
                <Text style={styles.setsLabel}>
                    SETS ({completedSets}/{currentSets.length})
                </Text>

                {currentSets.map((s, index) => (
                    <View
                        key={index}
                        style={[
                            styles.setRow,
                            s.completed && styles.setRowDone,
                        ]}
                    >
                        <View style={styles.setNumber}>
                            <Text style={styles.setNumberText}>{index + 1}</Text>
                        </View>
                        {s.completed ? (
                            <View style={styles.setCompleted}>
                                <Text style={styles.setDoneText}>
                                    {s.weight > 0 ? `${s.weight} kg` : 'BW'} × {s.reps} reps
                                </Text>
                                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                            </View>
                        ) : (
                            index === completedSets ? (
                                <View style={styles.setInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="KG"
                                        placeholderTextColor={colors.textDim}
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.inputX}>×</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="REPS"
                                        placeholderTextColor={colors.textDim}
                                        value={reps}
                                        onChangeText={setReps}
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity
                                        style={styles.logBtn}
                                        onPress={handleLogSet}
                                    >
                                        <Ionicons name="checkmark" size={20} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.setWaiting}>
                                    <Text style={styles.setWaitText}>
                                        {currentExercise.reps || currentExercise.defaultReps}
                                    </Text>
                                </View>
                            )
                        )}
                    </View>
                ))}

                {/* Target info */}
                <View style={styles.targetInfo}>
                    <Text style={styles.targetText}>
                        TARGET: {currentExercise.sets || currentExercise.defaultSets} sets × {currentExercise.reps || currentExercise.defaultReps} reps
                    </Text>
                    <Text style={styles.targetText}>
                        REST: {currentExercise.rest || 60}s between sets
                    </Text>
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
                    <Ionicons name="chevron-back" size={24} color={
                        activeWorkout.currentExerciseIndex === 0 ? colors.textMuted : colors.text
                    } />
                    <Text style={[styles.navBtnText, activeWorkout.currentExerciseIndex === 0 && { color: colors.textMuted }]}>
                        PREV
                    </Text>
                </TouchableOpacity>

                <View style={styles.setsProgress}>
                    <Text style={styles.setsProgressText}>
                        {totalCompletedSets}/{totalAllSets} SETS
                    </Text>
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
                    <Ionicons name="chevron-forward" size={24} color={
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

    // Day
    dayName: {
        ...textStyles.h2,
        color: colors.primary,
        textAlign: 'center',
        marginTop: spacing[3],
        fontSize: 18,
    },
    exerciseCounter: {
        ...textStyles.caption,
        color: colors.textDim,
        textAlign: 'center',
        marginBottom: spacing[3],
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
        fontSize: 22,
        marginBottom: spacing[2],
    },
    exerciseMeta: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[3],
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
    tips: {
        ...textStyles.caption,
        color: colors.warning,
        marginTop: spacing[2],
        fontSize: 10,
    },

    // Rest timer
    restCard: {
        backgroundColor: colors.primaryMuted,
        borderWidth: 2,
        borderColor: colors.primary,
        padding: spacing[5],
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    restLabel: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    restTimer: {
        fontSize: 72,
        fontWeight: '900',
        color: colors.primary,
    },
    restUnit: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    skipRestBtn: {
        marginTop: spacing[3],
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderWidth: 1,
        borderColor: colors.textDim,
    },
    skipRestText: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },

    // Sets
    setsLabel: {
        ...textStyles.label,
        color: colors.textDim,
        marginBottom: spacing[2],
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[2],
        marginBottom: spacing[1],
        minHeight: 48,
    },
    setRowDone: {
        borderColor: colors.success,
        opacity: 0.8,
    },
    setNumber: {
        width: 32,
        height: 32,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[3],
    },
    setNumberText: {
        ...textStyles.label,
        color: colors.textDim,
    },
    setCompleted: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    setDoneText: {
        ...textStyles.label,
        color: colors.success,
        fontSize: 13,
    },
    setInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primary,
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        paddingVertical: spacing[1],
    },
    inputX: {
        color: colors.textDim,
        fontSize: 16,
    },
    logBtn: {
        width: 40,
        height: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    setWaiting: {
        flex: 1,
    },
    setWaitText: {
        ...textStyles.caption,
        color: colors.textMuted,
    },

    // Target
    targetInfo: {
        marginTop: spacing[3],
        padding: spacing[2],
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    targetText: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginBottom: 2,
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
    },
    setsProgressText: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },
});

export default ActiveWorkoutScreen;
