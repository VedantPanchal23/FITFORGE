import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Card, Typography } from '../components';
import useWorkoutStore from '../../store/workoutStore';

const WorkoutLogScreen = ({ navigation }) => {
    const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
    const personalRecords = useWorkoutStore((s) => s.personalRecords);
    const totalWorkoutsCompleted = useWorkoutStore((s) => s.totalWorkoutsCompleted || 0);
    const currentStreak = useWorkoutStore((s) => s.currentStreak || 0);
    const longestStreak = useWorkoutStore((s) => s.longestStreak || 0);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

    const handleMonthChange = (direction) => {
        if (direction === -1) {
            if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(y => y - 1);
            } else {
                setSelectedMonth(m => m - 1);
            }
        } else {
            if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(y => y + 1);
            } else {
                setSelectedMonth(m => m + 1);
            }
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: spacing[4] }}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Typography variant="largeTitle">Workout Log</Typography>
                </View>

                {/* All-Time Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Typography variant="caption" color={colors.textSecondary}>Total</Typography>
                        <Typography variant="title1" style={{ marginTop: spacing[1] }}>{totalWorkoutsCompleted}</Typography>
                    </View>
                    <View style={[styles.statBox, styles.statBoxCenter]}>
                        <Typography variant="caption" color={colors.textSecondary}>Streak</Typography>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[1] }}>
                            <Ionicons name="flame" size={18} color={colors.primary} style={{ marginRight: 4 }} />
                            <Typography variant="title1">{currentStreak}</Typography>
                        </View>
                    </View>
                    <View style={styles.statBox}>
                        <Typography variant="caption" color={colors.textSecondary}>Best</Typography>
                        <Typography variant="title1" style={{ marginTop: spacing[1] }}>{longestStreak}</Typography>
                    </View>
                </View>

                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => handleMonthChange(-1)} style={{ padding: spacing[2] }}>
                        <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <Typography variant="title2">
                        {months[selectedMonth]} {selectedYear}
                    </Typography>
                    <TouchableOpacity onPress={() => handleMonthChange(1)} style={{ padding: spacing[2] }}>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Calendar Heatmap */}
                <Card style={styles.calendarCard}>
                    {/* Weekday headers */}
                    <View style={styles.weekRow}>
                        {weekDays.map((d, i) => (
                            <Typography key={i} variant="caption" color={colors.textDim} style={styles.weekDay}>{d}</Typography>
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
                                ]}
                            >
                                {item.day !== null && (
                                    <View style={[
                                        styles.calDayBox,
                                        item.hasWorkout && styles.calDayBoxActive,
                                        item.isToday && styles.calDayBoxToday,
                                    ]}>
                                        <Typography
                                            variant="caption"
                                            color={
                                                item.hasWorkout ? colors.textInverse :
                                                    item.isToday ? colors.primary : colors.textSecondary
                                            }
                                            weight={item.hasWorkout || item.isToday ? "bold" : "regular"}
                                        >
                                            {item.day}
                                        </Typography>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </Card>

                {/* Monthly Volume Stats */}
                <Typography variant="title2" style={styles.sectionLabel}>
                    {months[selectedMonth]} Stats
                </Typography>
                <View style={styles.volumeRow}>
                    <Card style={styles.volumeCard}>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing[1] }}>Workouts</Typography>
                        <Typography variant="headline">{monthStats.workouts}</Typography>
                    </Card>
                    <Card style={styles.volumeCard}>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing[1] }}>Sets</Typography>
                        <Typography variant="headline">{monthStats.sets}</Typography>
                    </Card>
                    <Card style={styles.volumeCard}>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing[1] }}>Volume (kg)</Typography>
                        <Typography variant="headline">
                            {monthStats.volume > 1000 ? `${(monthStats.volume / 1000).toFixed(1)}k` : monthStats.volume}
                        </Typography>
                    </Card>
                    <Card style={styles.volumeCard}>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing[1] }}>Avg. Min</Typography>
                        <Typography variant="headline">{monthStats.avgDuration}</Typography>
                    </Card>
                </View>

                {/* Recent Workouts */}
                <Typography variant="title2" style={styles.sectionLabel}>Recent Workouts</Typography>
                {workoutHistory.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="barbell-outline" size={32} color={colors.textDim} />
                        <Typography variant="headline" style={{ marginTop: spacing[3] }}>No workouts logged yet.</Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing[1] }}>
                            Complete your first workout to see history.
                        </Typography>
                    </Card>
                ) : (
                    workoutHistory.slice(0, 10).map((workout, i) => {
                        const exerciseCount = workout.exercises?.length || 0;
                        const setCount = workout.exercises?.reduce((sum, ex) =>
                            sum + (ex.sets?.filter(s => s.completed)?.length || 0), 0) || 0;
                        const durationMin = Math.round((workout.duration || 0) / 60);

                        return (
                            <Card key={i} style={styles.historyCard}>
                                <View style={styles.historyHeader}>
                                    <View>
                                        <Typography variant="headline">
                                            {workout.planName || 'Workout'}
                                        </Typography>
                                        <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2 }}>
                                            {workout.date}
                                        </Typography>
                                    </View>
                                    <Typography variant="subheadline" color={colors.primary}>{durationMin} min</Typography>
                                </View>
                                <View style={styles.historyStats}>
                                    <Typography variant="caption" color={colors.textSecondary}>
                                        {exerciseCount} exercises • {setCount} sets
                                    </Typography>
                                </View>
                            </Card>
                        );
                    })
                )}

                {/* Personal Records */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[6], marginBottom: spacing[4] }}>
                    <Ionicons name="trophy-outline" size={20} color={colors.text} />
                    <Typography variant="title2">Personal Records</Typography>
                </View>

                {prList.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="trophy-outline" size={32} color={colors.textDim} />
                        <Typography variant="headline" style={{ marginTop: spacing[3] }}>No PRs yet.</Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing[1] }}>
                            Hit new maxes to see them here.
                        </Typography>
                    </Card>
                ) : (
                    prList.map((pr, i) => (
                        <Card key={i} style={styles.prCard}>
                            <View style={styles.prLeft}>
                                <Typography variant="headline">{pr.exercise}</Typography>
                                <Typography variant="caption" color={colors.textDim} style={{ marginTop: 2 }}>
                                    {pr.date || 'Unknown'}
                                </Typography>
                            </View>
                            <View style={styles.prRight}>
                                <Typography variant="title2" color={colors.primary}>{pr.weight || 0} kg</Typography>
                                <Typography variant="subheadline" color={colors.textDim} style={{ marginLeft: spacing[1] }}>× {pr.reps || 0}</Typography>
                            </View>
                        </Card>
                    ))
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
    scrollContent: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[12],
        paddingBottom: spacing[8],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    sectionLabel: {
        marginTop: spacing[8],
        marginBottom: spacing[4],
    },
    statsGrid: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing[4],
        marginBottom: spacing[6],
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...colors.shadows?.sm,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBoxCenter: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.borderLight,
        paddingHorizontal: spacing[2],
    },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    calendarCard: {
        padding: spacing[4],
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: spacing[2],
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
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
        padding: 2,
    },
    calCellEmpty: {},
    calDayBox: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.sm,
    },
    calDayBoxActive: {
        backgroundColor: colors.primary,
        ...colors.shadows?.sm,
    },
    calDayBoxToday: {
        borderWidth: 1,
        borderColor: colors.primary,
    },
    volumeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    volumeCard: {
        width: '48%',
        alignItems: 'center',
        padding: spacing[4],
    },
    historyCard: {
        marginBottom: spacing[3],
        padding: spacing[4],
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    historyStats: {
        flexDirection: 'row',
        marginTop: spacing[3],
    },
    emptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[8],
    },
    prCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[3],
        padding: spacing[4],
    },
    prLeft: { flex: 1 },
    prRight: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
});

export default WorkoutLogScreen;
