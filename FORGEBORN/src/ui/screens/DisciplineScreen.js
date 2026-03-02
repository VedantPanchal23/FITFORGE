/**
 * FORGEBORN — DISCIPLINE SCREEN
 * 
 * Daily habit checklist with streaks, XP system, and week heatmap.
 * Inspired by: Streaks (visual streaks), Habitica (XP/levels)
 * 
 * Features:
 * - XP bar + level display
 * - Per-habit checkboxes with streak counters
 * - Weekly heatmap
 * - Custom habit creation
 * - Category grouping
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Vibration,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useHabitStore from '../../store/habitStore';
import useCommitmentStore from '../../store/commitmentStore';
import useObligationStore from '../../store/obligationStore';

const CATEGORY_COLORS = {
    DISCIPLINE: '#FF6B6B',
    MIND: '#A78BFA',
    HEALTH: '#4ECDC4',
    FITNESS: '#FFAA33',
    LOOKMAXX: '#FF69B4',
    CUSTOM: colors.primary,
};

const DisciplineScreen = () => {
    const habits = useHabitStore((s) => s.habits);
    const toggleHabit = useHabitStore((s) => s.toggleHabit);
    const isHabitDone = useHabitStore((s) => s.isHabitDone);
    const getHabitStreak = useHabitStore((s) => s.getHabitStreak);
    const getTodaysStatus = useHabitStore((s) => s.getTodaysStatus);
    const getWeekHeatmap = useHabitStore((s) => s.getWeekHeatmap);
    const getXPProgress = useHabitStore((s) => s.getXPProgress);
    const addCustomHabit = useHabitStore((s) => s.addCustomHabit);
    const removeCustomHabit = useHabitStore((s) => s.removeCustomHabit);

    const obligations = useObligationStore((s) => s.obligations);
    const debtUnits = useCommitmentStore((s) => s.debtUnits);

    const [showAddHabit, setShowAddHabit] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const todayStatus = getTodaysStatus();
    const weekHeatmap = getWeekHeatmap();
    const xpProgress = getXPProgress();

    const handleToggle = useCallback((habitId) => {
        toggleHabit(habitId);
        Vibration.vibrate(50);
        setRefreshKey(k => k + 1);
    }, []);

    const handleAddHabit = () => {
        if (newHabitName.trim().length === 0) return;
        addCustomHabit(newHabitName.trim());
        setNewHabitName('');
        setShowAddHabit(false);
        setRefreshKey(k => k + 1);
    };

    const handleRemoveHabit = (habitId) => {
        Alert.alert('REMOVE HABIT', 'Delete this custom habit?', [
            { text: 'KEEP', style: 'cancel' },
            {
                text: 'DELETE', style: 'destructive',
                onPress: () => {
                    removeCustomHabit(habitId);
                    setRefreshKey(k => k + 1);
                },
            },
        ]);
    };

    // Group habits by category
    const categories = {};
    habits.forEach(h => {
        const cat = h.category || 'CUSTOM';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(h);
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={styles.title}>DISCIPLINE</Text>
                <Text style={styles.subtitle}>BUILD THE MACHINE. DAILY.</Text>

                {/* XP + Level */}
                <View style={styles.xpCard}>
                    <View style={styles.xpHeader}>
                        <View>
                            <Text style={styles.levelText}>LVL {xpProgress.level}</Text>
                            <Text style={styles.xpText}>
                                {xpProgress.xpInCurrentLevel} / {100} XP
                            </Text>
                        </View>
                        <View style={styles.xpTotal}>
                            <Text style={styles.xpTotalNum}>{xpProgress.totalXP}</Text>
                            <Text style={styles.xpTotalLabel}>TOTAL XP</Text>
                        </View>
                    </View>
                    <View style={styles.xpBarBg}>
                        <View style={[styles.xpBarFill, { width: `${xpProgress.progress * 100}%` }]} />
                    </View>
                </View>

                {/* Today's Progress */}
                <View style={styles.progressCard}>
                    <View style={styles.progressLeft}>
                        <Text style={styles.progressNum}>
                            {todayStatus.completed}/{todayStatus.total}
                        </Text>
                        <Text style={styles.progressLabel}>COMPLETED</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, {
                            width: `${todayStatus.progress * 100}%`,
                            backgroundColor: todayStatus.isPerfect ? colors.success : colors.primary,
                        }]} />
                    </View>
                    {todayStatus.isPerfect && (
                        <Text style={styles.perfectBadge}>⭐ PERFECT DAY</Text>
                    )}
                </View>

                {/* Week Heatmap */}
                <Text style={styles.sectionLabel}>THIS WEEK</Text>
                <View style={styles.heatmapCard}>
                    {weekHeatmap.map((day, i) => {
                        const isToday = i === 6;
                        const intensity = day.progress;
                        return (
                            <View key={day.date} style={styles.heatDay}>
                                <Text style={[styles.heatDayLabel, isToday && { color: colors.primary }]}>
                                    {day.day}
                                </Text>
                                <View style={[styles.heatBox, {
                                    backgroundColor: intensity === 0 ? colors.surface :
                                        intensity < 0.5 ? 'rgba(230, 169, 38, 0.3)' :
                                            intensity < 1 ? 'rgba(230, 169, 38, 0.6)' :
                                                colors.success,
                                    borderColor: isToday ? colors.primary : colors.border,
                                }]}>
                                    <Text style={styles.heatNum}>
                                        {day.completed}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Habit Categories */}
                {Object.entries(categories).map(([category, categoryHabits]) => (
                    <View key={category}>
                        <View style={styles.categoryHeader}>
                            <View style={[styles.categoryDot, {
                                backgroundColor: CATEGORY_COLORS[category] || colors.textDim,
                            }]} />
                            <Text style={styles.categoryName}>{category}</Text>
                            <Text style={styles.categoryCount}>
                                {categoryHabits.filter(h => isHabitDone(h.id)).length}/{categoryHabits.length}
                            </Text>
                        </View>

                        {categoryHabits.map((habit) => {
                            const done = isHabitDone(habit.id);
                            const streak = getHabitStreak(habit.id);

                            return (
                                <TouchableOpacity
                                    key={habit.id}
                                    style={[styles.habitRow, done && styles.habitRowDone]}
                                    onPress={() => handleToggle(habit.id)}
                                    onLongPress={() => habit.isCustom && handleRemoveHabit(habit.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.habitLeft}>
                                        <View style={[styles.checkbox, done && styles.checkboxDone]}>
                                            {done && <Ionicons name="checkmark" size={14} color="#000" />}
                                        </View>
                                        <Text style={styles.habitIcon}>{habit.icon}</Text>
                                        <View style={styles.habitInfo}>
                                            <Text style={[styles.habitName, done && styles.habitNameDone]}>
                                                {habit.name}
                                            </Text>
                                            <Text style={styles.habitXP}>+{habit.xpReward} XP</Text>
                                        </View>
                                    </View>
                                    <View style={styles.habitRight}>
                                        {streak.current > 0 && (
                                            <View style={styles.streakBadge}>
                                                <Text style={styles.streakText}>
                                                    🔥 {streak.current}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}

                {/* Add Custom Habit */}
                {showAddHabit ? (
                    <View style={styles.addHabitForm}>
                        <TextInput
                            style={styles.addHabitInput}
                            placeholder="HABIT NAME"
                            placeholderTextColor={colors.textDim}
                            value={newHabitName}
                            onChangeText={setNewHabitName}
                            autoFocus
                        />
                        <View style={styles.addHabitBtns}>
                            <TouchableOpacity
                                style={styles.addHabitCancel}
                                onPress={() => { setShowAddHabit(false); setNewHabitName(''); }}
                            >
                                <Text style={styles.addHabitCancelText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.addHabitSave}
                                onPress={handleAddHabit}
                            >
                                <Text style={styles.addHabitSaveText}>ADD</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addHabitBtn}
                        onPress={() => setShowAddHabit(true)}
                    >
                        <Ionicons name="add" size={18} color={colors.primary} />
                        <Text style={styles.addHabitBtnText}>ADD CUSTOM HABIT</Text>
                    </TouchableOpacity>
                )}

                {/* Obligations */}
                {obligations.length > 0 && (
                    <>
                        <Text style={[styles.sectionLabel, { marginTop: spacing[5] }]}>
                            ACTIVE OBLIGATIONS
                        </Text>
                        {obligations.filter(o => o.status === 'ACTIVE').map((ob) => (
                            <View key={ob.id} style={styles.obligationCard}>
                                <View style={styles.obligationLeft}>
                                    <Ionicons name="flash" size={16} color={colors.warning} />
                                    <View>
                                        <Text style={styles.obligationTitle}>{ob.title}</Text>
                                        <Text style={styles.obligationDue}>
                                            Due: {new Date(ob.deadline).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.statusBadge, {
                                    borderColor: ob.status === 'ACTIVE' ? colors.warning : colors.success,
                                }]}>
                                    <Text style={[styles.statusText, {
                                        color: ob.status === 'ACTIVE' ? colors.warning : colors.success,
                                    }]}>{ob.status}</Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Debt Warning */}
                {debtUnits > 0 && (
                    <View style={styles.debtCard}>
                        <Ionicons name="warning" size={20} color={colors.danger} />
                        <View style={styles.debtInfo}>
                            <Text style={styles.debtTitle}>DEBT UNITS: {debtUnits}</Text>
                            <Text style={styles.debtDesc}>
                                Complete your obligations to clear debt.
                            </Text>
                        </View>
                    </View>
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
    title: {
        ...textStyles.h1,
        color: colors.primary,
        fontSize: 28,
    },
    subtitle: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[4],
    },

    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[2],
    },

    // XP Card
    xpCard: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.primary,
        padding: spacing[3],
        marginBottom: spacing[3],
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[2],
    },
    levelText: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.primary,
    },
    xpText: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },
    xpTotal: {
        alignItems: 'center',
    },
    xpTotalNum: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.text,
    },
    xpTotalLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },
    xpBarBg: {
        height: 8,
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },

    // Progress
    progressCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[4],
    },
    progressLeft: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    progressNum: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.text,
    },
    progressLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
    perfectBadge: {
        ...textStyles.label,
        color: colors.success,
        textAlign: 'center',
        marginTop: spacing[2],
        fontSize: 12,
    },

    // Heatmap
    heatmapCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[4],
    },
    heatDay: {
        alignItems: 'center',
        flex: 1,
    },
    heatDayLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginBottom: spacing[1],
    },
    heatBox: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    heatNum: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text,
    },

    // Categories
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginTop: spacing[3],
        marginBottom: spacing[2],
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    categoryName: {
        ...textStyles.caption,
        color: colors.textDim,
        flex: 1,
    },
    categoryCount: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },

    // Habit row
    habitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
    },
    habitRowDone: {
        borderColor: colors.success,
        opacity: 0.8,
    },
    habitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        flex: 1,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: colors.textDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxDone: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    habitIcon: {
        fontSize: 18,
    },
    habitInfo: { flex: 1 },
    habitName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    habitNameDone: {
        textDecorationLine: 'line-through',
        color: colors.textDim,
    },
    habitXP: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 9,
    },
    habitRight: {},
    streakBadge: {
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
        paddingVertical: 2,
        paddingHorizontal: spacing[2],
    },
    streakText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FF6B6B',
    },

    // Add habit
    addHabitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        padding: spacing[3],
        marginTop: spacing[3],
        gap: spacing[2],
    },
    addHabitBtnText: {
        ...textStyles.caption,
        color: colors.primary,
        fontSize: 10,
    },
    addHabitForm: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: spacing[3],
        marginTop: spacing[3],
    },
    addHabitInput: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 13,
        padding: spacing[2],
        marginBottom: spacing[2],
    },
    addHabitBtns: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    addHabitCancel: {
        flex: 1,
        padding: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    addHabitCancelText: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    addHabitSave: {
        flex: 1,
        padding: spacing[2],
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    addHabitSaveText: {
        ...textStyles.button,
        color: '#000',
        fontSize: 11,
    },

    // Obligations
    obligationCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
    },
    obligationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        flex: 1,
    },
    obligationTitle: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    obligationDue: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
    statusBadge: {
        borderWidth: 1,
        paddingVertical: 2,
        paddingHorizontal: spacing[2],
    },
    statusText: {
        ...textStyles.caption,
        fontSize: 8,
    },

    // Debt
    debtCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 69, 69, 0.1)',
        borderWidth: 1,
        borderColor: colors.danger,
        padding: spacing[3],
        marginTop: spacing[4],
        gap: spacing[3],
    },
    debtInfo: { flex: 1 },
    debtTitle: {
        ...textStyles.label,
        color: colors.danger,
        fontSize: 12,
    },
    debtDesc: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
});

export default DisciplineScreen;
