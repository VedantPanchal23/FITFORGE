import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import { ms, fs, hp, wp, sizes } from '../utils/responsive';
import * as PFT from '../services/PFTBridge';

export default function FoodScreen({ navigation }) {
    const { theme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [todayLog, setTodayLog] = useState(null);
    const [macros, setMacros] = useState({ calories: 2000, protein: 150, carbs: 200, fats: 60 });
    const [contextMode, setContextMode] = useState('normal'); // normal, quick, budget, restaurant
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [intakeSummary, setIntakeSummary] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadData();
    }, []);

    // Reload meals when context mode changes
    useEffect(() => {
        if (profile) {
            const mealPlan = PFT.generateMealPlan(profile, { contextMode });
            if (mealPlan?.meals) {
                setMeals(mealPlan.meals);
            }
        }
    }, [contextMode, profile]);

    // Reload when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadIntakeSummary();
        });
        return unsubscribe;
    }, [navigation]);

    const loadData = async () => {
        try {
            const p = await PFT.getProfile();
            setProfile(p);

            if (p) {
                // Get real macros from core
                const calculatedMacros = PFT.calculateMacros(p);
                setMacros(calculatedMacros);

                // Generate meal plan with context mode
                const mealPlan = PFT.generateMealPlan(p, { contextMode });
                if (mealPlan?.meals) {
                    setMeals(mealPlan.meals);
                }
            }

            const log = await PFT.getDailyLog(today);
            setTodayLog(log);

            // Load intake analysis
            await loadIntakeSummary();
        } catch (error) {
            console.log('Food load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadIntakeSummary = async () => {
        try {
            const summary = await PFT.getIntakeSummary(today);
            setIntakeSummary(summary);
        } catch (error) {
            console.log('Intake summary error:', error);
        }
    };

    const contextModes = [
        { id: 'normal', label: 'Normal', icon: 'home', color: '#6366F1' },
        { id: 'quick', label: 'Quick', icon: 'zap', color: '#F59E0B' },
        { id: 'budget', label: 'Budget', icon: 'dollar-sign', color: '#10B981' },
        { id: 'restaurant', label: 'Dining', icon: 'map-pin', color: '#EF4444' }
    ];

    const consumedCalories = todayLog?.calories || 0;
    const consumedProtein = todayLog?.protein || 0;
    const consumedCarbs = todayLog?.carbs || 0;
    const consumedFats = todayLog?.fats || 0;

    const MacroBar = ({ label, consumed, target, color }) => {
        const progress = Math.min(consumed / target, 1);
        return (
            <View style={styles.macroItem}>
                <View style={styles.macroHeader}>
                    <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{label}</Text>
                    <Text style={[styles.macroValue, { color: theme.text }]}>{consumed}/{target}g</Text>
                </View>
                <View style={[styles.macroBar, { backgroundColor: theme.cardBorder }]}>
                    <View style={[styles.macroProgress, { width: `${progress * 100}%`, backgroundColor: color }]} />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>FOOD</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Nutrition Tracker</Text>
                    </View>
                </View>

                {/* Context Mode Selector */}
                <View style={styles.modeBar}>
                    {contextModes.map(mode => (
                        <TouchableOpacity
                            key={mode.id}
                            style={[
                                styles.modeChip,
                                {
                                    backgroundColor: contextMode === mode.id ? mode.color : theme.card,
                                    borderColor: contextMode === mode.id ? mode.color : theme.cardBorder
                                }
                            ]}
                            onPress={() => setContextMode(mode.id)}
                        >
                            <Feather name={mode.icon} size={14} color={contextMode === mode.id ? '#FFF' : theme.textSecondary} />
                            <Text style={[
                                styles.modeChipText,
                                { color: contextMode === mode.id ? '#FFF' : theme.textSecondary }
                            ]}>
                                {mode.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Today's Summary - Planned vs Actual */}
                {intakeSummary && intakeSummary.hasLogs && (
                    <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>TODAY'S SUMMARY</Text>
                            <Text style={[styles.itemsLogged, { color: theme.primary }]}>
                                {intakeSummary.itemsLogged} items logged
                            </Text>
                        </View>

                        {/* Calories Row */}
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryLeft}>
                                <Feather name="zap" size={16} color={theme.warning} />
                                <Text style={[styles.summaryLabel, { color: theme.text }]}>Calories</Text>
                            </View>
                            <View style={styles.summaryRight}>
                                <Text style={[styles.summaryPlanned, { color: theme.textSecondary }]}>
                                    {intakeSummary.planned.calories}
                                </Text>
                                <Feather name="arrow-right" size={12} color={theme.textTertiary} />
                                <Text style={[styles.summaryActual, {
                                    color: intakeSummary.analysis.calories.status === 'on_target' ? theme.success :
                                        intakeSummary.analysis.calories.status === 'surplus' ? theme.error : theme.warning
                                }]}>
                                    {intakeSummary.actual.calories}
                                </Text>
                                <Text style={[styles.summaryUnit, { color: theme.textTertiary }]}>kcal</Text>
                            </View>
                        </View>

                        {/* Protein Row */}
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryLeft}>
                                <Feather name="target" size={16} color={theme.error} />
                                <Text style={[styles.summaryLabel, { color: theme.text }]}>Protein</Text>
                            </View>
                            <View style={styles.summaryRight}>
                                <Text style={[styles.summaryPlanned, { color: theme.textSecondary }]}>
                                    {Math.round(intakeSummary.planned.protein)}g
                                </Text>
                                <Feather name="arrow-right" size={12} color={theme.textTertiary} />
                                <Text style={[styles.summaryActual, {
                                    color: intakeSummary.analysis.protein.status === 'on_target' ? theme.success :
                                        intakeSummary.analysis.protein.status === 'deficit' ? theme.error : theme.warning
                                }]}>
                                    {Math.round(intakeSummary.actual.protein)}g
                                </Text>
                                {intakeSummary.analysis.protein.difference < 0 && (
                                    <Text style={[styles.deficitBadge, { backgroundColor: theme.error + '20', color: theme.error }]}>
                                        {Math.round(intakeSummary.analysis.protein.difference)}g
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { backgroundColor: theme.cardBorder }]}>
                                <View style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(intakeSummary.analysis.protein.percentComplete, 100)}%`,
                                        backgroundColor: intakeSummary.analysis.protein.percentComplete >= 90 ? theme.success :
                                            intakeSummary.analysis.protein.percentComplete >= 70 ? theme.warning : theme.error
                                    }
                                ]} />
                            </View>
                            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                                {intakeSummary.analysis.protein.percentComplete}% of protein target
                            </Text>
                        </View>

                        {/* Deficit Alert with Compensation Suggestions */}
                        {intakeSummary.analysis.protein.status === 'deficit' && intakeSummary.compensationSuggestions?.length > 0 && (
                            <View style={[styles.alertBox, { backgroundColor: theme.error + '10', borderColor: theme.error + '30' }]}>
                                <View style={styles.alertHeader}>
                                    <Feather name="alert-circle" size={16} color={theme.error} />
                                    <Text style={[styles.alertTitle, { color: theme.error }]}>
                                        {Math.abs(Math.round(intakeSummary.analysis.protein.difference))}g protein deficit
                                    </Text>
                                </View>
                                <Text style={[styles.alertSubtitle, { color: theme.textSecondary }]}>
                                    Quick fixes to hit your target:
                                </Text>
                                <View style={styles.suggestionList}>
                                    {intakeSummary.compensationSuggestions.slice(0, 3).map((suggestion, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[styles.suggestionChip, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}
                                            onPress={() => navigation.navigate('FoodLogging', { mealType: 'snack' })}
                                        >
                                            <Text style={[styles.suggestionText, { color: theme.primary }]}>
                                                {suggestion.unit} {suggestion.name}
                                            </Text>
                                            <Text style={[styles.suggestionProtein, { color: theme.success }]}>
                                                +{suggestion.proteinProvided}g
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Success Message */}
                        {intakeSummary.analysis.protein.percentComplete >= 90 && (
                            <View style={[styles.successBox, { backgroundColor: theme.success + '10' }]}>
                                <Feather name="check-circle" size={16} color={theme.success} />
                                <Text style={[styles.successText, { color: theme.success }]}>
                                    Great job hitting your protein target! 💪
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Today's Overview - Original macro bars */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
                            {intakeSummary?.hasLogs ? 'LOGGED INTAKE' : 'TODAY\'S INTAKE'}
                        </Text>
                        <Text style={[styles.calorieCount, { color: theme.primary }]}>
                            {intakeSummary?.actual?.calories || consumedCalories} / {macros.calories} kcal
                        </Text>
                    </View>

                    <View style={styles.macros}>
                        <MacroBar
                            label="Protein"
                            consumed={intakeSummary?.actual?.protein || consumedProtein}
                            target={macros.protein}
                            color={theme.error}
                        />
                        <MacroBar
                            label="Carbs"
                            consumed={intakeSummary?.actual?.carbs || consumedCarbs}
                            target={macros.carbs}
                            color={theme.warning}
                        />
                        <MacroBar
                            label="Fats"
                            consumed={intakeSummary?.actual?.fats || consumedFats}
                            target={macros.fats}
                            color={theme.success}
                        />
                    </View>
                </View>

                {/* Quick Log */}
                <TouchableOpacity
                    style={[styles.quickLog, { backgroundColor: theme.primary }]}
                    onPress={() => navigation.navigate('FoodLogging')}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                    <Text style={styles.quickLogText}>Log Food</Text>
                </TouchableOpacity>

                {/* Meal Plan */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {contextMode === 'normal' ? 'TODAY\'S MEALS' :
                            contextMode === 'quick' ? 'QUICK MEALS' :
                                contextMode === 'budget' ? 'BUDGET MEAL PLAN' :
                                    'RESTAURANT OPTIONS'}
                    </Text>

                    {meals.length > 0 ? meals.map((meal, idx) => (
                        <View key={idx} style={[styles.mealCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <View style={styles.mealHeader}>
                                <Text style={[styles.mealName, { color: theme.text }]}>{meal.name || `Meal ${idx + 1}`}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Text style={[styles.mealCal, { color: theme.primary }]}>{meal.calories || 0} kcal</Text>
                                    <TouchableOpacity
                                        style={[styles.swapBtn, { backgroundColor: theme.primary + '15' }]}
                                        onPress={() => {
                                            Alert.alert(
                                                'Swap Meal',
                                                `Current: ${meal.name || 'Meal'}\n\nSwitch context mode at the top to see:\n• Quick meals (under 10 min)\n• Budget options\n• Restaurant choices\n\nOr regenerate by pulling to refresh!`,
                                                [{ text: 'Got it!' }]
                                            );
                                        }}
                                    >
                                        <Feather name="refresh-cw" size={14} color={theme.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {meal.items?.map((item, i) => (
                                <View key={i} style={styles.mealItem}>
                                    <Text style={[styles.itemName, { color: theme.textSecondary }]}>• {item.name || item}</Text>
                                    {item.portion && <Text style={[styles.itemPortion, { color: theme.textTertiary }]}>{item.portion}</Text>}
                                </View>
                            ))}
                            {/* Log Actual Button */}
                            <TouchableOpacity
                                style={[styles.logActualBtn, { backgroundColor: theme.success + '15', borderColor: theme.success }]}
                                onPress={() => navigation.navigate('FoodLogging', { mealType: meal.type?.toLowerCase() || 'lunch' })}
                            >
                                <Feather name="edit-3" size={14} color={theme.success} />
                                <Text style={[styles.logActualText, { color: theme.success }]}>Log What I Actually Ate</Text>
                            </TouchableOpacity>
                        </View>
                    )) : (
                        <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <Feather name="coffee" size={28} color={theme.primary} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                                Your Meal Plan is Ready!
                            </Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                {profile ? 'Pull down to refresh and see your personalized meals' : 'Complete onboarding to get personalized meal plans'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Water Tracking */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.rowCenter}>
                            <Feather name="droplet" size={18} color={theme.info} />
                            <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: 8 }]}>HYDRATION</Text>
                        </View>
                        <Text style={[styles.waterCount, { color: theme.info }]}>
                            {todayLog?.water_glasses || 0} / 8 glasses
                        </Text>
                    </View>
                    <View style={styles.waterGrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <View
                                key={n}
                                style={[
                                    styles.waterDot,
                                    {
                                        backgroundColor: n <= (todayLog?.water_glasses || 0) ? theme.info : theme.cardBorder
                                    }
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: ms(14), paddingBottom: hp(100) },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ms(20) },
    title: { fontSize: fs(24), fontWeight: '700', letterSpacing: 1 },
    subtitle: { fontSize: fs(11), fontWeight: '500', marginTop: ms(4) },
    modeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: ms(10), paddingVertical: ms(8), borderRadius: ms(8), gap: ms(6) },
    modeBtnText: { fontSize: fs(11), fontWeight: '600' },
    card: { borderRadius: ms(12), borderWidth: 1, padding: ms(16), marginBottom: ms(14) },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ms(14) },
    cardLabel: { fontSize: fs(10), fontWeight: '700', letterSpacing: 1 },
    calorieCount: { fontSize: fs(14), fontWeight: '700' },
    macros: { gap: ms(10) },
    macroItem: { marginBottom: ms(6) },
    macroHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: ms(5) },
    macroLabel: { fontSize: fs(11), fontWeight: '500' },
    macroValue: { fontSize: fs(11), fontWeight: '600' },
    macroBar: { height: hp(6), borderRadius: ms(3), overflow: 'hidden' },
    macroProgress: { height: '100%', borderRadius: ms(3) },
    quickLog: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: sizes.touchTarget, padding: ms(14), borderRadius: ms(12), gap: ms(8), marginBottom: ms(20) },
    quickLogText: { color: '#FFF', fontSize: fs(14), fontWeight: '600' },
    section: { marginBottom: ms(20) },
    sectionTitle: { fontSize: fs(12), fontWeight: '700', letterSpacing: 1, marginBottom: ms(10) },
    mealCard: { borderRadius: ms(12), borderWidth: 1, padding: ms(14), marginBottom: ms(10) },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: ms(6) },
    mealName: { fontSize: fs(14), fontWeight: '600' },
    mealCal: { fontSize: fs(13), fontWeight: '600' },
    mealItem: { flexDirection: 'row', justifyContent: 'space-between', marginTop: ms(4) },
    itemName: { fontSize: fs(12), flex: 1 },
    itemPortion: { fontSize: fs(11) },
    emptyCard: { borderRadius: ms(12), borderWidth: 1, padding: ms(28), alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: fs(16), fontWeight: '600', marginTop: ms(10), textAlign: 'center' },
    emptyText: { fontSize: fs(13), marginTop: ms(6), textAlign: 'center', lineHeight: fs(18) },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    waterCount: { fontSize: fs(13), fontWeight: '600' },
    waterGrid: { flexDirection: 'row', gap: ms(6), justifyContent: 'center', flexWrap: 'wrap' },
    waterDot: { width: ms(22), height: ms(22), borderRadius: ms(11) },
    // Context mode styles
    headerRow: { marginBottom: ms(14) },
    modeBar: { flexDirection: 'row', gap: ms(6), marginBottom: ms(16), flexWrap: 'wrap' },
    modeChip: {
        flex: 1,
        minWidth: wp(70),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: sizes.touchTarget,
        paddingVertical: ms(8),
        paddingHorizontal: ms(4),
        borderRadius: ms(8),
        borderWidth: 1,
        gap: ms(4)
    },
    modeChipText: { fontSize: fs(10), fontWeight: '600' },
    swapBtn: { width: sizes.touchTarget * 0.8, height: sizes.touchTarget * 0.8, borderRadius: sizes.touchTarget * 0.4, alignItems: 'center', justifyContent: 'center' },
    logActualBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: ms(10), minHeight: sizes.touchTarget, padding: ms(10), borderRadius: ms(8), borderWidth: 1, gap: ms(6) },
    logActualText: { fontSize: fs(12), fontWeight: '600' },
    // Today's Summary styles
    summaryCard: { borderRadius: ms(12), borderWidth: 1, padding: ms(14), marginBottom: ms(14) },
    itemsLogged: { fontSize: fs(11), fontWeight: '600' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: ms(8), borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
    summaryRight: { flexDirection: 'row', alignItems: 'center', gap: ms(4), flexWrap: 'wrap' },
    summaryLabel: { fontSize: fs(13), fontWeight: '500' },
    summaryPlanned: { fontSize: fs(12) },
    summaryActual: { fontSize: fs(14), fontWeight: '700' },
    summaryUnit: { fontSize: fs(11) },
    deficitBadge: { fontSize: fs(10), fontWeight: '600', paddingHorizontal: ms(5), paddingVertical: ms(2), borderRadius: ms(4), marginLeft: ms(4) },
    progressContainer: { marginTop: ms(10) },
    progressBar: { height: hp(8), borderRadius: ms(4), overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: ms(4) },
    progressText: { fontSize: fs(10), marginTop: ms(5), textAlign: 'center' },
    alertBox: { marginTop: ms(14), padding: ms(10), borderRadius: ms(8), borderWidth: 1 },
    alertHeader: { flexDirection: 'row', alignItems: 'center', gap: ms(6), marginBottom: ms(6) },
    alertTitle: { fontSize: fs(13), fontWeight: '600' },
    alertSubtitle: { fontSize: fs(11), marginBottom: ms(8) },
    suggestionList: { gap: ms(6) },
    suggestionChip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: sizes.touchTarget, padding: ms(10), borderRadius: ms(8), borderWidth: 1 },
    suggestionText: { fontSize: fs(12), fontWeight: '500', flex: 1 },
    suggestionProtein: { fontSize: fs(12), fontWeight: '700' },
    successBox: { flexDirection: 'row', alignItems: 'center', gap: ms(6), marginTop: ms(10), padding: ms(10), borderRadius: ms(8) },
    successText: { fontSize: fs(12), fontWeight: '500' }
});
