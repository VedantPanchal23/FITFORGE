import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, radius } from '../theme';
import { Typography } from '../components';

import useUserStore from '../../store/userStore';
import useCommitmentStore from '../../store/commitmentStore';
import useWorkoutStore from '../../store/workoutStore';
import useNutritionStore from '../../store/nutritionStore';
import useHabitStore from '../../store/habitStore';
import useLookmaxxStore from '../../store/lookmaxxStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- Premium SVG Ring Component ---
const ProgressRing = ({ progress, color, size = 60, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const animatedProgress = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedProgress, {
            toValue: Math.min(progress, 1),
            useNativeDriver: false, // SVG animations don't support native driver easily
            bounciness: 4,
            speed: 8,
            delay: 150, // Stagger effect
        }).start();
    }, [progress]);

    const strokeDashoffset = animatedProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0]
    });

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                {/* Background Track */}
                <Circle
                    stroke={color + '20'} // 20% opacity
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Foreground Progress */}
                <AnimatedCircle
                    stroke={color}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                />
            </Svg>
            <View style={{ position: 'absolute' }}>
                <Typography variant="caption" style={{ fontSize: 10, fontWeight: '800', color: color }}>
                    {Math.round(progress * 100)}%
                </Typography>
            </View>
        </View>
    );
};

