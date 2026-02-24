import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, fonts, radius } from '../theme';
import * as PFT from '../services/PFTBridge';

export default function PlanScreen() {
    const { theme } = useTheme();
    const [tab, setTab] = useState('meals');
    const [profile, setProfile] = useState(null);
    const [mealPlan, setMealPlan] = useState(null);
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [skincarePlan, setSkincarePlan] = useState(null);
    const [supplementPlan, setSupplementPlan] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const p = await PFT.getProfile();
            setProfile(p);
            if (p) {
                const metrics = PFT.calculateBodyMetrics(p);
                setMealPlan(generateMealPlanWithFallback(p, metrics));
                setWorkoutPlan(generateWorkoutFromPFT(p));
                setSkincarePlan(generateSkincareWithFallback(p));
                // Load supplements
                const suppSchedule = PFT.getSupplementSchedule?.(p) || generateSupplementFallback(p);
                setSupplementPlan(suppSchedule);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    // Clean generators without emojis
    const generateMealPlanWithFallback = (p, metrics) => {
        const targetCals = p.target_calories || metrics?.targetCalories || 2000;
        const protein = p.protein_grams || metrics?.macros?.protein || 120;
        const isVeg = p.diet_type === 'veg' || p.diet_type === 'jain';

        return {
            meals: [
                {
                    type: 'Breakfast',
                    name: isVeg ? 'Protein Oatmeal Bowl' : 'Egg Omelette & Paratha',
                    time: '08:00',
                    items: isVeg ? [
                        { name: 'Oats', portion: '50g' }, { name: 'Banana', portion: '1 medium' },
                        { name: 'Almonds', portion: '10 pcs' }, { name: 'Milk', portion: '200ml' }
                    ] : [
                        { name: 'Whole Eggs', portion: '3 eggs' }, { name: 'Paratha', portion: '2 pcs' },
                        { name: 'Curd', portion: '100g' }
                    ],
                    totalCalories: Math.round(targetCals * 0.25),
                    totalProtein: Math.round(protein * 0.25)
                },
                {
                    type: 'Lunch',
                    name: isVeg ? 'Dal Rice & Sabzi' : 'Chicken Curry & Rice',
                    time: '13:00',
                    items: isVeg ? [
                        { name: 'Rice', portion: '150g' }, { name: 'Dal', portion: '200g' },
                        { name: 'Sabzi', portion: '150g' }, { name: 'Roti', portion: '2 pcs' }
                    ] : [
                        { name: 'Rice', portion: '150g' }, { name: 'Chicken Curry', portion: '150g' },
                        { name: 'Salad', portion: '100g' }, { name: 'Roti', portion: '1 pc' }
                    ],
                    totalCalories: Math.round(targetCals * 0.35),
                    totalProtein: Math.round(protein * 0.35)
                },
                {
                    type: 'Snack',
                    name: 'High Protein Snack',
                    time: '17:00',
                    items: [{ name: 'Protein Source', portion: '30g protein' }, { name: 'Fruit', portion: '1 unit' }],
                    totalCalories: Math.round(targetCals * 0.10),
                    totalProtein: Math.round(protein * 0.15)
                },
                {
                    type: 'Dinner',
                    name: isVeg ? 'Paneer & Roti' : 'Curry & Roti',
                    time: '20:00',
                    items: [{ name: 'Main Dish', portion: '200g' }, { name: 'Roti/Rice', portion: 'Standard' }],
                    totalCalories: Math.round(targetCals * 0.30),
                    totalProtein: Math.round(protein * 0.25)
                }
            ],
            targetCalories: targetCals,
            targetProtein: protein
        };
    };

    const generateWorkoutFromPFT = (p) => {
        // Use goal-driven holistic workout planner
        return PFT.generateHolisticWorkout(p, {
            goal: p.goal_type || 'general_fitness',
            timeAvailable: 45,
            equipment: p.equipment || 'none',
            energyLevel: 'moderate'
        });
    };


    const generateSkincareWithFallback = (p) => {
        return {
            morning: [{ step: 1, name: 'Cleanser' }, { step: 2, name: 'Moisturizer' }, { step: 3, name: 'SPF 50+' }],
            evening: [{ step: 1, name: 'Double Cleanse' }, { step: 2, name: 'Active Serum' }, { step: 3, name: 'Night Cream' }]
        };
    };

    // Supplement fallback generator
    const generateSupplementFallback = (p) => ({
        schedule: [
            { time: 'Morning', supplements: [{ name: 'Vitamin D3', dosage: '2000 IU' }, { name: 'Omega-3', dosage: '1000mg' }] },
            { time: 'With Lunch', supplements: [{ name: 'Multivitamin', dosage: '1 tab' }] },
            { time: 'Evening', supplements: [{ name: 'Magnesium', dosage: '400mg' }, { name: 'Zinc', dosage: '15mg' }] }
        ]
    });

    const tabs = [
        { id: 'meals', label: 'Nutrition', icon: 'coffee' },
        { id: 'workout', label: 'Training', icon: 'zap' },
        { id: 'supplements', label: 'Supps', icon: 'zap' },
        { id: 'skincare', label: 'Skin', icon: 'droplet' }
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>DAILY PLAN</Text>
                <Text style={[styles.subtitle, { color: theme.primary }]}>OPTIMIZATION PROTOCOLS</Text>
            </View>

            <View style={[styles.tabBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                {tabs.map(t => (
                    <TouchableOpacity key={t.id} style={[styles.tab, tab === t.id && { backgroundColor: theme.primary + '20' }]} onPress={() => setTab(t.id)}>
                        <Feather name={t.icon} size={14} color={tab === t.id ? theme.primary : theme.textSecondary} />
                        <Text style={[styles.tabLabel, { color: tab === t.id ? theme.primary : theme.textSecondary }]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* MEALS */}
                {tab === 'meals' && mealPlan && (
                    <>
                        <View style={[styles.summaryCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                            <View style={styles.rowCenter}>
                                <Feather name="target" size={14} color={theme.primary} />
                                <Text style={[styles.summaryTitle, { color: theme.primary }]}> TARGETS</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryItem, { color: theme.text }]}>{mealPlan.targetCalories} kcal</Text>
                                <Text style={[styles.summaryItem, { color: theme.text }]}>{mealPlan.targetProtein}g protein</Text>
                            </View>
                        </View>

                        {mealPlan.meals?.map((meal, i) => (
                            <View key={i} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.mealHeader}>
                                    <View>
                                        <Text style={[styles.mealType, { color: theme.textSecondary }]}>{meal.type}</Text>
                                        <Text style={[styles.mealName, { color: theme.text }]}>{meal.name}</Text>
                                    </View>
                                    <Text style={[styles.mealTime, { color: theme.textSecondary }]}>{meal.time}</Text>
                                </View>
                                {meal.items?.map((item, j) => (
                                    <View key={j} style={[styles.foodItem, { borderBottomColor: theme.cardBorder }]}>
                                        <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
                                        <Text style={[styles.foodPortion, { color: theme.textSecondary }]}>{item.portion}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </>
                )}

                {/* WORKOUT - HOLISTIC STRUCTURE */}
                {tab === 'workout' && workoutPlan && (
                    <>
                        {/* Goal Header */}
                        <View style={[styles.summaryCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                            <View style={styles.rowCenter}>
                                <Feather name="zap" size={14} color={theme.primary} />
                                <Text style={[styles.summaryTitle, { color: theme.primary }]}> {workoutPlan.goal || 'TODAY\'S WORKOUT'}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryItem, { color: theme.text }]}>{workoutPlan.totalDuration || 45} min</Text>
                                <Text style={[styles.summaryItem, { color: theme.textSecondary }]}>{workoutPlan.equipment || 'Bodyweight'}</Text>
                            </View>
                        </View>

                        {/* WARMUP Section */}
                        {workoutPlan.warmup?.exercises?.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="sun" size={16} color="#F59E0B" />
                                    <Text style={[styles.sectionHeaderText, { color: theme.text }]}>WARMUP</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.warmup.duration_mins} min</Text>
                                </View>
                                {workoutPlan.warmup.exercises.map((e, i) => (
                                    <View key={i} style={styles.exerciseRow}>
                                        <View style={[styles.exNum, { backgroundColor: '#F59E0B20' }]}>
                                            <Text style={[styles.exNumText, { color: '#F59E0B' }]}>{i + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.exName, { color: theme.text }]}>{e.name}</Text>
                                            <Text style={[styles.exDetail, { color: theme.textSecondary }]}>
                                                {e.reps ? `${e.reps} reps` : e.duration_seconds ? `${e.duration_seconds}s` : '30s each side'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* STRENGTH Section */}
                        {workoutPlan.strength?.exercises?.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="target" size={16} color="#EF4444" />
                                    <Text style={[styles.sectionHeaderText, { color: theme.text }]}>STRENGTH</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.strength.duration_mins} min</Text>
                                </View>
                                {workoutPlan.strength.exercises.map((e, i) => (
                                    <View key={i} style={styles.exerciseRow}>
                                        <View style={[styles.exNum, { backgroundColor: '#EF444420' }]}>
                                            <Text style={[styles.exNumText, { color: '#EF4444' }]}>{i + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.exName, { color: theme.text }]}>{e.name}</Text>
                                            <Text style={[styles.exDetail, { color: theme.textSecondary }]}>{e.sets} SETS × {e.reps}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* CARDIO Section */}
                        {(workoutPlan.cardio?.program || workoutPlan.cardio?.description) && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="heart" size={16} color="#10B981" />
                                    <Text style={[styles.sectionHeaderText, { color: theme.text }]}>CARDIO</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.cardio.duration_mins} min</Text>
                                </View>
                                <Text style={[styles.cardioProgram, { color: theme.text }]}>
                                    {workoutPlan.cardio.program?.name || workoutPlan.cardio.description || 'Light cardio'}
                                </Text>
                                {workoutPlan.cardio.program?.intensity && (
                                    <Text style={[styles.cardioIntensity, { color: theme.textSecondary }]}>
                                        Intensity: {workoutPlan.cardio.program.intensity}
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* YOGA Section */}
                        {workoutPlan.yoga?.poses?.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="feather" size={16} color="#8B5CF6" />
                                    <Text style={[styles.sectionHeaderText, { color: theme.text }]}>YOGA</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.yoga.duration_mins} min</Text>
                                </View>
                                {workoutPlan.yoga.poses.map((p, i) => (
                                    <View key={i} style={styles.exerciseRow}>
                                        <View style={[styles.exNum, { backgroundColor: '#8B5CF620' }]}>
                                            <Text style={[styles.exNumText, { color: '#8B5CF6' }]}>{i + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.exName, { color: theme.text }]}>{p.english_name}</Text>
                                            <Text style={[styles.exDetail, { color: theme.textSecondary }]}>{p.hold_seconds}s hold</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* COOLDOWN Section */}
                        {workoutPlan.cooldown?.exercises?.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="moon" size={16} color="#6366F1" />
                                    <Text style={[styles.sectionHeaderText, { color: theme.text }]}>COOLDOWN</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.cooldown.duration_mins} min</Text>
                                </View>
                                {workoutPlan.cooldown.exercises.slice(0, 4).map((e, i) => (
                                    <View key={i} style={styles.exerciseRow}>
                                        <View style={[styles.exNum, { backgroundColor: '#6366F120' }]}>
                                            <Text style={[styles.exNumText, { color: '#6366F1' }]}>{i + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.exName, { color: theme.text }]}>{e.name}</Text>
                                            <Text style={[styles.exDetail, { color: theme.textSecondary }]}>
                                                {e.hold_seconds ? `${e.hold_seconds}s hold` : e.duration_seconds ? `${e.duration_seconds}s` : '30s each side'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Rationale */}
                        {workoutPlan.rationale && (
                            <View style={[styles.rationaleCard, { backgroundColor: theme.backgroundSecondary }]}>
                                <Text style={[styles.rationaleText, { color: theme.textSecondary }]}>{workoutPlan.rationale}</Text>
                            </View>
                        )}
                    </>
                )}

                {/* SUPPLEMENTS */}
                {tab === 'supplements' && supplementPlan && (
                    <>
                        <View style={[styles.summaryCard, { backgroundColor: theme.warning + '10', borderColor: theme.warning }]}>
                            <View style={styles.rowCenter}>
                                <Feather name="zap" size={14} color={theme.warning} />
                                <Text style={[styles.summaryTitle, { color: theme.warning }]}> DAILY SUPPLEMENTS</Text>
                            </View>
                        </View>

                        {supplementPlan.schedule?.map((slot, i) => (
                            <View key={i} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.mealHeader}>
                                    <View style={styles.rowCenter}>
                                        <Feather
                                            name={slot.time === 'Morning' ? 'sun' : slot.time === 'Evening' ? 'moon' : 'clock'}
                                            size={16}
                                            color={slot.time === 'Morning' ? '#F59E0B' : slot.time === 'Evening' ? '#6366F1' : theme.primary}
                                        />
                                        <Text style={[styles.mealType, { color: theme.textSecondary, marginLeft: 8 }]}>{slot.time}</Text>
                                    </View>
                                </View>
                                {slot.supplements?.map((supp, j) => (
                                    <View key={j} style={[styles.foodItem, { borderBottomColor: theme.cardBorder }]}>
                                        <Text style={[styles.foodName, { color: theme.text }]}>{supp.name}</Text>
                                        <Text style={[styles.foodPortion, { color: theme.primary, fontWeight: '600' }]}>{supp.dosage}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </>
                )}

                {/* SKINCARE */}
                {tab === 'skincare' && skincarePlan && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>AM PROTOCOL</Text>
                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            {skincarePlan.morning?.map((s, i) => (
                                <View key={i} style={styles.skinRow}>
                                    <Feather name="sun" size={14} color={theme.warning} />
                                    <Text style={[styles.skinText, { color: theme.text }]}> {s.name}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PM PROTOCOL</Text>
                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            {skincarePlan.evening?.map((s, i) => (
                                <View key={i} style={styles.skinRow}>
                                    <Feather name="moon" size={14} color={theme.info} />
                                    <Text style={[styles.skinText, { color: theme.text }]}> {s.name}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* NUTRIENTS */}
                {tab === 'nutrients' && (
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>MICRONUTRIENT FOCUS</Text>
                        <View style={styles.chipContainer}>
                            {['Vitamin D3', 'Omega-3', 'Zinc', 'Magnesium'].map((n, i) => (
                                <View key={i} style={[styles.chip, { backgroundColor: theme.primary + '15' }]}>
                                    <Text style={[styles.chipText, { color: theme.primary }]}>{n}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: spacing.md, paddingBottom: 8 },
    title: { fontSize: 24, fontWeight: '700', letterSpacing: -1 },
    subtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
    tabBar: { flexDirection: 'row', marginHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, padding: 4, marginBottom: 12 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: radius.sm, gap: 6 },
    tabLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    scroll: { padding: spacing.md },
    summaryCard: { borderRadius: radius.md, borderWidth: 1, padding: 16, marginBottom: 16 },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    summaryTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    summaryItem: { fontSize: 14, fontWeight: '600' },
    card: { borderRadius: radius.lg, borderWidth: 1, padding: 20, marginBottom: 16 },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    mealType: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    mealName: { fontSize: 16, fontWeight: '600', marginTop: 2 },
    mealTime: { fontSize: 12, fontWeight: '500' },
    foodItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
    foodName: { fontSize: 14 },
    foodPortion: { fontSize: 12 },
    centerPad: { alignItems: 'center', padding: 24 },
    restTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
    workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    workoutTitle: { fontSize: 18, fontWeight: '600' },
    workoutSplit: { fontSize: 12, marginTop: 2 },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
    badgeText: { fontSize: 11, fontWeight: '600' },
    exerciseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    exNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    exNumText: { fontSize: 10, fontWeight: '700' },
    exName: { fontSize: 14, fontWeight: '500' },
    exDetail: { fontSize: 11, marginTop: 2 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
    skinRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    skinText: { fontSize: 14, marginLeft: 8 },
    cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
    chipText: { fontSize: 12, fontWeight: '500' },
    // Holistic workout section styles
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
    sectionHeaderText: { fontSize: 12, fontWeight: '700', letterSpacing: 1, flex: 1 },
    sectionDuration: { fontSize: 11, fontWeight: '500' },
    cardioProgram: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    cardioIntensity: { fontSize: 12 },
    rationaleCard: { padding: 14, borderRadius: radius.md, marginBottom: 16 },
    rationaleText: { fontSize: 12, fontStyle: 'italic', lineHeight: 18 }
});
