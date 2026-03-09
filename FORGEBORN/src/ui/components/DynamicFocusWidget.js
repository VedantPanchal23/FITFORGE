import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../theme';
import Typography from './Typography';
import useUserStore from '../../store/userStore';
import useCommitmentStore from '../../store/commitmentStore';
import useWorkoutStore from '../../store/workoutStore';
import useNutritionStore from '../../store/nutritionStore';
import useHabitStore from '../../store/habitStore';
import useLookmaxxStore from '../../store/lookmaxxStore';
import { BlurView } from 'expo-blur';

export default function DynamicFocusWidget({ navigation }) {
    const debtUnits = useCommitmentStore((s) => s.debtUnits);
    const totalWorkouts = useWorkoutStore((s) => s.totalWorkoutsCompleted || 0);
    const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
    const currentPlan = useWorkoutStore((s) => s.currentPlan);

    const nutritionPlan = useNutritionStore((s) => s.nutritionPlan);
    const nutritionTotals = useNutritionStore((s) => s.getTodaysTotals()) || { calories: 0 };

    const habitStatus = useHabitStore((s) => s.getTodaysStatus()) || { completed: 0, total: 1 };
    const routineStatus = useLookmaxxStore((s) => s.getTodaysRoutineStatus()) || { amCompleted: 0, amTotal: 0, pmCompleted: 0, pmTotal: 0 };

    const [focusState, setFocusState] = useState(null);
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    const determineFocus = () => {
        const hour = new Date().getHours();

        // 1. Debt is an absolute emergency.
        if (debtUnits > 0) {
            return {
                id: 'debt',
                title: 'CRITICAL: Clear Debt',
                subtitle: `You owe ${debtUnits} debt units. You are off track.`,
                icon: 'warning',
                color: colors.danger,
                actionText: 'Execute Penalty',
                route: 'Discipline' // Or wherever debt is handled
            };
        }

        // 2. Morning Routine
        if (hour < 11 && routineStatus.amTotal > 0 && routineStatus.amCompleted < routineStatus.amTotal) {
            return {
                id: 'am_routine',
                title: 'Morning Focus',
                subtitle: `Complete your AM Self-Care Routine (${routineStatus.amCompleted}/${routineStatus.amTotal})`,
                icon: 'water',
                color: colors.info,
                actionText: 'Start Routine',
                route: 'Profile'
            };
        }

        // 3. Training
        const todayPlanName = currentPlan?.schedule?.[new Date().getDay()]?.name || 'Rest Day';
        const workoutDone = activeWorkout === null && totalWorkouts > 0 && todayPlanName !== 'Rest Day'; // weak approx
        if (!workoutDone && todayPlanName !== 'Rest Day' && todayPlanName !== 'Rest Day / Unscheduled') {
            return {
                id: 'training',
                title: 'Primary Objective',
                subtitle: `Training: ${todayPlanName}`,
                icon: 'barbell',
                color: colors.primary,
                actionText: activeWorkout ? 'Resume Workout' : 'Start Workout',
                route: 'Workout'
            };
        }

        // 4. Discipline (Afternoon/General)
        if (habitStatus.completed < habitStatus.total) {
            return {
                id: 'discipline',
                title: 'Daily Discipline',
                subtitle: `You have ${habitStatus.total - habitStatus.completed} habits remaining today.`,
                icon: 'flash',
                color: colors.warning,
                actionText: 'Execute Habits',
                route: 'Discipline'
            };
        }

        // 5. Evening Routine
        if (hour >= 18 && routineStatus.pmTotal > 0 && routineStatus.pmCompleted < routineStatus.pmTotal) {
            return {
                id: 'pm_routine',
                title: 'Evening Focus',
                subtitle: `Complete your PM Self-Care Routine (${routineStatus.pmCompleted}/${routineStatus.pmTotal})`,
                icon: 'moon',
                color: '#8B5CF6',
                actionText: 'Wind Down',
                route: 'Profile'
            };
        }

        // 6. Perfect Day
        return {
            id: 'perfect',
            title: 'Standby Mode',
            subtitle: 'All primary objectives for today are complete.',
            icon: 'shield-checkmark',
            color: colors.success,
            actionText: 'View Stats',
            route: 'Profile'
        };
    };

    useEffect(() => {
        const nextFocus = determineFocus();
        if (!focusState || focusState.id !== nextFocus.id) {
            // Morphing animation
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start(() => {
                setFocusState(nextFocus);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }).start();
            });
        }
    }, [debtUnits, totalWorkouts, activeWorkout, habitStatus.completed, routineStatus.amCompleted, routineStatus.pmCompleted]);

    if (!focusState) return null;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate(focusState.route);
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <View style={styles.blurContainer}>
                    <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <View style={[styles.iconBox, { backgroundColor: focusState.color + '20' }]}>
                                <Ionicons name={focusState.icon} size={24} color={focusState.color} />
                            </View>
                            <View style={styles.textContainer}>
                                <Typography variant="caption" color={focusState.color} style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {focusState.title}
                                </Typography>
                                <Typography variant="title2" color={colors.text} style={{ marginTop: 2 }}>
                                    {focusState.subtitle}
                                </Typography>
                            </View>
                        </View>
                        <View style={[styles.actionButton, { backgroundColor: focusState.color }]}>
                            <Typography variant="caption" color={colors.surface} style={{ fontWeight: '700' }}>
                                {focusState.actionText}
                            </Typography>
                            <Ionicons name="arrow-forward" size={14} color={colors.surface} style={{ marginLeft: 4 }} />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[6],
        borderRadius: radius.xl,
        overflow: 'hidden',
        // VisionOS Glassmorphism
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
    },
    blurContainer: {
        backgroundColor: 'rgba(255,255,255,0.7)', // Fallback for blur
    },
    content: {
        padding: spacing[5],
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[4],
    },
    textContainer: {
        flex: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[3],
        borderRadius: radius.md,
        marginTop: spacing[5],
    }
});
