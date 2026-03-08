import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Vibration,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { Card, Typography, Button } from '../components';
import useProgressStore from '../../store/progressStore';
import WeightChart from '../components/WeightChart';

const MEASUREMENT_FIELDS = [
    { key: 'chest', label: 'Chest', icon: 'resize-outline' },
    { key: 'waist', label: 'Waist', icon: 'analytics-outline' },
    { key: 'hips', label: 'Hips', icon: 'resize-outline' },
    { key: 'arms', label: 'Arms', icon: 'fitness-outline' },
    { key: 'thighs', label: 'Thighs', icon: 'footsteps-outline' },
    { key: 'shoulders', label: 'Shoulders', icon: 'barbell-outline' },
    { key: 'neck', label: 'Neck', icon: 'resize-outline' },
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
            Alert.alert('Error', 'Enter at least one measurement.');
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
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[2] }}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Typography variant="largeTitle">Progress</Typography>
                        <Typography variant="subheadline" color={colors.textSecondary} style={{ marginTop: 2 }}>Track. Measure. Evolve.</Typography>
                    </View>
                </View>

                {/* Weight Trend Card */}
                <Card style={[styles.trendCard, { padding: spacing[6] }]}>
                    <View style={styles.trendHeader}>
                        <View>
                            <Typography variant="caption" color={colors.textDim} style={{ marginBottom: spacing[1] }}>Current Weight</Typography>
                            <Typography variant="largeTitle" style={{ fontSize: 40, lineHeight: 48 }}>
                                {trend.currentWeight || '–'}<Typography variant="title2" color={colors.textSecondary}> kg</Typography>
                            </Typography>
                        </View>
                        <View style={[styles.trendChangeBadge, {
                            backgroundColor: trend.trend === 'LOSING' ? 'rgba(16, 185, 129, 0.1)' :
                                trend.trend === 'GAINING' ? 'rgba(239, 68, 68, 0.1)' : colors.surfaceLight,
                        }]}>
                            <Ionicons
                                name={trend.change > 0 ? 'arrow-up' : trend.change < 0 ? 'arrow-down' : 'remove'}
                                size={16}
                                color={trend.trend === 'LOSING' ? colors.success :
                                    trend.trend === 'GAINING' ? colors.danger : colors.textDim}
                            />
                            <Typography variant="subheadline" style={{
                                color: trend.trend === 'LOSING' ? colors.success :
                                    trend.trend === 'GAINING' ? colors.danger : colors.textDim,
                                marginLeft: 4,
                                fontWeight: 'bold'
                            }}>
                                {Math.abs(trend.change)} kg
                            </Typography>
                        </View>
                    </View>
                </Card>

                {/* Log Weight */}
                <Card style={styles.logCard}>
                    <Typography variant="subheadline" color={colors.textSecondary} style={{ marginBottom: spacing[3] }}>Log Today's Weight</Typography>
                    <View style={styles.logRow}>
                        <TextInput
                            style={styles.logInput}
                            value={newWeight}
                            onChangeText={setNewWeight}
                            placeholder="73.5"
                            placeholderTextColor={colors.textDim}
                            keyboardType="numeric"
                        />
                        <Typography variant="body" color={colors.textSecondary} style={{ marginHorizontal: spacing[3] }}>kg</Typography>
                        <TouchableOpacity style={styles.logBtn} onPress={handleLogWeight}>
                            <Ionicons name="checkmark" size={20} color={colors.textInverse} />
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Weight Graph */}
                <View style={[styles.sectionHeader, { marginTop: spacing[8] }]}>
                    <Typography variant="title3">Weight Trend</Typography>
                    <Typography variant="caption" color={colors.textDim}>30 DAYS</Typography>
                </View>
                {last30.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="bar-chart-outline" size={24} color={colors.primary} />
                        </View>
                        <Typography variant="body" style={{ marginTop: spacing[3] }}>No weight data yet</Typography>
                        <Typography variant="caption" color={colors.textDim} style={{ marginTop: spacing[1] }}>Log your weight to see the graph.</Typography>
                    </Card>
                ) : (
                    <Card style={{ padding: spacing[4] }}>
                        <WeightChart
                            data={last30}
                            height={160}
                            color={colors.primary}
                        />
                    </Card>
                )}

                {/* Weight History */}
                {weightLog.length > 0 && (
                    <>
                        <View style={[styles.sectionHeader, { marginTop: spacing[8] }]}>
                            <Typography variant="title3">Recent Entries</Typography>
                        </View>
                        <Card style={{ padding: 0, overflow: 'hidden' }}>
                            {weightLog.slice(-7).reverse().map((entry, i, arr) => {
                                const isLast = i === arr.length - 1;
                                return (
                                    <View key={entry.date} style={[styles.historyRow, isLast && { borderBottomWidth: 0 }]}>
                                        <Typography variant="body" color={colors.textSecondary}>{entry.date}</Typography>
                                        <Typography variant="headline">{entry.weight} kg</Typography>
                                    </View>
                                );
                            })}
                        </Card>
                    </>
                )}

                {/* Body Measurements */}
                <View style={[styles.sectionHeader, { marginTop: spacing[8] }]}>
                    <Typography variant="title3">Body Measurements</Typography>
                    {latestMeasurements && (
                        <Typography variant="caption" color={colors.textDim}>As of {latestMeasurements.date}</Typography>
                    )}
                </View>

                {latestMeasurements ? (
                    <Card style={styles.measurementCard}>
                        <View style={styles.measurementGrid}>
                            {MEASUREMENT_FIELDS.map(field => {
                                const val = latestMeasurements[field.key];
                                if (!val) return null;
                                return (
                                    <View key={field.key} style={styles.measurementItem}>
                                        <View style={styles.measurementIconBox}>
                                            <Ionicons name={field.icon} size={16} color={colors.primary} />
                                        </View>
                                        <Typography variant="title3" style={{ marginTop: spacing[2] }}>{val} <Typography variant="caption" color={colors.textDim}>cm</Typography></Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{field.label}</Typography>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                ) : (
                    <Card style={styles.emptyCard}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="body-outline" size={24} color={colors.primary} />
                        </View>
                        <Typography variant="body" style={{ marginTop: spacing[3] }}>No measurements logged</Typography>
                    </Card>
                )}

                {/* Add Measurements */}
                {showMeasurements ? (
                    <Card style={styles.measurementForm}>
                        <Typography variant="headline" style={{ marginBottom: spacing[4] }}>Log Measurements (cm)</Typography>
                        {MEASUREMENT_FIELDS.map((field, index) => {
                            const isLast = index === MEASUREMENT_FIELDS.length - 1;
                            return (
                                <View key={field.key} style={[styles.measurementInputRow, isLast && { borderBottomWidth: 0 }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                                        <Ionicons name={field.icon} size={16} color={colors.textSecondary} />
                                        <Typography variant="body" color={colors.text}>{field.label}</Typography>
                                    </View>
                                    <TextInput
                                        style={styles.measurementInput}
                                        value={measurements[field.key] || ''}
                                        onChangeText={(v) => setMeasurements(m => ({ ...m, [field.key]: v }))}
                                        placeholder="–"
                                        placeholderTextColor={colors.textDim}
                                        keyboardType="numeric"
                                    />
                                </View>
                            );
                        })}
                        <View style={styles.measurementBtns}>
                            <Button
                                title="Cancel"
                                variant="secondary"
                                onPress={() => { setShowMeasurements(false); setMeasurements({}); }}
                                style={{ flex: 1 }}
                            />
                            <Button
                                title="Save Measurements"
                                onPress={handleLogMeasurements}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </Card>
                ) : (
                    <Button
                        title="Update Measurements"
                        variant="secondary"
                        onPress={() => setShowMeasurements(true)}
                        style={{ marginTop: spacing[4] }}
                    />
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[12],
        paddingBottom: spacing[8],
    },

    header: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing[6],
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: spacing[4],
        paddingHorizontal: spacing[1],
    },

    // Trend
    trendCard: {
        marginBottom: spacing[4],
    },
    trendHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trendChangeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: radius.full,
    },

    // Log weight
    logCard: {
        padding: spacing[4],
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logInput: {
        flex: 1,
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.md,
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    logBtn: {
        width: 48,
        height: 48,
        borderRadius: radius.full,
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

    // History
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[4],
        paddingHorizontal: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },

    // Measurements
    measurementCard: {
        padding: spacing[2],
    },
    measurementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    measurementItem: {
        width: '33.33%',
        alignItems: 'center',
        padding: spacing[4],
    },
    measurementIconBox: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Measurement form
    measurementForm: {
        marginTop: spacing[4],
        padding: spacing[5],
    },
    measurementInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    measurementInput: {
        width: 80,
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.sm,
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[3],
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    measurementBtns: {
        flexDirection: 'row',
        gap: spacing[3],
        marginTop: spacing[6],
    },

    // Empty
    emptyCard: {
        padding: spacing[8],
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconBox: {
        width: 56,
        height: 56,
        borderRadius: radius.full,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProgressScreen;
