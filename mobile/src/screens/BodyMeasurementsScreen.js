import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryScatter, VictoryLegend } from 'victory-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as DatabaseService from '../services/DatabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MEASUREMENT_TYPES = [
    { id: 'weight', label: 'Weight', unit: 'kg', icon: 'trending-down', color: '#FF6B6B' },
    { id: 'chest', label: 'Chest', unit: 'cm', icon: 'maximize', color: '#4ECDC4' },
    { id: 'waist', label: 'Waist', unit: 'cm', icon: 'minus', color: '#FBBF24' },
    { id: 'hips', label: 'Hips', unit: 'cm', icon: 'circle', color: '#A78BFA' },
    { id: 'arms', label: 'Arms', unit: 'cm', icon: 'anchor', color: '#60A5FA' },
    { id: 'thighs', label: 'Thighs', unit: 'cm', icon: 'git-branch', color: '#F472B6' }
];

const STORAGE_KEY = '@fitforge_measurements';

export default function BodyMeasurementsScreen({ navigation }) {
    const { theme } = useTheme();
    const [measurements, setMeasurements] = useState({});
    const [history, setHistory] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newMeasurement, setNewMeasurement] = useState({ type: 'weight', value: '' });
    const [chartType, setChartType] = useState('weight');

    useEffect(() => {
        loadMeasurements();
    }, []);

    const loadMeasurements = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                setHistory(parsed);

                // Get latest measurements
                const latest = {};
                MEASUREMENT_TYPES.forEach(type => {
                    const typeData = parsed.filter(m => m.type === type.id).sort((a, b) => new Date(b.date) - new Date(a.date));
                    if (typeData.length > 0) {
                        latest[type.id] = typeData[0].value;
                    }
                });
                setMeasurements(latest);
            }
        } catch (error) {
            console.log('Load measurements error:', error);
        }
    };

    const addMeasurement = async () => {
        if (!newMeasurement.value) {
            Alert.alert('Error', 'Please enter a value');
            return;
        }

        const entry = {
            id: Date.now().toString(),
            type: newMeasurement.type,
            value: parseFloat(newMeasurement.value),
            date: new Date().toISOString()
        };

        const updated = [...history, entry];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        setHistory(updated);
        setMeasurements({ ...measurements, [newMeasurement.type]: entry.value });
        setShowAdd(false);
        setNewMeasurement({ type: 'weight', value: '' });
    };

    const getChartData = (type) => {
        return history
            .filter(m => m.type === type)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-10)
            .map((m, i) => ({ x: i + 1, y: m.value }));
    };

    const getProgress = (type) => {
        const data = history.filter(m => m.type === type).sort((a, b) => new Date(a.date) - new Date(b.date));
        if (data.length < 2) return null;

        const first = data[0].value;
        const last = data[data.length - 1].value;
        return last - first;
    };

    const MeasurementCard = ({ type }) => {
        const progress = getProgress(type.id);
        const current = measurements[type.id];

        return (
            <TouchableOpacity
                style={[
                    styles.measurementCard,
                    {
                        backgroundColor: chartType === type.id ? type.color + '20' : theme.card,
                        borderColor: chartType === type.id ? type.color : theme.cardBorder
                    }
                ]}
                onPress={() => setChartType(type.id)}
            >
                <View style={[styles.measurementIcon, { backgroundColor: type.color + '20' }]}>
                    <Feather name={type.icon} size={18} color={type.color} />
                </View>
                <Text style={[styles.measurementLabel, { color: theme.textSecondary }]}>{type.label}</Text>
                <Text style={[styles.measurementValue, { color: theme.text }]}>
                    {current ? `${current} ${type.unit}` : '-'}
                </Text>
                {progress !== null && (
                    <View style={[styles.progressBadge, { backgroundColor: progress < 0 ? theme.success + '20' : theme.error + '20' }]}>
                        <Feather
                            name={progress < 0 ? 'trending-down' : 'trending-up'}
                            size={10}
                            color={progress < 0 ? theme.success : theme.error}
                        />
                        <Text style={[styles.progressText, { color: progress < 0 ? theme.success : theme.error }]}>
                            {progress > 0 ? '+' : ''}{progress.toFixed(1)}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const selectedType = MEASUREMENT_TYPES.find(t => t.id === chartType);
    const chartData = getChartData(chartType);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>BODY MEASUREMENTS</Text>
                    <TouchableOpacity onPress={() => setShowAdd(true)}>
                        <Feather name="plus" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                {/* Measurement Cards */}
                <View style={styles.measurementsGrid}>
                    {MEASUREMENT_TYPES.map(type => (
                        <MeasurementCard key={type.id} type={type} />
                    ))}
                </View>

                {/* Chart */}
                {chartData.length > 1 && (
                    <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.chartTitle, { color: theme.text }]}>
                            {selectedType.label} Progress
                        </Text>
                        <VictoryChart
                            width={width - 56}
                            height={200}
                            padding={{ left: 50, right: 20, top: 20, bottom: 40 }}
                        >
                            <VictoryAxis
                                label="Entries"
                                style={{
                                    axis: { stroke: theme.cardBorder },
                                    tickLabels: { fill: theme.textSecondary, fontSize: 10 },
                                    axisLabel: { fill: theme.textSecondary, fontSize: 11, padding: 25 }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                label={selectedType.unit}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    tickLabels: { fill: theme.textSecondary, fontSize: 10 },
                                    grid: { stroke: theme.cardBorder, strokeDasharray: '3,3' },
                                    axisLabel: { fill: theme.textSecondary, fontSize: 11, padding: 35 }
                                }}
                            />
                            <VictoryLine
                                data={chartData}
                                style={{ data: { stroke: selectedType.color, strokeWidth: 2 } }}
                                animate={{ duration: 500 }}
                            />
                            <VictoryScatter
                                data={chartData}
                                size={5}
                                style={{ data: { fill: selectedType.color } }}
                            />
                        </VictoryChart>
                    </View>
                )}

                {chartData.length <= 1 && (
                    <View style={[styles.emptyChart, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Feather name="bar-chart-2" size={32} color={theme.textTertiary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            Add at least 2 measurements to see progress chart
                        </Text>
                    </View>
                )}

                {/* Add Measurement Modal */}
                {showAdd && (
                    <View style={[styles.addModal, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Add Measurement</Text>

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                            {MEASUREMENT_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.typeBtn,
                                        {
                                            backgroundColor: newMeasurement.type === type.id ? type.color : theme.cardBorder
                                        }
                                    ]}
                                    onPress={() => setNewMeasurement({ ...newMeasurement, type: type.id })}
                                >
                                    <Text style={[styles.typeText, { color: newMeasurement.type === type.id ? '#FFF' : theme.text }]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                            Value ({MEASUREMENT_TYPES.find(t => t.id === newMeasurement.type)?.unit})
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBorder, color: theme.text }]}
                            placeholder="Enter value"
                            placeholderTextColor={theme.textTertiary}
                            keyboardType="numeric"
                            value={newMeasurement.value}
                            onChangeText={v => setNewMeasurement({ ...newMeasurement, value: v })}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}
                                onPress={() => setShowAdd(false)}
                            >
                                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={addMeasurement}
                            >
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
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
    title: { fontSize: 18, fontWeight: '700', letterSpacing: 1 },
    measurementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    measurementCard: { width: (width - 50) / 3, borderRadius: radius.md, borderWidth: 1, padding: 12, alignItems: 'center' },
    measurementIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    measurementLabel: { fontSize: 10, fontWeight: '600' },
    measurementValue: { fontSize: 14, fontWeight: '700', marginTop: 4 },
    progressBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
    progressText: { fontSize: 9, fontWeight: '600' },
    chartCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 20 },
    chartTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    emptyChart: { borderRadius: radius.lg, borderWidth: 1, padding: 40, alignItems: 'center' },
    emptyText: { fontSize: 13, textAlign: 'center', marginTop: 12 },
    addModal: { borderRadius: radius.lg, borderWidth: 1, padding: 20, marginTop: 20 },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    inputLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
    typeScroll: { flexDirection: 'row', marginBottom: 8 },
    typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, marginRight: 8 },
    typeText: { fontSize: 12, fontWeight: '600' },
    input: { height: 48, borderRadius: radius.md, paddingHorizontal: 14, fontSize: 16 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, height: 48, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    cancelText: { fontSize: 14, fontWeight: '600' },
    saveBtn: { flex: 2, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    saveText: { color: '#FFF', fontSize: 14, fontWeight: '600' }
});
