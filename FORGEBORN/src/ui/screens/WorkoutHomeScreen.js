/**
 * FORGEBORN — WORKOUT HOME SCREEN
 * 
 * Today's workout plan generated from your profile.
 * Features: exercise list with instructions, muscle tags, START button.
 * Navigates to ActiveWorkoutScreen when started.
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useUserStore from '../../store/userStore';
import useCommitmentStore from '../../store/commitmentStore';
import useWorkoutStore from '../../store/workoutStore';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';

// Muscle group icons
const MUSCLE_ICONS = {
    CHEST: '🫁', BACK: '🔙', SHOULDERS: '💪',
    BICEPS: '💪', TRICEPS: '💪', LEGS: '🦵',
    GLUTES: '🍑', CORE: '🎯', FOREARMS: '✊',
    CARDIO: '❤️', FULL_BODY: '🔥',
};

const WorkoutHomeScreen = () => {
    const profile = useUserStore((s) => s.profile);
    const getDaysSinceCommitment = useCommitmentStore((s) => s.getDaysSinceCommitment);
    const days = getDaysSinceCommitment();

    const currentPlan = useWorkoutStore((s) => s.currentPlan);
    const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
    const generatePlan = useWorkoutStore((s) => s.generatePlan);
    const getTodaysWorkout = useWorkoutStore((s) => s.getTodaysWorkout);
    const startWorkout = useWorkoutStore((s) => s.startWorkout);
    const totalWorkouts = useWorkoutStore((s) => s.totalWorkoutsCompleted);
    const currentStreak = useWorkoutStore((s) => s.currentStreak);
    const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
    const getThisWeekWorkouts = useWorkoutStore((s) => s.getThisWeekWorkouts);

    const [showActive, setShowActive] = useState(false);

    // Generate plan if not exists
    useEffect(() => {
        if (!currentPlan && profile) {
            generatePlan(profile);
        }
    }, [profile, currentPlan]);

    // Show active workout if one is in progress
    useEffect(() => {
        if (activeWorkout) setShowActive(true);
    }, [activeWorkout]);

    if (showActive && activeWorkout) {
        return (
            <ActiveWorkoutScreen
                onFinish={() => setShowActive(false)}
                onCancel={() => setShowActive(false)}
            />
        );
    }

    const todaysWorkout = getTodaysWorkout(days);
    const weekWorkouts = getThisWeekWorkouts();

    if (!todaysWorkout) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.background} />
                <View style={styles.emptyState}>
                    <Ionicons name="barbell" size={48} color={colors.textDim} />
                    <Text style={styles.emptyText}>GENERATING YOUR PLAN...</Text>
                    <TouchableOpacity
                        style={styles.genBtn}
                        onPress={() => profile && generatePlan(profile)}
                    >
                        <Text style={styles.genBtnText}>GENERATE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleStart = () => {
        startWorkout(todaysWorkout);
        setShowActive(true);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={styles.title}>WORKOUT</Text>
                <Text style={styles.subtitle}>{currentPlan?.splitName || 'YOUR PLAN'}</Text>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{totalWorkouts}</Text>
                        <Text style={styles.statLabel}>TOTAL</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>🔥 {currentStreak}</Text>
                        <Text style={styles.statLabel}>STREAK</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{weekWorkouts.length}</Text>
                        <Text style={styles.statLabel}>THIS WEEK</Text>
                    </View>
                </View>

                {/* Today's Plan Card */}
                <View style={styles.todayCard}>
                    <View style={styles.todayHeader}>
                        <View>
                            <Text style={styles.todayLabel}>TODAY — DAY {todaysWorkout.dayNumber}</Text>
                            <Text style={styles.todayName}>{todaysWorkout.name}</Text>
                        </View>
                        <View style={styles.todayMeta}>
                            <Text style={styles.metaVal}>{todaysWorkout.exerciseCount}</Text>
                            <Text style={styles.metaLabel}>EXERCISES</Text>
                        </View>
                    </View>

                    {/* Muscle group tags */}
                    <View style={styles.muscleTags}>
                        {todaysWorkout.muscles.map((m, i) => (
                            <View key={i} style={styles.muscleTag}>
                                <Text style={styles.muscleTagText}>
                                    {MUSCLE_ICONS[m] || '💪'} {m}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.durationRow}>
                        <Ionicons name="time-outline" size={14} color={colors.textDim} />
                        <Text style={styles.durationText}>
                            ~{todaysWorkout.estimatedMinutes} min • {todaysWorkout.totalSets} total sets
                        </Text>
                    </View>
                </View>

                {/* Exercise List */}
                <Text style={styles.sectionLabel}>EXERCISES</Text>

                {todaysWorkout.exercises.map((exercise, index) => (
                    <View key={exercise.id} style={styles.exerciseCard}>
                        <View style={styles.exerciseLeft}>
                            <View style={styles.exerciseNum}>
                                <Text style={styles.exerciseNumText}>{index + 1}</Text>
                            </View>
                            <View style={styles.exerciseInfo}>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                <Text style={styles.exerciseMuscle}>
                                    {exercise.muscle}
                                    {exercise.secondary?.length > 0 && ` + ${exercise.secondary.join(', ')}`}
                                </Text>
                                <Text style={styles.exerciseSets}>
                                    {exercise.sets} × {exercise.reps} • Rest {exercise.rest}s
                                </Text>
                            </View>
                        </View>
                        <View style={styles.exerciseRight}>
                            <View style={[styles.diffBadge,
                            exercise.difficulty === 'ADVANCED' && { borderColor: colors.danger },
                            exercise.difficulty === 'INTERMEDIATE' && { borderColor: colors.warning },
                            ]}>
                                <Text style={[styles.diffText,
                                exercise.difficulty === 'ADVANCED' && { color: colors.danger },
                                exercise.difficulty === 'INTERMEDIATE' && { color: colors.warning },
                                ]}>
                                    {exercise.difficulty[0]}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Start Button */}
                <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
                    <Ionicons name="play" size={22} color="#000" />
                    <Text style={styles.startText}>START WORKOUT</Text>
                </TouchableOpacity>

                {/* Week overview */}
                {currentPlan && (
                    <>
                        <Text style={[styles.sectionLabel, { marginTop: spacing[6] }]}>
                            WEEK OVERVIEW
                        </Text>
                        {currentPlan.days.map((day, i) => (
                            <TouchableOpacity key={i} style={[styles.weekDay,
                            i === todaysWorkout.dayIndex && styles.weekDayActive
                            ]} activeOpacity={0.7}>
                                <Text style={[styles.weekDayNum,
                                i === todaysWorkout.dayIndex && { color: colors.primary }
                                ]}>
                                    {i + 1}
                                </Text>
                                <Text style={[styles.weekDayName,
                                i === todaysWorkout.dayIndex && { color: colors.text }
                                ]}>
                                    {day.name}
                                </Text>
                                <Text style={styles.weekDayInfo}>{day.exercises.length} exercises</Text>
                                {i === todaysWorkout.dayIndex && (
                                    <View style={styles.todayBadge}>
                                        <Text style={styles.todayBadgeText}>TODAY</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: spacing[12],
        paddingBottom: spacing[4],
    },

    // Header
    title: {
        ...textStyles.h1,
        color: colors.primary,
        fontSize: 28,
    },
    subtitle: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[4],
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[5],
    },
    statItem: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[2],
        alignItems: 'center',
    },
    statNum: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.text,
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },

    // Today card
    todayCard: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.primary,
        padding: spacing[4],
        marginBottom: spacing[5],
    },
    todayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[3],
    },
    todayLabel: {
        ...textStyles.caption,
        color: colors.primary,
        fontSize: 9,
    },
    todayName: {
        ...textStyles.h2,
        color: colors.text,
        fontSize: 22,
    },
    todayMeta: {
        alignItems: 'center',
    },
    metaVal: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.text,
    },
    metaLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },
    muscleTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[1],
        marginBottom: spacing[2],
    },
    muscleTag: {
        backgroundColor: colors.primaryMuted,
        paddingVertical: 2,
        paddingHorizontal: spacing[2],
    },
    muscleTagText: {
        ...textStyles.caption,
        color: colors.primary,
        fontSize: 9,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    durationText: {
        ...textStyles.caption,
        color: colors.textDim,
    },

    // Exercises
    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[3],
    },
    exerciseCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[2],
    },
    exerciseLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing[3],
    },
    exerciseNum: {
        width: 28,
        height: 28,
        backgroundColor: colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exerciseNumText: {
        fontSize: 12,
        fontWeight: '900',
        color: colors.primary,
    },
    exerciseInfo: { flex: 1 },
    exerciseName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    exerciseMuscle: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
        marginTop: 1,
    },
    exerciseSets: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
        marginTop: 2,
    },
    exerciseRight: {},
    diffBadge: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    diffText: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.success,
    },

    // Start button
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: spacing[4],
        marginTop: spacing[4],
        gap: spacing[2],
    },
    startText: {
        ...textStyles.button,
        color: '#000',
        fontSize: 16,
    },

    // Week overview
    weekDay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
        gap: spacing[3],
    },
    weekDayActive: {
        borderColor: colors.primary,
    },
    weekDayNum: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.textDim,
        width: 24,
    },
    weekDayName: {
        ...textStyles.label,
        color: colors.textDim,
        fontSize: 12,
        flex: 1,
    },
    weekDayInfo: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 9,
    },
    todayBadge: {
        backgroundColor: colors.primary,
        paddingVertical: 2,
        paddingHorizontal: spacing[2],
    },
    todayBadgeText: {
        ...textStyles.caption,
        color: '#000',
        fontSize: 8,
        fontWeight: '900',
    },

    // Empty
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing[3],
    },
    emptyText: {
        ...textStyles.label,
        color: colors.textDim,
    },
    genBtn: {
        backgroundColor: colors.primary,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[5],
    },
    genBtnText: {
        ...textStyles.button,
        color: '#000',
    },
});

export default WorkoutHomeScreen;
