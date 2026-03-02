/**
 * FORGEBORN — NUTRITION STORE
 * 
 * Manages: daily meal logs, water intake, nutrition targets, history.
 * Inspired by: MacroFactor (daily adaptive), HealthifyMe (meal slots)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNutritionPlan } from '../engine/nutritionEngine';

const storage = createJSONStorage(() => AsyncStorage);

const getToday = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const useNutritionStore = create(
    persist(
        (set, get) => ({
            // Nutrition plan (generated from profile)
            nutritionPlan: null,

            // Daily logs: { [date]: { meals: [...], water: 0 } }
            dailyLogs: {},

            // History summary
            history: [], // [{ date, totalCalories, protein, carbs, fats, water, meals }]

            // ─── Generate Plan ────────────────────────────────────────
            generatePlan: (profile) => {
                const plan = generateNutritionPlan(profile);
                set({ nutritionPlan: plan });
                return plan;
            },

            // ─── Get Today's Log ──────────────────────────────────────
            getTodaysLog: () => {
                const { dailyLogs } = get();
                const today = getToday();
                return dailyLogs[today] || { meals: [], water: 0 };
            },

            // ─── Log Food ─────────────────────────────────────────────
            logFood: (food, mealType, quantity = 1) => {
                const { dailyLogs } = get();
                const today = getToday();
                const todayLog = dailyLogs[today] || { meals: [], water: 0 };

                const entry = {
                    id: Date.now().toString(),
                    foodId: food.id,
                    name: food.name,
                    mealType,
                    quantity,
                    calories: Math.round(food.calories * quantity),
                    protein: Math.round(food.protein * quantity * 10) / 10,
                    carbs: Math.round(food.carbs * quantity * 10) / 10,
                    fats: Math.round(food.fats * quantity * 10) / 10,
                    loggedAt: Date.now(),
                };

                set({
                    dailyLogs: {
                        ...dailyLogs,
                        [today]: {
                            ...todayLog,
                            meals: [...todayLog.meals, entry],
                        },
                    },
                });

                return entry;
            },

            // ─── Remove Food Entry ────────────────────────────────────
            removeFood: (entryId) => {
                const { dailyLogs } = get();
                const today = getToday();
                const todayLog = dailyLogs[today];
                if (!todayLog) return;

                set({
                    dailyLogs: {
                        ...dailyLogs,
                        [today]: {
                            ...todayLog,
                            meals: todayLog.meals.filter(m => m.id !== entryId),
                        },
                    },
                });
            },

            // ─── Add Water ────────────────────────────────────────────
            addWater: (glasses = 1) => {
                const { dailyLogs } = get();
                const today = getToday();
                const todayLog = dailyLogs[today] || { meals: [], water: 0 };

                set({
                    dailyLogs: {
                        ...dailyLogs,
                        [today]: {
                            ...todayLog,
                            water: todayLog.water + glasses,
                        },
                    },
                });
            },

            // ─── Get Today's Totals ───────────────────────────────────
            getTodaysTotals: () => {
                const { dailyLogs } = get();
                const today = getToday();
                const todayLog = dailyLogs[today] || { meals: [], water: 0 };

                const totals = todayLog.meals.reduce((acc, meal) => ({
                    calories: acc.calories + meal.calories,
                    protein: acc.protein + meal.protein,
                    carbs: acc.carbs + meal.carbs,
                    fats: acc.fats + meal.fats,
                }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

                return {
                    ...totals,
                    protein: Math.round(totals.protein),
                    carbs: Math.round(totals.carbs),
                    fats: Math.round(totals.fats),
                    water: todayLog.water,
                    mealsLogged: todayLog.meals.length,
                };
            },

            // ─── Get Meals by Type ────────────────────────────────────
            getMealsByType: (mealType) => {
                const { dailyLogs } = get();
                const today = getToday();
                const todayLog = dailyLogs[today] || { meals: [] };
                return todayLog.meals.filter(m => m.mealType === mealType);
            },

            // ─── Get Week Summary ─────────────────────────────────────
            getWeekSummary: () => {
                const { dailyLogs } = get();
                const dates = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    dates.push(date.toISOString().split('T')[0]);
                }

                return dates.map(date => {
                    const log = dailyLogs[date] || { meals: [], water: 0 };
                    const totals = log.meals.reduce((acc, meal) => ({
                        calories: acc.calories + meal.calories,
                        protein: acc.protein + meal.protein,
                    }), { calories: 0, protein: 0 });

                    return {
                        date,
                        day: new Date(date).toLocaleDateString('en', { weekday: 'short' }).toUpperCase(),
                        calories: totals.calories,
                        protein: Math.round(totals.protein),
                        water: log.water,
                        mealsLogged: log.meals.length,
                    };
                });
            },

            // ─── Clean Old Data ───────────────────────────────────────
            cleanOldLogs: () => {
                const { dailyLogs } = get();
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - 30); // Keep 30 days
                const cutoffStr = cutoff.toISOString().split('T')[0];

                const cleaned = {};
                Object.entries(dailyLogs).forEach(([date, log]) => {
                    if (date >= cutoffStr) cleaned[date] = log;
                });

                set({ dailyLogs: cleaned });
            },

            // ─── DEV ONLY ────────────────────────────────────────────
            __devReset: () => {
                set({
                    nutritionPlan: null,
                    dailyLogs: {},
                    history: [],
                });
            },
        }),
        {
            name: 'forgeborn-nutrition',
            storage,
        }
    )
);

export default useNutritionStore;
