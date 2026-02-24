import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as PFT from '../services/PFTBridge';

const DOMAINS = [
    { id: 'body', label: 'Body', icon: 'activity', color: '#FF6B6B' },
    { id: 'food', label: 'Food', icon: 'coffee', color: '#4ECDC4' },
    { id: 'looks', label: 'Looks', icon: 'smile', color: '#A78BFA' },
    { id: 'health', label: 'Health', icon: 'heart', color: '#F472B6' },
    { id: 'routine', label: 'Routine', icon: 'clock', color: '#60A5FA' }
];

const GOAL_TYPES = {
    body: ['weight_gain', 'weight_loss', 'muscle_gain', 'maintain'],
    food: ['clean_eating', 'high_protein', 'budget_meals'],
    looks: ['clear_skin', 'jawline', 'hair_growth'],
    health: ['better_sleep', 'reduce_stress', 'hydration'],
    routine: ['wake_early', 'consistent_habits', 'focus_hours']
};

export default function GoalManagerScreen({ navigation }) {
    const { theme } = useTheme();
    const [goals, setGoals] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newGoal, setNewGoal] = useState({ domain: 'body', type: '', target: '', deadline: '' });

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const multiGoal = await PFT.getMultiGoals();
            setGoals(multiGoal.goals || []);
        } catch (error) {
            console.log('Goals load error:', error);
        }
    };

    const addGoal = async () => {
        if (!newGoal.type) {
            Alert.alert('Error', 'Please select a goal type');
            return;
        }

        const goal = PFT.MultiGoal.createGoal({
            domain: newGoal.domain,
            type: newGoal.type,
            target: parseFloat(newGoal.target) || null,
            deadline: newGoal.deadline || null
        });

        await PFT.addGoal(goal);
        setGoals([...goals, goal]);
        setShowAdd(false);
        setNewGoal({ domain: 'body', type: '', target: '', deadline: '' });
    };

    const removeGoal = async (goalId) => {
        Alert.alert(
            'Remove Goal',
            'Are you sure you want to remove this goal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await PFT.removeGoal(goalId);
                        setGoals(goals.filter(g => g.id !== goalId));
                    }
                }
            ]
        );
    };

    const getDomainInfo = (domainId) => DOMAINS.find(d => d.id === domainId) || DOMAINS[0];

    const GoalCard = ({ goal }) => {
        const domain = getDomainInfo(goal.domain);
        const progress = PFT.MultiGoal.getGoalProgress ? PFT.MultiGoal.getGoalProgress(goal) : { percentage: 0 };

        return (
            <View style={[styles.goalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.goalHeader}>
                    <View style={[styles.domainBadge, { backgroundColor: domain.color + '20' }]}>
                        <Feather name={domain.icon} size={16} color={domain.color} />
                        <Text style={[styles.domainText, { color: domain.color }]}>{domain.label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeGoal(goal.id)}>
                        <Feather name="trash-2" size={18} color={theme.textTertiary} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.goalType, { color: theme.text }]}>
                    {goal.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>

                {goal.target && (
                    <Text style={[styles.goalTarget, { color: theme.textSecondary }]}>
                        Target: {goal.target} {goal.unit || ''}
                    </Text>
                )}

                {goal.deadline && (
                    <Text style={[styles.goalDeadline, { color: theme.textTertiary }]}>
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                    </Text>
                )}

                <View style={[styles.progressBar, { backgroundColor: theme.cardBorder }]}>
                    <View style={[styles.progressFill, { width: `${progress.percentage}%`, backgroundColor: domain.color }]} />
                </View>
                <Text style={[styles.progressText, { color: theme.textSecondary }]}>{progress.percentage}% complete</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={[styles.title, { color: theme.text }]}>GOALS</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{goals.length} active goals</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: theme.primary }]}
                        onPress={() => setShowAdd(true)}
                    >
                        <Feather name="plus" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Add Goal Form */}
                {showAdd && (
                    <View style={[styles.addForm, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.formTitle, { color: theme.text }]}>New Goal</Text>

                        {/* Domain Selection */}
                        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Domain</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.domainScroll}>
                            {DOMAINS.map(d => (
                                <TouchableOpacity
                                    key={d.id}
                                    style={[
                                        styles.domainBtn,
                                        {
                                            backgroundColor: newGoal.domain === d.id ? d.color : theme.cardBorder,
                                            borderColor: d.color
                                        }
                                    ]}
                                    onPress={() => setNewGoal({ ...newGoal, domain: d.id, type: '' })}
                                >
                                    <Feather name={d.icon} size={16} color={newGoal.domain === d.id ? '#FFF' : d.color} />
                                    <Text style={[styles.domainBtnText, { color: newGoal.domain === d.id ? '#FFF' : d.color }]}>
                                        {d.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Goal Type */}
                        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Goal Type</Text>
                        <View style={styles.typeGrid}>
                            {(GOAL_TYPES[newGoal.domain] || []).map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeBtn,
                                        {
                                            backgroundColor: newGoal.type === type ? theme.primary : theme.cardBorder
                                        }
                                    ]}
                                    onPress={() => setNewGoal({ ...newGoal, type })}
                                >
                                    <Text style={[styles.typeText, { color: newGoal.type === type ? '#FFF' : theme.text }]}>
                                        {type.replace(/_/g, ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Target & Deadline */}
                        <View style={styles.inputRow}>
                            <View style={styles.inputHalf}>
                                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Target (optional)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.cardBorder, color: theme.text }]}
                                    placeholder="e.g. 8"
                                    placeholderTextColor={theme.textTertiary}
                                    keyboardType="numeric"
                                    value={newGoal.target}
                                    onChangeText={t => setNewGoal({ ...newGoal, target: t })}
                                />
                            </View>
                            <View style={styles.inputHalf}>
                                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Deadline</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.cardBorder, color: theme.text }]}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={theme.textTertiary}
                                    value={newGoal.deadline}
                                    onChangeText={d => setNewGoal({ ...newGoal, deadline: d })}
                                />
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.formActions}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}
                                onPress={() => setShowAdd(false)}
                            >
                                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={addGoal}
                            >
                                <Text style={styles.saveText}>Add Goal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Goals List */}
                {goals.length > 0 ? (
                    goals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Feather name="flag" size={48} color={theme.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Goals Yet</Text>
                        <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                            Add goals to track your progress across all areas of life.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.md, paddingBottom: 100 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '700', letterSpacing: 1 },
    subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    addForm: { borderRadius: radius.lg, borderWidth: 1, padding: 20, marginBottom: 24 },
    formTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    formLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
    domainScroll: { flexDirection: 'row', marginBottom: 8 },
    domainBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, marginRight: 8, gap: 6, borderWidth: 1 },
    domainBtnText: { fontSize: 12, fontWeight: '600' },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md },
    typeText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
    inputRow: { flexDirection: 'row', gap: 12 },
    inputHalf: { flex: 1 },
    input: { height: 44, borderRadius: radius.md, paddingHorizontal: 12, fontSize: 14 },
    formActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, height: 48, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    cancelText: { fontSize: 14, fontWeight: '600' },
    saveBtn: { flex: 2, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    saveText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    goalCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 12 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    domainBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, gap: 4 },
    domainText: { fontSize: 11, fontWeight: '600' },
    goalType: { fontSize: 18, fontWeight: '600' },
    goalTarget: { fontSize: 13, marginTop: 4 },
    goalDeadline: { fontSize: 12, marginTop: 2 },
    progressBar: { height: 6, borderRadius: 3, marginTop: 12, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    progressText: { fontSize: 11, marginTop: 4 },
    emptyState: { borderRadius: radius.lg, borderWidth: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
    emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 }
});
