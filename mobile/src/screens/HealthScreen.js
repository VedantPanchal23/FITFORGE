import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as PFT from '../services/PFTBridge';

export default function HealthScreen({ navigation }) {
    const { theme } = useTheme();
    const [todayLog, setTodayLog] = useState(null);
    const [healthScore, setHealthScore] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            let log = await PFT.getHealthLog(today);

            if (!log) {
                log = PFT.HealthLog.createHealthLog({ date: today });
            }

            setTodayLog(log);
            setHealthScore(PFT.HealthLog.calculateHealthScore(log));
        } catch (error) {
            console.log('Health load error:', error);
        }
    };

    const updateLog = async (field, value) => {
        const today = new Date().toISOString().split('T')[0];
        const updated = { ...todayLog, [field]: value };
        setTodayLog(updated);
        setHealthScore(PFT.HealthLog.calculateHealthScore(updated));
        await PFT.saveHealthLog(today, updated);
    };

    const addWater = async () => {
        const current = todayLog?.water_glasses || 0;
        await updateLog('water_glasses', current + 1);
    };

    const ScoreRing = ({ score }) => (
        <View style={[styles.scoreRing, { borderColor: theme.primary }]}>
            <Text style={[styles.scoreValue, { color: theme.primary }]}>{score}</Text>
            <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>HEALTH SCORE</Text>
        </View>
    );

    const SliderRow = ({ label, value, icon, color, onDecrease, onIncrease }) => (
        <View style={[styles.sliderCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.sliderHeader}>
                <Feather name={icon} size={18} color={color} />
                <Text style={[styles.sliderLabel, { color: theme.text }]}>{label}</Text>
            </View>
            <View style={styles.sliderRow}>
                <TouchableOpacity onPress={onDecrease} style={[styles.sliderBtn, { backgroundColor: theme.cardBorder }]}>
                    <Feather name="minus" size={18} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.sliderValue, { color: theme.text }]}>{value || '-'}</Text>
                <TouchableOpacity onPress={onIncrease} style={[styles.sliderBtn, { backgroundColor: theme.primary }]}>
                    <Feather name="plus" size={18} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>HEALTH</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Wellness Tracker</Text>
                    </View>
                </View>

                {/* Health Score */}
                <View style={styles.scoreContainer}>
                    <ScoreRing score={healthScore} />
                </View>

                {/* Sleep */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <Feather name="moon" size={18} color={theme.info} />
                        <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: 8 }]}>SLEEP</Text>
                    </View>
                    <View style={styles.sleepRow}>
                        <View style={styles.sleepInput}>
                            <TouchableOpacity onPress={() => updateLog('sleep_hours', Math.max(0, (todayLog?.sleep_hours || 0) - 0.5))}>
                                <Feather name="minus-circle" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                            <Text style={[styles.sleepValue, { color: theme.text }]}>
                                {todayLog?.sleep_hours || 0}h
                            </Text>
                            <TouchableOpacity onPress={() => updateLog('sleep_hours', Math.min(12, (todayLog?.sleep_hours || 0) + 0.5))}>
                                <Feather name="plus-circle" size={24} color={theme.info} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.qualityBtns}>
                            {['poor', 'average', 'good'].map(q => (
                                <TouchableOpacity
                                    key={q}
                                    style={[
                                        styles.qualityBtn,
                                        {
                                            backgroundColor: todayLog?.sleep_quality === q ? theme.info : theme.cardBorder
                                        }
                                    ]}
                                    onPress={() => updateLog('sleep_quality', q)}
                                >
                                    <Text style={[styles.qualityText, { color: todayLog?.sleep_quality === q ? '#FFF' : theme.textSecondary }]}>
                                        {q}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Water */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <Feather name="droplet" size={18} color={theme.info} />
                        <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: 8 }]}>WATER INTAKE</Text>
                    </View>
                    <View style={styles.waterRow}>
                        <Text style={[styles.waterCount, { color: theme.text }]}>
                            {todayLog?.water_glasses || 0} / 8
                        </Text>
                        <TouchableOpacity style={[styles.addWaterBtn, { backgroundColor: theme.info }]} onPress={addWater}>
                            <Feather name="plus" size={20} color="#FFF" />
                            <Text style={styles.addWaterText}>Add Glass</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.waterDots}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <View
                                key={n}
                                style={[
                                    styles.waterDot,
                                    { backgroundColor: n <= (todayLog?.water_glasses || 0) ? theme.info : theme.cardBorder }
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Energy & Stress */}
                <View style={styles.metricsRow}>
                    <SliderRow
                        label="Energy"
                        value={todayLog?.energy_level}
                        icon="zap"
                        color={theme.warning}
                        onDecrease={() => updateLog('energy_level', Math.max(1, (todayLog?.energy_level || 5) - 1))}
                        onIncrease={() => updateLog('energy_level', Math.min(10, (todayLog?.energy_level || 5) + 1))}
                    />
                    <SliderRow
                        label="Stress"
                        value={todayLog?.stress_level}
                        icon="cloud"
                        color={theme.error}
                        onDecrease={() => updateLog('stress_level', Math.max(1, (todayLog?.stress_level || 5) - 1))}
                        onIncrease={() => updateLog('stress_level', Math.min(10, (todayLog?.stress_level || 5) + 1))}
                    />
                </View>

                {/* Mood */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <Feather name="smile" size={18} color={theme.success} />
                        <Text style={[styles.cardLabel, { color: theme.textSecondary, marginLeft: 8 }]}>MOOD</Text>
                    </View>
                    <View style={styles.moodRow}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <TouchableOpacity
                                key={n}
                                style={[
                                    styles.moodBtn,
                                    {
                                        backgroundColor: todayLog?.mood === n ? theme.success : theme.cardBorder
                                    }
                                ]}
                                onPress={() => updateLog('mood', n)}
                            >
                                <Text style={[styles.moodNum, { color: todayLog?.mood === n ? '#FFF' : theme.textSecondary }]}>{n}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Breathing Exercise */}
                <TouchableOpacity
                    style={[styles.breathingCard, { backgroundColor: theme.primary }]}
                    onPress={() => {
                        Alert.alert(
                            '4-7-8 Breathing Technique',
                            '1. Breathe IN quietly through nose for 4 seconds\n\n2. HOLD your breath for 7 seconds\n\n3. Breathe OUT completely through mouth for 8 seconds\n\nRepeat 4 times for stress relief.',
                            [
                                { text: 'Got it!', style: 'default' }
                            ]
                        );
                    }}
                >
                    <Feather name="wind" size={24} color="#FFF" />
                    <View style={styles.breathingText}>
                        <Text style={styles.breathingTitle}>Breathing Exercise</Text>
                        <Text style={styles.breathingDesc}>4-7-8 technique • 3 minutes</Text>
                    </View>
                    <Feather name="play-circle" size={28} color="#FFF" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.md, paddingBottom: 100 },
    header: { marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '700', letterSpacing: 1 },
    subtitle: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    scoreContainer: { alignItems: 'center', marginBottom: 24 },
    scoreRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
    scoreValue: { fontSize: 36, fontWeight: '700' },
    scoreLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
    card: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    sleepRow: { alignItems: 'center' },
    sleepInput: { flexDirection: 'row', alignItems: 'center', gap: 24 },
    sleepValue: { fontSize: 36, fontWeight: '700' },
    qualityBtns: { flexDirection: 'row', gap: 8, marginTop: 16 },
    qualityBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full },
    qualityText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    waterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    waterCount: { fontSize: 32, fontWeight: '700' },
    addWaterBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, gap: 8 },
    addWaterText: { color: '#FFF', fontWeight: '600' },
    waterDots: { flexDirection: 'row', gap: 8, marginTop: 16, justifyContent: 'center' },
    waterDot: { width: 28, height: 28, borderRadius: 14 },
    metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    sliderCard: { flex: 1, borderRadius: radius.lg, borderWidth: 1, padding: 12 },
    sliderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sliderLabel: { fontSize: 13, fontWeight: '600', marginLeft: 8 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sliderBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    sliderValue: { fontSize: 24, fontWeight: '700' },
    moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    moodBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    moodNum: { fontSize: 12, fontWeight: '600' },
    breathingCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: radius.lg, gap: 16 },
    breathingText: { flex: 1 },
    breathingTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    breathingDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }
});
