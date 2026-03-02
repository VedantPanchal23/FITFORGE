/**
 * FORGEBORN — HABIT STORE
 * 
 * Manages daily habits, streaks, XP system, and custom habits.
 * Inspired by: Streaks (per-habit streaks), Habitica (XP/level system)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);

const getToday = () => new Date().toISOString().split('T')[0];

// Default habits every operator should have
const DEFAULT_HABITS = [
    { id: 'h01', name: 'Cold Shower', icon: '🥶', category: 'DISCIPLINE', xpReward: 15 },
    { id: 'h02', name: 'Meditate 10 min', icon: '🧘', category: 'MIND', xpReward: 10 },
    { id: 'h03', name: 'No Social Media', icon: '📵', category: 'DISCIPLINE', xpReward: 20 },
    { id: 'h04', name: 'Read 20 Pages', icon: '📖', category: 'MIND', xpReward: 15 },
    { id: 'h05', name: 'Journal', icon: '✍️', category: 'MIND', xpReward: 10 },
    { id: 'h06', name: 'Sleep by 10 PM', icon: '🌙', category: 'HEALTH', xpReward: 15 },
    { id: 'h07', name: 'No Junk Food', icon: '🚫', category: 'HEALTH', xpReward: 15 },
    { id: 'h08', name: 'Sunlight 15 min', icon: '☀️', category: 'HEALTH', xpReward: 10 },
    { id: 'h09', name: 'Walk 10,000 Steps', icon: '🚶', category: 'FITNESS', xpReward: 15 },
    { id: 'h10', name: 'No Fap', icon: '🔒', category: 'DISCIPLINE', xpReward: 25 },
    { id: 'h11', name: 'Gratitude (3 Things)', icon: '🙏', category: 'MIND', xpReward: 5 },
    { id: 'h12', name: 'Skin Care Routine', icon: '🧴', category: 'LOOKMAXX', xpReward: 10 },
];

const XP_PER_LEVEL = 100; // XP needed per level up

const useHabitStore = create(
    persist(
        (set, get) => ({
            // Habit definitions (default + custom)
            habits: DEFAULT_HABITS,

            // Daily completions: { [date]: { [habitId]: boolean } }
            dailyCompletions: {},

            // Streaks: { [habitId]: { current: 0, longest: 0, lastDate: null } }
            streaks: {},

            // XP & Level
            totalXP: 0,
            level: 1,

            // Stats
            totalHabitsCompleted: 0,
            perfectDays: 0, // Days where ALL habits were completed

            // ─── Toggle Habit ─────────────────────────────────────────
            toggleHabit: (habitId) => {
                const { dailyCompletions, streaks, totalXP, level, habits, totalHabitsCompleted, perfectDays } = get();
                const today = getToday();
                const todayLog = dailyCompletions[today] || {};
                const wasCompleted = todayLog[habitId] || false;
                const habit = habits.find(h => h.id === habitId);

                // Toggle
                const newTodayLog = { ...todayLog, [habitId]: !wasCompleted };

                // Update streak
                const currentStreak = streaks[habitId] || { current: 0, longest: 0, lastDate: null };
                let newStreak;

                if (!wasCompleted) {
                    // Completing
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    const isConsecutive = currentStreak.lastDate === yesterdayStr || currentStreak.lastDate === today;

                    const newCurrent = isConsecutive ? currentStreak.current + 1 : 1;
                    newStreak = {
                        current: newCurrent,
                        longest: Math.max(newCurrent, currentStreak.longest),
                        lastDate: today,
                    };
                } else {
                    // Uncompleting
                    newStreak = {
                        ...currentStreak,
                        current: Math.max(0, currentStreak.current - 1),
                    };
                }

                // XP
                const xpChange = !wasCompleted ? (habit?.xpReward || 10) : -(habit?.xpReward || 10);
                const newXP = Math.max(0, totalXP + xpChange);
                const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

                // Check perfect day
                const habitCount = habits.length;
                const completedCount = Object.values(newTodayLog).filter(Boolean).length;
                const wasPerfect = Object.values(todayLog).filter(Boolean).length === habitCount;
                const isPerfect = completedCount === habitCount;

                set({
                    dailyCompletions: {
                        ...dailyCompletions,
                        [today]: newTodayLog,
                    },
                    streaks: {
                        ...streaks,
                        [habitId]: newStreak,
                    },
                    totalXP: newXP,
                    level: newLevel,
                    totalHabitsCompleted: totalHabitsCompleted + (wasCompleted ? -1 : 1),
                    perfectDays: perfectDays + (isPerfect && !wasPerfect ? 1 : 0) - (!isPerfect && wasPerfect ? 1 : 0),
                });
            },

            // ─── Add Custom Habit ─────────────────────────────────────
            addCustomHabit: (name, icon = '⭐', category = 'CUSTOM') => {
                const { habits } = get();
                const newHabit = {
                    id: `custom_${Date.now()}`,
                    name,
                    icon,
                    category,
                    xpReward: 10,
                    isCustom: true,
                };
                set({ habits: [...habits, newHabit] });
                return newHabit;
            },

            // ─── Remove Custom Habit ──────────────────────────────────
            removeCustomHabit: (habitId) => {
                const { habits } = get();
                set({ habits: habits.filter(h => h.id !== habitId || !h.isCustom) });
            },

            // ─── Get Today's Status ───────────────────────────────────
            getTodaysStatus: () => {
                const { dailyCompletions, habits } = get();
                const today = getToday();
                const todayLog = dailyCompletions[today] || {};
                const completed = Object.values(todayLog).filter(Boolean).length;
                return {
                    completed,
                    total: habits.length,
                    progress: habits.length > 0 ? completed / habits.length : 0,
                    isPerfect: completed === habits.length,
                };
            },

            // ─── Is Habit Done Today ──────────────────────────────────
            isHabitDone: (habitId) => {
                const { dailyCompletions } = get();
                const today = getToday();
                return (dailyCompletions[today] || {})[habitId] || false;
            },

            // ─── Get Habit Streak ─────────────────────────────────────
            getHabitStreak: (habitId) => {
                const { streaks } = get();
                return streaks[habitId] || { current: 0, longest: 0 };
            },

            // ─── Get Week Heatmap ─────────────────────────────────────
            getWeekHeatmap: () => {
                const { dailyCompletions, habits } = get();
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const log = dailyCompletions[dateStr] || {};
                    const completed = Object.values(log).filter(Boolean).length;
                    days.push({
                        date: dateStr,
                        day: date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2).toUpperCase(),
                        completed,
                        total: habits.length,
                        progress: habits.length > 0 ? completed / habits.length : 0,
                    });
                }
                return days;
            },

            // ─── Get XP Progress ──────────────────────────────────────
            getXPProgress: () => {
                const { totalXP, level } = get();
                const xpInCurrentLevel = totalXP % XP_PER_LEVEL;
                return {
                    totalXP,
                    level,
                    xpInCurrentLevel,
                    xpToNextLevel: XP_PER_LEVEL - xpInCurrentLevel,
                    progress: xpInCurrentLevel / XP_PER_LEVEL,
                };
            },

            // ─── DEV ONLY ────────────────────────────────────────────
            __devReset: () => {
                set({
                    habits: DEFAULT_HABITS,
                    dailyCompletions: {},
                    streaks: {},
                    totalXP: 0,
                    level: 1,
                    totalHabitsCompleted: 0,
                    perfectDays: 0,
                });
            },
        }),
        {
            name: 'forgeborn-habits',
            storage,
        }
    )
);

export default useHabitStore;
