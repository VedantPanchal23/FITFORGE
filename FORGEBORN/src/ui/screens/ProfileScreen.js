/**
 * FORGEBORN — PROFILE SCREEN
 * 
 * User stats, body measurements, lookmaxxing entry, and settings.
 * Features:
 * - Avatar + name + day count + level
 * - Body stats (weight, height, BMI)
 * - Training profile
 * - Quick access to Lookmaxxing
 * - All-time stats
 * - DEV reset
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useUserStore from '../../store/userStore';
import useCommitmentStore from '../../store/commitmentStore';
import useWorkoutStore from '../../store/workoutStore';
import useNutritionStore from '../../store/nutritionStore';
import useHabitStore from '../../store/habitStore';
import useLookmaxxStore from '../../store/lookmaxxStore';
import LookmaxxingScreen from './LookmaxxingScreen';

const ProfileScreen = () => {
    const profile = useUserStore((s) => s.profile);
    const resetUser = useUserStore((s) => s.resetUser);
    const getDaysSinceCommitment = useCommitmentStore((s) => s.getDaysSinceCommitment);
    const resetCommitment = useCommitmentStore((s) => s.resetCommitment);

    const totalWorkouts = useWorkoutStore((s) => s.totalWorkoutsCompleted);
    const workoutStreak = useWorkoutStore((s) => s.currentStreak);
    const longestStreak = useWorkoutStore((s) => s.longestStreak);
    const workoutReset = useWorkoutStore((s) => s.__devReset);

    const nutritionReset = useNutritionStore((s) => s.__devReset);

    const habitLevel = useHabitStore((s) => s.level);
    const habitXP = useHabitStore((s) => s.totalXP);
    const perfectDays = useHabitStore((s) => s.perfectDays);
    const totalHabitsCompleted = useHabitStore((s) => s.totalHabitsCompleted);
    const habitReset = useHabitStore((s) => s.__devReset);

    const lookmaxxReset = useLookmaxxStore((s) => s.__devReset);
    const getTodaysRoutineStatus = useLookmaxxStore((s) => s.getTodaysRoutineStatus);
    const routineStatus = getTodaysRoutineStatus();

    const [showLookmaxx, setShowLookmaxx] = useState(false);

    if (showLookmaxx) {
        return <LookmaxxingScreen onBack={() => setShowLookmaxx(false)} />;
    }

    const days = getDaysSinceCommitment();
    const name = profile?.name || 'OPERATOR';
    const weight = profile?.weight || 0;
    const height = profile?.height || 0;
    const bmi = weight > 0 && height > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : '–';
    const bmiCategory = bmi === '–' ? '' :
        bmi < 18.5 ? 'UNDERWEIGHT' :
            bmi < 25 ? 'NORMAL' :
                bmi < 30 ? 'OVERWEIGHT' : 'OBESE';

    const handleDevReset = () => {
        Alert.alert(
            '⚠️ DEV RESET',
            'This will ERASE ALL DATA including profile, workout history, nutrition logs, habits, and lookmaxxing progress.\n\nYou will be sent back to onboarding.',
            [
                { text: 'CANCEL', style: 'cancel' },
                {
                    text: 'RESET EVERYTHING',
                    style: 'destructive',
                    onPress: () => {
                        workoutReset();
                        nutritionReset();
                        habitReset();
                        lookmaxxReset();
                        resetCommitment();
                        resetUser();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{name[0]}</Text>
                    </View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.dayCount}>DAY {days} • LVL {habitLevel}</Text>
                    <View style={styles.xpBar}>
                        <View style={[styles.xpBarFill, {
                            width: `${(habitXP % 100)}%`
                        }]} />
                    </View>
                    <Text style={styles.xpText}>{habitXP} TOTAL XP</Text>
                </View>

                {/* Body Stats */}
                <Text style={styles.sectionLabel}>BODY STATS</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statVal}>{weight}</Text>
                        <Text style={styles.statUnit}>KG</Text>
                        <Text style={styles.statLabel}>WEIGHT</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statVal}>{height}</Text>
                        <Text style={styles.statUnit}>CM</Text>
                        <Text style={styles.statLabel}>HEIGHT</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statVal}>{bmi}</Text>
                        <Text style={styles.statUnit}>{bmiCategory}</Text>
                        <Text style={styles.statLabel}>BMI</Text>
                    </View>
                </View>

                {/* Training Profile */}
                <Text style={styles.sectionLabel}>TRAINING PROFILE</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>GOALS</Text>
                        <Text style={styles.infoVal}>
                            {(profile?.fitnessGoal || []).join(', ') || 'Not set'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>LEVEL</Text>
                        <Text style={styles.infoVal}>{profile?.experienceLevel || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>TRAINING DAYS</Text>
                        <Text style={styles.infoVal}>{profile?.trainingDaysPerWeek || '–'}/week</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>DIET</Text>
                        <Text style={styles.infoVal}>{profile?.dietPreference || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>AGE</Text>
                        <Text style={styles.infoVal}>{profile?.age || '–'}</Text>
                    </View>
                </View>

                {/* All-Time Stats */}
                <Text style={styles.sectionLabel}>ALL-TIME STATS</Text>
                <View style={styles.allTimeGrid}>
                    <View style={styles.allTimeStat}>
                        <Text style={styles.allTimeVal}>{totalWorkouts}</Text>
                        <Text style={styles.allTimeLabel}>WORKOUTS</Text>
                    </View>
                    <View style={styles.allTimeStat}>
                        <Text style={styles.allTimeVal}>🔥 {workoutStreak}</Text>
                        <Text style={styles.allTimeLabel}>STREAK</Text>
                    </View>
                    <View style={styles.allTimeStat}>
                        <Text style={styles.allTimeVal}>{longestStreak}</Text>
                        <Text style={styles.allTimeLabel}>BEST STREAK</Text>
                    </View>
                    <View style={styles.allTimeStat}>
                        <Text style={styles.allTimeVal}>{totalHabitsCompleted}</Text>
                        <Text style={styles.allTimeLabel}>HABITS DONE</Text>
                    </View>
                    <View style={styles.allTimeStat}>
                        <Text style={styles.allTimeVal}>⭐ {perfectDays}</Text>
                        <Text style={styles.allTimeLabel}>PERFECT DAYS</Text>
                    </View>
                    <View style={styles.allTimeStat}>
                        <Text style={styles.allTimeVal}>{days}</Text>
                        <Text style={styles.allTimeLabel}>COMMITMENT</Text>
                    </View>
                </View>

                {/* Lookmaxxing Card */}
                <Text style={styles.sectionLabel}>APPEARANCE</Text>
                <TouchableOpacity
                    style={styles.lookmaxxCard}
                    onPress={() => setShowLookmaxx(true)}
                    activeOpacity={0.7}
                >
                    <View style={styles.lookmaxxLeft}>
                        <Text style={styles.lookmaxxIcon}>✨</Text>
                        <View>
                            <Text style={styles.lookmaxxTitle}>LOOKMAXXING</Text>
                            <Text style={styles.lookmaxxSub}>
                                AM: {routineStatus.amCompleted}/{routineStatus.amTotal} • PM: {routineStatus.pmCompleted}/{routineStatus.pmTotal}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                </TouchableOpacity>

                {/* DEV Reset */}
                <TouchableOpacity
                    style={styles.devResetBtn}
                    onPress={handleDevReset}
                >
                    <Ionicons name="trash" size={16} color={colors.danger} />
                    <Text style={styles.devResetText}>DEV RESET (ALL DATA)</Text>
                </TouchableOpacity>

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

    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[5],
        marginBottom: spacing[2],
    },

    // Profile card
    profileCard: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.primary,
        padding: spacing[5],
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[2],
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#000',
    },
    name: {
        ...textStyles.h2,
        color: colors.text,
        fontSize: 22,
    },
    dayCount: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[2],
    },
    xpBar: {
        width: '100%',
        height: 4,
        backgroundColor: colors.background,
        overflow: 'hidden',
        marginBottom: 4,
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    xpText: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 8,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        alignItems: 'center',
    },
    statVal: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.text,
    },
    statUnit: {
        ...textStyles.caption,
        color: colors.primary,
        fontSize: 8,
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },

    // Info card
    infoCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },
    infoVal: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 11,
    },

    // All time
    allTimeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    allTimeStat: {
        width: '31%',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[2],
        alignItems: 'center',
    },
    allTimeVal: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.text,
    },
    allTimeLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 7,
        marginTop: 2,
    },

    // Lookmaxx card
    lookmaxxCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: spacing[3],
    },
    lookmaxxLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    lookmaxxIcon: { fontSize: 22 },
    lookmaxxTitle: {
        ...textStyles.label,
        color: colors.primary,
        fontSize: 13,
    },
    lookmaxxSub: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },

    // Dev reset
    devResetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.danger,
        padding: spacing[3],
        marginTop: spacing[8],
        gap: spacing[2],
    },
    devResetText: {
        ...textStyles.caption,
        color: colors.danger,
        fontSize: 10,
    },
});

export default ProfileScreen;
