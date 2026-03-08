import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Animated,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';
import { BlurView } from 'expo-blur';
import { Card, Typography, Button, ProgressBar, ScreenWrapper } from '../components';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
import useUserStore from '../../store/userStore';
import useNutritionStore from '../../store/nutritionStore';
import CalorieRing from '../components/CalorieRing';

const MEAL_SLOTS = [
    { type: 'BREAKFAST', label: 'Breakfast', icon: 'sunny-outline', time: '8:00 AM' },
    { type: 'LUNCH', label: 'Lunch', icon: 'partly-sunny-outline', time: '1:00 PM' },
    { type: 'SNACKS', label: 'Snacks', icon: 'cafe-outline', time: '4:00 PM' },
    { type: 'DINNER', label: 'Dinner', icon: 'moon-outline', time: '8:00 PM' },
];

const WeekBar = ({ progress, isToday, color }) => {
    const heightAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(heightAnim, {
            toValue: progress * 100, // percentage 0-100
            useNativeDriver: false,
            bounciness: 6,
            speed: 10,
            delay: 100, // slight delay for cascade effect if mapped
        }).start();
    }, [progress]);

    return (
        <View style={styles.weekBarBg}>
            <Animated.View style={[
                styles.weekBarFill,
                {
                    height: heightAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                    }),
                    backgroundColor: color,
                }
            ]} />
        </View>
    );
};

