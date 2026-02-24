import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import { ms, fs, hp, wp, sizes, screen } from '../utils/responsive';
import * as PFT from '../services/PFTBridge';

const STEPS = ['meals', 'foodlogs', 'workout', 'health', 'looks', 'routine', 'summary'];

export default function DailyCheckInScreen({ navigation }) {
    const { theme } = useTheme();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Data for each domain
    const [meals, setMeals] = useState({ compliance: 'good', protein_hit: true, water_glasses: 8 });
    const [workout, setWorkout] = useState({ done: false, intensity: 'normal', notes: '' });
    const [health, setHealth] = useState({ sleep_hours: 7, energy: 7, stress: 4, mood: 7 });
    const [looks, setLooks] = useState({ morning_done: true, evening_done: false, facial_done: false });
    const [routine, setRoutine] = useState({ wake_time: '06:00', habits_done: 3, focus_hours: 4 });

    // Food logs data
    const [foodLogs, setFoodLogs] = useState([]);
    const [intakeSummary, setIntakeSummary] = useState(null);
    const [mealCompletion, setMealCompletion] = useState(null);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadFoodLogsData();
    }, []);

    const loadFoodLogsData = async () => {
        try {
            const logs = await PFT.getFoodLogs(today);
            setFoodLogs(logs);

            const summary = await PFT.getIntakeSummary(today);
            setIntakeSummary(summary);

            const completion = await PFT.analyzeMealCompletion(today);
            setMealCompletion(completion);
        } catch (error) {
            console.log('Load food logs error:', error);
        }
    };

    const goNext = () => step < STEPS.length - 1 && setStep(step + 1);
    const goBack = () => step > 0 && setStep(step - 1);

    const submitCheckIn = async () => {
        setLoading(true);
        try {
            // Using component-level `today` constant

            // Save DailyLog - use actual intake if available
            const actualCalories = intakeSummary?.actual?.calories || (meals.compliance === 'good' ? 2000 : meals.compliance === 'ok' ? 1800 : 1500);
            const actualProtein = intakeSummary?.actual?.protein || (meals.protein_hit ? 130 : 80);

            await PFT.saveDailyLog(today, {
                calories: actualCalories,
                protein: actualProtein,
                workout_done: workout.done,
                water_glasses: meals.water_glasses
            });

            // Get tomorrow adjustments based on today's intake
            const tomorrowAdjustments = await PFT.getTomorrowAdjustments(today);

            // Save HealthLog
            await PFT.saveHealthLog(today, {
                sleep_hours: health.sleep_hours,
                energy_level: health.energy,
                stress_level: health.stress,
                mood: health.mood,
                water_glasses: meals.water_glasses
            });

            // Save LooksLog
            await PFT.saveLooksLog(today, {
                morning_routine_done: looks.morning_done,
                evening_routine_done: looks.evening_done,
                facial_exercises_done: looks.facial_done
            });

            // Save RoutineLog
            await PFT.saveRoutineLog(today, {
                wake_time: routine.wake_time,
                focus_hours: routine.focus_hours,
                habits: [
                    { id: 'h1', name: 'Habit 1', done: routine.habits_done >= 1 },
                    { id: 'h2', name: 'Habit 2', done: routine.habits_done >= 2 },
                    { id: 'h3', name: 'Habit 3', done: routine.habits_done >= 3 },
                    { id: 'h4', name: 'Habit 4', done: routine.habits_done >= 4 }
                ]
            });

            // Generate tomorrow's plan using LifeAdvisorEngine
            const tomorrowPlan = await PFT.generateUnifiedLifePlan(new Date(Date.now() + 86400000));

            Alert.alert(
                'Day Complete! 🎉',
                `Great job! Your Life Score today: ${tomorrowPlan.lifeScore || 0}\n\nTomorrow's plan has been optimized based on today's data.`,
                [{ text: 'See Tomorrow\'s Plan', onPress: () => navigation.navigate('Main') }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to save check-in. Please try again.');
            console.log('Check-in error:', error);
        } finally {
            setLoading(false);
        }
    };

    const ProgressBar = () => (
        <View style={styles.progressContainer}>
            {STEPS.map((s, i) => (
                <View
                    key={i}
                    style={[
                        styles.progressDot,
                        { backgroundColor: i <= step ? theme.primary : theme.cardBorder }
                    ]}
                />
            ))}
        </View>
    );

    const OptionButton = ({ label, selected, onPress, color }) => (
        <TouchableOpacity
            style={[
                styles.optionBtn,
                {
                    backgroundColor: selected ? (color || theme.primary) : theme.cardBorder,
                    borderColor: selected ? (color || theme.primary) : theme.cardBorder
                }
            ]}
            onPress={onPress}
        >
            <Text style={[styles.optionText, { color: selected ? '#FFF' : theme.textSecondary }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const SliderRow = ({ label, value, min, max, onDecrease, onIncrease }) => (
        <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>{label}</Text>
            <View style={styles.sliderControls}>
                <TouchableOpacity onPress={onDecrease} style={[styles.sliderBtn, { backgroundColor: theme.cardBorder }]}>
                    <Feather name="minus" size={18} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.sliderValue, { color: theme.text }]}>{value}</Text>
                <TouchableOpacity onPress={onIncrease} style={[styles.sliderBtn, { backgroundColor: theme.primary }]}>
                    <Feather name="plus" size={18} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>End My Day</Text>
                <View style={{ width: 24 }} />
            </View>

            <ProgressBar />

            <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
                {/* Step 1: Meals */}
                {step === 0 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>How were your meals today?</Text>
                        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>Rate your overall nutrition compliance</Text>

                        <View style={styles.optionsRow}>
                            <OptionButton label="🎯 Great" selected={meals.compliance === 'good'} onPress={() => setMeals({ ...meals, compliance: 'good' })} color={theme.success} />
                            <OptionButton label="👌 Okay" selected={meals.compliance === 'ok'} onPress={() => setMeals({ ...meals, compliance: 'ok' })} color={theme.warning} />
                            <OptionButton label="😅 Missed" selected={meals.compliance === 'bad'} onPress={() => setMeals({ ...meals, compliance: 'bad' })} color={theme.error} />
                        </View>

                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <TouchableOpacity
                                style={styles.toggleRow}
                                onPress={() => setMeals({ ...meals, protein_hit: !meals.protein_hit })}
                            >
                                <Text style={[styles.toggleLabel, { color: theme.text }]}>Hit protein target?</Text>
                                <Feather
                                    name={meals.protein_hit ? "check-circle" : "circle"}
                                    size={24}
                                    color={meals.protein_hit ? theme.success : theme.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>

                        <SliderRow
                            label="Water (glasses)"
                            value={meals.water_glasses}
                            onDecrease={() => setMeals({ ...meals, water_glasses: Math.max(0, meals.water_glasses - 1) })}
                            onIncrease={() => setMeals({ ...meals, water_glasses: Math.min(12, meals.water_glasses + 1) })}
                        />
                    </View>
                )}

                {/* Step 2: Review Food Logs */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Review Your Food Logs</Text>
                        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>Confirm what you actually ate today</Text>

                        {/* Intake Summary */}
                        {intakeSummary?.hasLogs && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Calories</Text>
                                    <Text style={[styles.summaryValue, { color: theme.text }]}>
                                        {intakeSummary.actual.calories} / {intakeSummary.planned.calories} kcal
                                    </Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Protein</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={[styles.summaryValue, { color: theme.text }]}>
                                            {Math.round(intakeSummary.actual.protein)}g / {Math.round(intakeSummary.planned.protein)}g
                                        </Text>
                                        {intakeSummary.analysis.protein.difference < 0 && (
                                            <View style={[styles.deficitBadge, { backgroundColor: theme.error + '20' }]}>
                                                <Text style={{ color: theme.error, fontSize: 11, fontWeight: '600' }}>
                                                    {Math.round(intakeSummary.analysis.protein.difference)}g
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Logged Foods by Meal */}
                        {mealCompletion && (
                            <View style={styles.mealLogsList}>
                                {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                                    const meal = mealCompletion.byMeal[mealType];
                                    const isMissing = !meal?.logged;

                                    return (
                                        <View
                                            key={mealType}
                                            style={[
                                                styles.mealLogCard,
                                                {
                                                    backgroundColor: isMissing ? theme.warning + '10' : theme.card,
                                                    borderColor: isMissing ? theme.warning : theme.cardBorder
                                                }
                                            ]}
                                        >
                                            <View style={styles.mealLogHeader}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Feather
                                                        name={meal?.logged ? 'check-circle' : 'alert-circle'}
                                                        size={18}
                                                        color={meal?.logged ? theme.success : theme.warning}
                                                    />
                                                    <Text style={[styles.mealLogTitle, { color: theme.text }]}>
                                                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                                    </Text>
                                                </View>
                                                {meal?.logged && (
                                                    <Text style={[styles.mealLogMeta, { color: theme.textSecondary }]}>
                                                        {meal.itemCount} items • {meal.totalCalories} kcal
                                                    </Text>
                                                )}
                                            </View>
                                            {meal?.logged && meal.items?.length > 0 && (
                                                <View style={styles.mealLogItems}>
                                                    {meal.items.slice(0, 3).map((item, i) => (
                                                        <Text key={i} style={[styles.mealLogItem, { color: theme.textSecondary }]}>
                                                            • {item.name}
                                                        </Text>
                                                    ))}
                                                    {meal.items.length > 3 && (
                                                        <Text style={[styles.mealLogItem, { color: theme.textTertiary }]}>
                                                            +{meal.items.length - 3} more
                                                        </Text>
                                                    )}
                                                </View>
                                            )}
                                            {isMissing && (
                                                <TouchableOpacity
                                                    style={[styles.logNowBtn, { backgroundColor: theme.warning }]}
                                                    onPress={() => navigation.navigate('FoodLogging', { mealType })}
                                                >
                                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Log Now</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* No logs message */}
                        {!intakeSummary?.hasLogs && (
                            <View style={[styles.emptyLogsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <Feather name="clipboard" size={32} color={theme.textSecondary} />
                                <Text style={[styles.emptyLogsText, { color: theme.textSecondary }]}>
                                    No foods logged today
                                </Text>
                                <TouchableOpacity
                                    style={[styles.logFoodBtn, { backgroundColor: theme.primary }]}
                                    onPress={() => navigation.navigate('FoodLogging')}
                                >
                                    <Feather name="plus" size={16} color="#FFF" />
                                    <Text style={{ color: '#FFF', fontWeight: '600' }}>Log Food</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Step 3: Workout */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Did you workout today?</Text>

                        <View style={styles.optionsRow}>
                            <OptionButton label="💪 Yes" selected={workout.done} onPress={() => setWorkout({ ...workout, done: true })} color={theme.success} />
                            <OptionButton label="🛋️ Rest Day" selected={!workout.done} onPress={() => setWorkout({ ...workout, done: false })} color={theme.cardBorder} />
                        </View>

                        {workout.done && (
                            <>
                                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Intensity level</Text>
                                <View style={styles.optionsRow}>
                                    <OptionButton label="Light" selected={workout.intensity === 'light'} onPress={() => setWorkout({ ...workout, intensity: 'light' })} />
                                    <OptionButton label="Normal" selected={workout.intensity === 'normal'} onPress={() => setWorkout({ ...workout, intensity: 'normal' })} />
                                    <OptionButton label="Intense" selected={workout.intensity === 'intense'} onPress={() => setWorkout({ ...workout, intensity: 'intense' })} />
                                </View>
                            </>
                        )}
                    </View>
                )}

                {/* Step 4: Health */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>How do you feel?</Text>

                        <SliderRow
                            label="Sleep (hours)"
                            value={health.sleep_hours}
                            onDecrease={() => setHealth({ ...health, sleep_hours: Math.max(0, health.sleep_hours - 0.5) })}
                            onIncrease={() => setHealth({ ...health, sleep_hours: Math.min(12, health.sleep_hours + 0.5) })}
                        />
                        <SliderRow
                            label="Energy (1-10)"
                            value={health.energy}
                            onDecrease={() => setHealth({ ...health, energy: Math.max(1, health.energy - 1) })}
                            onIncrease={() => setHealth({ ...health, energy: Math.min(10, health.energy + 1) })}
                        />
                        <SliderRow
                            label="Stress (1-10)"
                            value={health.stress}
                            onDecrease={() => setHealth({ ...health, stress: Math.max(1, health.stress - 1) })}
                            onIncrease={() => setHealth({ ...health, stress: Math.min(10, health.stress + 1) })}
                        />
                        <SliderRow
                            label="Mood (1-10)"
                            value={health.mood}
                            onDecrease={() => setHealth({ ...health, mood: Math.max(1, health.mood - 1) })}
                            onIncrease={() => setHealth({ ...health, mood: Math.min(10, health.mood + 1) })}
                        />
                    </View>
                )}

                {/* Step 5: Looks */}
                {step === 4 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Skincare & Grooming</Text>

                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <TouchableOpacity
                                style={styles.toggleRow}
                                onPress={() => setLooks({ ...looks, morning_done: !looks.morning_done })}
                            >
                                <Text style={[styles.toggleLabel, { color: theme.text }]}>Morning routine</Text>
                                <Feather name={looks.morning_done ? "check-circle" : "circle"} size={24} color={looks.morning_done ? theme.success : theme.textTertiary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.toggleRow}
                                onPress={() => setLooks({ ...looks, evening_done: !looks.evening_done })}
                            >
                                <Text style={[styles.toggleLabel, { color: theme.text }]}>Evening routine</Text>
                                <Feather name={looks.evening_done ? "check-circle" : "circle"} size={24} color={looks.evening_done ? theme.success : theme.textTertiary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleRow, { borderBottomWidth: 0 }]}
                                onPress={() => setLooks({ ...looks, facial_done: !looks.facial_done })}
                            >
                                <Text style={[styles.toggleLabel, { color: theme.text }]}>Facial exercises</Text>
                                <Feather name={looks.facial_done ? "check-circle" : "circle"} size={24} color={looks.facial_done ? theme.success : theme.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Step 6: Routine */}
                {step === 5 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Daily Discipline</Text>

                        <SliderRow
                            label="Habits completed"
                            value={routine.habits_done}
                            onDecrease={() => setRoutine({ ...routine, habits_done: Math.max(0, routine.habits_done - 1) })}
                            onIncrease={() => setRoutine({ ...routine, habits_done: Math.min(6, routine.habits_done + 1) })}
                        />
                        <SliderRow
                            label="Focus hours"
                            value={routine.focus_hours}
                            onDecrease={() => setRoutine({ ...routine, focus_hours: Math.max(0, routine.focus_hours - 0.5) })}
                            onIncrease={() => setRoutine({ ...routine, focus_hours: Math.min(12, routine.focus_hours + 0.5) })}
                        />
                    </View>
                )}

                {/* Step 7: Summary */}
                {step === 6 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>Day Summary</Text>
                        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>Review before submitting</Text>

                        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <SummaryRow label="Meals" value={meals.compliance === 'good' ? 'Great' : meals.compliance === 'ok' ? 'Okay' : 'Missed'} icon="coffee" />
                            <SummaryRow label="Workout" value={workout.done ? `Done (${workout.intensity})` : 'Rest day'} icon="activity" />
                            <SummaryRow label="Sleep" value={`${health.sleep_hours}h`} icon="moon" />
                            <SummaryRow label="Energy" value={`${health.energy}/10`} icon="zap" />
                            <SummaryRow label="Mood" value={`${health.mood}/10`} icon="smile" />
                            <SummaryRow label="Skincare" value={`${[looks.morning_done, looks.evening_done].filter(Boolean).length}/2`} icon="droplet" />
                            <SummaryRow label="Habits" value={`${routine.habits_done} done`} icon="check-square" />
                            <SummaryRow label="Water" value={`${meals.water_glasses} glasses`} icon="droplet" />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
                {step > 0 ? (
                    <TouchableOpacity style={[styles.navBtn, { borderColor: theme.cardBorder }]} onPress={goBack}>
                        <Feather name="arrow-left" size={20} color={theme.text} />
                        <Text style={[styles.navBtnText, { color: theme.text }]}>Back</Text>
                    </TouchableOpacity>
                ) : <View style={styles.navBtn} />}

                {step < STEPS.length - 1 ? (
                    <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary, { backgroundColor: theme.primary }]} onPress={goNext}>
                        <Text style={styles.navBtnTextPrimary}>Next</Text>
                        <Feather name="arrow-right" size={20} color="#FFF" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.navBtn, styles.navBtnPrimary, { backgroundColor: theme.success }]}
                        onPress={submitCheckIn}
                        disabled={loading}
                    >
                        <Feather name="check-circle" size={20} color="#FFF" />
                        <Text style={styles.navBtnTextPrimary}>{loading ? 'Saving...' : 'Complete Day'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const SummaryRow = ({ label, value, icon }) => {
    const { theme } = useTheme();
    return (
        <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
                <Feather name={icon} size={16} color={theme.textSecondary} />
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{label}</Text>
            </View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: ms(16), paddingVertical: ms(10) },
    headerTitle: { fontSize: fs(16), fontWeight: '600' },
    progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: ms(6), paddingVertical: ms(10) },
    progressDot: { width: wp(28), height: hp(4), borderRadius: 2 },
    content: { flex: 1 },
    contentPadding: { padding: ms(16), paddingBottom: hp(40) },
    stepContent: {},
    stepTitle: { fontSize: fs(22), fontWeight: '700', marginBottom: ms(6) },
    stepDesc: { fontSize: fs(13), marginBottom: ms(20) },
    subLabel: { fontSize: fs(12), fontWeight: '600', marginTop: ms(20), marginBottom: ms(10) },
    optionsRow: { flexDirection: 'row', gap: ms(8), marginBottom: ms(16), flexWrap: 'wrap' },
    optionBtn: { flex: 1, minWidth: wp(90), minHeight: sizes.touchTarget, paddingVertical: ms(12), paddingHorizontal: ms(8), borderRadius: ms(8), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    optionText: { fontSize: fs(13), fontWeight: '600', textAlign: 'center' },
    card: { borderRadius: ms(12), borderWidth: 1, marginBottom: ms(14) },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: ms(14), minHeight: sizes.touchTarget, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    toggleLabel: { fontSize: fs(14), fontWeight: '500', flex: 1 },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ms(16) },
    sliderLabel: { fontSize: fs(13), fontWeight: '500', flex: 1 },
    sliderControls: { flexDirection: 'row', alignItems: 'center', gap: ms(12) },
    sliderBtn: { width: sizes.touchTarget, height: sizes.touchTarget, borderRadius: sizes.touchTarget / 2, alignItems: 'center', justifyContent: 'center' },
    sliderValue: { fontSize: fs(18), fontWeight: '700', minWidth: wp(36), textAlign: 'center' },
    summaryCard: { borderRadius: ms(12), borderWidth: 1, padding: ms(14) },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: ms(8) },
    summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(8) },
    summaryLabel: { fontSize: fs(13) },
    summaryValue: { fontSize: fs(13), fontWeight: '600' },
    navigation: { flexDirection: 'row', padding: ms(16), gap: ms(10), paddingBottom: hp(24) },
    navBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: sizes.touchTarget, padding: ms(14), borderRadius: ms(12), borderWidth: 1, gap: ms(6) },
    navBtnPrimary: { borderWidth: 0 },
    navBtnText: { fontSize: fs(14), fontWeight: '600' },
    navBtnTextPrimary: { color: '#FFF', fontSize: fs(14), fontWeight: '600' },
    // Food logs step styles
    deficitBadge: { paddingHorizontal: ms(6), paddingVertical: ms(2), borderRadius: ms(4) },
    mealLogsList: { gap: ms(8) },
    mealLogCard: { borderRadius: ms(8), borderWidth: 1, padding: ms(10) },
    mealLogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mealLogTitle: { fontSize: fs(14), fontWeight: '600' },
    mealLogMeta: { fontSize: fs(11) },
    mealLogItems: { marginTop: ms(6), paddingLeft: ms(24) },
    mealLogItem: { fontSize: fs(12), marginBottom: ms(2) },
    logNowBtn: { marginTop: ms(6), minHeight: sizes.touchTarget * 0.8, paddingVertical: ms(6), paddingHorizontal: ms(12), borderRadius: ms(6), alignSelf: 'flex-start', justifyContent: 'center' },
    emptyLogsCard: { borderRadius: ms(12), borderWidth: 1, padding: ms(28), alignItems: 'center', justifyContent: 'center' },
    emptyLogsText: { fontSize: fs(13), marginTop: ms(10), marginBottom: ms(14) },
    logFoodBtn: { flexDirection: 'row', alignItems: 'center', gap: ms(6), minHeight: sizes.touchTarget, paddingVertical: ms(10), paddingHorizontal: ms(14), borderRadius: ms(8) }
});
