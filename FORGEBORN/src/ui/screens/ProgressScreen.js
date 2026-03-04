/**
 * FORGEBORN — PROGRESS SCREEN
 * 
 * Weight graph, body measurements, and progress tracking.
 * Inspired by: Happy Scale (weight trends), MyFitnessPal (measurement log)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Vibration,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useProgressStore from '../../store/progressStore';
import WeightChart from '../components/WeightChart';
import { radius, shadows } from '../theme/colors';

const MEASUREMENT_FIELDS = [
    { key: 'chest', label: 'CHEST', icon: '📏' },
    { key: 'waist', label: 'WAIST', icon: '📐' },
    { key: 'hips', label: 'HIPS', icon: '📏' },
    { key: 'arms', label: 'ARMS', icon: '💪' },
    { key: 'thighs', label: 'THIGHS', icon: '🦵' },
    { key: 'shoulders', label: 'SHOULDERS', icon: '🔱' },
    { key: 'neck', label: 'NECK', icon: '📏' },
];

const ProgressScreen = ({ navigation }) => {
    const weightLog = useProgressStore((s) => s.weightLog);
    const logWeight = useProgressStore((s) => s.logWeight);
    const getWeightTrend = useProgressStore((s) => s.getWeightTrend);
    const getLast30DaysWeight = useProgressStore((s) => s.getLast30DaysWeight);
    const logMeasurements = useProgressStore((s) => s.logMeasurements);
    const getLatestMeasurements = useProgressStore((s) => s.getLatestMeasurements);

    const [newWeight, setNewWeight] = useState('');
    const [showMeasurements, setShowMeasurements] = useState(false);
    const [measurements, setMeasurements] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);

    const trend = getWeightTrend();
    const last30 = getLast30DaysWeight();
    const latestMeasurements = getLatestMeasurements();

    // Simple weight graph (text-based bar chart)
    const maxWeight = last30.length > 0 ? Math.max(...last30.map(w => w.weight)) : 100;
    const minWeight = last30.length > 0 ? Math.min(...last30.map(w => w.weight)) : 50;
    const range = maxWeight - minWeight || 1;

    const handleLogWeight = () => {
        const w = parseFloat(newWeight);
        if (isNaN(w) || w <= 0) return;
        logWeight(w);
        setNewWeight('');
        Vibration.vibrate(50);
        setRefreshKey(k => k + 1);
    };

    const handleLogMeasurements = () => {
        const parsed = {};
        Object.entries(measurements).forEach(([key, val]) => {
            const num = parseFloat(val);
            if (!isNaN(num) && num > 0) parsed[key] = num;
        });

        if (Object.keys(parsed).length === 0) {
            Alert.alert('ERROR', 'Enter at least one measurement.');
            return;
        }

        logMeasurements(parsed);
        setMeasurements({});
        setShowMeasurements(false);
        Vibration.vibrate(50);
        setRefreshKey(k => k + 1);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>PROGRESS</Text>
                </View>
                <Text style={styles.subtitle}>TRACK. MEASURE. EVOLVE.</Text>

                {/* Weight Trend Card */}
                <View style={styles.trendCard}>
                    <View style={styles.trendHeader}>
                        <View>
                            <Text style={styles.trendLabel}>CURRENT</Text>
                            <Text style={styles.trendWeight}>
                                {trend.currentWeight || '–'} kg
                            </Text>
                        </View>
                        <View style={styles.trendChange}>
                            <Ionicons
                                name={trend.change > 0 ? 'arrow-up' : trend.change < 0 ? 'arrow-down' : 'remove'}
                                size={16}
                                color={trend.trend === 'LOSING' ? colors.success :
                                    trend.trend === 'GAINING' ? colors.warning : colors.textDim}
                            />
                            <Text style={[styles.trendChangeNum, {
                                color: trend.trend === 'LOSING' ? colors.success :
                                    trend.trend === 'GAINING' ? colors.warning : colors.textDim,
                            }]}>
                                {Math.abs(trend.change)} kg
                            </Text>
                            <Text style={styles.trendStatus}>{trend.trend}</Text>
                        </View>
                    </View>
                </View>

                {/* Log Weight */}
                <View style={styles.logCard}>
                    <Text style={styles.logTitle}>LOG TODAY'S WEIGHT</Text>
                    <View style={styles.logRow}>
                        <TextInput
                            style={styles.logInput}
                            value={newWeight}
                            onChangeText={setNewWeight}
                            placeholder="73.5"
                            placeholderTextColor={colors.textDim}
                            keyboardType="numeric"
                        />
                        <Text style={styles.logUnit}>KG</Text>
                        <TouchableOpacity style={styles.logBtn} onPress={handleLogWeight}>
                            <Ionicons name="checkmark" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Weight Graph */}
                <Text style={styles.sectionLabel}>WEIGHT TREND (30 DAYS)</Text>
                {last30.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={styles.emptyText}>No weight data yet.</Text>
                        <Text style={styles.emptySubtext}>Log your weight to see the graph.</Text>
                    </View>
                ) : (
                    <WeightChart
                        data={last30}
                        height={160}
                        color={colors.primary}
                    />
                )}

                {/* Weight History */}
                {weightLog.length > 0 && (
                    <>
                        <Text style={styles.sectionLabel}>RECENT ENTRIES</Text>
                        {weightLog.slice(-7).reverse().map((entry, i) => (
                            <View key={entry.date} style={styles.historyRow}>
                                <Text style={styles.historyDate}>{entry.date}</Text>
                                <Text style={styles.historyWeight}>{entry.weight} kg</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Body Measurements */}
                <Text style={styles.sectionLabel}>BODY MEASUREMENTS</Text>
                {latestMeasurements ? (
                    <View style={styles.measurementCard}>
                        <Text style={styles.measurementDate}>
                            Last updated: {latestMeasurements.date}
                        </Text>
                        <View style={styles.measurementGrid}>
                            {MEASUREMENT_FIELDS.map(field => {
                                const val = latestMeasurements[field.key];
                                if (!val) return null;
                                return (
                                    <View key={field.key} style={styles.measurementItem}>
                                        <Text style={styles.measurementIcon}>{field.icon}</Text>
                                        <Text style={styles.measurementVal}>{val}</Text>
                                        <Text style={styles.measurementLabel}>{field.label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No measurements logged yet.</Text>
                    </View>
                )}

                {/* Add Measurements */}
                {showMeasurements ? (
                    <View style={styles.measurementForm}>
                        <Text style={styles.measurementFormTitle}>LOG MEASUREMENTS (cm)</Text>
                        {MEASUREMENT_FIELDS.map(field => (
                            <View key={field.key} style={styles.measurementInputRow}>
                                <Text style={styles.measurementInputLabel}>
                                    {field.icon} {field.label}
                                </Text>
                                <TextInput
                                    style={styles.measurementInput}
                                    value={measurements[field.key] || ''}
                                    onChangeText={(v) => setMeasurements(m => ({ ...m, [field.key]: v }))}
                                    placeholder="–"
                                    placeholderTextColor={colors.textDim}
                                    keyboardType="numeric"
                                />
                            </View>
                        ))}
                        <View style={styles.measurementBtns}>
                            <TouchableOpacity
                                style={styles.measurementCancel}
                                onPress={() => { setShowMeasurements(false); setMeasurements({}); }}
                            >
                                <Text style={styles.cancelText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.measurementSave}
                                onPress={handleLogMeasurements}
                            >
                                <Text style={styles.saveText}>SAVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addMeasurementBtn}
                        onPress={() => setShowMeasurements(true)}
                    >
                        <Ionicons name="add" size={18} color={colors.primary} />
                        <Text style={styles.addMeasurementText}>UPDATE MEASUREMENTS</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: spacing[12],
        paddingBottom: spacing[4],
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    title: {
        ...textStyles.h1,
        color: colors.primary,
        fontSize: 24,
    },
    subtitle: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[4],
    },

    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[5],
        marginBottom: spacing[2],
    },

    // Trend
    trendCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: radius.lg,
        padding: spacing[4],
        ...shadows.md,
    },
    trendHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trendLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
    trendWeight: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.text,
    },
    trendChange: {
        alignItems: 'center',
    },
    trendChangeNum: {
        fontSize: 16,
        fontWeight: '700',
    },
    trendStatus: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },

    // Log weight
    logCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[3],
        marginTop: spacing[3],
    },
    logTitle: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
        marginBottom: spacing[2],
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    logInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        padding: spacing[2],
    },
    logUnit: {
        ...textStyles.label,
        color: colors.textDim,
        fontSize: 14,
    },
    logBtn: {
        width: 40,
        height: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Graph
    graphCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[2],
        height: 140,
    },
    graphYAxis: {
        justifyContent: 'space-between',
        paddingRight: spacing[1],
        width: 36,
    },
    graphYLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },
    graphScroll: {
        flex: 1,
    },
    graphBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 3,
        paddingRight: spacing[2],
    },
    graphBarWrapper: {
        alignItems: 'center',
        width: 16,
        height: '100%',
        justifyContent: 'flex-end',
    },
    graphBar: {
        width: 10,
        minHeight: 4,
    },
    graphBarLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 6,
        marginTop: 2,
    },

    // History
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        padding: spacing[2],
        paddingHorizontal: spacing[3],
        marginBottom: 2,
    },
    historyDate: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },
    historyWeight: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 13,
    },

    // Measurements
    measurementCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[3],
    },
    measurementDate: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginBottom: spacing[2],
    },
    measurementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    measurementItem: {
        width: '30%',
        alignItems: 'center',
        padding: spacing[2],
        backgroundColor: colors.background,
    },
    measurementIcon: { fontSize: 14 },
    measurementVal: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.text,
    },
    measurementLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 7,
    },

    // Measurement form
    measurementForm: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: spacing[3],
        marginTop: spacing[2],
    },
    measurementFormTitle: {
        ...textStyles.label,
        color: colors.primary,
        fontSize: 11,
        marginBottom: spacing[2],
    },
    measurementInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    measurementInputLabel: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 11,
    },
    measurementInput: {
        width: 60,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        padding: spacing[1],
    },
    measurementBtns: {
        flexDirection: 'row',
        gap: spacing[2],
        marginTop: spacing[3],
    },
    measurementCancel: {
        flex: 1,
        padding: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    cancelText: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    measurementSave: {
        flex: 1,
        padding: spacing[2],
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    saveText: {
        ...textStyles.button,
        color: '#000',
        fontSize: 11,
    },
    addMeasurementBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        padding: spacing[3],
        marginTop: spacing[2],
        gap: spacing[2],
    },
    addMeasurementText: {
        ...textStyles.caption,
        color: colors.primary,
        fontSize: 10,
    },

    // Empty
    emptyCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[5],
        alignItems: 'center',
    },
    emptyIcon: { fontSize: 24, marginBottom: spacing[1] },
    emptyText: {
        ...textStyles.label,
        color: colors.textDim,
        fontSize: 12,
    },
    emptySubtext: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 9,
        marginTop: 2,
    },
});

export default ProgressScreen;
