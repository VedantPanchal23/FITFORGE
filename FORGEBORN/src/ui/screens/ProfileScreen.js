import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Card, Typography, Button, ProgressBar } from '../components';
import useUserStore from '../../store/userStore';
import useCommitmentStore from '../../store/commitmentStore';
import useWorkoutStore from '../../store/workoutStore';
import useNutritionStore from '../../store/nutritionStore';
import useHabitStore from '../../store/habitStore';
import useLookmaxxStore from '../../store/lookmaxxStore';
import useProgressStore from '../../store/progressStore';
import useBadgeStore, { BADGES } from '../../store/badgeStore';

const ProfileScreen = ({ navigation }) => {
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

    const progressReset = useProgressStore((s) => s.__devReset);
    const weightLog = useProgressStore((s) => s.weightLog);

    const getBadgesWithStatus = useBadgeStore((s) => s.getBadgesWithStatus);
    const getUnlockedCount = useBadgeStore((s) => s.getUnlockedCount);
    const badgeReset = useBadgeStore((s) => s.__devReset);
    const allBadges = getBadgesWithStatus();
    const unlockedCount = getUnlockedCount();

    const days = getDaysSinceCommitment();
    const name = profile?.name || 'OPERATOR';
    const weight = profile?.weight || 0;
    const height = profile?.height || 0;
    const bmi = weight > 0 && height > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : '–';
    const bmiCategory = bmi === '–' ? '' :
        bmi < 18.5 ? 'Underweight' :
            bmi < 25 ? 'Normal' :
                bmi < 30 ? 'Overweight' : 'Obese';

    const handleDevReset = () => {
        Alert.alert(
            'DEV RESET',
            'This will ERASE ALL DATA including profile, workout history, nutrition logs, habits, and lookmaxxing progress.\n\nYou will be sent back to onboarding.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset Everything',
                    style: 'destructive',
                    onPress: () => {
                        workoutReset();
                        nutritionReset();
                        habitReset();
                        lookmaxxReset();
                        progressReset();
                        badgeReset();
                        resetCommitment();
                        resetUser();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <Card style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Typography variant="largeTitle" style={{ fontSize: 32, color: colors.textInverse }}>{name[0]}</Typography>
                    </View>
                    <Typography variant="title2">{name}</Typography>
                    <Typography variant="subheadline" color={colors.textSecondary} style={{ marginBottom: spacing[3], marginTop: 2 }}>
                        Day {days} • Level {habitLevel}
                    </Typography>
                    <ProgressBar progress={(habitXP % 100) / 100} color={colors.primary} />
                    <Typography variant="caption" color={colors.textDim} style={{ marginTop: spacing[2] }}>{habitXP} Total XP</Typography>
                </Card>

                {/* Body Stats */}
                <View style={styles.sectionHeader}>
                    <Typography variant="title3">Body Stats</Typography>
                </View>
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Typography variant="title2">{weight}</Typography>
                        <Typography variant="caption" color={colors.textDim}>kg</Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing[1] }}>Weight</Typography>
                    </Card>
                    <Card style={styles.statCard}>
                        <Typography variant="title2">{height}</Typography>
                        <Typography variant="caption" color={colors.textDim}>cm</Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing[1] }}>Height</Typography>
                    </Card>
                    <Card style={styles.statCard}>
                        <Typography variant="title2">{bmi}</Typography>
                        <Typography variant="caption" color={colors.textDim}>{bmiCategory}</Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing[1] }}>BMI</Typography>
                    </Card>
                </View>

                {/* Training Profile */}
                <View style={styles.sectionHeader}>
                    <Typography variant="title3">Training Profile</Typography>
                </View>
                <Card style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Typography variant="body" color={colors.textSecondary}>Goals</Typography>
                        <Typography variant="body" style={{ flex: 1, textAlign: 'right', marginLeft: spacing[4] }}>
                            {(profile?.fitnessGoal || []).join(', ') || 'Not set'}
                        </Typography>
                    </View>
                    <View style={styles.infoRow}>
                        <Typography variant="body" color={colors.textSecondary}>Level</Typography>
                        <Typography variant="body">{profile?.experienceLevel || 'Not set'}</Typography>
                    </View>
                    <View style={styles.infoRow}>
                        <Typography variant="body" color={colors.textSecondary}>Training Days</Typography>
                        <Typography variant="body">{profile?.trainingDaysPerWeek || '–'}/week</Typography>
                    </View>
                    <View style={styles.infoRow}>
                        <Typography variant="body" color={colors.textSecondary}>Diet</Typography>
                        <Typography variant="body">{profile?.dietPreference || 'Not set'}</Typography>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Typography variant="body" color={colors.textSecondary}>Age</Typography>
                        <Typography variant="body">{profile?.age || '–'}</Typography>
                    </View>
                </Card>

                {/* All-Time Stats */}
                <View style={styles.sectionHeader}>
                    <Typography variant="title3">All-Time Stats</Typography>
                </View>
                <Card style={styles.allTimeGridCard}>
                    <View style={styles.allTimeGrid}>
                        <View style={styles.allTimeStat}>
                            <Typography variant="title2">{totalWorkouts}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Workouts</Typography>
                        </View>
                        <View style={styles.allTimeStat}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="flame" size={16} color="#F59E0B" />
                                <Typography variant="title2">{workoutStreak}</Typography>
                            </View>
                            <Typography variant="caption" color={colors.textSecondary}>Streak</Typography>
                        </View>
                        <View style={styles.allTimeStat}>
                            <Typography variant="title2">{longestStreak}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Best Streak</Typography>
                        </View>
                        <View style={styles.allTimeStat}>
                            <Typography variant="title2">{totalHabitsCompleted}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Habits Done</Typography>
                        </View>
                        <View style={styles.allTimeStat}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="star" size={16} color="#F59E0B" />
                                <Typography variant="title2">{perfectDays}</Typography>
                            </View>
                            <Typography variant="caption" color={colors.textSecondary}>Perfect Days</Typography>
                        </View>
                        <View style={styles.allTimeStat}>
                            <Typography variant="title2">{days}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Commitment</Typography>
                        </View>
                    </View>
                </Card>

                {/* Achievement Badges */}
                <View style={styles.sectionHeader}>
                    <Typography variant="title3">Achievements</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>{unlockedCount}/{BADGES.length}</Typography>
                </View>
                <Card style={styles.allTimeGridCard}>
                    <View style={styles.badgeGrid}>
                        {allBadges.map(badge => (
                            <View key={badge.id} style={styles.badgeItem}>
                                <View style={[
                                    styles.badgeIcon,
                                    badge.unlocked
                                        ? { backgroundColor: badge.color + '15', borderColor: badge.color }
                                        : { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight },
                                ]}>
                                    <Ionicons
                                        name={badge.unlocked ? badge.icon : 'lock-closed'}
                                        size={24}
                                        color={badge.unlocked ? badge.color : colors.textMuted}
                                    />
                                </View>
                                <Typography variant="caption" style={{
                                    fontWeight: 'bold',
                                    marginTop: spacing[2],
                                    color: badge.unlocked ? colors.text : colors.textMuted,
                                    textAlign: 'center'
                                }}>
                                    {badge.unlocked ? badge.name : 'Unlocked ???'}
                                </Typography>
                                <Typography variant="caption" color={colors.textMuted} style={{ fontSize: 10, textAlign: 'center', marginTop: 2 }}>
                                    {badge.description}
                                </Typography>
                            </View>
                        ))}
                    </View>
                </Card>

                {/* Navigation Cards */}
                <View style={styles.sectionHeader}>
                    <Typography variant="title3">More Tools</Typography>
                </View>
                <Card style={[styles.infoCard, { padding: 0, paddingHorizontal: spacing[4] }]}>
                    <TouchableOpacity
                        style={styles.navRow}
                        onPress={() => navigation.navigate('Lookmaxxing')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.navLeft}>
                            <View style={[styles.navIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <Ionicons name="sparkles" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Typography variant="body">Appearance</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    AM: {routineStatus.amCompleted}/{routineStatus.amTotal} • PM: {routineStatus.pmCompleted}/{routineStatus.pmTotal}
                                </Typography>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navRow, { borderBottomWidth: 0 }]}
                        onPress={() => navigation.navigate('Progress')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.navLeft}>
                            <View style={[styles.navIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Ionicons name="analytics" size={20} color="#3B82F6" />
                            </View>
                            <View>
                                <Typography variant="body">Progress</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {weightLog.length > 0
                                        ? `${weightLog[weightLog.length - 1].weight} kg • ${weightLog.length} entries`
                                        : 'Weight & measurements'}
                                </Typography>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                    </TouchableOpacity>
                </Card>

                {/* DEV Reset */}
                <TouchableOpacity
                    style={styles.devResetBtn}
                    onPress={handleDevReset}
                >
                    <Ionicons name="trash" size={18} color={colors.danger} />
                    <Typography variant="body" color={colors.danger}>Dev Reset (All Data)</Typography>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[12],
        paddingBottom: spacing[8],
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginTop: spacing[8],
        marginBottom: spacing[4],
        paddingHorizontal: spacing[1],
    },

    // Profile card
    profileCard: {
        alignItems: 'center',
        padding: spacing[6],
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[4],
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: spacing[4],
    },
    statCard: {
        flex: 1,
        padding: spacing[3],
        alignItems: 'center',
    },

    // Info card
    infoCard: {
        padding: spacing[4],
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },

    // All time
    allTimeGridCard: {
        padding: spacing[4],
    },
    allTimeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    allTimeStat: {
        width: '33.33%',
        paddingVertical: spacing[3],
        alignItems: 'center',
    },

    // Badge grid
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: spacing[4],
    },
    badgeItem: {
        width: '33.33%',
        paddingHorizontal: spacing[2],
        alignItems: 'center',
    },
    badgeIcon: {
        width: 56,
        height: 56,
        borderRadius: radius.full,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Nav Row
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    navLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    navIconBox: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Dev reset
    devResetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderStyle: 'dashed',
        padding: spacing[4],
        marginTop: spacing[8],
        borderRadius: radius.md,
        gap: spacing[2],
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
});

export default ProfileScreen;
