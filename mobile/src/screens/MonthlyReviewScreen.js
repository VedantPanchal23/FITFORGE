import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryArea, VictoryScatter } from 'victory-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as DatabaseService from '../services/DatabaseService';
import * as PFT from '../services/PFTBridge';

const { width } = Dimensions.get('window');

export default function MonthlyReviewScreen({ navigation }) {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [monthData, setMonthData] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    useEffect(() => {
        loadMonthData();
    }, [selectedMonth]);

    const loadMonthData = async () => {
        setLoading(true);
        try {
            const year = selectedMonth.getFullYear();
            const month = selectedMonth.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;

            // Get all logs for the month
            const healthLogs = await DatabaseService.getHealthLogRange(startDate, endDate);
            const looksLogs = await DatabaseService.getLooksLogs(31);
            const routineLogs = await DatabaseService.getRoutineLogs(31);

            // Calculate daily scores
            const dailyScores = [];
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const healthLog = healthLogs.find(l => l.date === dateStr);

                let score = 0;
                if (healthLog) {
                    score = PFT.HealthLog.calculateHealthScore(healthLog);
                }

                dailyScores.push({ x: day, y: score });
            }

            // Calculate stats
            const avgSleep = average(healthLogs.map(l => l.sleep_hours || 0));
            const avgEnergy = average(healthLogs.map(l => l.energy_level || 0));
            const avgMood = average(healthLogs.map(l => l.mood || 0));
            const workoutDays = healthLogs.filter(l => l.workout_done).length;
            const skincareRate = looksLogs.filter(l => l.morning_routine_done && l.evening_routine_done).length / Math.max(looksLogs.length, 1) * 100;

            // Monthly trends (week by week)
            const weeklyTrends = [];
            for (let week = 0; week < 4; week++) {
                const weekStart = week * 7 + 1;
                const weekEnd = Math.min(weekStart + 6, daysInMonth);
                const weekScores = dailyScores.slice(weekStart - 1, weekEnd);
                const avgScore = average(weekScores.map(s => s.y));
                weeklyTrends.push({ x: `W${week + 1}`, y: avgScore });
            }

            // Best/Worst days
            const sortedDays = [...dailyScores].filter(d => d.y > 0).sort((a, b) => b.y - a.y);
            const bestDay = sortedDays[0];
            const worstDay = sortedDays[sortedDays.length - 1];

            setMonthData({
                dailyScores,
                weeklyTrends,
                avgSleep: avgSleep.toFixed(1),
                avgEnergy: avgEnergy.toFixed(1),
                avgMood: avgMood.toFixed(1),
                workoutDays,
                skincareRate: Math.round(skincareRate),
                totalDaysLogged: healthLogs.length,
                bestDay,
                worstDay,
                overallScore: Math.round(average(dailyScores.filter(d => d.y > 0).map(d => d.y)))
            });
        } catch (error) {
            console.log('Monthly review error:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (delta) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedMonth(newDate);
    };

    const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const StatCard = ({ icon, value, label, color }) => (
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Feather name={icon} size={20} color={color || theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>MONTHLY REVIEW</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}>
                        <Feather name="chevron-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.monthName, { color: theme.text }]}>{monthName}</Text>
                    <TouchableOpacity onPress={() => changeMonth(1)}>
                        <Feather name="chevron-right" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Overall Score */}
                <View style={[styles.scoreCard, { backgroundColor: theme.primary }]}>
                    <Text style={styles.scoreLabel}>MONTH SCORE</Text>
                    <Text style={styles.scoreValue}>{monthData?.overallScore || 0}</Text>
                    <Text style={styles.scoreSub}>{monthData?.totalDaysLogged || 0} days logged</Text>
                </View>

                {/* Daily Score Chart */}
                <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.chartTitle, { color: theme.text }]}>Daily Scores</Text>
                    {monthData?.dailyScores && (
                        <VictoryChart
                            width={width - 56}
                            height={180}
                            padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
                        >
                            <VictoryAxis
                                tickValues={[1, 8, 15, 22, 29]}
                                style={{
                                    axis: { stroke: theme.cardBorder },
                                    tickLabels: { fill: theme.textSecondary, fontSize: 10 }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                domain={[0, 100]}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    tickLabels: { fill: theme.textSecondary, fontSize: 10 },
                                    grid: { stroke: theme.cardBorder, strokeDasharray: '3,3' }
                                }}
                            />
                            <VictoryArea
                                data={monthData.dailyScores}
                                style={{
                                    data: { fill: theme.primary + '30', stroke: theme.primary, strokeWidth: 2 }
                                }}
                                animate={{ duration: 500 }}
                            />
                        </VictoryChart>
                    )}
                </View>

                {/* Weekly Trends */}
                <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.chartTitle, { color: theme.text }]}>Weekly Progress</Text>
                    {monthData?.weeklyTrends && (
                        <VictoryChart
                            width={width - 56}
                            height={140}
                            padding={{ left: 40, right: 20, top: 20, bottom: 30 }}
                            domainPadding={{ x: 30 }}
                        >
                            <VictoryAxis
                                style={{
                                    axis: { stroke: theme.cardBorder },
                                    tickLabels: { fill: theme.textSecondary, fontSize: 11 }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                domain={[0, 100]}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    tickLabels: { fill: theme.textSecondary, fontSize: 10 }
                                }}
                            />
                            <VictoryBar
                                data={monthData.weeklyTrends}
                                style={{ data: { fill: theme.success } }}
                                cornerRadius={{ top: 4 }}
                                animate={{ duration: 400 }}
                            />
                        </VictoryChart>
                    )}
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard icon="moon" value={`${monthData?.avgSleep}h`} label="Avg Sleep" color="#60A5FA" />
                    <StatCard icon="zap" value={`${monthData?.avgEnergy}/10`} label="Avg Energy" color="#FBBF24" />
                    <StatCard icon="smile" value={`${monthData?.avgMood}/10`} label="Avg Mood" color="#A78BFA" />
                    <StatCard icon="activity" value={monthData?.workoutDays} label="Workouts" color="#4ECDC4" />
                </View>

                {/* Best/Worst Days */}
                <View style={[styles.highlightCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.highlightTitle, { color: theme.textSecondary }]}>HIGHLIGHTS</Text>
                    <View style={styles.highlightRow}>
                        <View style={styles.highlightItem}>
                            <Feather name="trending-up" size={16} color={theme.success} />
                            <Text style={[styles.highlightLabel, { color: theme.textSecondary }]}>Best Day</Text>
                            <Text style={[styles.highlightValue, { color: theme.text }]}>
                                Day {monthData?.bestDay?.x || '-'} ({monthData?.bestDay?.y || 0}%)
                            </Text>
                        </View>
                        <View style={[styles.highlightDivider, { backgroundColor: theme.cardBorder }]} />
                        <View style={styles.highlightItem}>
                            <Feather name="trending-down" size={16} color={theme.error} />
                            <Text style={[styles.highlightLabel, { color: theme.textSecondary }]}>Lowest Day</Text>
                            <Text style={[styles.highlightValue, { color: theme.text }]}>
                                Day {monthData?.worstDay?.x || '-'} ({monthData?.worstDay?.y || 0}%)
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Consistency */}
                <View style={[styles.consistencyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.highlightTitle, { color: theme.textSecondary }]}>CONSISTENCY</Text>
                    <View style={styles.consistencyRow}>
                        <View style={styles.consistencyItem}>
                            <Text style={[styles.consistencyValue, { color: theme.primary }]}>{monthData?.skincareRate}%</Text>
                            <Text style={[styles.consistencyLabel, { color: theme.textSecondary }]}>Skincare</Text>
                        </View>
                        <View style={styles.consistencyItem}>
                            <Text style={[styles.consistencyValue, { color: theme.success }]}>
                                {Math.round((monthData?.totalDaysLogged || 0) / 30 * 100)}%
                            </Text>
                            <Text style={[styles.consistencyLabel, { color: theme.textSecondary }]}>Logging</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.md, paddingBottom: 100 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { fontSize: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '700', letterSpacing: 1 },
    monthSelector: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 20 },
    monthName: { fontSize: 20, fontWeight: '600' },
    scoreCard: { borderRadius: radius.lg, padding: 24, alignItems: 'center', marginBottom: 20 },
    scoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    scoreValue: { color: '#FFF', fontSize: 64, fontWeight: '700', marginTop: -8 },
    scoreSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    chartCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 16 },
    chartTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
    statCard: { width: (width - 48) / 2 - 6, borderRadius: radius.md, borderWidth: 1, padding: 16, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '700', marginTop: 8 },
    statLabel: { fontSize: 11, marginTop: 4 },
    highlightCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 16 },
    highlightTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
    highlightRow: { flexDirection: 'row' },
    highlightItem: { flex: 1, alignItems: 'center' },
    highlightDivider: { width: 1, marginHorizontal: 12 },
    highlightLabel: { fontSize: 11, marginTop: 8 },
    highlightValue: { fontSize: 14, fontWeight: '600', marginTop: 4 },
    consistencyCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16 },
    consistencyRow: { flexDirection: 'row' },
    consistencyItem: { flex: 1, alignItems: 'center' },
    consistencyValue: { fontSize: 32, fontWeight: '700' },
    consistencyLabel: { fontSize: 12, marginTop: 4 }
});
