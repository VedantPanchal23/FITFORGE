/**
 * FORGEBORN — WORKOUT LOG SCREEN
 * 
 * Workout history with calendar heatmap, volume stats, and personal records.
 * Inspired by: Hevy (calendar heatmap), Strong (PR tracking)
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useWorkoutStore from '../../store/workoutStore';

const WorkoutLogScreen = ({ navigation }) => {
    const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
    const personalRecords = useWorkoutStore((s) => s.personalRecords);
    const totalWorkoutsCompleted = useWorkoutStore((s) => s.totalWorkoutsCompleted);
    const currentStreak = useWorkoutStore((s) => s.currentStreak);
    const longestStreak = useWorkoutStore((s) => s.longestStreak);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear] = useState(new Date().getFullYear());

    // Build calendar heatmap data for selected month
    const calendarData = useMemo(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const firstDay = new Date(selectedYear, selectedMonth, 1).getDay(); // 0=Sun
        const days = [];

        // Pad start
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const workout = workoutHistory.find(w => w.date?.startsWith(dateStr));
            days.push({
                day: d,
                date: dateStr,
                hasWorkout: !!workout,
                workout,
                isToday: dateStr === new Date().toISOString().split('T')[0],
            });
        }

        return days;
    }, [selectedMonth, selectedYear, workoutHistory]);

    // Volume stats for selected month
    const monthStats = useMemo(() => {
        const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const monthWorkouts = workoutHistory.filter(w => w.date?.startsWith(monthKey));

        let totalSets = 0;
        let totalVolume = 0; // weight × reps
        let totalDuration = 0;

        monthWorkouts.forEach(w => {
            totalDuration += w.duration || 0;
            totalVolume += w.totalVolume || 0;
            totalSets += w.setsCompleted || 0;
        });

        return {
            workouts: monthWorkouts.length,
            sets: totalSets,
            volume: totalVolume,
            avgDuration: monthWorkouts.length > 0
                ? Math.round(totalDuration / monthWorkouts.length / 60)
                : 0,
        };
    }, [selectedMonth, selectedYear, workoutHistory]);

    // PR list
    const prList = useMemo(() => {
        return Object.entries(personalRecords || {}).map(([exercise, data]) => ({
            exercise,
            ...data,
        })).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }, [personalRecords]);

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
                    <Text style={styles.title}>WORKOUT LOG</Text>
                </View>

                {/* All-Time Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{totalWorkoutsCompleted}</Text>
                        <Text style={styles.statLabel}>TOTAL</Text>
                    </View>
                    <View style={styles.statBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="flame" size={16} color={colors.primary} />
                            <Text style={styles.statVal}>{currentStreak}</Text>
                        </View>
                        <Text style={styles.statLabel}>STREAK</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{longestStreak}</Text>
                        <Text style={styles.statLabel}>BEST</Text>
                    </View>
                </View>

                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => setSelectedMonth(m => Math.max(0, m - 1))}>
                        <Ionicons name="chevron-back" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {months[selectedMonth]} {selectedYear}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedMonth(m => Math.min(11, m + 1))}>
                        <Ionicons name="chevron-forward" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Calendar Heatmap */}
                <View style={styles.calendarCard}>
                    {/* Weekday headers */}
                    <View style={styles.weekRow}>
                        {weekDays.map((d, i) => (
                            <Text key={i} style={styles.weekDay}>{d}</Text>
                        ))}
                    </View>

                    {/* Calendar grid */}
                    <View style={styles.calGrid}>
                        {calendarData.map((item, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.calCell,
                                    item.day === null && styles.calCellEmpty,
                                    item.hasWorkout && styles.calCellActive,
                                    item.isToday && styles.calCellToday,
                                ]}
                            >
                                {item.day !== null && (
                                    <Text style={[
                                        styles.calDay,
                                        item.hasWorkout && styles.calDayActive,
                                        item.isToday && styles.calDayToday,
                                    ]}>
                                        {item.day}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Monthly Volume Stats */}
                <Text style={styles.sectionLabel}>
                    {months[selectedMonth]} STATS
                </Text>
                <View style={styles.volumeRow}>
                    <View style={styles.volumeCard}>
                        <Text style={styles.volumeVal}>{monthStats.workouts}</Text>
                        <Text style={styles.volumeLabel}>WORKOUTS</Text>
                    </View>
                    <View style={styles.volumeCard}>
                        <Text style={styles.volumeVal}>{monthStats.sets}</Text>
                        <Text style={styles.volumeLabel}>TOTAL SETS</Text>
                    </View>
                    <View style={styles.volumeCard}>
                        <Text style={styles.volumeVal}>
                            {monthStats.volume > 1000
                                ? `${(monthStats.volume / 1000).toFixed(1)}k`
                                : monthStats.volume}
                        </Text>
                        <Text style={styles.volumeLabel}>VOLUME (KG)</Text>
                    </View>
                    <View style={styles.volumeCard}>
                        <Text style={styles.volumeVal}>{monthStats.avgDuration}</Text>
                        <Text style={styles.volumeLabel}>AVG MIN</Text>
                    </View>
                </View>

                {/* Recent Workouts */}
                <Text style={styles.sectionLabel}>RECENT WORKOUTS</Text>
                {workoutHistory.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="barbell-outline" size={28} color={colors.textDim} />
                        <Text style={styles.emptyText}>No workouts logged yet.</Text>
                        <Text style={styles.emptySubtext}>Complete your first workout to see history.</Text>
                    </View>
                ) : (
                    workoutHistory.slice(0, 10).map((workout, i) => {
                        const exerciseCount = workout.exercises?.length || 0;
                        const setCount = workout.exercises?.reduce((sum, ex) =>
                            sum + (ex.sets?.filter(s => s.completed)?.length || 0), 0) || 0;
                        const durationMin = Math.round((workout.duration || 0) / 60);

                        return (
                            <View key={i} style={styles.historyCard}>
                                <View style={styles.historyHeader}>
                                    <View>
                                        <Text style={styles.historyName}>
                                            {workout.planName || 'Workout'}
                                        </Text>
                                        <Text style={styles.historyDate}>{workout.date}</Text>
                                    </View>
                                    <Text style={styles.historyDuration}>{durationMin} min</Text>
                                </View>
                                <View style={styles.historyStats}>
                                    <Text style={styles.historyStatItem}>
                                        {exerciseCount} exercises
                                    </Text>
                                    <Text style={styles.historyStatDot}>•</Text>
                                    <Text style={styles.historyStatItem}>
                                        {setCount} sets
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                )}

                {/* Personal Records */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="trophy-outline" size={14} color={colors.textDim} />
                    <Text style={styles.sectionLabel}>PERSONAL RECORDS</Text>
                </View>
                {prList.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="trophy-outline" size={28} color={colors.textDim} />
                        <Text style={styles.emptyText}>No PRs yet.</Text>
                        <Text style={styles.emptySubtext}>Hit new maxes to see them here.</Text>
                    </View>
                ) : (
                    prList.map((pr, i) => (
                        <View key={i} style={styles.prCard}>
                            <View style={styles.prLeft}>
                                <Text style={styles.prExercise}>{pr.exercise}</Text>
                                <Text style={styles.prDate}>{pr.date || 'Unknown'}</Text>
                            </View>
                            <View style={styles.prRight}>
                                <Text style={styles.prWeight}>{pr.weight || 0} kg</Text>
                                <Text style={styles.prReps}>× {pr.reps || 0}</Text>
                            </View>
                        </View>
                    ))
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

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        marginBottom: spacing[4],
    },
    title: {
        ...textStyles.h1,
        color: colors.primary,
        fontSize: 24,
    },

    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[5],
        marginBottom: spacing[2],
    },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        alignItems: 'center',
    },
    statVal: {
        fontSize: 20,
        fontWeight: '900',
        color: colors.text,
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
        marginTop: 2,
    },

    // Month selector
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[2],
    },
    monthText: {
        ...textStyles.h3,
        color: colors.text,
        fontSize: 16,
    },

    // Calendar
    calendarCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: spacing[1],
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },
    calGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calCellEmpty: {},
    calCellActive: {
        backgroundColor: 'rgba(230, 169, 38, 0.2)',
    },
    calCellToday: {
        borderWidth: 1,
        borderColor: colors.primary,
    },
    calDay: {
        fontSize: 12,
        color: colors.textDim,
    },
    calDayActive: {
        color: colors.primary,
        fontWeight: '900',
    },
    calDayToday: {
        color: colors.text,
        fontWeight: '700',
    },

    // Volume
    volumeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    volumeCard: {
        width: '48%',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        alignItems: 'center',
    },
    volumeVal: {
        fontSize: 20,
        fontWeight: '900',
        color: colors.text,
    },
    volumeLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
        marginTop: 2,
    },

    // History
    historyCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    historyName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    historyDate: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
    historyDuration: {
        ...textStyles.label,
        color: colors.primary,
        fontSize: 12,
    },
    historyStats: {
        flexDirection: 'row',
        marginTop: spacing[1],
        gap: spacing[1],
    },
    historyStatItem: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
    },
    historyStatDot: {
        color: colors.textDim,
    },

    // Empty state
    emptyCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[5],
        alignItems: 'center',
    },
    emptyIcon: { fontSize: 28, marginBottom: spacing[2] },
    emptyText: {
        ...textStyles.label,
        color: colors.textDim,
        fontSize: 13,
    },
    emptySubtext: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 10,
        marginTop: 4,
    },

    // PRs
    prCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
    },
    prLeft: { flex: 1 },
    prExercise: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    prDate: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
    prRight: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing[1],
    },
    prWeight: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.primary,
    },
    prReps: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 11,
    },
});

export default WorkoutLogScreen;
