/**
 * HabitHeatmap Component
 * GitHub-style contribution graph for habit tracking
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius } from '../theme';

const { width } = Dimensions.get('window');
const CELL_SIZE = 12;
const CELL_GAP = 2;
const WEEKS_TO_SHOW = 16; // ~4 months

/**
 * Get color intensity based on completion level
 */
function getHeatColor(level, color) {
    if (level === 0) return 'transparent';
    const opacity = Math.min(0.2 + level * 0.2, 1);
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}

/**
 * HabitHeatmap - displays a GitHub-style contribution grid
 * @param {string} habitId - unique habit identifier
 * @param {string} title - habit name
 * @param {string} color - primary color for the heatmap
 * @param {Array} data - array of { date: 'YYYY-MM-DD', value: 0-5 }
 */
export function HabitHeatmap({ habitId, title, color = '#4ECDC4', data = [], onCellPress }) {
    const { theme } = useTheme();

    // Generate grid data for weeks
    const generateGridData = () => {
        const grid = [];
        const today = new Date();

        for (let week = WEEKS_TO_SHOW - 1; week >= 0; week--) {
            const weekData = [];
            for (let day = 0; day < 7; day++) {
                const date = new Date(today);
                date.setDate(today.getDate() - (week * 7 + (6 - day)));
                const dateStr = date.toISOString().split('T')[0];

                const entry = data.find(d => d.date === dateStr);
                weekData.push({
                    date: dateStr,
                    value: entry?.value || 0,
                    dayOfWeek: date.getDay()
                });
            }
            grid.push(weekData);
        }
        return grid;
    };

    const gridData = generateGridData();
    const totalCompletions = data.reduce((sum, d) => sum + (d.value > 0 ? 1 : 0), 0);
    const currentStreak = calculateStreak(data);

    return (
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                <View style={styles.stats}>
                    <Text style={[styles.streak, { color: color }]}>{currentStreak} 🔥</Text>
                </View>
            </View>

            {/* Day labels */}
            <View style={styles.dayLabels}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <Text key={i} style={[styles.dayLabel, { color: theme.textTertiary }]}>{day}</Text>
                ))}
            </View>

            {/* Heatmap Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.grid}>
                    {gridData.map((week, weekIndex) => (
                        <View key={weekIndex} style={styles.week}>
                            {week.map((cell, dayIndex) => (
                                <TouchableOpacity
                                    key={`${weekIndex}-${dayIndex}`}
                                    style={[
                                        styles.cell,
                                        {
                                            backgroundColor: cell.value > 0
                                                ? getHeatColor(cell.value, color)
                                                : theme.cardBorder
                                        }
                                    ]}
                                    onPress={() => onCellPress?.(cell)}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={[styles.legendLabel, { color: theme.textTertiary }]}>Less</Text>
                {[0, 1, 2, 3, 4].map(level => (
                    <View
                        key={level}
                        style={[
                            styles.legendCell,
                            { backgroundColor: level === 0 ? theme.cardBorder : getHeatColor(level, color) }
                        ]}
                    />
                ))}
                <Text style={[styles.legendLabel, { color: theme.textTertiary }]}>More</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <Text style={[styles.statText, { color: theme.textSecondary }]}>
                    {totalCompletions} completions in {WEEKS_TO_SHOW} weeks
                </Text>
            </View>
        </View>
    );
}

/**
 * Calculate current streak from data
 */
function calculateStreak(data) {
    if (!data || data.length === 0) return 0;

    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sortedData) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

        if (daysDiff > 1) break; // Gap in streak
        if (entry.value > 0) {
            streak++;
            currentDate = entryDate;
            currentDate.setDate(currentDate.getDate() - 1);
        }
    }

    return streak;
}

/**
 * MultiHabitHeatmaps - displays multiple habit heatmaps
 */
export function MultiHabitHeatmaps({ habits = [], onCellPress }) {
    const { theme } = useTheme();

    if (habits.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No habits tracked yet. Start tracking to see your progress!
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.multiContainer}>
            {habits.map(habit => (
                <HabitHeatmap
                    key={habit.id}
                    habitId={habit.id}
                    title={habit.name}
                    color={habit.color}
                    data={habit.data}
                    onCellPress={onCellPress}
                />
            ))}
        </View>
    );
}

/**
 * MiniHeatmap - compact version for dashboard
 */
export function MiniHeatmap({ data = [], color = '#4ECDC4', weeks = 4 }) {
    const { theme } = useTheme();

    const generateMiniGrid = () => {
        const grid = [];
        const today = new Date();

        for (let week = weeks - 1; week >= 0; week--) {
            const weekData = [];
            for (let day = 0; day < 7; day++) {
                const date = new Date(today);
                date.setDate(today.getDate() - (week * 7 + (6 - day)));
                const dateStr = date.toISOString().split('T')[0];

                const entry = data.find(d => d.date === dateStr);
                weekData.push({ value: entry?.value || 0 });
            }
            grid.push(weekData);
        }
        return grid;
    };

    const gridData = generateMiniGrid();

    return (
        <View style={styles.miniGrid}>
            {gridData.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.miniWeek}>
                    {week.map((cell, dayIndex) => (
                        <View
                            key={`${weekIndex}-${dayIndex}`}
                            style={[
                                styles.miniCell,
                                {
                                    backgroundColor: cell.value > 0
                                        ? getHeatColor(cell.value, color)
                                        : theme.cardBorder
                                }
                            ]}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    streak: {
        fontSize: 14,
        fontWeight: '700'
    },
    dayLabels: {
        flexDirection: 'column',
        marginRight: 4,
        position: 'absolute',
        left: 16,
        top: 48
    },
    dayLabel: {
        fontSize: 8,
        height: CELL_SIZE + CELL_GAP,
        lineHeight: CELL_SIZE + CELL_GAP
    },
    grid: {
        flexDirection: 'row',
        marginLeft: 16,
        paddingVertical: 4
    },
    week: {
        flexDirection: 'column',
        marginRight: CELL_GAP
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 2,
        marginBottom: CELL_GAP
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 8,
        gap: 4
    },
    legendCell: {
        width: 10,
        height: 10,
        borderRadius: 2
    },
    legendLabel: {
        fontSize: 9,
        marginHorizontal: 4
    },
    statsRow: {
        marginTop: 8,
        alignItems: 'center'
    },
    statText: {
        fontSize: 11
    },
    multiContainer: {
        gap: 12
    },
    emptyContainer: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center'
    },
    emptyText: {
        fontSize: 13,
        textAlign: 'center'
    },
    miniGrid: {
        flexDirection: 'row',
        gap: 2
    },
    miniWeek: {
        flexDirection: 'column',
        gap: 2
    },
    miniCell: {
        width: 8,
        height: 8,
        borderRadius: 1
    }
});

export default { HabitHeatmap, MultiHabitHeatmaps, MiniHeatmap };
