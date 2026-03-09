import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Alert,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';
import { Card, Typography, Button, ProgressBar, ScreenWrapper, CustomBottomSheet, SwipeableCard } from '../components';
import { BlurView } from 'expo-blur';
import AbstractPattern from '../components/AbstractPattern';
import SoundEngine from '../../utils/SoundEngine';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
import useHabitStore from '../../store/habitStore';
import useCommitmentStore from '../../store/commitmentStore';
import useObligationStore from '../../store/obligationStore';

const CATEGORY_COLORS = {
    DISCIPLINE: '#EF4444', // red-500
    MIND: '#8B5CF6',       // violet-500
    HEALTH: '#10B981',     // emerald-500
    FITNESS: '#F59E0B',    // amber-500
    LOOKMAXX: '#EC4899',   // pink-500
    CUSTOM: colors.primary,
};

const HeatBox = ({ day, isToday, intensity }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 10,
            speed: 12,
            delay: Math.random() * 200, // random stagger effect
        }).start();
    }, []);

    let bgColor = colors.surfaceLight;
    if (intensity > 0) {
        if (intensity < 0.5) bgColor = 'rgba(16, 185, 129, 0.3)';
        else if (intensity < 1) bgColor = 'rgba(16, 185, 129, 0.7)';
        else bgColor = colors.success;
    }

    return (
        <View style={styles.heatDay}>
            <Typography variant="caption" color={isToday ? colors.primary : colors.textDim} style={{ marginBottom: spacing[2], fontWeight: '700' }}>
                {day.day}
            </Typography>
            <Animated.View style={[
                styles.heatBox,
                { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] },
                isToday && { borderColor: colors.primary, borderWidth: 2 }
            ]}>
                <Typography variant="caption" color={intensity >= 0.5 ? colors.textInverse : colors.textSecondary} style={{ fontWeight: '800' }}>
                    {day.completed > 0 ? day.completed : ''}
                </Typography>
            </Animated.View>
        </View>
    );
};

