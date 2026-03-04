/**
 * FORGEBORN — NUTRITION HOME SCREEN
 * 
 * Daily nutrition dashboard with:
 * - Calorie progress ring
 * - Macro bars (protein/carbs/fats)
 * - Meal slots (breakfast/lunch/snack/dinner)
 * - Water tracker (glass by glass)
 * - Per-meal calorie breakdown
 * 
 * Inspired by: MacroFactor (clean UI), HealthifyMe (Indian meals), MFP (macro pie)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useUserStore from '../../store/userStore';
import useNutritionStore from '../../store/nutritionStore';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import { radius, shadows } from '../theme/colors';

const MEAL_SLOTS = [
    { type: 'BREAKFAST', label: 'BREAKFAST', icon: 'sunny-outline', time: '8:00 AM' },
    { type: 'LUNCH', label: 'LUNCH', icon: 'partly-sunny-outline', time: '1:00 PM' },
    { type: 'SNACKS', label: 'SNACKS', icon: 'cafe-outline', time: '4:00 PM' },
    { type: 'DINNER', label: 'DINNER', icon: 'moon-outline', time: '8:00 PM' },
];

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
    const calProgress = Math.min(1, totals.calories / plan.targetCalories);
    const proteinProgress = Math.min(1, totals.protein / plan.macros.protein);
    const carbsProgress = Math.min(1, totals.carbs / plan.macros.carbs);
    const fatsProgress = Math.min(1, totals.fats / plan.macros.fats);
    const waterProgress = Math.min(1, totals.water / plan.waterGlasses);
    const remainingCals = plan.targetCalories - totals.calories;

    const handleAddWater = () => {
        addWater(1);
        Vibration.vibrate(30);
        setRefreshKey(k => k + 1);
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
                <Text style={styles.title}>NUTRITION</Text>
                <Text style={styles.subtitle}>
                    {plan.deficit < 0 ? `${Math.abs(plan.deficit)} CAL DEFICIT` :
                        plan.deficit > 0 ? `${plan.deficit} CAL SURPLUS` : 'MAINTENANCE'}
                </Text>

                {/* Calorie Ring Card */}
                <View style={styles.calorieCard}>
                    <CalorieRing
                        consumed={totals.calories}
                        target={plan.targetCalories}
                        size={130}
                        strokeWidth={8}
                        color={colors.primary}
                    />
                    <View style={styles.calorieStats}>
                        <View style={styles.calStatRow}>
                            <Text style={styles.calStatLabel}>TARGET</Text>
                            <Text style={styles.calStatVal}>{plan.targetCalories}</Text>
                        </View>
                        <View style={styles.calStatRow}>
                            <Text style={styles.calStatLabel}>CONSUMED</Text>
                            <Text style={[styles.calStatVal, { color: colors.primary }]}>{totals.calories}</Text>
                        </View>
                        <View style={styles.calStatRow}>
                            <Text style={styles.calStatLabel}>REMAINING</Text>
                            <Text style={[styles.calStatVal, {
                                color: remainingCals < 0 ? colors.danger : colors.success
                            }]}>{remainingCals}</Text>
                        </View>
                        <View style={[styles.calStatRow, { marginTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing[2] }]}>
                            <Text style={styles.calStatLabel}>BMR</Text>
                            <Text style={[styles.calStatVal, { fontSize: 11 }]}>{plan.bmr}</Text>
                        </View>
                        <View style={styles.calStatRow}>
                            <Text style={styles.calStatLabel}>TDEE</Text>
                            <Text style={[styles.calStatVal, { fontSize: 11 }]}>{plan.tdee}</Text>
                        </View>
                    </View>
                </View>

                {/* Macro Bars */}
                <Text style={styles.sectionLabel}>MACROS</Text>
                <View style={styles.macroCard}>
                    <MacroBar label="PROTEIN" current={totals.protein} target={plan.macros.protein} color={colors.protein} />
                    <MacroBar label="CARBS" current={totals.carbs} target={plan.macros.carbs} color={colors.carbs} />
                    <MacroBar label="FATS" current={totals.fats} target={plan.macros.fats} color={colors.fats} />
                </View>

                {/* Meal Slots */}
                <Text style={styles.sectionLabel}>MEALS</Text>
                {MEAL_SLOTS.map((slot) => {
                    const meals = getMealsByType(slot.type);
                    const slotCals = meals.reduce((sum, m) => sum + m.calories, 0);
                    const slotProtein = meals.reduce((sum, m) => sum + m.protein, 0);

                    return (
                        <View key={slot.type} style={styles.mealSlot}>
                            <View style={styles.mealSlotHeader}>
                                <View style={styles.mealSlotLeft}>
                                    <Ionicons name={slot.icon} size={18} color={colors.textSecondary} />
                                    <View>
                                        <Text style={styles.mealSlotName}>{slot.label}</Text>
                                        <Text style={styles.mealSlotTime}>{slot.time}</Text>
                                    </View>
                                </View>
                                <View style={styles.mealSlotRight}>
                                    {slotCals > 0 && (
                                        <Text style={styles.slotCals}>{slotCals} cal</Text>
                                    )}
                                    <TouchableOpacity
                                        style={styles.addMealBtn}
                                        onPress={() => navigation.navigate('MealLog', { mealType: slot.type })}
                                    >
                                        <Ionicons name="add" size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Logged items */}
                            {meals.map((meal) => (
                                <TouchableOpacity
                                    key={meal.id}
                                    style={styles.loggedItem}
                                    onLongPress={() => {
                                        removeFood(meal.id);
                                        setRefreshKey(k => k + 1);
                                        Vibration.vibrate(30);
                                    }}
                                >
                                    <View style={styles.loggedItemLeft}>
                                        <Text style={styles.loggedItemName}>{meal.name}</Text>
                                        <Text style={styles.loggedItemMacro}>
                                            P:{Math.round(meal.protein)}g  C:{Math.round(meal.carbs)}g  F:{Math.round(meal.fats)}g
                                        </Text>
                                    </View>
                                    <Text style={styles.loggedItemCals}>{meal.calories}</Text>
                                </TouchableOpacity>
                            ))}

                            {meals.length === 0 && (
                                <TouchableOpacity
                                    style={styles.emptySlot}
                                    onPress={() => navigation.navigate('MealLog', { mealType: slot.type })}
                                >
                                    <Ionicons name="add-circle-outline" size={16} color={colors.textDim} />
                                    <Text style={styles.emptySlotText}>Tap to log {slot.label.toLowerCase()}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {/* Water Tracker */}
                <Text style={styles.sectionLabel}>HYDRATION</Text>
                <View style={styles.waterCard}>
                    <View style={styles.waterHeader}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="water-outline" size={14} color={colors.info} />
                                <Text style={styles.waterTitle}>WATER</Text>
                            </View>
                            <Text style={styles.waterCount}>
                                {totals.water} / {plan.waterGlasses} glasses
                            </Text>
                        </View>
                        <Text style={styles.waterMl}>
                            {totals.water * 250}ml / {plan.waterGlasses * 250}ml
                        </Text>
                    </View>

                    {/* Water progress */}
                    <View style={styles.waterBarBg}>
                        <View style={[styles.waterBarFill, {
                            width: `${waterProgress * 100}%`,
                        }]} />
                    </View>

                    {/* Water glasses */}
                    <View style={styles.glassRow}>
                        {Array.from({ length: Math.min(plan.waterGlasses, 12) }, (_, i) => (
                            <View
                                key={i}
                                style={[styles.glass,
                                i < totals.water && styles.glassFilled
                                ]}
                            >
                                <Text style={styles.glassIcon}>
                                    <Ionicons
                                        name={i < totals.water ? 'water' : 'water-outline'}
                                        size={16}
                                        color={i < totals.water ? colors.info : colors.textDim}
                                    />
                                </Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.addWaterBtn}
                        onPress={handleAddWater}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={18} color="#000" />
                        <Text style={styles.addWaterText}>ADD GLASS</Text>
                    </TouchableOpacity>
                </View>

                {/* Week Overview */}
                <Text style={styles.sectionLabel}>THIS WEEK</Text>
                <View style={styles.weekCard}>
                    {weekSummary.map((day, i) => {
                        const dayProgress = day.calories > 0
                            ? Math.min(1, day.calories / plan.targetCalories)
                            : 0;
                        const isToday = i === 6;

                        return (
                            <View key={day.date} style={[styles.weekDay, isToday && styles.weekDayActive]}>
                                <Text style={[styles.weekDayLabel, isToday && { color: colors.primary }]}>
                                    {day.day}
                                </Text>
                                <View style={styles.weekBarBg}>
                                    <View style={[styles.weekBarFill, {
                                        height: `${dayProgress * 100}%`,
                                        backgroundColor: isToday ? colors.primary :
                                            dayProgress >= 0.8 ? colors.success : colors.textDim,
                                    }]} />
                                </View>
                                <Text style={styles.weekDayCals}>
                                    {day.calories > 0 ? day.calories : '–'}
                                </Text>
                            </View>
                        );
                    })}
                </View>

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

    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[5],
        marginBottom: spacing[2],
    },

    // Calorie Card
    calorieCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: radius.lg,
        padding: spacing[4],
        gap: spacing[4],
        ...shadows.md,
    },
    calorieRing: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringOuter: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 6,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringInner: {
        alignItems: 'center',
    },
    calorieNum: {
        fontSize: 26,
        fontWeight: '900',
        color: colors.text,
    },
    calorieLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },
    calorieStats: {
        flex: 1,
        justifyContent: 'center',
    },
    calStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    calStatLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },
    calStatVal: {
        fontSize: 13,
        fontWeight: '900',
        color: colors.text,
    },

    // Macros
    macroCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[4],
    },
    macroRow: {},
    macroInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[1],
    },
    macroName: {
        ...textStyles.label,
        fontSize: 11,
    },
    macroGrams: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },
    macroBarBg: {
        height: 8,
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    macroBarFill: {
        height: '100%',
    },

    // Meals
    mealSlot: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginBottom: spacing[2],
        overflow: 'hidden',
    },
    mealSlotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing[3],
    },
    mealSlotLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    mealSlotIcon: { fontSize: 20 },
    mealSlotName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    mealSlotTime: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
    mealSlotRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    slotCals: {
        ...textStyles.label,
        color: colors.textSecondary,
        fontSize: 12,
    },
    addMealBtn: {
        width: 30,
        height: 30,
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Logged items
    loggedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    loggedItemLeft: { flex: 1 },
    loggedItemName: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 11,
    },
    loggedItemMacro: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
        marginTop: 1,
    },
    loggedItemCals: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
    },

    emptySlot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        padding: spacing[2],
        paddingHorizontal: spacing[3],
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    emptySlotText: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },

    // Water
    waterCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[3],
    },
    waterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[2],
    },
    waterTitle: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 13,
    },
    waterCount: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },
    waterMl: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },
    waterBarBg: {
        height: 6,
        backgroundColor: colors.background,
        marginBottom: spacing[2],
        overflow: 'hidden',
    },
    waterBarFill: {
        height: '100%',
        backgroundColor: '#4FA4FF',
    },
    glassRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[1],
        marginBottom: spacing[3],
    },
    glass: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    glassFilled: {
        backgroundColor: 'rgba(79, 164, 255, 0.15)',
    },
    glassIcon: {
        fontSize: 14,
    },
    addWaterBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4FA4FF',
        padding: spacing[2],
        gap: spacing[1],
    },
    addWaterText: {
        ...textStyles.button,
        color: '#000',
        fontSize: 11,
    },

    // Week
    weekCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[3],
        justifyContent: 'space-between',
    },
    weekDay: {
        alignItems: 'center',
        flex: 1,
    },
    weekDayActive: {},
    weekDayLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginBottom: spacing[1],
    },
    weekBarBg: {
        width: 12,
        height: 50,
        backgroundColor: colors.background,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    weekBarFill: {
        width: '100%',
    },
    weekDayCals: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 7,
        marginTop: spacing[1],
    },
});

export default NutritionHomeScreen;
