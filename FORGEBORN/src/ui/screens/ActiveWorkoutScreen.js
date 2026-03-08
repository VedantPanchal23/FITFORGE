import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TextInput,
    Animated,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';
import { Card, Typography, Button, ProgressBar } from '../components';
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
    const prTranslateAnim = useRef(new Animated.Value(-50)).current;
    const prOpacityAnim = useRef(new Animated.Value(0)).current;

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
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

        const targetReps = currentExercise?.reps || currentExercise?.defaultReps || '10';
        const parsedReps = typeof targetReps === 'string' && targetReps.includes('-')
            ? Math.round((parseInt(targetReps.split('-')[0]) + parseInt(targetReps.split('-')[1])) / 2)
            : parseInt(targetReps) || 10;

        const newInputs = {};
        currentSets.forEach((s, i) => {
            if (s.completed) {
                newInputs[i] = { weight: String(s.weight), reps: String(s.reps) };
            } else {
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
    const progress = activeWorkout.currentExerciseIndex / Math.max(totalExercises - 1, 1);

    let totalCompletedSets = 0;
    let totalAllSets = 0;
    Object.values(activeWorkout.sets).forEach(setArr => {
        totalAllSets += setArr.length;
        totalCompletedSets += setArr.filter(s => s.completed).length;
    });

    // Overall workout progress
    const workoutProgress = totalCompletedSets / Math.max(totalAllSets, 1);

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

        const volume = (parseFloat(weight) || 0) * (parseInt(reps) || 0);
        const prevPR = personalRecords?.[currentExercise.id];
        const isPR = volume > 0 && (!prevPR || volume > (prevPR.maxVolume || 0));

        logSet(currentExercise.id, setIndex, weight, reps);

        if (isPR) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPrNotification(currentExercise.name);

            Animated.parallel([
                Animated.spring(prTranslateAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }),
                Animated.timing(prOpacityAnim, { toValue: 1, duration: 200, useNativeDriver: true })
            ]).start(() => {
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(prTranslateAnim, { toValue: -50, duration: 300, useNativeDriver: true }),
                        Animated.timing(prOpacityAnim, { toValue: 0, duration: 300, useNativeDriver: true })
                    ]).start(() => setPrNotification(null));
                }, 2500);
            });
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        const nextUncompleted = currentSets.findIndex((s, i) => i > setIndex && !s.completed);
        if (nextUncompleted !== -1) {
            startRest(currentExercise.rest || 60);
        }
    };

    const nextExerciseData = activeWorkout.currentExerciseIndex < totalExercises - 1
        ? activeWorkout.exercises[activeWorkout.currentExerciseIndex + 1]
        : null;

    const handleFinish = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Finish Workout',
            `Complete ${activeWorkout.dayName}?\n\n${totalCompletedSets}/${totalAllSets} sets done\nTime: ${formatTime(elapsedTime)}`,
            [
                { text: 'Keep Going', style: 'cancel' },
                {
                    text: 'Finish', style: 'default',
                    onPress: () => {
                        const record = finishWorkout();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
            'Quit Workout?',
            'All progress will be lost.',
            [
                { text: 'Stay', style: 'cancel' },
                {
                    text: 'Quit', style: 'destructive',
                    onPress: () => {
                        cancelWorkout();
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleNavToggle = (type) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (type === 'next') nextExercise();
        else prevExercise();
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={26} color={colors.textSecondary} />
                </TouchableOpacity>
                <View style={styles.timerBox}>
                    <Ionicons name="time-outline" size={18} color={colors.text} />
                    <Typography variant="headline" style={{ marginLeft: 6, fontVariant: ['tabular-nums'] }}>{formatTime(elapsedTime)}</Typography>
                </View>
                <Button
                    title="Finish"
                    onPress={handleFinish}
                    size="sm"
                    style={styles.finishBtn}
                    textStyle={{ fontSize: 13 }}
                />
            </View>

            {/* Overall Progress Bar */}
            <ProgressBar progress={workoutProgress} height={4} color={colors.primary} backgroundColor={colors.borderLight} style={{ borderRadius: 0 }} />

            {/* PR Notification Banner - Absolutely positioned to float over UI */}
            <Animated.View
                style={[
                    styles.prBanner,
                    {
                        opacity: prOpacityAnim,
                        transform: [{ translateY: prTranslateAnim }],
                    }
                ]}
                pointerEvents="none"
            >
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Typography variant="subheadline" color="#D97706" style={{ marginHorizontal: spacing[3], fontWeight: '800' }}>
                    NEW PERSONAL RECORD!
                </Typography>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
            </Animated.View>

            {/* Exercise Counter */}
            <View style={styles.exerciseHeader}>
                <Typography variant="caption" color={colors.textSecondary} style={{ letterSpacing: 1.5, fontWeight: '700' }}>
                    EXERCISE {activeWorkout.currentExerciseIndex + 1} OF {totalExercises}
                </Typography>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Current Exercise Info */}
                <View style={styles.exerciseCard}>
                    <Typography variant="title1" style={{ marginBottom: spacing[3], fontSize: 32 }}>{currentExercise.name}</Typography>
                    <View style={styles.exerciseMeta}>
                        <View style={styles.metaBadge}>
                            <Typography variant="caption" color={colors.primary} style={{ fontWeight: '700' }}>{currentExercise.muscle.toUpperCase()}</Typography>
                        </View>
                        <View style={[styles.metaBadge, { backgroundColor: colors.surfaceLight }]}>
                            <Typography variant="caption" color={colors.textSecondary} style={{ fontWeight: '600' }}>{currentExercise.equipment.toUpperCase()}</Typography>
                        </View>
                    </View>
                    {currentExercise.instructions && (
                        <Typography variant="body" color={colors.textDim} style={{ marginTop: spacing[3], lineHeight: 22 }}>
                            {currentExercise.instructions}
                        </Typography>
                    )}
                </View>

                {/* Rest Timer */}
                {activeWorkout.isResting && restTimeLeft > 0 && (
                    <Card style={styles.restCard} noPadding>
                        <View style={styles.restTop}>
                            <View style={styles.restHeader}>
                                <Ionicons name="timer-outline" size={22} color={colors.primary} />
                                <Typography variant="headline" color={colors.primary} style={{ marginLeft: spacing[2] }}>Rest</Typography>
                            </View>
                            <Typography variant="dataDisplay" color={colors.primary} style={{ fontSize: 44, lineHeight: 44, fontVariant: ['tabular-nums'] }}>{restTimeLeft}s</Typography>
                            <Button
                                variant="outline"
                                title="Skip"
                                size="sm"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    endRest();
                                }}
                                style={{ backgroundColor: colors.surface, borderColor: colors.primary + '30' }}
                                textStyle={{ color: colors.primary }}
                            />
                        </View>
                        {nextExerciseData && (
                            <View style={styles.nextPreview}>
                                <Typography variant="caption" color={colors.textDim} style={{ letterSpacing: 1, marginBottom: 2, fontWeight: '700' }}>UP NEXT</Typography>
                                <Typography variant="headline">{nextExerciseData.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {nextExerciseData.muscle} • {nextExerciseData.sets || nextExerciseData.defaultSets} sets × {nextExerciseData.reps || nextExerciseData.defaultReps}
                                </Typography>
                            </View>
                        )}
                    </Card>
                )}

                {/* ─── SET TABLE ─── */}
                <View style={styles.setTable}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Typography variant="caption" style={[styles.headerCell, styles.setCellSmall]}>SET</Typography>
                        <Typography variant="caption" style={[styles.headerCell, styles.prevCell]}>PREVIOUS</Typography>
                        <Typography variant="caption" style={[styles.headerCell, styles.inputCell]}>KG</Typography>
                        <Typography variant="caption" style={[styles.headerCell, styles.inputCell]}>REPS</Typography>
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
                                <View style={[styles.setCellSmall, styles.setNumBox, s.completed && { backgroundColor: colors.success + '20' }]}>
                                    <Typography variant="headline" color={s.completed ? colors.success : colors.textSecondary}>
                                        {index + 1}
                                    </Typography>
                                </View>

                                {/* Previous */}
                                <View style={styles.prevCell}>
                                    <Typography variant="subheadline" color={colors.textDim} style={{ textAlign: 'center' }}>
                                        {prev
                                            ? `${prev.weight > 0 ? prev.weight + ' kg' : 'BW'} × ${prev.reps}`
                                            : '—'
                                        }
                                    </Typography>
                                </View>

                                {/* Weight Input */}
                                <View style={styles.inputCell}>
                                    {s.completed ? (
                                        <Typography variant="headline" color={colors.text} style={{ textAlign: 'center' }}>
                                            {s.weight > 0 ? s.weight : 'BW'}
                                        </Typography>
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
                                        <Typography variant="headline" color={colors.text} style={{ textAlign: 'center' }}>{s.reps}</Typography>
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
                                        <View style={styles.checkDone}>
                                            <Ionicons name="checkmark" size={24} color={colors.surface} />
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleLogSet(index)}
                                            style={styles.checkBtn}
                                            activeOpacity={0.7}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <View style={styles.checkPending}>
                                                <Ionicons name="checkmark" size={24} color={colors.primary} />
                                            </View>
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
                        <Ionicons name="information-circle" size={18} color={colors.textDim} />
                        <Typography variant="caption" color={colors.textDim} style={{ marginLeft: spacing[2], fontWeight: '600' }}>
                            TARGET: {currentExercise.sets || currentExercise.defaultSets} sets × {currentExercise.reps || currentExercise.defaultReps} reps
                        </Typography>
                    </View>
                    <View style={[styles.targetRow, { marginTop: spacing[3] }]}>
                        <Ionicons name="timer" size={18} color={colors.textDim} />
                        <Typography variant="caption" color={colors.textDim} style={{ marginLeft: spacing[2], fontWeight: '600' }}>
                            REST: {currentExercise.rest || 60}s between sets
                        </Typography>
                    </View>
                    {currentExercise.tips && (
                        <View style={[styles.targetRow, { marginTop: spacing[3] }]}>
                            <Ionicons name="bulb" size={18} color={colors.warning} />
                            <Typography variant="caption" color={colors.warning} style={{ marginLeft: spacing[2], fontWeight: '600' }}>
                                {currentExercise.tips}
                            </Typography>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={[styles.navBtn, activeWorkout.currentExerciseIndex === 0 && styles.navBtnDisabled]}
                    onPress={() => handleNavToggle('prev')}
                    disabled={activeWorkout.currentExerciseIndex === 0}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color={
                        activeWorkout.currentExerciseIndex === 0 ? colors.textMuted : colors.text
                    } />
                </TouchableOpacity>

                <View style={styles.setsProgress}>
                    <Typography variant="headline">{totalCompletedSets}</Typography>
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>/ {totalAllSets} Sets Logged</Typography>
                </View>

                <TouchableOpacity
                    style={[styles.navBtn, activeWorkout.currentExerciseIndex === totalExercises - 1 && styles.navBtnDisabled]}
                    onPress={() => handleNavToggle('next')}
                    disabled={activeWorkout.currentExerciseIndex === totalExercises - 1}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-forward" size={20} color={
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
        backgroundColor: colors.surface,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingTop: spacing[14], // Safe area adjusted
        paddingBottom: spacing[4],
        backgroundColor: colors.surface,
    },
    cancelBtn: {
        padding: spacing[1],
    },
    timerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: radius.full,
    },
    finishBtn: {
        borderRadius: radius.full,
        paddingHorizontal: spacing[5],
        height: 36,
    },
    prBanner: {
        position: 'absolute',
        top: spacing[24],
        left: spacing[4],
        right: spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#F59E0B',
        paddingVertical: spacing[3],
        borderRadius: radius.lg,
        zIndex: 100,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    exerciseHeader: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[6],
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: spacing[5],
    },
    exerciseCard: {
        marginBottom: spacing[8],
        alignItems: 'center',
    },
    exerciseMeta: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing[2],
    },
    metaBadge: {
        backgroundColor: colors.primaryMuted,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3],
        borderRadius: radius.full,
    },
    restCard: {
        backgroundColor: colors.primaryLight || colors.primaryMuted,
        borderColor: colors.primary + '30',
        borderWidth: 1,
        marginBottom: spacing[8],
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    restTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing[6],
    },
    restHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nextPreview: {
        borderTopWidth: 1,
        borderTopColor: colors.primary + '15',
        padding: spacing[5],
        backgroundColor: colors.surfaceLight,
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
    },
    setTable: {
        marginBottom: spacing[8],
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        marginBottom: spacing[3],
    },
    headerCell: {
        color: colors.textDim,
        letterSpacing: 1,
        textAlign: 'center',
        fontWeight: '700',
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
        width: 65,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCell: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[2],
        marginBottom: spacing[3],
        minHeight: 64, // Taller rows for premium feel
        borderWidth: 1,
        borderColor: colors.borderLight + '50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    setRowDone: {
        borderColor: colors.success + '40',
        backgroundColor: colors.success + '10',
    },
    setNumBox: {
        width: 32,
        height: 32,
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.md,
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[1],
        width: 60,
    },
    checkBtn: {
        padding: 4,
    },
    checkPending: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkDone: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    targetInfo: {
        padding: spacing[5],
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight + '40',
    },
    targetRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
        paddingTop: spacing[4],
        paddingBottom: spacing[8],
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        backgroundColor: colors.surface,
    },
    navBtn: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.full,
        backgroundColor: colors.surfaceLight,
    },
    navBtnDisabled: {
        opacity: 0.5,
    },
    setsProgress: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
});

export default ActiveWorkoutScreen;