const DisciplineScreen = () => {
    const habits = useHabitStore((s) => s.habits);
    const toggleHabit = useHabitStore((s) => s.toggleHabit);
    const isHabitDone = useHabitStore((s) => s.isHabitDone);
    const getHabitStreak = useHabitStore((s) => s.getHabitStreak);
    const getTodaysStatus = useHabitStore((s) => s.getTodaysStatus);
    const getWeekHeatmap = useHabitStore((s) => s.getWeekHeatmap);
    const getXPProgress = useHabitStore((s) => s.getXPProgress);
    const addCustomHabit = useHabitStore((s) => s.addCustomHabit);
    const removeCustomHabit = useHabitStore((s) => s.removeCustomHabit);

    const obligations = useObligationStore((s) => s.obligations);
    const debtUnits = useCommitmentStore((s) => s.debtUnits);

    const bottomSheetRef = useRef(null);
    const [newHabitName, setNewHabitName] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const todayStatus = getTodaysStatus();
    const weekHeatmap = getWeekHeatmap();
    const xpProgress = getXPProgress();

    const handleToggle = useCallback((habitId) => {
        const wasDone = isHabitDone(habitId);
        toggleHabit(habitId);

        if (wasDone) {
            SoundEngine.play('light');
        } else {
            SoundEngine.play('complete');
        }
        setRefreshKey(k => k + 1);
    }, [isHabitDone, toggleHabit]);

    const handleAddHabit = () => {
        if (newHabitName.trim().length === 0) return;
        addCustomHabit(newHabitName.trim());
        setNewHabitName('');
        bottomSheetRef.current?.dismiss();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRefreshKey(k => k + 1);
    };

    const handleRemoveHabit = (habitId) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Remove Habit', 'Delete this custom habit?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: () => {
                    removeCustomHabit(habitId);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setRefreshKey(k => k + 1);
                },
            },
        ]);
    };

    const categories = {};
    habits.forEach(h => {
        const cat = h.category || 'CUSTOM';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(h);
    });

    // Scroll & Sticky Header Animations
    const scrollY = React.useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [100, 60],
        extrapolate: 'clamp',
    });

    const headerBlur = scrollY.interpolate({
        inputRange: [0, 20, 60],
        outputRange: [0, 0, 100],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [30, 60],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

            {/* Sticky Blurring Header */}
            <Animated.View style={[styles.stickyHeader, { height: headerHeight }]}>
                {Platform.OS === 'ios' ? (
                    <AnimatedBlurView
                        tint="light"
                        intensity={headerBlur}
                        style={StyleSheet.absoluteFill}
                    />
                ) : (
                    <Animated.View style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: colors.surface, opacity: headerOpacity }
                    ]} />
                )}
                <View style={styles.stickyHeaderContent}>
                    <Animated.Text style={[styles.stickyTitle, { opacity: headerOpacity }]}>
                        Discipline
                    </Animated.Text>
                </View>
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <ScreenWrapper staggerScale={0.7}>
                    {/* Header (Scrolls away) */}
                    <View style={styles.header}>
                        <Typography variant="largeTitle" color={colors.text}>Discipline</Typography>
                        <Typography variant="subheadline" color={colors.textSecondary} style={{ marginTop: spacing[1], letterSpacing: 0.5 }}>Build the machine. Daily.</Typography>
                    </View>

                    {/* XP + Level */}
                    <Card style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View>
                                <Typography variant="caption" color={colors.textDim} style={{ fontVariant: ['tabular-nums'], fontWeight: '600' }} tabularNums>{xpProgress.xpInCurrentLevel} / 100 XP</Typography>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Typography variant="title2" style={{ fontVariant: ['tabular-nums'] }} tabularNums>{xpProgress.totalXP}</Typography>
                                <Typography variant="caption" color={colors.textDim} style={{ fontWeight: '600' }}>TOTAL XP</Typography>
                            </View>
                        </View>
                        <ProgressBar progress={xpProgress.progress} color={colors.primary} height={8} />
                    </Card>

                    {/* Today's Progress */}
                    <Card style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing[2] }}>
                                    <Typography variant="largeTitle" style={{ fontSize: 32 }} tabularNums>{todayStatus.completed}</Typography>
                                    <Typography variant="title2" color={colors.textDim} tabularNums>/ {todayStatus.total}</Typography>
                                </View>
                                <Typography variant="caption" color={colors.textDim} style={{ fontWeight: '600', letterSpacing: 0.5 }}>HABITS COMPLETED</Typography>
                            </View>
                            {todayStatus.isPerfect && (
                                <View style={styles.perfectBadge}>
                                    <Ionicons name="star" size={14} color={colors.warning} />
                                    <Typography variant="caption" color={colors.warning} style={{ fontWeight: '700' }}>PERFECT</Typography>
                                </View>
                            )}
                        </View>
                        <ProgressBar
                            progress={todayStatus.progress}
                            color={todayStatus.isPerfect ? colors.success : colors.primary}
                            height={8}
                        />
                    </Card>

                    {/* Week Heatmap */}
                    <Typography variant="subheadline" color={colors.textSecondary} style={styles.sectionTitle}>This Week</Typography>
                    <Card style={styles.heatmapCard}>
                        {weekHeatmap.map((day, i) => (
                            <HeatBox key={day.date} day={day} isToday={i === 6} intensity={day.progress} />
                        ))}
                    </Card>

                    {/* Habit Categories */}
                    {Object.entries(categories).map(([category, categoryHabits]) => {
                        const sortedHabits = [...categoryHabits].sort((a, b) => {
                            const aDone = isHabitDone(a.id);
                            const bDone = isHabitDone(b.id);
                            if (aDone === bDone) return 0;
                            return aDone ? 1 : -1; // completed move to bottom
                        });

                        return (
                            <View key={category} style={{ marginBottom: spacing[6] }}>
                                <View style={styles.categoryHeader}>
                                    <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[category] || colors.textDim }]} />
                                    <Typography variant="title3" color={colors.textSecondary} style={{ flex: 1, textTransform: 'capitalize', letterSpacing: 0.5 }}>
                                        {category.toLowerCase()}
                                    </Typography>
                                    <Typography variant="caption" color={colors.textDim} style={{ fontWeight: '700', fontVariant: ['tabular-nums'] }} tabularNums>
                                        {categoryHabits.filter(h => isHabitDone(h.id)).length}/{categoryHabits.length}
                                    </Typography>
                                </View>

                                <Card style={styles.categoryCard}>
                                    {sortedHabits.map((habit, index) => {
                                        const done = isHabitDone(habit.id);
                                        const streak = getHabitStreak(habit.id);
                                        const isLast = index === sortedHabits.length - 1;

                                        return (
                                            <SwipeableCard
                                                key={habit.id}
                                                style={isLast ? {} : { borderBottomWidth: 1, borderBottomColor: colors.borderLight + '50' }}
                                                onSwipeLeft={() => handleToggle(habit.id)}
                                                leftActionIcon={done ? "arrow-undo" : "checkmark"}
                                                leftActionColor={done ? colors.warning : colors.success}
                                                onSwipeRight={habit.isCustom ? () => handleRemoveHabit(habit.id) : null}
                                            >
                                                <TouchableOpacity
                                                    style={styles.habitRow}
                                                    onPress={() => handleToggle(habit.id)}
                                                    onLongPress={() => habit.isCustom && handleRemoveHabit(habit.id)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={styles.habitLeft}>
                                                        <View style={[styles.checkbox, done && styles.checkboxDone]}>
                                                            {done && <Ionicons name="checkmark" size={16} color={colors.textInverse} />}
                                                        </View>
                                                        <View style={styles.iconBox}>
                                                            <Ionicons name={habit.icon} size={22} color={done ? colors.textDim : CATEGORY_COLORS[category] || colors.primary} />
                                                        </View>
                                                        <View style={styles.habitInfo}>
                                                            <Typography
                                                                variant="headline"
                                                                style={[
                                                                    { fontSize: 16 },
                                                                    done ? { textDecorationLine: 'line-through', color: colors.textDim } : { color: colors.text }
                                                                ]}
                                                            >
                                                                {habit.name}
                                                            </Typography>
                                                            <Typography variant="caption" color={colors.primary} style={{ marginTop: 2, fontWeight: '700' }} tabularNums>
                                                                +{habit.xpReward} XP
                                                            </Typography>
                                                        </View>
                                                    </View>
                                                    <View style={styles.habitRight}>
                                                        {streak.current > 0 && (
                                                            <View style={styles.streakBadge}>
                                                                <Ionicons name="flame" size={14} color="#EF4444" />
                                                                <Typography variant="caption" color="#EF4444" style={{ fontWeight: '800' }} tabularNums>
                                                                    {streak.current}
                                                                </Typography>
                                                            </View>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            </SwipeableCard>
                                        );
                                    })}
                                </Card>
                            </View>
                        );
                    })}

                    {/* Add Custom Habit Button */}
                    <TouchableOpacity
                        style={styles.addCustomBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            bottomSheetRef.current?.present();
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={22} color={colors.primary} />
                        <Typography variant="title3" color={colors.primary}>Add Custom Habit</Typography>
                    </TouchableOpacity>

                    {/* Obligations */}
                    {obligations.length > 0 && (
                        <>
                            <Typography variant="subheadline" color={colors.textSecondary} style={[styles.sectionTitle, { marginTop: spacing[8], letterSpacing: 0.5 }]}>
                                ACTIVE OBLIGATIONS
                            </Typography>
                            {obligations.filter(o => o.status === 'ACTIVE').map((ob) => (
                                <Card key={ob.id} style={styles.obligationCard}>
                                    <View style={styles.obligationLeft}>
                                        <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                            <Ionicons name="flash" size={20} color={colors.warning} />
                                        </View>
                                        <View>
                                            <Typography variant="headline">{ob.title}</Typography>
                                            <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2, fontWeight: '600' }}>
                                                DUE: {new Date(ob.deadline).toLocaleDateString()}
                                            </Typography>
                                        </View>
                                    </View>
                                    <View style={[styles.statusBadge, {
                                        backgroundColor: ob.status === 'ACTIVE' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    }]}>
                                        <Typography variant="caption" color={ob.status === 'ACTIVE' ? colors.warning : colors.success} style={{ fontWeight: '800', textTransform: 'uppercase' }}>
                                            {ob.status}
                                        </Typography>
                                    </View>
                                </Card>
                            ))}
                        </>
                    )}

                    {obligations.length === 0 && (
                        <View style={{ marginTop: spacing[8], alignItems: 'center', opacity: 0.8 }}>
                            <AbstractPattern primaryColor={colors.warning} style={{ marginBottom: spacing[4], transform: [{ scale: 0.7 }] }} />
                            <Typography variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                                No active obligations. Stay disciplined.
                            </Typography>
                        </View>
                    )}

                    {/* Debt Warning */}
                    {debtUnits > 0 && (
                        <Card style={styles.debtCard}>
                            <View style={styles.debtLeft}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                    <Ionicons name="warning" size={24} color={colors.danger} />
                                </View>
                                <View style={styles.debtInfo}>
                                    <Typography variant="headline" color={colors.danger}>Debt Units: {debtUnits}</Typography>
                                    <Typography variant="caption" color={colors.danger} style={{ opacity: 0.8, marginTop: 2, fontWeight: '600' }}>
                                        Complete obligations to clear debt.
                                    </Typography>
                                </View>
                            </View>
                        </Card>
                    )}

                    <View style={{ height: 40 }} />
                </ScreenWrapper>
            </Animated.ScrollView>

            {/* Custom Bottom Sheet Modal */}
            <CustomBottomSheet ref={bottomSheetRef} snapPoints={['40%']}>
                <Typography variant="title2" style={{ marginBottom: spacing[4] }}>Add Custom Habit</Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing[6] }}>
                    Define a new routine to build your discipline.
                </Typography>

                <TextInput
                    style={styles.addHabitInput}
                    placeholder="Habit Name (e.g., Read 10 pages)"
                    placeholderTextColor={colors.textDim}
                    value={newHabitName}
                    onChangeText={setNewHabitName}
                    autoCapitalize="sentences"
                />

                <Button
                    title="Add Habit"
                    onPress={handleAddHabit}
                    size="lg"
                    style={{ marginTop: spacing[4] }}
                />
            </CustomBottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[8] + 100, // Account for sticky header
        paddingBottom: spacing[8],
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        overflow: 'hidden',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: spacing[4],
    },
    stickyHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
    },
    stickyTitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 17, // Standard iOS header size
        color: colors.text,
        letterSpacing: -0.5,
    },
    header: {
        marginBottom: spacing[6],
    },
    sectionTitle: {
        marginBottom: spacing[3],
        marginLeft: spacing[1],
        marginTop: spacing[2],
        fontWeight: '700'
    },

    // Stat Cards (XP, Progress)
    statCard: {
        marginBottom: spacing[5],
        padding: spacing[6],
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[5],
    },
    perfectBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: radius.full,
    },

    // Heatmap
    heatmapCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing[5],
        paddingVertical: spacing[6],
        marginBottom: spacing[6],
    },
    heatDay: {
        alignItems: 'center',
        flex: 1,
    },
    heatBox: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },

    // Categories
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[3],
        paddingHorizontal: spacing[1],
    },
    categoryDot: {
        width: 12,
        height: 12,
        borderRadius: radius.full,
    },
    categoryCard: {
        padding: 0, // remove padding from card to allow rows to span full width
        overflow: 'hidden',
    },

    // Habit Row
    habitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[5],
        paddingHorizontal: spacing[5],
        backgroundColor: colors.surface,
    },
    habitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
        flex: 1,
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: radius.sm,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxDone: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    habitInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    habitRight: {
        paddingLeft: spacing[2],
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3],
        borderRadius: radius.full,
    },

    // Add Custom
    addCustomBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        paddingVertical: spacing[4],
        borderWidth: 2,
        borderColor: colors.primary + '40', // light primary
        borderStyle: 'dashed',
        borderRadius: radius.lg,
        marginTop: spacing[2],
        marginBottom: spacing[6],
    },
    addHabitInput: {
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.md,
        color: colors.text,
        fontSize: 18,
        padding: spacing[4],
        fontWeight: '500',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },

    // Obligations
    obligationCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing[5],
        marginBottom: spacing[4],
    },
    obligationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
        flex: 1,
    },
    statusBadge: {
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3],
        borderRadius: radius.full,
    },

    // Debt
    debtCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 1,
        marginTop: spacing[6],
        padding: spacing[5],
    },
    debtLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
    },
    debtInfo: {
        flex: 1,
    },
});

export default DisciplineScreen;
