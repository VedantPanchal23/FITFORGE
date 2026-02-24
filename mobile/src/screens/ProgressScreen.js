import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../theme/ThemeContext';
import { spacing, fonts, radius } from '../theme';
import * as PFT from '../services/PFTBridge';

const screenWidth = Dimensions.get('window').width - 48; // spacing.lg * 2 (24*2) -> 48

export default function ProgressScreen() {
    const { theme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [weightHistory, setWeightHistory] = useState([]);
    const [newWeight, setNewWeight] = useState('');
    const [bodyMetrics, setBodyMetrics] = useState(null);
    const [tab, setTab] = useState('overview');

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
            }
            const history = await PFT.getWeightHistory();
            setWeightHistory(history || []);
        } catch (error) {
            console.log('ProgressScreen error:', error.message);
        }
    };

    const handleLogWeight = async () => {
        const weight = parseFloat(newWeight);
        if (isNaN(weight) || weight < 20 || weight > 300) {
            Alert.alert('Invalid Weight', 'Please enter a valid weight');
            return;
        }

        try {
            await PFT.logWeight(weight);
            setNewWeight('');
            Alert.alert('System Update', `Weight ${weight}kg logged.`);
            loadData();
        } catch (error) {
            Alert.alert('Error', 'Failed to log weight');
        }
    };

    const getWeightChartData = () => {
        if (weightHistory.length < 2) {
            return {
                labels: ['Start', 'Current'],
                datasets: [{ data: [profile?.weight_kg || 70, profile?.weight_kg || 70] }]
            };
        }
        const last7 = weightHistory.slice(-7).reverse();
        return {
            labels: last7.map((_, i) => i === 0 ? 'Start' : i === last7.length - 1 ? 'Now' : ''),
            datasets: [{ data: last7.map(w => w.weight_kg), strokeWidth: 2 }]
        };
    };

    const getMacroChartData = () => {
        const protein = profile?.protein_grams || bodyMetrics?.macros?.protein || 120;
        const carbs = profile?.carbs_grams || bodyMetrics?.macros?.carbs || 200;
        const fats = profile?.fats_grams || bodyMetrics?.macros?.fats || 60;
        return {
            labels: ['P', 'C', 'F'],
            datasets: [{ data: [protein, carbs, fats] }]
        };
    };

    const chartConfig = {
        backgroundGradientFrom: theme.card,
        backgroundGradientTo: theme.card,
        decimalPlaces: 1,
        color: (opacity = 1) => theme.primary,
        labelColor: () => theme.textSecondary,
        style: { borderRadius: radius.lg },
        propsForDots: { r: '4', strokeWidth: '0', stroke: theme.primary }
    };

    const calculateWeightChange = () => {
        if (weightHistory.length < 2) return { change: 0, percent: 0 };
        const first = weightHistory[weightHistory.length - 1].weight_kg;
        const last = weightHistory[0].weight_kg;
        const change = last - first;
        const percent = ((change / first) * 100).toFixed(1);
        return { change: change.toFixed(1), percent };
    };

    const weightChange = calculateWeightChange();
    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'activity' },
        { id: 'weight', label: 'Mass', icon: 'maximize-2' },
        { id: 'macros', label: 'Macros', icon: 'pie-chart' }
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>SYSTEM PROGRESS</Text>
                <Text style={[styles.subtitle, { color: theme.primary }]}>DATA ANALYTICS</Text>
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
                {tab === 'overview' && (
                    <>
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>CURRENT</Text>
                                <Text style={[styles.statValue, { color: theme.text }]}>{profile?.weight_kg || '--'}</Text>
                                <Text style={[styles.statUnit, { color: theme.textSecondary }]}>KG</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>GOAL</Text>
                                <Text style={[styles.statValue, { color: theme.primary }]}>{profile?.target_weight_kg || '--'}</Text>
                                <Text style={[styles.statUnit, { color: theme.textSecondary }]}>KG</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>DELTA</Text>
                                <View style={styles.rowCenter}>
                                    <Feather
                                        name={weightChange.change < 0 ? 'arrow-down' : 'arrow-up'}
                                        size={14}
                                        color={weightChange.change < 0 ? theme.success : theme.warning}
                                    />
                                    <Text style={[styles.statValue, { color: weightChange.change < 0 ? theme.success : theme.warning, fontSize: 18 }]}>
                                        {Math.abs(weightChange.change)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>SYSTEM METRICS</Text>
                            <View style={styles.metricsGrid}>
                                <View style={styles.metricItem}>
                                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>BMR</Text>
                                    <Text style={[styles.metricValue, { color: theme.text }]}>{bodyMetrics?.bmr || '--'}</Text>
                                </View>
                                <View style={styles.metricItem}>
                                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>TDEE</Text>
                                    <Text style={[styles.metricValue, { color: theme.primary }]}>{bodyMetrics?.tdee || '--'}</Text>
                                </View>
                                <View style={styles.metricItem}>
                                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>BMI</Text>
                                    <Text style={[styles.metricValue, { color: theme.text }]}>{bodyMetrics?.bmi || '--'}</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {tab === 'weight' && (
                    <>
                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>LOG MASS</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }]}
                                    placeholder="Enter weight (kg)"
                                    placeholderTextColor={theme.textSecondary}
                                    keyboardType="numeric"
                                    value={newWeight}
                                    onChangeText={setNewWeight}
                                />
                                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleLogWeight}>
                                    <Feather name="plus" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>MASS TREND</Text>
                            <LineChart
                                data={getWeightChartData()}
                                width={screenWidth}
                                height={200}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                    </>
                )}

                {tab === 'macros' && (
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>MACRO DISTRIBUTION</Text>
                        <BarChart
                            data={getMacroChartData()}
                            width={screenWidth}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => theme.primary
                            }}
                            style={styles.chart}
                            showValuesOnTopOfBars
                            fromZero
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: spacing.lg, paddingBottom: 8 },
    title: { fontSize: 24, fontWeight: '700', letterSpacing: -1 },
    subtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
    tabBar: { flexDirection: 'row', marginHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, padding: 4, marginBottom: 12 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: radius.sm, gap: 6 },
    tabLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    scroll: { padding: spacing.lg },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: { flex: 1, padding: 16, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center' },
    statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: '700', letterSpacing: -1 },
    statUnit: { fontSize: 10, fontWeight: '600', marginTop: 4 },
    rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    card: { borderRadius: radius.lg, borderWidth: 1, padding: 20, marginBottom: 16 },
    cardTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
    metricsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    metricItem: { alignItems: 'center' },
    metricLabel: { fontSize: 11, marginBottom: 4 },
    metricValue: { fontSize: 18, fontWeight: '700' },
    inputRow: { flexDirection: 'row', gap: 12 },
    input: { flex: 1, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
    btn: { width: 48, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md },
    chart: { borderRadius: radius.md, marginVertical: 8 }
});
