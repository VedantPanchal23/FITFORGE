/**
 * FORGEBORN — WORKOUT COMPLETE SCREEN
 * 
 * Post-workout summary screen. Shows stats, celebrates the user.
 * Inspired by: Nike Training Club (completion badge), FitOn (summary card)
 * 
 * Features:
 * - Animated trophy entrance
 * - Stats grid (duration, sets, volume, exercises)
 * - Completion bar with color coding
 * - Newly unlocked badges display
 * - Motivational quote
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Animated,
    ScrollView,
    Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useBadgeStore, { BADGES } from '../../store/badgeStore';
import useWorkoutStore from '../../store/workoutStore';
import useHabitStore from '../../store/habitStore';
import useNutritionStore from '../../store/nutritionStore';
import useCommitmentStore from '../../store/commitmentStore';
import useLookmaxxStore from '../../store/lookmaxxStore';

const WorkoutCompleteScreen = ({ navigation, route }) => {
    const {
        duration = 0,
        setsCompleted = 0,
        totalSets = 0,
        totalVolume = 0,
        exercisesDone = 0,
        dayName = 'WORKOUT',
    } = route.params || {};

    const [earnedBadges, setEarnedBadges] = useState([]);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const badgeFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Run badge check
        const checkBadges = useBadgeStore.getState().checkBadges;
        const ws = useWorkoutStore.getState();
        const hs = useHabitStore.getState();
        const ns = useNutritionStore.getState();
        const cs = useCommitmentStore.getState();
        const ls = useLookmaxxStore.getState();

        let totalVol = 0;
        (ws.workoutHistory || []).forEach(w => { totalVol += w.totalVolume || 0; });

        let totalMeals = 0;
        let maxWater = 0;
        Object.values(ns.dailyLogs || {}).forEach(day => {
            Object.values(day?.meals || {}).forEach(arr => { totalMeals += (arr || []).length; });
            maxWater = Math.max(maxWater, day?.water || 0);
        });

        const rs = ls.getTodaysRoutineStatus?.() || {};
        const sc = (rs.amCompleted === rs.amTotal && rs.pmCompleted === rs.pmTotal) ? 1 : 0;

        const newBadgeIds = checkBadges({
            totalWorkouts: ws.totalWorkoutsCompleted || 0,
            totalVolume: totalVol,
            longestStreak: ws.longestStreak || 0,
            totalHabitsCompleted: hs.totalHabitsCompleted || 0,
            perfectDays: hs.perfectDays || 0,
            habitLevel: hs.level || 0,
            totalMealsLogged: totalMeals,
            maxWaterGlasses: maxWater,
            daysSinceCommitment: cs.getDaysSinceCommitment?.() || 0,
            skincareCompleted: sc,
        });

        if (newBadgeIds.length > 0) {
            const badges = BADGES.filter(b => newBadgeIds.includes(b.id));
            setEarnedBadges(badges);
            Vibration.vibrate([0, 100, 50, 100, 50, 200]);
        }

        // Animate in
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 80,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(badgeFade, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins >= 60) {
            const hours = Math.floor(mins / 60);
            const remainMins = mins % 60;
            return `${hours}h ${remainMins}m`;
        }
        return `${mins}m ${secs}s`;
    };

    const formatVolume = (vol) => {
        if (vol >= 1000) return `${(vol / 1000).toFixed(1)}t`;
        return `${Math.round(vol)} kg`;
    };

    const completionRate = totalSets > 0 ? Math.round((setsCompleted / totalSets) * 100) : 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Trophy / Check Icon */}
                <Animated.View style={[styles.heroSection, {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                }]}>
                    <View style={styles.trophyCircle}>
                        <Ionicons name="trophy" size={48} color="#000" />
                    </View>
                    <Text style={styles.completeTitle}>WORKOUT COMPLETE</Text>
                    <Text style={styles.dayName}>{dayName}</Text>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View style={[styles.statsGrid, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }]}>
                    <View style={styles.statCard}>
                        <Ionicons name="time-outline" size={20} color={colors.primary} />
                        <Text style={styles.statValue}>{formatDuration(duration)}</Text>
                        <Text style={styles.statLabel}>DURATION</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-done" size={20} color={colors.success} />
                        <Text style={styles.statValue}>{setsCompleted}/{totalSets}</Text>
                        <Text style={styles.statLabel}>SETS</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="barbell-outline" size={20} color={colors.warning} />
                        <Text style={styles.statValue}>{formatVolume(totalVolume)}</Text>
                        <Text style={styles.statLabel}>VOLUME</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="fitness-outline" size={20} color={colors.accent} />
                        <Text style={styles.statValue}>{exercisesDone}</Text>
                        <Text style={styles.statLabel}>EXERCISES</Text>
                    </View>
                </Animated.View>

                {/* Completion Rate */}
                <Animated.View style={[styles.completionBar, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }]}>
                    <View style={styles.completionHeader}>
                        <Text style={styles.completionLabel}>COMPLETION</Text>
                        <Text style={[styles.completionPercent, {
                            color: completionRate >= 80 ? colors.success : completionRate >= 50 ? colors.warning : colors.danger,
                        }]}>{completionRate}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, {
                            width: `${completionRate}%`,
                            backgroundColor: completionRate >= 80 ? colors.success : completionRate >= 50 ? colors.warning : colors.danger,
                        }]} />
                    </View>
                </Animated.View>

                {/* Newly Earned Badges */}
                {earnedBadges.length > 0 && (
                    <Animated.View style={[styles.badgeSection, { opacity: badgeFade }]}>
                        <Text style={styles.badgeSectionTitle}>BADGES UNLOCKED</Text>
                        <View style={styles.badgeRow}>
                            {earnedBadges.map(badge => (
                                <View key={badge.id} style={styles.earnedBadge}>
                                    <View style={[styles.earnedBadgeIcon, { backgroundColor: badge.color + '22', borderColor: badge.color }]}>
                                        <Ionicons name={badge.icon} size={24} color={badge.color} />
                                    </View>
                                    <Text style={[styles.earnedBadgeName, { color: badge.color }]}>{badge.name}</Text>
                                    <Text style={styles.earnedBadgeDesc}>{badge.description}</Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Motivational Text */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.quoteText}>
                        {completionRate >= 90
                            ? 'PERFECT EXECUTION. YOU ARE UNBREAKABLE.'
                            : completionRate >= 70
                                ? 'SOLID WORK. KEEP GRINDING.'
                                : 'EVERY REP COUNTS. COME BACK STRONGER.'
                        }
                    </Text>
                </Animated.View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => navigation.popToTop()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="home" size={18} color="#000" />
                        <Text style={styles.doneButtonText}>DONE</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: screen.paddingHorizontal,
        paddingVertical: spacing[8],
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    trophyCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    completeTitle: {
        ...textStyles.h1,
        color: colors.text,
        fontSize: 24,
        letterSpacing: 3,
        marginBottom: spacing[1],
    },
    dayName: {
        ...textStyles.caption,
        color: colors.textDim,
        letterSpacing: 2,
    },

    // Stats
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
        marginBottom: spacing[5],
        width: '100%',
    },
    statCard: {
        width: '47%',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        alignItems: 'center',
        gap: spacing[1],
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.text,
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        letterSpacing: 1,
    },

    // Completion
    completionBar: {
        width: '100%',
        marginBottom: spacing[4],
    },
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[1],
    },
    completionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        letterSpacing: 1,
    },
    completionPercent: {
        fontSize: 16,
        fontWeight: '900',
    },
    progressTrack: {
        height: 6,
        backgroundColor: colors.surface,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },

    // Badges
    badgeSection: {
        width: '100%',
        marginBottom: spacing[4],
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.primaryMuted,
        padding: spacing[3],
    },
    badgeSectionTitle: {
        ...textStyles.label,
        color: colors.primary,
        fontSize: 11,
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: spacing[3],
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing[3],
    },
    earnedBadge: {
        alignItems: 'center',
        width: 90,
        gap: 4,
    },
    earnedBadgeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    earnedBadgeName: {
        ...textStyles.label,
        fontSize: 9,
        textAlign: 'center',
    },
    earnedBadgeDesc: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 7,
        textAlign: 'center',
    },

    // Quote
    quoteText: {
        ...textStyles.label,
        color: colors.textSecondary,
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: spacing[6],
        fontSize: 11,
    },

    // Actions
    actions: {
        width: '100%',
    },
    doneButton: {
        backgroundColor: colors.primary,
        padding: spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
    },
    doneButtonText: {
        ...textStyles.button,
        color: '#000',
        fontSize: 16,
    },
});

export default WorkoutCompleteScreen;
