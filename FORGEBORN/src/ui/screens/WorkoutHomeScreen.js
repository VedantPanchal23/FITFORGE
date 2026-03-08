import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Card, Typography, Button } from '../components';
import useUserStore from '../../store/userStore';
import useCommitmentStore from '../../store/commitmentStore';
import useWorkoutStore from '../../store/workoutStore';

const MUSCLE_ICONS = {
    CHEST: 'body-outline', BACK: 'arrow-undo-outline', SHOULDERS: 'barbell-outline',
    BICEPS: 'fitness-outline', TRICEPS: 'fitness-outline', LEGS: 'footsteps-outline',
    GLUTES: 'trending-up-outline', CORE: 'disc-outline', FOREARMS: 'hand-left-outline',
    CARDIO: 'heart-outline', FULL_BODY: 'flame-outline',
};

const WorkoutHomeScreen = ({ navigation }) => {
    const profile = useUserStore((s) => s.profile);
    const getDaysSinceCommitment = useCommitmentStore((s) => s.getDaysSinceCommitment);
    const days = getDaysSinceCommitment();

    const currentPlan = useWorkoutStore((s) => s.currentPlan);
    const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
    const generatePlan = useWorkoutStore((s) => s.generatePlan);
    const getTodaysWorkout = useWorkoutStore((s) => s.getTodaysWorkout);
    const startWorkout = useWorkoutStore((s) => s.startWorkout);
    const totalWorkouts = useWorkoutStore((s) => s.totalWorkoutsCompleted || 0);
    const currentStreak = useWorkoutStore((s) => s.currentStreak || 0);
    const getThisWeekWorkouts = useWorkoutStore((s) => s.getThisWeekWorkouts);

    useEffect(() => {
        if (!currentPlan && profile) {
            generatePlan(profile);
        }
    }, [profile, currentPlan]);

    useEffect(() => {
        if (activeWorkout) navigation.navigate('ActiveWorkout');
    }, [activeWorkout]);

    const todaysWorkout = getTodaysWorkout(days);
    const weekWorkouts = getThisWeekWorkouts();

    if (!todaysWorkout) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
                <View style={styles.emptyState}>
                    <Ionicons name="barbell-outline" size={64} color={colors.textMuted} />
                    <Typography variant="headline" style={{ marginTop: spacing[4], marginBottom: spacing[6] }}>
                        Generating your plan...
                    </Typography>
                    <Button
                        title="Generate Plan"
                        onPress={() => profile && generatePlan(profile)}
                    />
                </View>
            </View>
        );
    }

    const handleStart = () => {
        startWorkout(todaysWorkout);
        navigation.navigate('ActiveWorkout');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Typography variant="largeTitle">Workout</Typography>
                    <Typography variant="subheadline">{currentPlan?.splitName || 'Your Plan'}</Typography>
                </View>

                {/* Stats row */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Typography variant="caption">Total</Typography>
                        <Typography variant="title1" style={{ marginTop: spacing[1] }}>{totalWorkouts}</Typography>
                    </View>
                    <View style={[styles.statBox, styles.statBoxCenter]}>
                        <Typography variant="caption">Streak</Typography>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[1] }}>
                            <Ionicons name="flame" size={18} color={colors.primary} style={{ marginRight: 4 }} />
                            <Typography variant="title1">{currentStreak}</Typography>
                        </View>
                    </View>
                    <View style={styles.statBox}>
                        <Typography variant="caption">This Week</Typography>
                        <Typography variant="title1" style={{ marginTop: spacing[1] }}>{weekWorkouts.length}</Typography>
                    </View>
                </View>

                {/* Today's Plan Card */}
                <Card style={styles.todayCard} noPadding>
                    <View style={{ padding: spacing[5] }}>
                        <View style={styles.todayHeader}>
                            <View style={{ flex: 1 }}>
                                <Typography variant="caption" color={colors.primary} style={{ marginBottom: spacing[1] }}>
                                    TODAY — DAY {todaysWorkout.dayNumber}
                                </Typography>
                                <Typography variant="title1">{todaysWorkout.name}</Typography>
                            </View>
                            <View style={styles.exercisesBadge}>
                                <Typography variant="title2">{todaysWorkout.exerciseCount}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Exer.</Typography>
                            </View>
                        </View>

                        {/* Muscle group tags */}
                        <View style={styles.muscleTags}>
                            {todaysWorkout.muscles.map((m, i) => (
                                <View key={i} style={styles.muscleTag}>
                                    <Ionicons name={MUSCLE_ICONS[m] || 'fitness-outline'} size={14} color={colors.primary} />
                                    <Typography variant="caption" color={colors.primary} style={{ marginLeft: spacing[1] }}>
                                        {m}
                                    </Typography>
                                </View>
                            ))}
                        </View>

                        <View style={styles.durationRow}>
                            <Ionicons name="time-outline" size={16} color={colors.textDim} />
                            <Typography variant="subheadline" color={colors.textDim} style={{ marginLeft: spacing[1] }}>
                                ~{todaysWorkout.estimatedMinutes} min • {todaysWorkout.totalSets} sets
                            </Typography>
                        </View>
                    </View>

                    <Button
                        title="Start Workout"
                        onPress={handleStart}
                        size="lg"
                        style={styles.startButton}
                    />
                </Card>

                {/* Exercise List */}
                <Typography variant="title2" style={styles.sectionLabel}>Exercises</Typography>

                {todaysWorkout.exercises.map((exercise, index) => (
                    <Card key={exercise.id} style={styles.exerciseCard}>
                        <View style={styles.exerciseNum}>
                            <Typography variant="headline" color={colors.textSecondary}>{index + 1}</Typography>
                        </View>
                        <View style={styles.exerciseInfo}>
                            <Typography variant="headline">{exercise.name}</Typography>
                            <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2 }}>
                                {exercise.muscle}
                                {exercise.secondary?.length > 0 && ` + ${exercise.secondary.join(', ')}`}
                            </Typography>
                            <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing[1] }}>
                                {exercise.sets} Sets × {exercise.reps} Reps • Rest {exercise.rest}s
                            </Typography>
                        </View>
                    </Card>
                ))}

                {/* View Log */}
                <Button
                    variant="outline"
                    title="View Workout Log"
                    icon={<Ionicons name="calendar-outline" size={18} color={colors.text} />}
                    onPress={() => navigation.navigate('WorkoutLog')}
                    style={{ marginTop: spacing[4], marginBottom: spacing[8] }}
                />

                {/* Week overview */}
                {currentPlan && (
                    <>
                        <Typography variant="title2" style={styles.sectionLabel}>
                            Week Overview
                        </Typography>
                        {currentPlan.days.map((day, i) => (
                            <Card
                                key={i}
                                style={[
                                    styles.weekDay,
                                    i === todaysWorkout.dayIndex && styles.weekDayActive
                                ]}
                            >
                                <Typography variant="title1" color={colors.textMuted} style={styles.weekDayNum}>
                                    {i + 1}
                                </Typography>
                                <View style={{ flex: 1, marginLeft: spacing[3] }}>
                                    <Typography variant="headline" color={i === todaysWorkout.dayIndex ? colors.text : colors.textSecondary}>
                                        {day.name}
                                    </Typography>
                                    <Typography variant="caption" color={colors.textDim}>
                                        {day.exercises.length} exercises
                                    </Typography>
                                </View>
                                {i === todaysWorkout.dayIndex && (
                                    <View style={styles.todayBadge}>
                                        <Typography variant="caption" color={colors.textInverse} style={{ fontSize: 10 }}>TODAY</Typography>
                                    </View>
                                )}
                            </Card>
                        ))}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[12],
        paddingBottom: spacing[8],
    },
    header: {
        marginBottom: spacing[6],
    },
    statsGrid: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing[4],
        marginBottom: spacing[6],
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...colors.shadows?.sm,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBoxCenter: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.borderLight,
        paddingHorizontal: spacing[2],
    },
    todayCard: {
        marginBottom: spacing[8],
        overflow: 'hidden', // to keep button inside card radius 
    },
    todayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[4],
    },
    exercisesBadge: {
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: radius.md,
    },
    muscleTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    muscleTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryMuted,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
        borderRadius: radius.sm,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    startButton: {
        borderRadius: 0, // Fill bottom of card
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
    },
    sectionLabel: {
        marginBottom: spacing[4],
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        marginBottom: spacing[3],
    },
    exerciseNum: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[4],
    },
    exerciseInfo: {
        flex: 1
    },
    weekDay: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        marginBottom: spacing[3],
    },
    weekDayActive: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    weekDayNum: {
        width: 30,
        textAlign: 'center',
    },
    todayBadge: {
        backgroundColor: colors.primary,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
        borderRadius: radius.sm,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default WorkoutHomeScreen;
