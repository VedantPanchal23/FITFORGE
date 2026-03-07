/**
 * FORGEBORN — BADGE STORE
 * 
 * Achievement system with 25 badges across categories.
 * Checks unlock conditions against live store data.
 * Persisted with Zustand + AsyncStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── BADGE DEFINITIONS ──────────────────────────────────────────────────────────

export const BADGES = [
    // ── WORKOUT ──
    {
        id: 'first_workout',
        name: 'FIRST BLOOD',
        description: 'Complete your first workout',
        icon: 'barbell-outline',
        color: '#4ECDC4',
        category: 'WORKOUT',
        check: (data) => data.totalWorkouts >= 1,
    },
    {
        id: 'ten_workouts',
        name: 'IRON DISCIPLINE',
        description: 'Complete 10 workouts',
        icon: 'barbell',
        color: '#FF6B6B',
        category: 'WORKOUT',
        check: (data) => data.totalWorkouts >= 10,
    },
    {
        id: 'fifty_workouts',
        name: 'FORGED IN IRON',
        description: 'Complete 50 workouts',
        icon: 'trophy-outline',
        color: '#FFAA33',
        category: 'WORKOUT',
        check: (data) => data.totalWorkouts >= 50,
    },
    {
        id: 'hundred_workouts',
        name: 'CENTURION',
        description: 'Complete 100 workouts',
        icon: 'trophy',
        color: '#FFD700',
        category: 'WORKOUT',
        check: (data) => data.totalWorkouts >= 100,
    },
    {
        id: 'volume_1000',
        name: 'TONNAGE',
        description: 'Lift 1,000 kg total volume',
        icon: 'trending-up',
        color: '#A78BFA',
        category: 'WORKOUT',
        check: (data) => data.totalVolume >= 1000,
    },
    {
        id: 'volume_10000',
        name: 'HEAVY METAL',
        description: 'Lift 10,000 kg total volume',
        icon: 'rocket-outline',
        color: '#F97316',
        category: 'WORKOUT',
        check: (data) => data.totalVolume >= 10000,
    },
    {
        id: 'volume_100000',
        name: 'TITAN',
        description: 'Lift 100,000 kg total volume',
        icon: 'rocket',
        color: '#EF4444',
        category: 'WORKOUT',
        check: (data) => data.totalVolume >= 100000,
    },

    // ── STREAKS ──
    {
        id: 'streak_3',
        name: 'MOMENTUM',
        description: '3-day workout streak',
        icon: 'flame-outline',
        color: '#FB923C',
        category: 'STREAK',
        check: (data) => data.longestStreak >= 3,
    },
    {
        id: 'streak_7',
        name: 'UNSTOPPABLE',
        description: '7-day workout streak',
        icon: 'flame',
        color: '#F97316',
        category: 'STREAK',
        check: (data) => data.longestStreak >= 7,
    },
    {
        id: 'streak_30',
        name: 'MACHINE',
        description: '30-day workout streak',
        icon: 'flash',
        color: '#EF4444',
        category: 'STREAK',
        check: (data) => data.longestStreak >= 30,
    },
    {
        id: 'streak_100',
        name: 'LEGENDARY',
        description: '100-day workout streak',
        icon: 'shield',
        color: '#FFD700',
        category: 'STREAK',
        check: (data) => data.longestStreak >= 100,
    },

    // ── DISCIPLINE ──
    {
        id: 'habits_50',
        name: 'DISCIPLINED',
        description: 'Complete 50 habits',
        icon: 'checkmark-circle-outline',
        color: '#22C55E',
        category: 'DISCIPLINE',
        check: (data) => data.totalHabitsCompleted >= 50,
    },
    {
        id: 'habits_500',
        name: 'RUTHLESS',
        description: 'Complete 500 habits',
        icon: 'checkmark-done-circle',
        color: '#16A34A',
        category: 'DISCIPLINE',
        check: (data) => data.totalHabitsCompleted >= 500,
    },
    {
        id: 'perfect_day_1',
        name: 'PERFECT DAY',
        description: 'Complete all habits in a day',
        icon: 'star-outline',
        color: '#A78BFA',
        category: 'DISCIPLINE',
        check: (data) => data.perfectDays >= 1,
    },
    {
        id: 'perfect_days_10',
        name: 'FLAWLESS',
        description: '10 perfect days',
        icon: 'star',
        color: '#8B5CF6',
        category: 'DISCIPLINE',
        check: (data) => data.perfectDays >= 10,
    },
    {
        id: 'level_5',
        name: 'RISING',
        description: 'Reach habit level 5',
        icon: 'arrow-up-circle-outline',
        color: '#06B6D4',
        category: 'DISCIPLINE',
        check: (data) => data.habitLevel >= 5,
    },
    {
        id: 'level_10',
        name: 'ASCENDED',
        description: 'Reach habit level 10',
        icon: 'arrow-up-circle',
        color: '#0891B2',
        category: 'DISCIPLINE',
        check: (data) => data.habitLevel >= 10,
    },

    // ── NUTRITION ──
    {
        id: 'meals_10',
        name: 'FUELED',
        description: 'Log 10 meals',
        icon: 'nutrition-outline',
        color: '#84CC16',
        category: 'NUTRITION',
        check: (data) => data.totalMealsLogged >= 10,
    },
    {
        id: 'meals_100',
        name: 'NUTRITION MASTER',
        description: 'Log 100 meals',
        icon: 'nutrition',
        color: '#65A30D',
        category: 'NUTRITION',
        check: (data) => data.totalMealsLogged >= 100,
    },
    {
        id: 'water_streak',
        name: 'HYDRATED',
        description: 'Hit 8 glasses of water in a day',
        icon: 'water-outline',
        color: '#38BDF8',
        category: 'NUTRITION',
        check: (data) => data.maxWaterGlasses >= 8,
    },

    // ── COMMITMENT ──
    {
        id: 'commitment_7',
        name: 'COMMITTED',
        description: '7 days since taking the creed',
        icon: 'time-outline',
        color: '#94A3B8',
        category: 'COMMITMENT',
        check: (data) => data.daysSinceCommitment >= 7,
    },
    {
        id: 'commitment_30',
        name: 'DEVOTED',
        description: '30 days since taking the creed',
        icon: 'time',
        color: '#64748B',
        category: 'COMMITMENT',
        check: (data) => data.daysSinceCommitment >= 30,
    },
    {
        id: 'commitment_90',
        name: 'FORGEBORN',
        description: '90 days since taking the creed',
        icon: 'shield-checkmark',
        color: '#FFD700',
        category: 'COMMITMENT',
        check: (data) => data.daysSinceCommitment >= 90,
    },
    {
        id: 'commitment_365',
        name: 'IMMORTAL',
        description: '365 days since taking the creed',
        icon: 'diamond',
        color: '#C084FC',
        category: 'COMMITMENT',
        check: (data) => data.daysSinceCommitment >= 365,
    },

    // ── LOOKMAXX ──
    {
        id: 'skincare_start',
        name: 'GLOW UP',
        description: 'Complete AM & PM skincare routine',
        icon: 'sunny-outline',
        color: '#FBBF24',
        category: 'LOOKMAXX',
        check: (data) => data.skincareCompleted >= 1,
    },
];

// ─── STORE ──────────────────────────────────────────────────────────────────────

const useBadgeStore = create(
    persist(
        (set, get) => ({
            // Map of badge id → unlock timestamp
            unlockedBadges: {},
            // Badges unlocked in the latest check (for celebration)
            newlyUnlocked: [],

            // ─── Check Badges Against Current Data ───────────────────
            checkBadges: (data) => {
                const { unlockedBadges } = get();
                const newlyUnlocked = [];

                BADGES.forEach(badge => {
                    if (!unlockedBadges[badge.id] && badge.check(data)) {
                        newlyUnlocked.push(badge.id);
                    }
                });

                if (newlyUnlocked.length > 0) {
                    const now = Date.now();
                    const updated = { ...unlockedBadges };
                    newlyUnlocked.forEach(id => {
                        updated[id] = now;
                    });
                    set({ unlockedBadges: updated, newlyUnlocked });
                } else {
                    set({ newlyUnlocked: [] });
                }

                return newlyUnlocked;
            },

            // Clear newly unlocked (after showing celebration)
            clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),

            // Get all badges with unlock status
            getBadgesWithStatus: () => {
                const { unlockedBadges } = get();
                return BADGES.map(badge => ({
                    ...badge,
                    unlocked: !!unlockedBadges[badge.id],
                    unlockedAt: unlockedBadges[badge.id] || null,
                }));
            },

            // Get unlocked count
            getUnlockedCount: () => {
                return Object.keys(get().unlockedBadges).length;
            },

            // ─── DEV ONLY ────────────────────────────────────────────
            __devReset: () => set({ unlockedBadges: {}, newlyUnlocked: [] }),
        }),
        {
            name: 'forgeborn-badges',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useBadgeStore;
