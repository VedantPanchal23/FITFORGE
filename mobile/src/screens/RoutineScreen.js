import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as PFT from '../services/PFTBridge';

export default function RoutineScreen({ navigation }) {
    const { theme } = useTheme();
    const [todayLog, setTodayLog] = useState(null);
    const [disciplineScore, setDisciplineScore] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            let log = await PFT.getRoutineLog(today);

            if (!log) {
                log = PFT.RoutineLog.createRoutineLog({ date: today });
            }

            setTodayLog(log);
            setDisciplineScore(PFT.RoutineLog.calculateDisciplineScore(log));
        } catch (error) {
            console.log('Routine load error:', error);
        }
    };

    const toggleHabit = async (habitId) => {
        const today = new Date().toISOString().split('T')[0];
        const updatedHabits = todayLog.habits.map(h =>
            h.id === habitId ? { ...h, done: !h.done } : h
        );
        const updated = { ...todayLog, habits: updatedHabits };
        setTodayLog(updated);
        setDisciplineScore(PFT.RoutineLog.calculateDisciplineScore(updated));
        await PFT.saveRoutineLog(today, updated);
    };

    const updateTime = async (field, value) => {
        const today = new Date().toISOString().split('T')[0];
        const updated = { ...todayLog, [field]: value };
        setTodayLog(updated);
        await PFT.saveRoutineLog(today, updated);
    };

    const HabitRow = ({ habit, onToggle }) => (
        <TouchableOpacity
            style={[styles.habitRow, { borderBottomColor: theme.cardBorder }]}
            onPress={onToggle}
        >
            <View style={styles.rowCenter}>
                <View style={[
                    styles.checkbox,
                    {
                        backgroundColor: habit.done ? theme.success : 'transparent',
                        borderColor: habit.done ? theme.success : theme.textTertiary
                    }
                ]}>
                    {habit.done && <Feather name="check" size={14} color="#FFF" />}
                </View>
                <Text style={[
                    styles.habitName,
                    {
                        color: habit.done ? theme.textSecondary : theme.text,
                        textDecorationLine: habit.done ? 'line-through' : 'none'
                    }
                ]}>
                    {habit.name}
                </Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: theme.cardBorder }]}>
                <Text style={[styles.streakNum, { color: theme.textSecondary }]}>🔥 0</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>ROUTINE</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Daily Habits & Discipline</Text>
                    </View>
                </View>

                {/* Discipline Score */}
                <View style={[styles.scoreCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.scoreHeader}>
                        <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>DISCIPLINE SCORE</Text>
                        <Text style={[styles.dateText, { color: theme.textTertiary }]}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                    <View style={styles.scoreRow}>
                        <Text style={[styles.scoreValue, { color: theme.primary }]}>{disciplineScore}</Text>
                        <View style={[styles.scoreMeter, { backgroundColor: theme.cardBorder }]}>
                            <View style={[styles.scoreFill, { width: `${disciplineScore}%`, backgroundColor: theme.primary }]} />
                        </View>
                    </View>
                </View>

                {/* Schedule */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>TODAY'S SCHEDULE</Text>
                    <View style={styles.timeRow}>
                        <View style={styles.timeItem}>
                            <Feather name="sunrise" size={20} color={theme.warning} />
                            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Wake</Text>
                            <Text style={[styles.timeValue, { color: theme.text }]}>
                                {todayLog?.wake_time || '--:--'}
                            </Text>
                        </View>
                        <View style={[styles.timeDivider, { backgroundColor: theme.cardBorder }]} />
                        <View style={styles.timeItem}>
                            <Feather name="moon" size={20} color={theme.info} />
                            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Sleep</Text>
                            <Text style={[styles.timeValue, { color: theme.text }]}>
                                {todayLog?.sleep_time || '--:--'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Habits */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>DAILY HABITS</Text>
                        <Text style={[styles.habitProgress, { color: theme.primary }]}>
                            {todayLog?.habits?.filter(h => h.done).length || 0}/{todayLog?.habits?.length || 0}
                        </Text>
                    </View>

                    {todayLog?.habits?.map((habit, i) => (
                        <HabitRow key={i} habit={habit} onToggle={() => toggleHabit(habit.id)} />
                    ))}
                </View>

                {/* Focus Time */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.rowCenter}>
                            <Feather name="target" size={18} color={theme.accent} />
                            <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: 8 }]}>FOCUS TIME</Text>
                        </View>
                    </View>
                    <View style={styles.focusRow}>
                        <TouchableOpacity
                            onPress={() => updateTime('focus_hours', Math.max(0, (todayLog?.focus_hours || 0) - 0.5))}
                            style={[styles.focusBtn, { backgroundColor: theme.cardBorder }]}
                        >
                            <Feather name="minus" size={18} color={theme.text} />
                        </TouchableOpacity>
                        <View style={styles.focusCenter}>
                            <Text style={[styles.focusValue, { color: theme.text }]}>{todayLog?.focus_hours || 0}</Text>
                            <Text style={[styles.focusUnit, { color: theme.textSecondary }]}>hours</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => updateTime('focus_hours', (todayLog?.focus_hours || 0) + 0.5)}
                            style={[styles.focusBtn, { backgroundColor: theme.accent }]}
                        >
                            <Feather name="plus" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.success }]}
                        onPress={() => navigation.navigate('GoalManager')}
                    >
                        <Feather name="flag" size={18} color="#FFF" />
                        <Text style={styles.actionText}>Manage Goals</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.analyticsBtn, { backgroundColor: theme.card, borderColor: theme.accent }]}
                        onPress={() => navigation.navigate('HabitHeatmaps')}
                    >
                        <Feather name="grid" size={18} color={theme.accent} />
                        <Text style={[styles.analyticsBtnText, { color: theme.accent }]}>Habit Analytics – View Heatmaps</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.md, paddingBottom: 100 },
    header: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '700', letterSpacing: 1 },
    subtitle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    scoreCard: { borderRadius: radius.lg, borderWidth: 1, padding: 20, marginBottom: 16 },
    scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    scoreLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    dateText: { fontSize: 11 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    scoreValue: { fontSize: 48, fontWeight: '700' },
    scoreMeter: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    scoreFill: { height: '100%', borderRadius: 4 },
    card: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    habitProgress: { fontSize: 14, fontWeight: '700' },
    timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    timeItem: { flex: 1, alignItems: 'center' },
    timeLabel: { fontSize: 11, marginTop: 4 },
    timeValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
    timeDivider: { width: 1, height: 50 },
    habitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    habitName: { fontSize: 15, fontWeight: '500' },
    streakBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
    streakNum: { fontSize: 11, fontWeight: '600' },
    focusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
    focusBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    focusCenter: { alignItems: 'center' },
    focusValue: { fontSize: 36, fontWeight: '700' },
    focusUnit: { fontSize: 12 },
    quickActions: { marginTop: 8, gap: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: radius.lg, gap: 8 },
    actionText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    analyticsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: radius.lg, gap: 8, borderWidth: 2 },
    analyticsBtnText: { fontSize: 14, fontWeight: '600' }
});
