import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

export default function CycleScreen({ navigation }) {
    const { theme } = useTheme();
    const [enabled, setEnabled] = useState(false);
    const [cycleDay, setCycleDay] = useState(null);
    const [cycleLength, setCycleLength] = useState(28);
    const [lastPeriodStart, setLastPeriodStart] = useState(null);

    const phases = [
        { id: 'menstrual', name: 'Menstrual', days: '1-5', desc: 'Period days - Gentle workouts, extra iron', color: '#EF4444', icon: 'water', recommendations: ['Reduce intensity', 'Iron-rich foods', 'Rest'] },
        { id: 'follicular', name: 'Follicular', days: '6-13', desc: 'Rising energy - Great for intense training', color: '#10B981', icon: 'trending-up', recommendations: ['High intensity OK', 'Build muscle', 'Try new PRs'] },
        { id: 'ovulation', name: 'Ovulation', days: '14-16', desc: 'Peak performance - Max strength', color: '#F59E0B', icon: 'flash', recommendations: ['Peak strength', 'Compete', 'HIIT'] },
        { id: 'luteal', name: 'Luteal', days: '17-28', desc: 'Winding down - Moderate intensity', color: '#8B5CF6', icon: 'trending-down', recommendations: ['Moderate cardio', 'Yoga', 'Combat cravings'] }
    ];

    useEffect(() => {
        loadCycleData();
    }, []);

    const loadCycleData = async () => {
        const saved = await AsyncStorage.getItem('@fitforge_cycle');
        if (saved) {
            const data = JSON.parse(saved);
            setEnabled(data.enabled);
            setCycleLength(data.cycleLength || 28);
            setLastPeriodStart(data.lastPeriodStart);
            if (data.lastPeriodStart) {
                calculateCurrentDay(data.lastPeriodStart, data.cycleLength);
            }
        }
    };

    const calculateCurrentDay = (startDate, length) => {
        const start = new Date(startDate);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setCycleDay(((diffDays - 1) % length) + 1);
    };

    const saveCycleData = async () => {
        await AsyncStorage.setItem('@fitforge_cycle', JSON.stringify({
            enabled, cycleLength, lastPeriodStart
        }));
    };

    const toggleEnabled = async () => {
        setEnabled(!enabled);
        await AsyncStorage.setItem('@fitforge_cycle', JSON.stringify({
            enabled: !enabled, cycleLength, lastPeriodStart
        }));
    };

    const logPeriodStart = async () => {
        const today = new Date().toISOString().split('T')[0];
        setLastPeriodStart(today);
        setCycleDay(1);
        await AsyncStorage.setItem('@fitforge_cycle', JSON.stringify({
            enabled, cycleLength, lastPeriodStart: today
        }));
    };

    const getCurrentPhase = () => {
        if (!cycleDay) return null;
        if (cycleDay <= 5) return phases[0];
        if (cycleDay <= 13) return phases[1];
        if (cycleDay <= 16) return phases[2];
        return phases[3];
    };

    const currentPhase = getCurrentPhase();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
                    <Ionicons name="arrow-back" size={22} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Cycle Tracking</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Toggle */}
                <View style={[styles.toggleCard, { backgroundColor: enabled ? theme.primary + '15' : theme.card, borderColor: enabled ? theme.primary : theme.border }]}>
                    <View style={styles.toggleRow}>
                        <View style={[styles.toggleIcon, { backgroundColor: enabled ? theme.primary : theme.backgroundSecondary }]}>
                            <Ionicons name="calendar-outline" size={24} color={enabled ? '#FFF' : theme.textSecondary} />
                        </View>
                        <View style={styles.toggleContent}>
                            <Text style={[styles.toggleLabel, { color: theme.text }]}>Cycle Tracking</Text>
                            <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>Adjust plans based on menstrual phase</Text>
                        </View>
                        <Switch value={enabled} onValueChange={toggleEnabled} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#FFF" />
                    </View>
                </View>

                {enabled && (
                    <>
                        {/* Current Status */}
                        {currentPhase && (
                            <View style={[styles.statusCard, { backgroundColor: currentPhase.color + '15', borderColor: currentPhase.color }]}>
                                <View style={styles.statusHeader}>
                                    <View style={[styles.phaseIcon, { backgroundColor: currentPhase.color }]}>
                                        <Ionicons name={currentPhase.icon} size={22} color="#FFF" />
                                    </View>
                                    <View style={styles.statusContent}>
                                        <Text style={[styles.phaseName, { color: currentPhase.color }]}>{currentPhase.name} Phase</Text>
                                        <Text style={[styles.cycleDay, { color: theme.text }]}>Day {cycleDay} of {cycleLength}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.phaseDesc, { color: theme.textSecondary }]}>{currentPhase.desc}</Text>
                                <View style={styles.recommendations}>
                                    {currentPhase.recommendations.map((rec, i) => (
                                        <View key={i} style={[styles.recTag, { backgroundColor: currentPhase.color + '20' }]}>
                                            <Ionicons name="checkmark" size={12} color={currentPhase.color} />
                                            <Text style={[styles.recText, { color: currentPhase.color }]}>{rec}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Log Period */}
                        <TouchableOpacity style={[styles.logBtn, { backgroundColor: theme.error + '15', borderColor: theme.error }]} onPress={logPeriodStart}>
                            <Ionicons name="add-circle" size={20} color={theme.error} />
                            <Text style={[styles.logBtnText, { color: theme.error }]}>Log Period Start (Today)</Text>
                        </TouchableOpacity>

                        {/* Phase Guide */}
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cycle Phases</Text>
                        {phases.map(phase => (
                            <View key={phase.id} style={[styles.phaseCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
                                <View style={styles.phaseContent}>
                                    <Text style={[styles.phaseLabel, { color: theme.text }]}>{phase.name}</Text>
                                    <Text style={[styles.phaseDays, { color: theme.textSecondary }]}>Days {phase.days}</Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Info for all users */}
                <View style={[styles.infoCard, { backgroundColor: theme.info + '15', borderColor: theme.info }]}>
                    <Ionicons name="information-circle" size={20} color={theme.info} />
                    <Text style={[styles.infoText, { color: theme.info }]}>
                        This feature adjusts workout intensity and nutrition recommendations based on hormonal fluctuations. For males, tracking can help identify energy patterns.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
    backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    scroll: { padding: spacing.lg, paddingTop: 0 },
    toggleCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    toggleRow: { flexDirection: 'row', alignItems: 'center' },
    toggleIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    toggleContent: { flex: 1 },
    toggleLabel: { fontSize: 17, fontWeight: '600' },
    toggleDesc: { fontSize: 13, marginTop: 2 },
    statusCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    phaseIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    statusContent: { flex: 1 },
    phaseName: { fontSize: 18, fontWeight: '700' },
    cycleDay: { fontSize: 14, fontWeight: '600', marginTop: 2 },
    phaseDesc: { fontSize: 14, marginBottom: 12 },
    recommendations: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    recTag: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, gap: 4 },
    recText: { fontSize: 12, fontWeight: '500' },
    logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 24, gap: 8 },
    logBtnText: { fontSize: 15, fontWeight: '600' },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    phaseCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
    phaseDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    phaseContent: { flex: 1 },
    phaseLabel: { fontSize: 15, fontWeight: '600' },
    phaseDays: { fontSize: 12, marginTop: 2 },
    infoCard: { flexDirection: 'row', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 16, gap: 10 },
    infoText: { flex: 1, fontSize: 12, lineHeight: 18 }
});
