import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as PFT from '../services/PFTBridge';

export default function BodyScreen({ navigation }) {
    const { theme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [bodyMetrics, setBodyMetrics] = useState(null);
    const [weightHistory, setWeightHistory] = useState([]);
    const [todayLog, setTodayLog] = useState(null);
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const p = await PFT.getProfile();
            setProfile(p);

            if (p) {
                const metrics = PFT.calculateBodyMetrics(p);
                setBodyMetrics(metrics);

                const workout = PFT.generateHolisticWorkout(p, {});
                setWorkoutPlan(workout);
            }

            const weights = await PFT.getWeightHistory();
            setWeightHistory(weights.slice(0, 7));

            const today = new Date().toISOString().split('T')[0];
            const log = await PFT.getDailyLog(today);
            setTodayLog(log);
        } catch (error) {
            console.log('Body load error:', error);
        }
    };

    const promptLogWeight = () => {
        Alert.prompt(
            'Log Weight',
            'Enter your current weight in kg',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: async (weight) => {
                        if (weight && !isNaN(parseFloat(weight))) {
                            try {
                                await PFT.addWeightEntry(parseFloat(weight));
                                Alert.alert('✓ Saved', `Weight logged: ${weight} kg`);
                                loadData(); // Refresh data
                            } catch (error) {
                                Alert.alert('Error', 'Could not save weight');
                            }
                        } else {
                            Alert.alert('Invalid', 'Please enter a valid number');
                        }
                    }
                }
            ],
            'plain-text',
            profile?.weight_kg?.toString() || ''
        );
    };

    const TabButton = ({ id, label, icon }) => (
        <TouchableOpacity
            style={[styles.tabBtn, activeTab === id && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab(id)}
        >
            <Feather name={icon} size={16} color={activeTab === id ? '#FFF' : theme.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === id ? '#FFF' : theme.textSecondary }]}>{label}</Text>
        </TouchableOpacity>
    );

    const StatCard = ({ label, value, unit, icon, color }) => (
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Feather name={icon} size={18} color={color || theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statUnit, { color: theme.textSecondary }]}>{unit}</Text>
            <Text style={[styles.statLabel, { color: theme.textTertiary }]}>{label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>BODY</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Physical Progress</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.cardBorder }]}
                        onPress={() => navigation.navigate('Plan')}
                    >
                        <Feather name="calendar" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Tab Navigation */}
                <View style={[styles.tabs, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <TabButton id="overview" label="Overview" icon="activity" />
                    <TabButton id="workout" label="Workout" icon="target" />
                    <TabButton id="measure" label="Measure" icon="maximize-2" />
                    <TabButton id="posture" label="Posture" icon="user" />
                </View>

                {activeTab === 'overview' && (
                    <>
                        {/* Body Metrics Grid */}
                        <View style={styles.statsGrid}>
                            <StatCard label="BMI" value={bodyMetrics?.bmi || '--'} unit="index" icon="percent" />
                            <StatCard label="BMR" value={bodyMetrics?.bmr || '--'} unit="kcal" icon="zap" color={theme.warning} />
                            <StatCard label="TDEE" value={bodyMetrics?.tdee || '--'} unit="kcal" icon="activity" color={theme.success} />
                            <StatCard label="Target" value={bodyMetrics?.targetCalories || '--'} unit="kcal" icon="target" color={theme.primary} />
                        </View>

                        {/* Weight Card */}
                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>WEIGHT PROGRESS</Text>
                                <TouchableOpacity onPress={promptLogWeight}>
                                    <Feather name="plus-circle" size={20} color={theme.primary} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.currentWeight, { color: theme.text }]}>
                                {profile?.weight_kg || '--'} <Text style={{ fontSize: 16, color: theme.textSecondary }}>kg</Text>
                            </Text>
                            {weightHistory.length > 0 && (
                                <View style={styles.weightHistory}>
                                    {weightHistory.map((w, i) => (
                                        <View key={i} style={styles.weightDot}>
                                            <Text style={[styles.weightDate, { color: theme.textTertiary }]}>
                                                {new Date(w.date).getDate()}
                                            </Text>
                                            <View style={[styles.dot, { backgroundColor: theme.primary, height: 20 + (w.weight_kg - 60) }]} />
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Today's Workout Status */}
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                            onPress={() => setActiveTab('workout')}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>TODAY'S WORKOUT</Text>
                                <Feather name="arrow-right" size={18} color={theme.textSecondary} />
                            </View>
                            <View style={styles.workoutStatus}>
                                <Feather
                                    name={todayLog?.workout_done ? "check-circle" : "circle"}
                                    size={24}
                                    color={todayLog?.workout_done ? theme.success : theme.textTertiary}
                                />
                                <Text style={[styles.workoutText, { color: theme.text }]}>
                                    {todayLog?.workout_done ? 'Completed!' : 'Not yet completed'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </>
                )}

                {activeTab === 'workout' && (
                    <>
                        {/* Goal Summary */}
                        <View style={[styles.card, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                            <Text style={[styles.cardLabel, { color: theme.primary }]}>
                                {workoutPlan?.goal || 'TODAY\'S WORKOUT'}
                            </Text>
                            <Text style={[styles.workoutMeta, { color: theme.text }]}>
                                {workoutPlan?.totalDuration || 45} min • {workoutPlan?.equipment || 'Bodyweight'}
                            </Text>
                        </View>

                        {/* WARMUP */}
                        {workoutPlan?.warmup?.exercises?.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="sun" size={16} color="#F59E0B" />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>WARMUP</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.warmup.duration_mins} min</Text>
                                </View>
                                {workoutPlan.warmup.exercises.map((e, i) => (
                                    <View key={i} style={[styles.exerciseRow, { borderTopColor: theme.cardBorder }]}>
                                        <View>
                                            <Text style={[styles.exerciseName, { color: theme.text }]}>{e.name}</Text>
                                            <Text style={[styles.exerciseMeta, { color: theme.textTertiary }]}>
                                                {e.reps ? `${e.reps} reps` : e.duration_seconds ? `${e.duration_seconds}s` : '30s each side'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* STRENGTH */}
                        {workoutPlan?.strength?.exercises?.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="target" size={16} color="#EF4444" />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>STRENGTH</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.strength.duration_mins} min</Text>
                                </View>
                                {workoutPlan.strength.exercises.map((e, i) => (
                                    <View key={i} style={[styles.exerciseRow, { borderTopColor: theme.cardBorder }]}>
                                        <View>
                                            <Text style={[styles.exerciseName, { color: theme.text }]}>{e.name}</Text>
                                            <Text style={[styles.exerciseMeta, { color: theme.textTertiary }]}>{e.sets} sets × {e.reps}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* CARDIO */}
                        {(workoutPlan?.cardio?.program || workoutPlan?.cardio?.description) && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="heart" size={16} color="#10B981" />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>CARDIO</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.cardio.duration_mins} min</Text>
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.text }]}>
                                    {workoutPlan.cardio.program?.name || workoutPlan.cardio.description || 'Light cardio'}
                                </Text>
                            </View>
                        )}

                        {/* YOGA */}
                        {workoutPlan?.yoga?.poses?.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="feather" size={16} color="#8B5CF6" />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>YOGA</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.yoga.duration_mins} min</Text>
                                </View>
                                {workoutPlan.yoga.poses.map((p, i) => (
                                    <Text key={i} style={[styles.exerciseName, { color: theme.text, paddingVertical: 4 }]}>• {p.english_name} ({p.hold_seconds}s)</Text>
                                ))}
                            </View>
                        )}

                        {/* COOLDOWN */}
                        {workoutPlan?.cooldown?.exercises?.length > 0 && (
                            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="moon" size={16} color="#6366F1" />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>COOLDOWN</Text>
                                    <Text style={[styles.sectionDuration, { color: theme.textSecondary }]}>{workoutPlan.cooldown.duration_mins} min</Text>
                                </View>
                                {workoutPlan.cooldown.exercises.slice(0, 4).map((e, i) => (
                                    <View key={i} style={[styles.exerciseRow, { borderTopColor: theme.cardBorder }]}>
                                        <View>
                                            <Text style={[styles.exerciseName, { color: theme.text }]}>{e.name}</Text>
                                            <Text style={[styles.exerciseMeta, { color: theme.textTertiary }]}>
                                                {e.hold_seconds ? `${e.hold_seconds}s hold` : e.duration_seconds ? `${e.duration_seconds}s` : '30s each side'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Rationale */}
                        {workoutPlan?.rationale && (
                            <View style={[styles.card, { backgroundColor: theme.backgroundSecondary || theme.cardBorder }]}>
                                <Text style={[styles.infoText, { color: theme.textSecondary, fontStyle: 'italic' }]}>
                                    {workoutPlan.rationale}
                                </Text>
                            </View>
                        )}
                    </>
                )}

                {activeTab === 'measure' && (
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>BODY MEASUREMENTS</Text>
                        </View>
                        <Text style={[styles.infoText, { color: theme.textSecondary, marginBottom: 16 }]}>
                            Track your body measurements over time to see your physical transformation.
                        </Text>

                        {/* Quick Stats */}
                        <View style={styles.measureGrid}>
                            <View style={[styles.measureItem, { backgroundColor: theme.cardBorder }]}>
                                <Feather name="trending-down" size={18} color="#FF6B6B" />
                                <Text style={[styles.measureLabel, { color: theme.textSecondary }]}>Weight</Text>
                                <Text style={[styles.measureValue, { color: theme.text }]}>{profile?.weight_kg || '--'} kg</Text>
                            </View>
                            <View style={[styles.measureItem, { backgroundColor: theme.cardBorder }]}>
                                <Feather name="maximize" size={18} color="#4ECDC4" />
                                <Text style={[styles.measureLabel, { color: theme.textSecondary }]}>Height</Text>
                                <Text style={[styles.measureValue, { color: theme.text }]}>{profile?.height_cm || '--'} cm</Text>
                            </View>
                        </View>

                        {/* Open Detailed Charts Button */}
                        <TouchableOpacity
                            style={[styles.detailsBtn, { backgroundColor: theme.primary }]}
                            onPress={() => navigation.navigate('BodyMeasurements')}
                        >
                            <Feather name="bar-chart-2" size={20} color="#FFF" />
                            <Text style={styles.detailsBtnText}>Open Detailed Charts</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'posture' && (
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Posture Correction</Text>
                        <Text style={[styles.infoText, { color: theme.textSecondary, marginBottom: 16 }]}>
                            Daily exercises to improve posture and prevent back pain.
                        </Text>

                        {[
                            { name: 'Chin Tucks', reps: '10 reps, 3x daily', why: 'Corrects forward head posture' },
                            { name: 'Wall Angels', reps: '10 reps daily', why: 'Opens chest, strengthens back' },
                            { name: 'Plank Hold', reps: '30-60 sec', why: 'Core stability for spine' },
                            { name: 'Doorframe Stretch', reps: '30 sec each side', why: 'Opens tight chest muscles' }
                        ].map((ex, i) => (
                            <View key={i} style={[styles.postureRow, { borderBottomColor: theme.cardBorder }]}>
                                <View>
                                    <Text style={[styles.exerciseName, { color: theme.text }]}>{ex.name}</Text>
                                    <Text style={[styles.exerciseMeta, { color: theme.primary }]}>{ex.reps}</Text>
                                </View>
                                <Text style={[styles.whyText, { color: theme.textTertiary }]}>{ex.why}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.md, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '700', letterSpacing: 1 },
    subtitle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    iconBtn: { padding: 10, borderRadius: 12 },
    tabs: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, padding: 4, marginBottom: 20 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: radius.md, gap: 4 },
    tabLabel: { fontSize: 11, fontWeight: '600' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
    statCard: { width: '47%', borderRadius: radius.lg, borderWidth: 1, padding: 16, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '700', marginTop: 8 },
    statUnit: { fontSize: 11, fontWeight: '500' },
    statLabel: { fontSize: 10, fontWeight: '600', marginTop: 4, letterSpacing: 0.5 },
    card: { borderRadius: radius.lg, borderWidth: 1, padding: 20, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    currentWeight: { fontSize: 36, fontWeight: '700' },
    weightHistory: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    weightDot: { alignItems: 'center' },
    weightDate: { fontSize: 10, marginBottom: 4 },
    dot: { width: 8, borderRadius: 4 },
    workoutStatus: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    workoutText: { fontSize: 16, fontWeight: '500' },
    workoutMeta: { fontSize: 13, marginBottom: 16 },
    exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1 },
    exerciseName: { fontSize: 15, fontWeight: '500' },
    exerciseMeta: { fontSize: 12, marginTop: 2 },
    emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
    infoText: { fontSize: 13, lineHeight: 20 },
    heightTasks: { marginTop: 16 },
    taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    taskName: { fontSize: 14, fontWeight: '500' },
    taskDuration: { fontSize: 12 },
    postureRow: { paddingVertical: 12, borderBottomWidth: 1 },
    whyText: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
    measureGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    measureItem: { flex: 1, borderRadius: radius.md, padding: 16, alignItems: 'center' },
    measureLabel: { fontSize: 11, marginTop: 6 },
    measureValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
    detailsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: radius.lg, gap: 8 },
    detailsBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    // Holistic workout section styles
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, flex: 1 },
    sectionDuration: { fontSize: 11, fontWeight: '500' }
});
