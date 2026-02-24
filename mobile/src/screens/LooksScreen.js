import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as PFT from '../services/PFTBridge';

export default function LooksScreen({ navigation }) {
    const { theme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [todayLog, setTodayLog] = useState(null);
    const [looksPlan, setLooksPlan] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const p = await PFT.getProfile();
            setProfile(p);

            if (p) {
                const plan = PFT.generateLooksmaxingPlan(p);
                setLooksPlan(plan);
            }

            const today = new Date().toISOString().split('T')[0];
            const log = await PFT.getLooksLog(today);
            setTodayLog(log || PFT.LooksLog.createLooksLog({ date: today }));
        } catch (error) {
            console.log('Looks load error:', error);
        }
    };

    const toggleRoutine = async (type) => {
        const today = new Date().toISOString().split('T')[0];
        const updated = {
            ...todayLog,
            [type]: !todayLog?.[type]
        };
        setTodayLog(updated);
        await PFT.saveLooksLog(today, updated);
    };

    const toggleGroomingTask = async (index) => {
        const today = new Date().toISOString().split('T')[0];
        const currentTasks = todayLog?.grooming_tasks || [
            { task: 'Trim nails', done: false },
            { task: 'Check eyebrows', done: false },
            { task: 'Hair styling', done: false },
            { task: 'Oral hygiene', done: false }
        ];

        const updatedTasks = currentTasks.map((t, i) =>
            i === index ? { ...t, done: !t.done } : t
        );

        const updated = {
            ...todayLog,
            grooming_tasks: updatedTasks
        };
        setTodayLog(updated);
        await PFT.saveLooksLog(today, updated);
    };

    const RoutineCard = ({ title, done, onToggle, items, icon }) => (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.cardHeader}>
                <View style={styles.rowCenter}>
                    <Feather name={icon} size={18} color={done ? theme.success : theme.textSecondary} />
                    <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: 8 }]}>{title}</Text>
                </View>
                <Switch
                    value={done}
                    onValueChange={onToggle}
                    trackColor={{ false: theme.cardBorder, true: theme.success }}
                    thumbColor={done ? '#FFF' : theme.textTertiary}
                />
            </View>
            {items?.map((item, i) => (
                <View key={i} style={[styles.itemRow, { borderTopColor: theme.cardBorder }]}>
                    <Text style={[styles.itemText, { color: theme.text }]}>{item.name || item}</Text>
                    {item.duration && <Text style={[styles.itemDuration, { color: theme.textTertiary }]}>{item.duration}</Text>}
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>LOOKS</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Looksmaxing & Grooming</Text>
                    </View>
                    <View style={[styles.streakBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.streakText}>🔥 {looksPlan?.streak || 0} days</Text>
                    </View>
                </View>

                {/* Today's Score */}
                <View style={[styles.scoreCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>TODAY'S COMPLETION</Text>
                    <Text style={[styles.scoreValue, { color: theme.primary }]}>
                        {PFT.LooksLog.calculateLooksScore(todayLog || {})}%
                    </Text>
                </View>

                {/* Morning Routine */}
                <RoutineCard
                    title="MORNING ROUTINE"
                    done={todayLog?.morning_routine_done}
                    onToggle={() => toggleRoutine('morning_routine_done')}
                    icon="sunrise"
                    items={looksPlan?.skincare?.morning || [
                        { name: 'Cleanse face', duration: '2 min' },
                        { name: 'Apply moisturizer', duration: '1 min' },
                        { name: 'Sunscreen SPF 30+', duration: '1 min' }
                    ]}
                />

                {/* Evening Routine */}
                <RoutineCard
                    title="EVENING ROUTINE"
                    done={todayLog?.evening_routine_done}
                    onToggle={() => toggleRoutine('evening_routine_done')}
                    icon="moon"
                    items={looksPlan?.skincare?.evening || [
                        { name: 'Double cleanse', duration: '3 min' },
                        { name: 'Toner/Serum', duration: '2 min' },
                        { name: 'Night moisturizer', duration: '1 min' }
                    ]}
                />

                {/* Facial Exercises */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.rowCenter}>
                            <Feather name="smile" size={18} color={theme.accent} />
                            <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: 8 }]}>FACIAL EXERCISES</Text>
                        </View>
                        <Switch
                            value={todayLog?.facial_exercises_done}
                            onValueChange={() => toggleRoutine('facial_exercises_done')}
                            trackColor={{ false: theme.cardBorder, true: theme.accent }}
                            thumbColor={todayLog?.facial_exercises_done ? '#FFF' : theme.textTertiary}
                        />
                    </View>
                    {[
                        { name: 'Mewing', duration: 'Maintain throughout day' },
                        { name: 'Cheekbone raises', duration: '20 reps' },
                        { name: 'Jawline clenches', duration: '30 sec holds' }
                    ].map((ex, i) => (
                        <View key={i} style={[styles.itemRow, { borderTopColor: theme.cardBorder }]}>
                            <Text style={[styles.itemText, { color: theme.text }]}>{ex.name}</Text>
                            <Text style={[styles.itemDuration, { color: theme.textTertiary }]}>{ex.duration}</Text>
                        </View>
                    ))}
                </View>

                {/* Grooming Tasks */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.cardLabel, { color: theme.textSecondary, marginBottom: 12 }]}>GROOMING CHECKLIST</Text>
                    {(todayLog?.grooming_tasks || [
                        { task: 'Trim nails', done: false },
                        { task: 'Check eyebrows', done: false },
                        { task: 'Hair styling', done: false },
                        { task: 'Oral hygiene', done: false }
                    ]).map((task, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.groomRow, { borderBottomColor: theme.cardBorder }]}
                            onPress={() => toggleGroomingTask(i)}
                        >
                            <View style={styles.rowCenter}>
                                <Feather
                                    name={task.done ? "check-square" : "square"}
                                    size={18}
                                    color={task.done ? theme.success : theme.textTertiary}
                                />
                                <Text style={[styles.groomText, { color: theme.text, marginLeft: 12 }]}>{task.task}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Hair Care */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.rowCenter}>
                            <Feather name="scissors" size={18} color={theme.warning} />
                            <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: 8 }]}>HAIR CARE</Text>
                        </View>
                        <Switch
                            value={todayLog?.hair_routine_done}
                            onValueChange={() => toggleRoutine('hair_routine_done')}
                            trackColor={{ false: theme.cardBorder, true: theme.warning }}
                            thumbColor={todayLog?.hair_routine_done ? '#FFF' : theme.textTertiary}
                        />
                    </View>
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                        {looksPlan?.hairCare?.tip || 'Oil hair 1-2x weekly. Use mild shampoo. Avoid hot water on scalp.'}
                    </Text>
                </View>
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
    streakBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
    streakText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    scoreCard: { borderRadius: radius.lg, borderWidth: 1, padding: 20, marginBottom: 16, alignItems: 'center' },
    scoreLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    scoreValue: { fontSize: 48, fontWeight: '700', marginTop: 4 },
    card: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1 },
    itemText: { fontSize: 14, fontWeight: '500' },
    itemDuration: { fontSize: 12 },
    groomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    groomText: { fontSize: 14 },
    tipText: { fontSize: 13, lineHeight: 20 }
});
