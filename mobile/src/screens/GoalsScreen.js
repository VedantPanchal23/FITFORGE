import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

export default function GoalsScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { demographics } = route.params || {};
    const [goal, setGoal] = useState(null);
    const [targetWeight, setTargetWeight] = useState('');
    const [weeks, setWeeks] = useState('12');

    const goals = [
        { id: 'fat_loss', icon: 'trending-down', label: 'Fat Loss', desc: 'Lose body fat while preserving muscle', color: '#EF4444' },
        { id: 'muscle_gain', icon: 'trending-up', label: 'Muscle Gain', desc: 'Build lean muscle mass', color: '#10B981' },
        { id: 'recomp', icon: 'swap-horizontal', label: 'Recomposition', desc: 'Lose fat and gain muscle simultaneously', color: '#8B5CF6' },
        { id: 'health', icon: 'heart', label: 'General Health', desc: 'Maintain weight and improve overall health', color: '#3B82F6' }
    ];

    const isValid = goal && (goal === 'health' || (targetWeight && weeks));

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
                        <Ionicons name="arrow-back" size={22} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.progress}>
                        <View style={[styles.progressFill, { width: '33%', backgroundColor: theme.primary }]} />
                    </View>
                    <Text style={[styles.step, { color: theme.textSecondary }]}>2/6</Text>
                </View>

                <Text style={[styles.title, { color: theme.text }]}>Your Goal</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>What do you want to achieve?</Text>

                {/* Goal Cards */}
                {goals.map(g => (
                    <TouchableOpacity
                        key={g.id}
                        style={[styles.goalCard, { backgroundColor: goal === g.id ? g.color + '15' : theme.card, borderColor: goal === g.id ? g.color : theme.border }]}
                        onPress={() => setGoal(g.id)}
                    >
                        <View style={[styles.goalIcon, { backgroundColor: goal === g.id ? g.color : theme.backgroundSecondary }]}>
                            <Ionicons name={g.icon} size={24} color={goal === g.id ? '#FFF' : theme.textSecondary} />
                        </View>
                        <View style={styles.goalContent}>
                            <Text style={[styles.goalLabel, { color: theme.text }]}>{g.label}</Text>
                            <Text style={[styles.goalDesc, { color: theme.textSecondary }]}>{g.desc}</Text>
                        </View>
                        {goal === g.id && (
                            <View style={[styles.checkCircle, { backgroundColor: g.color }]}>
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Targets */}
                {goal && goal !== 'health' && (
                    <View style={styles.targets}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Set Your Target</Text>

                        <Text style={[styles.label, { color: theme.text }]}>Target Weight</Text>
                        <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Ionicons name="flag-outline" size={20} color={theme.textSecondary} />
                            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Target weight" placeholderTextColor={theme.textTertiary} keyboardType="numeric" value={targetWeight} onChangeText={setTargetWeight} />
                            <Text style={[styles.unit, { color: theme.textSecondary }]}>kg</Text>
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Timeline</Text>
                        <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Duration" placeholderTextColor={theme.textTertiary} keyboardType="numeric" value={weeks} onChangeText={setWeeks} />
                            <Text style={[styles.unit, { color: theme.textSecondary }]}>weeks</Text>
                        </View>

                        {targetWeight && weeks && demographics?.weight_kg && (
                            <View style={[styles.calcCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="calculator-outline" size={18} color={theme.primary} />
                                <Text style={[styles.calcText, { color: theme.textSecondary }]}>
                                    That's {Math.abs(demographics.weight_kg - +targetWeight).toFixed(1)} kg in {weeks} weeks
                                    ({(Math.abs(demographics.weight_kg - +targetWeight) / +weeks).toFixed(2)} kg/week)
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Diet', { demographics, goals: { goal_type: goal, target_weight_kg: targetWeight ? +targetWeight : null, target_weeks: +weeks } })}
                    disabled={!isValid}
                >
                    <LinearGradient colors={isValid ? ['#6366F1', '#8B5CF6'] : [theme.border, theme.border]} style={styles.continueBtn}>
                        <Text style={[styles.continueBtnText, { color: isValid ? '#FFF' : theme.textTertiary }]}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color={isValid ? '#FFF' : theme.textTertiary} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.lg },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    progress: { flex: 1, height: 4, backgroundColor: '#27272A', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    step: { fontSize: 12, fontWeight: '600' },
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 15, marginTop: 6, marginBottom: 24 },
    goalCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 12 },
    goalIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    goalContent: { flex: 1 },
    goalLabel: { fontSize: 17, fontWeight: '600' },
    goalDesc: { fontSize: 12, marginTop: 2 },
    checkCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    targets: { marginTop: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 16 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, gap: 12 },
    input: { flex: 1, paddingVertical: 16, fontSize: 16 },
    unit: { fontSize: 15 },
    calcCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 16, gap: 10 },
    calcText: { flex: 1, fontSize: 13 },
    footer: { padding: spacing.lg, borderTopWidth: 1 },
    continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 8 },
    continueBtnText: { fontSize: 16, fontWeight: '600' }
});
