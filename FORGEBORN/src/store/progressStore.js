/**
 * FORGEBORN — PROGRESS STORE
 * 
 * Weight history, body measurements, and progress photo tracking.
 * Tracks trends and shows visual graphs.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);
const getToday = () => new Date().toISOString().split('T')[0];

const useProgressStore = create(
    persist(
        (set, get) => ({
            // Weight entries: [{ date, weight, note }]
            weightLog: [],

            // Measurements: [{ date, chest, waist, hips, arms, thighs, calves, shoulders, neck }]
            measurementLog: [],

            // Progress photos: [{ date, uri, note }]
            photoLog: [],

            // ─── Log Weight ───────────────────────────────────────────
            logWeight: (weight, note = '') => {
                const { weightLog } = get();
                const today = getToday();

                // Replace today's entry if exists
                const filtered = weightLog.filter(w => w.date !== today);
                const newLog = [...filtered, { date: today, weight, note }]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(-90); // Keep 90 days

                set({ weightLog: newLog });
            },

            // ─── Get Weight Trend ─────────────────────────────────────
            getWeightTrend: () => {
                const { weightLog } = get();
                if (weightLog.length < 2) return { change: 0, trend: 'STABLE' };

                const first = weightLog[0].weight;
                const last = weightLog[weightLog.length - 1].weight;
                const change = Math.round((last - first) * 10) / 10;

                return {
                    change,
                    trend: change > 0.5 ? 'GAINING' : change < -0.5 ? 'LOSING' : 'STABLE',
                    startWeight: first,
                    currentWeight: last,
                };
            },

            // ─── Get Last 30 Days Weight ──────────────────────────────
            getLast30DaysWeight: () => {
                const { weightLog } = get();
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - 30);
                const cutoffStr = cutoff.toISOString().split('T')[0];
                return weightLog.filter(w => w.date >= cutoffStr);
            },

            // ─── Log Measurements ─────────────────────────────────────
            logMeasurements: (measurements) => {
                const { measurementLog } = get();
                const today = getToday();

                const filtered = measurementLog.filter(m => m.date !== today);
                const newLog = [...filtered, { date: today, ...measurements }]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(-24); // Keep ~2 years monthly

                set({ measurementLog: newLog });
            },

            // ─── Get Latest Measurements ──────────────────────────────
            getLatestMeasurements: () => {
                const { measurementLog } = get();
                return measurementLog.length > 0
                    ? measurementLog[measurementLog.length - 1]
                    : null;
            },

            // ─── Log Photo ────────────────────────────────────────────
            logPhoto: (uri, note = '') => {
                const { photoLog } = get();
                const today = getToday();
                const newLog = [...photoLog, { date: today, uri, note }].slice(-50);
                set({ photoLog: newLog });
            },

            // ─── DEV ONLY ────────────────────────────────────────────
            __devReset: () => {
                set({ weightLog: [], measurementLog: [], photoLog: [] });
            },
        }),
        {
            name: 'forgeborn-progress',
            storage,
        }
    )
);

export default useProgressStore;
