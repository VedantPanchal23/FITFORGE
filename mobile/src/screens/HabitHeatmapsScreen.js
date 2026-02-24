import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import { HabitHeatmap, MultiHabitHeatmaps } from '../components/HabitHeatmap';
import * as DatabaseService from '../services/DatabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = '@fitforge_habit_data';

// Default habits with colors
const DEFAULT_HABITS = [
    { id: 'workout', name: 'Workout', color: '#FF6B6B' },
    { id: 'skincare', name: 'Skincare', color: '#4ECDC4' },
    { id: 'water', name: 'Water Goal', color: '#60A5FA' },
    { id: 'sleep', name: 'Good Sleep', color: '#A78BFA' },
    { id: 'reading', name: 'Reading', color: '#FBBF24' }
];

export default function HabitHeatmapsScreen({ navigation }) {
    const { theme } = useTheme();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHabit, setSelectedHabit] = useState(null);

    useEffect(() => {
        loadHabitData();
    }, []);

    const loadHabitData = async () => {
        setLoading(true);
        try {
            // Ensure database is initialized
            await DatabaseService.initDatabase();

            // Get habit data from storage
            const storedData = await AsyncStorage.getItem(HABITS_KEY);
            let habitEntries = storedData ? JSON.parse(storedData) : {};

            // Get data from routine logs (with fallback)
            let routineLogs = [];
            try {
                routineLogs = await DatabaseService.getRoutineLogs(120);
            } catch (dbError) {
                console.log('Database not ready, using empty logs');
            }

            // Merge with default habits
            const habitsWithData = DEFAULT_HABITS.map(habit => {
                const entries = habitEntries[habit.id] || [];

                // Add data from routine logs for workout
                if (habit.id === 'workout' && routineLogs.length > 0) {
                    routineLogs.forEach(log => {
                        const workoutDone = log.habits?.find(h => h.name?.toLowerCase().includes('exercise') || h.name?.toLowerCase().includes('workout'))?.done;
                        if (workoutDone && !entries.find(e => e.date === log.date)) {
                            entries.push({ date: log.date, value: 1 });
                        }
                    });
                }

                return {
                    ...habit,
                    data: entries
                };
            });

            setHabits(habitsWithData);
        } catch (error) {
            console.log('Load habit data error:', error);
            // Set default habits without data on error
            setHabits(DEFAULT_HABITS.map(h => ({ ...h, data: [] })));
        } finally {
            setLoading(false);
        }
    };

    const toggleHabitToday = async (habitId) => {
        const today = new Date().toISOString().split('T')[0];

        // Get current data
        const storedData = await AsyncStorage.getItem(HABITS_KEY);
        let habitEntries = storedData ? JSON.parse(storedData) : {};

        if (!habitEntries[habitId]) {
            habitEntries[habitId] = [];
        }

        const existingIndex = habitEntries[habitId].findIndex(e => e.date === today);

        if (existingIndex >= 0) {
            // Toggle off
            habitEntries[habitId].splice(existingIndex, 1);
        } else {
            // Toggle on
            habitEntries[habitId].push({ date: today, value: 1 });
        }

        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habitEntries));
        loadHabitData();
    };

    const getStreakForHabit = (habitId) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit || !habit.data.length) return 0;

        const sorted = [...habit.data].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();

        for (const entry of sorted) {
            const entryDate = new Date(entry.date);
            const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

            if (daysDiff > 1) break;
            if (entry.value > 0) {
                streak++;
                currentDate = entryDate;
            }
        }

        return streak;
    };

    const isTodayComplete = (habitId) => {
        const today = new Date().toISOString().split('T')[0];
        const habit = habits.find(h => h.id === habitId);
        return habit?.data.some(e => e.date === today);
    };

    const HabitCard = ({ habit }) => {
        const streak = getStreakForHabit(habit.id);
        const todayDone = isTodayComplete(habit.id);

        return (
            <TouchableOpacity
                style={[styles.habitCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => toggleHabitToday(habit.id)}
            >
                <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                    <Feather
                        name={todayDone ? 'check-circle' : 'circle'}
                        size={20}
                        color={todayDone ? habit.color : theme.textTertiary}
                    />
                </View>
                <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, { color: theme.text }]}>{habit.name}</Text>
                    <Text style={[styles.habitStreak, { color: theme.textSecondary }]}>
                        {streak > 0 ? `${streak} day streak 🔥` : 'Not started'}
                    </Text>
                </View>
                <View style={[styles.checkBtn, { backgroundColor: todayDone ? habit.color : theme.cardBorder }]}>
                    <Feather name="check" size={16} color={todayDone ? '#FFF' : theme.textTertiary} />
                </View>
            </TouchableOpacity>
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
                    <Text style={[styles.title, { color: theme.text }]}>HABIT TRACKER</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Today's Habits */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>TODAY</Text>
                    {habits.map(habit => (
                        <HabitCard key={habit.id} habit={habit} />
                    ))}
                </View>

                {/* Heatmaps */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PROGRESS HEATMAPS</Text>
                    {habits.map(habit => (
                        <HabitHeatmap
                            key={habit.id}
                            habitId={habit.id}
                            title={habit.name}
                            color={habit.color}
                            data={habit.data}
                            onCellPress={(cell) => {
                                Alert.alert(habit.name, `${cell.date}: ${cell.value > 0 ? 'Completed ✅' : 'Not done'}`);
                            }}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.md, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 18, fontWeight: '700', letterSpacing: 1 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
    habitCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: radius.md, borderWidth: 1, marginBottom: 10 },
    habitIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    habitInfo: { flex: 1, marginLeft: 12 },
    habitName: { fontSize: 15, fontWeight: '600' },
    habitStreak: { fontSize: 12, marginTop: 2 },
    checkBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }
});
