import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { spacing, fonts } from '../theme';
import * as PFT from '../services/PFTBridge';

export default function LoggingScreen({ navigation }) {
    const { theme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [macros, setMacros] = useState(null);
    const [ateOnPlan, setAteOnPlan] = useState(true);
    const [proteinHit, setProteinHit] = useState(true);
    const [workoutDone, setWorkoutDone] = useState(false);
    const [water, setWater] = useState(5);
    const [weight, setWeight] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const p = await PFT.getProfile();
        setProfile(p);
        if (p) {
            const bodyMetrics = PFT.calculateBodyMetrics(p);
            setMacros({
                calories: bodyMetrics.targetCalories,
                protein: bodyMetrics.macros?.protein
            });
        }
    };

    const save = async () => {
        try {
            setSaving(true);
            const today = new Date().toISOString().split('T')[0];

            // Calculate consumed values
            const consumedCalories = ateOnPlan ? macros?.calories : Math.round((macros?.calories || 2000) * 1.2);
            const consumedProtein = proteinHit ? macros?.protein : Math.round((macros?.protein || 120) * 0.7);

            // Save daily log
            const log = {
                date: today,
                ate_on_plan: ateOnPlan,
                protein_hit: proteinHit,
                workout_done: workoutDone,
                water_glasses: water,
                calories: consumedCalories,
                protein: consumedProtein,
                weight: weight ? parseFloat(weight) : null
            };
            await PFT.saveDailyLog(today, log);

            // Add weight entry if provided (triggers AdaptiveTDEE update)
            if (weight) {
                await PFT.addWeightEntry(parseFloat(weight));
            }

            // Update habits (uses HabitTrackingService logic)
            if (water >= 8) await PFT.updateHabit('water', true);
            if (proteinHit) await PFT.updateHabit('protein', true);
            if (workoutDone) await PFT.updateHabit('workout', true);

            Alert.alert('Saved!', 'Your daily log has been recorded and AdaptiveTDEE updated.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save log. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Quick Log</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.row}>
                        <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                        <Text style={[styles.rowLabel, { color: theme.text }]}>Ate on plan?</Text>
                        <Switch value={ateOnPlan} onValueChange={setAteOnPlan} trackColor={{ false: theme.border, true: theme.success }} thumbColor="#FFF" />
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.row}>
                        <Ionicons name="flame" size={22} color={theme.proteinColor} />
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowLabel, { color: theme.text }]}>Hit protein goal?</Text>
                            <Text style={[styles.rowSub, { color: theme.textSecondary }]}>Target: {macros?.protein || 120}g</Text>
                        </View>
                        <Switch value={proteinHit} onValueChange={setProteinHit} trackColor={{ false: theme.border, true: theme.success }} thumbColor="#FFF" />
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.row}>
                        <Ionicons name="barbell" size={22} color={theme.secondary} />
                        <Text style={[styles.rowLabel, { color: theme.text }]}>Workout completed?</Text>
                        <Switch value={workoutDone} onValueChange={setWorkoutDone} trackColor={{ false: theme.border, true: theme.success }} thumbColor="#FFF" />
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.waterTitle, { color: theme.text }]}>💧 Water Intake</Text>
                    <View style={styles.waterRow}>
                        <TouchableOpacity style={[styles.waterBtn, { backgroundColor: theme.backgroundSecondary }]} onPress={() => setWater(Math.max(0, water - 1))}>
                            <Ionicons name="remove" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <View style={styles.waterDisplay}>
                            <Text style={[styles.waterVal, { color: theme.text }]}>{water}</Text>
                            <Text style={[styles.waterUnit, { color: theme.textSecondary }]}>glasses</Text>
                        </View>
                        <TouchableOpacity style={[styles.waterBtn, { backgroundColor: theme.info }]} onPress={() => setWater(water + 1)}>
                            <Ionicons name="add" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    {water >= 8 && (
                        <View style={[styles.achievedBadge, { backgroundColor: theme.success + '20' }]}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                            <Text style={[styles.achievedText, { color: theme.success }]}>Goal achieved!</Text>
                        </View>
                    )}
                </View>

                {/* Weight Log for AdaptiveTDEE */}
                <View style={[styles.card, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                    <Text style={[styles.weightTitle, { color: theme.text }]}>⚖️ Log Weight (Optional)</Text>
                    <Text style={[styles.weightInfo, { color: theme.textSecondary }]}>Updates AdaptiveTDEE for better accuracy</Text>
                    <View style={styles.weightRow}>
                        <TouchableOpacity style={[styles.weightBtn, { backgroundColor: theme.card }]} onPress={() => setWeight(String(Math.max(0, (parseFloat(weight) || profile?.weight_kg || 70) - 0.5)))}>
                            <Ionicons name="remove" size={20} color={theme.text} />
                        </TouchableOpacity>
                        <View style={styles.weightDisplay}>
                            <Text style={[styles.weightVal, { color: theme.primary }]}>{weight || '--'}</Text>
                            <Text style={[styles.weightUnit, { color: theme.textSecondary }]}>kg</Text>
                        </View>
                        <TouchableOpacity style={[styles.weightBtn, { backgroundColor: theme.card }]} onPress={() => setWeight(String((parseFloat(weight) || profile?.weight_kg || 70) + 0.5))}>
                            <Ionicons name="add" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity onPress={save} disabled={saving}>
                    <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.saveBtn}>
                        <Ionicons name="checkmark" size={22} color="#FFF" />
                        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Log'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
    title: { ...fonts.h2 },
    content: { flex: 1, padding: spacing.lg, paddingTop: 0 },
    card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowContent: { flex: 1, marginLeft: 12 },
    rowLabel: { flex: 1, fontSize: 16, marginLeft: 12 },
    rowSub: { fontSize: 12, marginTop: 2 },
    waterTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
    waterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
    waterBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    waterDisplay: { alignItems: 'center' },
    waterVal: { fontSize: 36, fontWeight: '700' },
    waterUnit: { fontSize: 12 },
    achievedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, padding: 8, borderRadius: 8, gap: 6 },
    achievedText: { fontSize: 14, fontWeight: '600' },
    weightTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    weightInfo: { fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 16 },
    weightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
    weightBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    weightDisplay: { alignItems: 'center' },
    weightVal: { fontSize: 28, fontWeight: '700' },
    weightUnit: { fontSize: 12 },
    footer: { padding: spacing.lg },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 10 },
    saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '600' }
});