const NutritionHomeScreen = ({ navigation }) => {
    const profile = useUserStore((s) => s.profile);
    const nutritionPlan = useNutritionStore((s) => s.nutritionPlan);
    const generatePlan = useNutritionStore((s) => s.generatePlan);
    const getTodaysTotals = useNutritionStore((s) => s.getTodaysTotals);
    const getMealsByType = useNutritionStore((s) => s.getMealsByType);
    const addWater = useNutritionStore((s) => s.addWater);
    const removeFood = useNutritionStore((s) => s.removeFood);
    const getWeekSummary = useNutritionStore((s) => s.getWeekSummary);

    const [refreshKey, setRefreshKey] = useState(0);

    // Generate plan if not exists
    useEffect(() => {
        if (!nutritionPlan && profile) {
            generatePlan(profile);
        }
    }, [profile, nutritionPlan]);

    // Refresh when coming back from MealLog
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setRefreshKey(k => k + 1);
        });
        return unsubscribe;
    }, [navigation]);

    const plan = nutritionPlan || {
        targetCalories: 2200,
        macros: { protein: 140, carbs: 250, fats: 70 },
        waterGlasses: 10,
        tdee: 2200,
        bmr: 1700,
        deficit: 0,
    };

    const totals = getTodaysTotals();
    const weekSummary = getWeekSummary();

    // Progress calculations
    const calProgress = Math.min(1, totals.calories / Math.max(plan.targetCalories, 1));
    const proteinProgress = Math.min(1, totals.protein / Math.max(plan.macros.protein, 1));
    const carbsProgress = Math.min(1, totals.carbs / Math.max(plan.macros.carbs, 1));
    const fatsProgress = Math.min(1, totals.fats / Math.max(plan.macros.fats, 1));
    const waterProgress = Math.min(1, totals.water / Math.max(plan.waterGlasses, 1));
    const remainingCals = plan.targetCalories - totals.calories;

    const handleAddWater = () => {
        addWater(1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRefreshKey(k => k + 1);
    };

    const handleLongPressMeal = (mealId, mealName) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Delete Entry",
            `Remove ${mealName} from today's log?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        removeFood(mealId);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        setRefreshKey(k => k + 1);
                    }
                }
            ]
        );
    };

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
                        Nutrition
                    </Animated.Text>
                </View>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <ScreenWrapper staggerScale={0.7}>
                    {/* Header (Scrolls away) */}
                    <Typography variant="largeTitle" color={colors.text}>Nutrition</Typography>
                    <Typography variant="subheadline" color={colors.textSecondary} style={{ marginBottom: spacing[6], letterSpacing: 1, fontWeight: '600' }}>
                        {plan.deficit < 0 ? `${Math.abs(plan.deficit)} CAL DEFICIT` :
                            plan.deficit > 0 ? `${plan.deficit} CAL SURPLUS` : 'MAINTENANCE'}
                    </Typography>

                    {/* Calorie Ring Card */}
                    <Card style={styles.calorieCard}>
                        <View style={styles.ringContainer}>
                            <CalorieRing
                                consumed={totals.calories}
                                target={plan.targetCalories}
                                size={140}
                                strokeWidth={12}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.calorieStats}>
                            <View style={styles.calStatRow}>
                                <Typography variant="caption" color={colors.textSecondary} style={{ fontWeight: '600' }}>TARGET</Typography>
                                <Typography variant="headline" style={{ fontVariant: ['tabular-nums'] }} tabularNums>{plan.targetCalories}</Typography>
                            </View>
                            <View style={styles.calStatRow}>
                                <Typography variant="caption" color={colors.textSecondary} style={{ fontWeight: '600' }}>CONSUMED</Typography>
                                <Typography variant="headline" color={colors.primary} style={{ fontVariant: ['tabular-nums'] }} tabularNums>{totals.calories}</Typography>
                            </View>
                            <View style={styles.calStatRow}>
                                <Typography variant="caption" color={colors.textSecondary} style={{ fontWeight: '600' }}>REMAIN</Typography>
                                <Typography variant="headline" color={remainingCals < 0 ? colors.danger : colors.text} style={{ fontVariant: ['tabular-nums'] }} tabularNums>
                                    {remainingCals}
                                </Typography>
                            </View>
                            <View style={[styles.calStatRow, { marginTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing[3] }]}>
                                <Typography variant="caption" color={colors.textDim} style={{ fontWeight: '600' }}>BMR</Typography>
                                <Typography variant="caption" style={{ fontVariant: ['tabular-nums'] }} tabularNums>{plan.bmr}</Typography>
                            </View>
                            <View style={styles.calStatRow}>
                                <Typography variant="caption" color={colors.textDim} style={{ fontWeight: '600' }}>TDEE</Typography>
                                <Typography variant="caption" style={{ fontVariant: ['tabular-nums'] }} tabularNums>{plan.tdee}</Typography>
                            </View>
                        </View>
                    </Card>

                    {/* Macro Bars */}
                    <Typography variant="title2" style={styles.sectionLabel}>Macros</Typography>
                    <Card style={styles.macroCard}>
                        <View style={styles.macroRow}>
                            <View style={styles.macroInfo}>
                                <Typography variant="subheadline" style={{ fontWeight: '700' }}>Protein</Typography>
                                <Typography variant="caption" color={colors.textSecondary} style={{ fontVariant: ['tabular-nums'] }}>
                                    {Math.round(totals.protein)} / {plan.macros.protein}g
                                </Typography>
                            </View>
                            <ProgressBar progress={proteinProgress} color={colors.protein || '#3B82F6'} height={8} />
                        </View>

                        <View style={styles.macroRow}>
                            <View style={styles.macroInfo}>
                                <Typography variant="subheadline" style={{ fontWeight: '700' }}>Carbs</Typography>
                                <Typography variant="caption" color={colors.textSecondary} style={{ fontVariant: ['tabular-nums'] }}>
                                    {Math.round(totals.carbs)} / {plan.macros.carbs}g
                                </Typography>
                            </View>
                            <ProgressBar progress={carbsProgress} color={colors.carbs || '#F59E0B'} height={8} />
                        </View>

                        <View style={styles.macroRow}>
                            <View style={styles.macroInfo}>
                                <Typography variant="subheadline" style={{ fontWeight: '700' }}>Fats</Typography>
                                <Typography variant="caption" color={colors.textSecondary} style={{ fontVariant: ['tabular-nums'] }}>
                                    {Math.round(totals.fats)} / {plan.macros.fats}g
                                </Typography>
                            </View>
                            <ProgressBar progress={fatsProgress} color={colors.fats || '#EF4444'} height={8} />
                        </View>
                    </Card>

                    {/* Meal Slots */}
                    <Typography variant="title2" style={styles.sectionLabel}>Meals</Typography>
                    {MEAL_SLOTS.map((slot) => {
                        const meals = getMealsByType(slot.type);
                        const slotCals = meals.reduce((sum, m) => sum + m.calories, 0);

                        return (
                            <Card key={slot.type} style={styles.mealSlot}>
                                <View style={styles.mealSlotHeader}>
                                    <View style={styles.mealSlotLeft}>
                                        <View style={styles.iconBox}>
                                            <Ionicons name={slot.icon} size={20} color={colors.primary} />
                                        </View>
                                        <View>
                                            <Typography variant="title2" style={{ fontSize: 18 }}>{slot.label}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary} style={{ fontWeight: '600' }}>{slot.time}</Typography>
                                        </View>
                                    </View>
                                    <View style={styles.mealSlotRight}>
                                        {slotCals > 0 && (
                                            <Typography variant="subheadline" color={colors.textSecondary} style={{ fontVariant: ['tabular-nums'] }}>{slotCals} cal</Typography>
                                        )}
                                        <TouchableOpacity
                                            style={styles.addMealBtn}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                navigation.navigate('MealLog', { mealType: slot.type });
                                            }}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons name="add" size={22} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Logged items */}
                                {meals.map((meal) => (
                                    <TouchableOpacity
                                        key={meal.id}
                                        style={styles.loggedItem}
                                        onLongPress={() => handleLongPressMeal(meal.id, meal.name)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.loggedItemLeft}>
                                            <Typography variant="headline" style={{ fontSize: 16 }}>{meal.name}</Typography>
                                            <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2, fontVariant: ['tabular-nums'] }}>
                                                P:{Math.round(meal.protein)}g  C:{Math.round(meal.carbs)}g  F:{Math.round(meal.fats)}g
                                            </Typography>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Typography variant="headline" style={{ fontVariant: ['tabular-nums'] }}>{meal.calories}</Typography>
                                            <Typography variant="caption" color={colors.textDim} style={{ fontSize: 10, marginTop: 2 }}>cal</Typography>
                                        </View>
                                    </TouchableOpacity>
                                ))}

                                {meals.length === 0 && (
                                    <TouchableOpacity
                                        style={styles.emptySlot}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            navigation.navigate('MealLog', { mealType: slot.type });
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="add-circle-outline" size={18} color={colors.textDim} />
                                        <Typography variant="caption" color={colors.textSecondary} style={{ fontWeight: '600' }}>Tap to log {slot.label.toLowerCase()}</Typography>
                                    </TouchableOpacity>
                                )}
                            </Card>
                        );
                    })}

                    {/* Water Tracker */}
                    <Typography variant="title2" style={styles.sectionLabel}>Hydration</Typography>
                    <Card style={styles.waterCard}>
                        <View style={styles.waterHeader}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
                                    <Ionicons name="water" size={18} color={colors.info || '#3B82F6'} />
                                    <Typography variant="title2">Water</Typography>
                                </View>
                                <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2, fontWeight: '600' }}>
                                    {totals.water} / {plan.waterGlasses} GLASSES
                                </Typography>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Typography variant="subheadline" color={colors.textSecondary} style={{ fontVariant: ['tabular-nums'] }}>
                                    {totals.water * 250}ml
                                </Typography>
                                <Typography variant="caption" color={colors.textDim} style={{ fontVariant: ['tabular-nums'] }}>
                                    / {plan.waterGlasses * 250}ml
                                </Typography>
                            </View>
                        </View>

                        {/* Water progress */}
                        <ProgressBar progress={waterProgress} color={colors.info || '#3B82F6'} height={8} style={{ marginBottom: spacing[5] }} />

                        {/* Water glasses */}
                        <View style={styles.glassRow}>
                            {Array.from({ length: Math.min(plan.waterGlasses, 16) }, (_, i) => (
                                <View
                                    key={i}
                                    style={[styles.glass,
                                    i < totals.water && styles.glassFilled
                                    ]}
                                >
                                    <Ionicons
                                        name={i < totals.water ? 'water' : 'water-outline'}
                                        size={18}
                                        color={i < totals.water ? (colors.info || '#3B82F6') : colors.textDim}
                                    />
                                </View>
                            ))}
                        </View>

                        <Button
                            title="Add Glass"
                            onPress={handleAddWater}
                            variant="secondary"
                            icon={<Ionicons name="add" size={18} color={colors.info || '#3B82F6'} />}
                            textStyle={{ color: colors.info || '#3B82F6' }}
                            hapticFeedback={false} // Handled custom above
                        />
                    </Card>

                    {/* Week Overview */}
                    <Typography variant="title2" style={styles.sectionLabel}>This Week</Typography>
                    <Card style={styles.weekCard}>
                        {weekSummary.map((day, i) => {
                            const dayProgress = day.calories > 0
                                ? Math.min(1, day.calories / Math.max(plan.targetCalories, 1))
                                : 0;
                            const isToday = i === 6;

                            let barColor = colors.textDim;
                            if (isToday) barColor = colors.primary;
                            else if (dayProgress >= 0.8) barColor = colors.success;

                            return (
                                <View key={day.date} style={styles.weekDay}>
                                    <Typography variant={isToday ? "bold" : "caption"} color={isToday ? colors.primary : colors.textSecondary} style={{ fontSize: 10, marginBottom: spacing[2], fontWeight: '700' }}>
                                        {day.day}
                                    </Typography>
                                    <WeekBar progress={dayProgress} isToday={isToday} color={barColor} />
                                    <Typography variant="caption" color={colors.textDim} style={{ fontSize: 10, marginTop: spacing[2], fontVariant: ['tabular-nums'] }}>
                                        {day.calories > 0 ? day.calories : '–'}
                                    </Typography>
                                </View>
                            );
                        })}
                    </Card>

                    <View style={{ height: 40 }} />
                </ScreenWrapper>
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface
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
    sectionLabel: {
        marginTop: spacing[8],
        marginBottom: spacing[4],
    },

    // Calorie Card
    calorieCard: {
        flexDirection: 'row',
        padding: spacing[6],
        gap: spacing[6],
        alignItems: 'center',
    },
    ringContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    calorieStats: {
        flex: 1,
        justifyContent: 'center',
    },
    calStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[1],
        alignItems: 'center',
    },

    // Macros
    macroCard: {
        padding: spacing[5],
        paddingVertical: spacing[6],
        gap: spacing[6],
    },
    macroRow: {},
    macroInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[2],
        alignItems: 'flex-end',
    },

    // Meals
    mealSlot: {
        padding: 0,
        marginBottom: spacing[5],
        overflow: 'hidden',
    },
    mealSlotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing[5],
    },
    mealSlotLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mealSlotRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    addMealBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Logged items
    loggedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[4],
        borderTopWidth: 1,
        borderTopColor: colors.borderLight + '50',
        backgroundColor: colors.surface,
    },
    loggedItemLeft: { flex: 1 },

    emptySlot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        padding: spacing[4],
        paddingHorizontal: spacing[5],
        borderTopWidth: 1,
        borderTopColor: colors.borderLight + '50',
        backgroundColor: colors.surfaceLight,
    },

    // Water
    waterCard: {
        padding: spacing[6],
    },
    waterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[5],
    },
    glassRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
        marginBottom: spacing[6],
    },
    glass: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.sm,
    },
    glassFilled: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
    },

    // Week
    weekCard: {
        flexDirection: 'row',
        padding: spacing[5],
        paddingVertical: spacing[6],
        justifyContent: 'space-between',
    },
    weekDay: {
        alignItems: 'center',
        flex: 1,
    },
    weekBarBg: {
        width: 14,
        height: 80,
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.full,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    weekBarFill: {
        width: '100%',
        borderRadius: radius.full,
    },
});

export default NutritionHomeScreen;
