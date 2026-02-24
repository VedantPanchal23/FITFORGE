import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as PFT from '../services/PFTBridge';

const { width } = Dimensions.get('window');

export default function WeeklyReviewScreen({ navigation }) {
    const { theme } = useTheme();
    const [weekData, setWeekData] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWeekData();
    }, []);

    const loadWeekData = async () => {
        try {
            const healthLogs = await PFT.getHealthLogs(7);
            const looksLogs = await PFT.getLooksLogs(7);
            const routineLogs = await PFT.getRoutineLogs(7);
            const dailyLogs = Object.values(await PFT.getDailyLogs());
            const profile = await PFT.getProfile();

            // Calculate weekly averages
            const avgSleep = average(healthLogs.map(l => l.sleep_hours || 0));
            const avgEnergy = average(healthLogs.map(l => l.energy_level || 0));
            const avgMood = average(healthLogs.map(l => l.mood || 0));
            const avgWater = average(healthLogs.map(l => l.water_glasses || 0));

            const skincareRate = healthLogs.length > 0
                ? (looksLogs.filter(l => l.morning_routine_done && l.evening_routine_done).length / looksLogs.length) * 100
                : 0;

            const workoutDays = dailyLogs.filter(l => l.workout_done).length;

            const avgDiscipline = average(routineLogs.map(l =>
                PFT.RoutineLog.calculateDisciplineScore(l)
            ));

            // Daily life scores
            const dailyScores = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const healthLog = healthLogs.find(l => l.date === dateStr);
                const looksLog = looksLogs.find(l => l.date === dateStr);
                const routineLog = routineLogs.find(l => l.date === dateStr);

                let score = 0;
                let factors = 0;

                if (healthLog) {
                    score += PFT.HealthLog.calculateHealthScore(healthLog) * 0.4;
                    factors += 0.4;
                }
                if (looksLog) {
                    score += PFT.LooksLog.calculateLooksScore(looksLog) * 0.2;
                    factors += 0.2;
                }
                if (routineLog) {
                    score += PFT.RoutineLog.calculateDisciplineScore(routineLog) * 0.4;
                    factors += 0.4;
                }

                dailyScores.push({
                    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
                    score: factors > 0 ? Math.round(score / factors) : 0
                });
            }

            setWeekData({
                avgSleep: avgSleep.toFixed(1),
                avgEnergy: avgEnergy.toFixed(1),
                avgMood: avgMood.toFixed(1),
                avgWater: avgWater.toFixed(1),
                skincareRate: Math.round(skincareRate),
                workoutDays,
                avgDiscipline: Math.round(avgDiscipline),
                dailyScores,
                overallScore: Math.round(average(dailyScores.map(d => d.score)))
            });

            // Get insights
            const allLogs = { healthLogs, looksLogs, routineLogs, dailyLogs, profile };
            const ins = PFT.InsightsEngine.generateInsights(allLogs);
            setInsights(ins);

        } catch (error) {
            console.log('Weekly review error:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ label, value, unit, icon, color, trend }) => (
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <Feather name={icon} size={18} color={color} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}{unit}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
            {trend && (
                <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? theme.success + '20' : theme.error + '20' }]}>
                    <Feather name={trend > 0 ? 'trending-up' : 'trending-down'} size={12} color={trend > 0 ? theme.success : theme.error} />
                </View>
            )}
        </View>
    );

    const DomainProgress = ({ domain, label, value, color }) => (
        <View style={styles.domainRow}>
            <View style={styles.domainHeader}>
                <Text style={[styles.domainLabel, { color: theme.text }]}>{label}</Text>
                <Text style={[styles.domainValue, { color }]}>{value}%</Text>
            </View>
            <View style={[styles.domainBar, { backgroundColor: theme.cardBorder }]}>
                <View style={[styles.domainFill, { width: `${value}%`, backgroundColor: color }]} />
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading your week...</Text>
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
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={[styles.title, { color: theme.text }]}>WEEKLY REVIEW</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Last 7 days</Text>
                    </View>
                </View>

                {/* Overall Score */}
                <View style={[styles.scoreCard, { backgroundColor: theme.primary }]}>
                    <View>
                        <Text style={styles.scoreLabel}>WEEK SCORE</Text>
                        <Text style={styles.scoreValue}>{weekData?.overallScore || 0}</Text>
                    </View>

                    {/* Mini chart */}
                    <View style={styles.chartContainer}>
                        {weekData?.dailyScores?.map((day, i) => (
                            <View key={i} style={styles.chartBar}>
                                <View style={[styles.chartFill, { height: `${day.score}%` }]} />
                                <Text style={styles.chartLabel}>{day.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard label="Avg Sleep" value={weekData?.avgSleep} unit="h" icon="moon" color={theme.info} />
                    <StatCard label="Avg Energy" value={weekData?.avgEnergy} unit="/10" icon="zap" color={theme.warning} />
                    <StatCard label="Workouts" value={weekData?.workoutDays} unit="/7" icon="activity" color={theme.success} />
                    <StatCard label="Skincare" value={weekData?.skincareRate} unit="%" icon="droplet" color={theme.accent} />
                </View>

                {/* Domain Progress */}
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Domain Progress</Text>
                    <DomainProgress label="Body" value={weekData?.workoutDays > 3 ? 80 : weekData?.workoutDays * 20} color={theme.error} />
                    <DomainProgress label="Health" value={Math.round(weekData?.avgEnergy * 10) || 0} color={theme.info} />
                    <DomainProgress label="Looks" value={weekData?.skincareRate} color={theme.accent} />
                    <DomainProgress label="Routine" value={weekData?.avgDiscipline} color={theme.warning} />
                </View>

                {/* Insights */}
                <View style={styles.insightsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Insights</Text>
                    {insights.length > 0 ? insights.slice(0, 4).map((insight, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.insightCard,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: theme.cardBorder,
                                    borderLeftColor: insight.type === 'positive' ? theme.success :
                                        insight.type === 'warning' ? theme.warning : theme.info
                                }
                            ]}
                        >
                            <Feather
                                name={insight.type === 'positive' ? 'check-circle' : insight.type === 'warning' ? 'alert-circle' : 'info'}
                                size={18}
                                color={insight.type === 'positive' ? theme.success : insight.type === 'warning' ? theme.warning : theme.info}
                            />
                            <View style={styles.insightContent}>
                                <Text style={[styles.insightText, { color: theme.text }]}>{insight.insight}</Text>
                                <Text style={[styles.insightDomain, { color: theme.textTertiary }]}>{insight.domain}</Text>
                            </View>
                        </View>
                    )) : (
                        <View style={[styles.emptyInsights, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <Feather name="info" size={24} color={theme.textTertiary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Log more data to see personalized insights!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Focus Areas */}
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Focus for Next Week</Text>
                    {[
                        weekData?.avgSleep < 7 && { icon: 'moon', text: 'Improve sleep - aim for 7+ hours', color: theme.info },
                        weekData?.avgWater < 6 && { icon: 'droplet', text: 'Drink more water - target 8 glasses', color: theme.info },
                        weekData?.workoutDays < 3 && { icon: 'activity', text: 'More workouts - aim for 4 this week', color: theme.success },
                        weekData?.skincareRate < 50 && { icon: 'smile', text: 'Better skincare consistency', color: theme.accent }
                    ].filter(Boolean).slice(0, 3).map((focus, i) => (
                        <View key={i} style={styles.focusRow}>
                            <View style={[styles.focusIcon, { backgroundColor: focus.color + '20' }]}>
                                <Feather name={focus.icon} size={16} color={focus.color} />
                            </View>
                            <Text style={[styles.focusText, { color: theme.text }]}>{focus.text}</Text>
                        </View>
                    ))}

                    {!weekData?.avgSleep && (
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            Complete this week's check-ins to get personalized focus areas.
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.navigate('GoalManager')}
                    >
                        <Feather name="flag" size={20} color="#FFF" />
                        <Text style={styles.actionText}>Set New Goals</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.monthlyBtn, { backgroundColor: theme.card, borderColor: theme.primary }]}
                        onPress={() => navigation.navigate('MonthlyReview')}
                    >
                        <Feather name="calendar" size={20} color={theme.primary} />
                        <Text style={[styles.monthlyBtnText, { color: theme.primary }]}>View Monthly Review</Text>
                    </TouchableOpacity>
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
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '700', letterSpacing: 1 },
    subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    scoreCard: { borderRadius: radius.lg, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    scoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    scoreValue: { color: '#FFF', fontSize: 56, fontWeight: '700', marginTop: -8 },
    chartContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 60 },
    chartBar: { alignItems: 'center', width: 20 },
    chartFill: { width: 12, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 3, minHeight: 4 },
    chartLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    statCard: { width: (width - 52) / 2, borderRadius: radius.lg, borderWidth: 1, padding: 16, position: 'relative' },
    statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 24, fontWeight: '700' },
    statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    trendBadge: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    section: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
    domainRow: { marginBottom: 16 },
    domainHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    domainLabel: { fontSize: 14, fontWeight: '500' },
    domainValue: { fontSize: 14, fontWeight: '700' },
    domainBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
    domainFill: { height: '100%', borderRadius: 4 },
    insightsSection: { marginBottom: 20 },
    insightCard: { flexDirection: 'row', padding: 14, borderRadius: radius.md, borderWidth: 1, borderLeftWidth: 3, marginBottom: 10, gap: 12 },
    insightContent: { flex: 1 },
    insightText: { fontSize: 13, lineHeight: 18 },
    insightDomain: { fontSize: 11, marginTop: 4, textTransform: 'uppercase' },
    emptyInsights: { borderRadius: radius.md, borderWidth: 1, padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 13, textAlign: 'center', marginTop: 8 },
    focusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    focusIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    focusText: { flex: 1, fontSize: 13 },
    actionButtons: { gap: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: radius.lg, gap: 8 },
    actionText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    monthlyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: radius.lg, gap: 8, borderWidth: 2 },
    monthlyBtnText: { fontSize: 16, fontWeight: '600' }
});