// --- Premium Pressable Card ---
const ActionCard = ({ title, subtitle, icon, color, progress, onPress, targetValueStr = '' }) => {
    const animatedScale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(animatedScale, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(animatedScale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <Animated.View style={[styles.card, { transform: [{ scale: animatedScale }] }]}>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                            <Ionicons name={icon} size={24} color={color} />
                        </View>
                        <View style={styles.cardHeaderText}>
                            <Typography variant="headline" style={{ fontWeight: '700' }}>{title}</Typography>
                            <Typography variant="caption" color={colors.textDim} numberOfLines={1}>{subtitle}</Typography>
                        </View>
                    </View>

                    {/* Ring replaces simple progress bar */}
                    <View style={styles.cardRight}>
                        <ProgressRing progress={progress} color={color} size={54} strokeWidth={5} />
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};


const DashboardScreen = ({ navigation }) => {
    // Stores
    const profile = useUserStore((s) => s.profile);
    const userName = profile?.name || 'Warrior';

    // Dates/Greeting
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 5) greeting = 'Early start';
    else if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';

    const getDaysSinceCommitment = useCommitmentStore((s) => s.getDaysSinceCommitment);
    const dayCount = getDaysSinceCommitment() || 0;

    // Workout
    const totalWorkouts = useWorkoutStore((s) => s.totalWorkoutsCompleted || 0);
    const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
    const currentPlan = useWorkoutStore((s) => s.currentPlan);
    const todayPlanName = currentPlan?.schedule?.[new Date().getDay()]?.name || 'Rest Day / Unscheduled';
    const workoutDone = activeWorkout === null && totalWorkouts > 0; // Simple approx

    // Nutrition
    const nutritionPlan = useNutritionStore((s) => s.nutritionPlan);
    const getTodaysTotals = useNutritionStore((s) => s.getTodaysTotals);
    const nutritionTotals = getTodaysTotals() || { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, mealsLogged: 0 };
    const calTarget = nutritionPlan?.targetCalories || 2000;
    const calProgress = Math.min(nutritionTotals.calories / Math.max(calTarget, 1), 1);

    // Habits
    const getTodaysStatus = useHabitStore((s) => s.getTodaysStatus);
    const habitStatus = getTodaysStatus() || { completed: 0, total: 1, progress: 0 }; // default total 1 to avoid NaN

    // Lookmaxx
    const getTodaysRoutineStatus = useLookmaxxStore((s) => s.getTodaysRoutineStatus);
    const routineStatus = getTodaysRoutineStatus() || { amCompleted: 0, amTotal: 0, pmCompleted: 0, pmTotal: 0 };

    // Haptic Scroll
    const handleScroll = (e) => {
        const y = e.nativeEvent.contentOffset.y;
        if (y < -30) {
            // Pull down refresh feel
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                overScrollMode="always"
            >
                {/* Premium Header */}
                <View style={styles.header}>
                    <View>
                        <Typography variant="subheadline" color={colors.textSecondary} style={{ fontWeight: '600' }}>
                            {greeting},
                        </Typography>
                        <Typography variant="largeTitle" style={{ marginTop: -2, letterSpacing: -1 }}>
                            {userName}
                        </Typography>
                    </View>
                    <TouchableOpacity
                        style={styles.dayBadge}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            navigation.navigate('Profile');
                        }}
                        activeOpacity={0.8}
                    >
                        <Typography variant="caption" color={colors.surface} style={{ fontWeight: '800' }}>DAY</Typography>
                        <Typography variant="title2" color={colors.surface} style={{ marginTop: -4 }}>
                            {dayCount}
                        </Typography>
                    </TouchableOpacity>
                </View>

                {/* Glassmorphic Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Ionicons name="barbell" size={16} color={colors.primary} style={{ marginBottom: 4 }} />
                        <Typography variant="title1" style={{ fontSize: 28 }}>{totalWorkouts}</Typography>
                        <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2 }}>Workouts</Typography>
                    </View>
                    <View style={[styles.statBox, styles.statBoxCenter]}>
                        <Ionicons name="water" size={16} color={colors.info} style={{ marginBottom: 4 }} />
                        <Typography variant="title1" color={colors.info} style={{ fontSize: 28 }}>{nutritionTotals.water}</Typography>
                        <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2 }}>Glasses</Typography>
                    </View>
                    <View style={styles.statBox}>
                        <Ionicons name="checkmark-done" size={16} color={colors.warning} style={{ marginBottom: 4 }} />
                        <Typography variant="title1" style={{ fontSize: 28 }}>{habitStatus.completed}</Typography>
                        <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2 }}>Habits</Typography>
                    </View>
                </View>

                {/* Main Action Items */}
                <View style={styles.sectionHeader}>
                    <Typography variant="title2" style={{ fontWeight: '700', letterSpacing: -0.5 }}>
                        Today's Progress
                    </Typography>
                </View>

                <ActionCard
                    title="Training"
                    subtitle={todayPlanName}
                    icon="barbell"
                    color={colors.primary}
                    progress={workoutDone ? 1 : (activeWorkout ? 0.5 : 0)}
                    onPress={() => navigation.navigate('Workout')}
                />

                <ActionCard
                    title="Nutrition"
                    subtitle={`${Math.round(nutritionTotals.calories)} / ${calTarget} kcal`}
                    icon="restaurant"
                    color={colors.success}
                    progress={calProgress}
                    onPress={() => navigation.navigate('Nutrition')}
                />

                <ActionCard
                    title="Discipline"
                    subtitle={`${habitStatus.completed} of ${habitStatus.total} habits done`}
                    icon="flash"
                    color={colors.warning}
                    progress={habitStatus.total > 0 ? (habitStatus.completed / habitStatus.total) : 0}
                    onPress={() => navigation.navigate('Discipline')}
                />

                {/* Lookmaxx Mini Card */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        navigation.navigate('Profile');
                    }}
                    activeOpacity={0.8}
                    style={{ marginTop: spacing[2], marginBottom: spacing[24] }} // Extra padding for blur tab bar
                >
                    <View style={styles.lookmaxxCard}>
                        <View style={styles.lookmaxxLeft}>
                            <View style={[styles.iconBox, { backgroundColor: colors.textSecondary + '10', width: 36, height: 36 }]}>
                                <Ionicons name="sparkles" size={16} color={colors.textSecondary} />
                            </View>
                            <View style={{ marginLeft: spacing[3] }}>
                                <Typography variant="headline" style={{ fontSize: 15 }}>Self-Care Routine</Typography>
                                <Typography variant="caption" color={colors.textDim}>
                                    AM: {routineStatus.amCompleted}/{routineStatus.amTotal} • PM: {routineStatus.pmCompleted}/{routineStatus.pmTotal}
                                </Typography>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.borderLight} />
                    </View>
                </TouchableOpacity>

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
        paddingHorizontal: spacing[6],
        paddingTop: spacing[16], // Generous top padding
        paddingBottom: spacing[12],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[8],
    },
    dayBadge: {
        backgroundColor: colors.text, // Dark badge for contrast in light mode
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing[5],
        marginBottom: spacing[10],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 24,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.borderLight + '50',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statBoxCenter: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.borderLight + '60',
        paddingHorizontal: spacing[2],
    },
    sectionHeader: {
        marginBottom: spacing[4],
        paddingLeft: spacing[1],
    },

    // Abstracted Card Styles
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing[4],
        marginBottom: spacing[4],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.borderLight + '30',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[4],
    },
    cardHeaderText: {
        flex: 1,
        paddingRight: spacing[4],
    },
    cardRight: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    lookmaxxCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing[3],
        paddingRight: spacing[4],
        borderWidth: 1,
        borderColor: colors.borderLight + '50',
    },
    lookmaxxLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default DashboardScreen;

