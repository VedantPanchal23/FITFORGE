import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Animated,
    ScrollView,
    Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Card, Typography, Button, ProgressBar } from '../components';
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
    const getCompletionColor = () => {
        if (completionRate >= 80) return colors.success;
        if (completionRate >= 50) return colors.warning;
        return colors.danger;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
                        <Ionicons name="trophy" size={56} color={colors.textInverse} />
                    </View>
                    <Typography variant="largeTitle" style={{ textAlign: 'center', marginBottom: spacing[1] }}>
                        Workout Complete
                    </Typography>
                    <Typography variant="subheadline" color={colors.textSecondary} style={{ letterSpacing: 2, textTransform: 'uppercase' }}>
                        {dayName}
                    </Typography>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View style={[styles.statsGridContainer, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }]}>
                    <View style={styles.statsGrid}>
                        <Card style={styles.statCard}>
                            <Ionicons name="time-outline" size={24} color={colors.primary} />
                            <Typography variant="title2" style={{ marginTop: spacing[2] }}>{formatDuration(duration)}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Duration</Typography>
                        </Card>
                        <Card style={styles.statCard}>
                            <Ionicons name="checkmark-done" size={24} color={colors.success} />
                            <Typography variant="title2" style={{ marginTop: spacing[2] }}>{setsCompleted}/{totalSets}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Sets</Typography>
                        </Card>
                        <Card style={styles.statCard}>
                            <Ionicons name="barbell-outline" size={24} color={colors.warning} />
                            <Typography variant="title2" style={{ marginTop: spacing[2] }}>{formatVolume(totalVolume)}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Volume</Typography>
                        </Card>
                        <Card style={styles.statCard}>
                            <Ionicons name="fitness-outline" size={24} color={colors.accent} />
                            <Typography variant="title2" style={{ marginTop: spacing[2] }}>{exercisesDone}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Exercises</Typography>
                        </Card>
                    </View>
                </Animated.View>

                {/* Completion Rate */}
                <Animated.View style={[styles.completionSection, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }]}>
                    <Card style={styles.completionCard}>
                        <View style={styles.completionHeader}>
                            <Typography variant="headline">Completion Score</Typography>
                            <Typography variant="title2" style={{ color: getCompletionColor() }}>{completionRate}%</Typography>
                        </View>
                        <ProgressBar progress={completionRate / 100} color={getCompletionColor()} />
                    </Card>
                </Animated.View>

                {/* Newly Earned Badges */}
                {earnedBadges.length > 0 && (
                    <Animated.View style={[styles.badgeSection, { opacity: badgeFade }]}>
                        <Typography variant="headline" style={{ textAlign: 'center', marginBottom: spacing[4], color: colors.primary }}>
                            Badges Unlocked!
                        </Typography>
                        <View style={styles.badgeRow}>
                            {earnedBadges.map(badge => (
                                <View key={badge.id} style={styles.earnedBadge}>
                                    <View style={[styles.earnedBadgeIcon, { backgroundColor: badge.color + '15', borderColor: badge.color }]}>
                                        <Ionicons name={badge.icon} size={32} color={badge.color} />
                                    </View>
                                    <Typography variant="subheadline" style={{ color: badge.color, textAlign: 'center' }}>{badge.name}</Typography>
                                    <Typography variant="caption" color={colors.textDim} style={{ textAlign: 'center' }}>{badge.description}</Typography>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Motivational Text */}
                <Animated.View style={{ opacity: fadeAnim, marginTop: spacing[6], width: '100%' }}>
                    <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center', fontStyle: 'italic', paddingHorizontal: spacing[4] }}>
                        {completionRate >= 90
                            ? '"Perfect execution. You are unbreakable."'
                            : completionRate >= 70
                                ? '"Solid work. Keep grinding and pushing your limits."'
                                : '"Every rep counts. Rest up and come back stronger."'
                        }
                    </Typography>
                </Animated.View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <Button
                        title="Finish Workout"
                        onPress={() => navigation.popToTop()}
                        style={{ width: '100%', borderRadius: radius.full }}
                    />
                </View>
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
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingTop: spacing[16],
        paddingBottom: spacing[12],
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        marginBottom: spacing[10],
    },
    trophyCircle: {
        width: 120,
        height: 120,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[6],
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },

    // Stats
    statsGridContainer: {
        width: '100%',
        marginBottom: spacing[6],
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[3],
        width: '100%',
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        padding: spacing[4],
    },

    // Completion
    completionSection: {
        width: '100%',
        marginBottom: spacing[6],
    },
    completionCard: {
        padding: spacing[5],
    },
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
    },

    // Badges
    badgeSection: {
        width: '100%',
        marginBottom: spacing[6],
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: radius.lg,
        padding: spacing[5],
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing[4],
    },
    earnedBadge: {
        alignItems: 'center',
        width: 110,
        gap: spacing[1],
    },
    earnedBadgeIcon: {
        width: 64,
        height: 64,
        borderRadius: radius.full,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[1],
    },

    // Actions
    actions: {
        width: '100%',
        marginTop: spacing[10],
    },
});

export default WorkoutCompleteScreen;
