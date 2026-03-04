/**
 * FORGEBORN — LOOKMAXXING STORE
 * 
 * Manages skincare routines, grooming schedule, sleep tracking, and mewing.
 * Inspired by: BasicBeauty (AM/PM routines), SkinCare routine apps
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);
const getToday = () => new Date().toISOString().split('T')[0];

const DEFAULT_AM_ROUTINE = [
    { id: 'am01', name: 'Face Wash', icon: 'water-outline', done: false },
    { id: 'am02', name: 'Moisturizer', icon: 'rainy-outline', done: false },
    { id: 'am03', name: 'Sunscreen SPF 50', icon: 'sunny-outline', done: false },
    { id: 'am04', name: 'Lip Balm', icon: 'ellipse-outline', done: false },
    { id: 'am05', name: 'Mewing (5 min)', icon: 'fitness-outline', done: false },
    { id: 'am06', name: 'Posture Check', icon: 'body-outline', done: false },
    { id: 'am07', name: 'Hair Style', icon: 'cut-outline', done: false },
];

const DEFAULT_PM_ROUTINE = [
    { id: 'pm01', name: 'Cleanser', icon: 'water-outline', done: false },
    { id: 'pm02', name: 'Exfoliate (2x/week)', icon: 'sparkles-outline', done: false },
    { id: 'pm03', name: 'Serum / Retinol', icon: 'flask-outline', done: false },
    { id: 'pm04', name: 'Moisturizer', icon: 'rainy-outline', done: false },
    { id: 'pm05', name: 'Ice Face (2 min)', icon: 'snow-outline', done: false },
    { id: 'pm06', name: 'Tongue Posture', icon: 'fitness-outline', done: false },
];

const DEFAULT_GROOMING = [
    { id: 'gr01', name: 'Haircut', icon: 'cut-outline', frequency: 'MONTHLY', lastDone: null },
    { id: 'gr02', name: 'Nails Trimmed', icon: 'hand-left-outline', frequency: 'WEEKLY', lastDone: null },
    { id: 'gr03', name: 'Eyebrows', icon: 'eye-outline', frequency: 'BIWEEKLY', lastDone: null },
    { id: 'gr04', name: 'Shave / Trim Beard', icon: 'construct-outline', frequency: 'WEEKLY', lastDone: null },
    { id: 'gr05', name: 'Nose Hair', icon: 'remove-circle-outline', frequency: 'BIWEEKLY', lastDone: null },
    { id: 'gr06', name: 'Ear Clean', icon: 'ear-outline', frequency: 'WEEKLY', lastDone: null },
];

const useLookmaxxStore = create(
    persist(
        (set, get) => ({
            // Routines
            amRoutine: DEFAULT_AM_ROUTINE,
            pmRoutine: DEFAULT_PM_ROUTINE,
            grooming: DEFAULT_GROOMING,

            // Daily logs: { [date]: { am: { [id]: bool }, pm: { [id]: bool } } }
            dailyLogs: {},

            // Sleep
            sleepLogs: {}, // { [date]: { bedtime: '22:30', wakeTime: '06:00', hours: 7.5 } }

            // Mewing
            mewingMinutes: {}, // { [date]: minutes }

            // Stats
            amStreakDays: 0,
            pmStreakDays: 0,

            // ─── Toggle AM Item ───────────────────────────────────────
            toggleAMItem: (itemId) => {
                const { dailyLogs } = get();
                const today = getToday();
                const todayLog = dailyLogs[today] || { am: {}, pm: {} };
                const wasDone = todayLog.am[itemId] || false;

                set({
                    dailyLogs: {
                        ...dailyLogs,
                        [today]: {
                            ...todayLog,
                            am: { ...todayLog.am, [itemId]: !wasDone },
                        },
                    },
                });
            },

            // ─── Toggle PM Item ───────────────────────────────────────
            togglePMItem: (itemId) => {
                const { dailyLogs } = get();
                const today = getToday();
                const todayLog = dailyLogs[today] || { am: {}, pm: {} };
                const wasDone = todayLog.pm[itemId] || false;

                set({
                    dailyLogs: {
                        ...dailyLogs,
                        [today]: {
                            ...todayLog,
                            pm: { ...todayLog.pm, [itemId]: !wasDone },
                        },
                    },
                });
            },

            // ─── Get Today's Status ───────────────────────────────────
            getTodaysRoutineStatus: () => {
                const { dailyLogs, amRoutine, pmRoutine } = get();
                const today = getToday();
                const todayLog = dailyLogs[today] || { am: {}, pm: {} };

                const amDone = Object.values(todayLog.am).filter(Boolean).length;
                const pmDone = Object.values(todayLog.pm).filter(Boolean).length;

                return {
                    amCompleted: amDone,
                    amTotal: amRoutine.length,
                    amProgress: amRoutine.length > 0 ? amDone / amRoutine.length : 0,
                    pmCompleted: pmDone,
                    pmTotal: pmRoutine.length,
                    pmProgress: pmRoutine.length > 0 ? pmDone / pmRoutine.length : 0,
                    isAMDone: amDone === amRoutine.length,
                    isPMDone: pmDone === pmRoutine.length,
                };
            },

            // ─── Is Item Done Today ───────────────────────────────────
            isAMDone: (itemId) => {
                const { dailyLogs } = get();
                const today = getToday();
                return (dailyLogs[today]?.am || {})[itemId] || false;
            },

            isPMDone: (itemId) => {
                const { dailyLogs } = get();
                const today = getToday();
                return (dailyLogs[today]?.pm || {})[itemId] || false;
            },

            // ─── Mark Grooming Done ───────────────────────────────────
            markGroomingDone: (groomingId) => {
                const { grooming } = get();
                set({
                    grooming: grooming.map(g =>
                        g.id === groomingId ? { ...g, lastDone: getToday() } : g
                    ),
                });
            },

            // ─── Log Sleep ────────────────────────────────────────────
            logSleep: (bedtime, wakeTime) => {
                const { sleepLogs } = get();
                const today = getToday();

                // Calculate hours (simple estimation)
                const [bedH, bedM] = bedtime.split(':').map(Number);
                const [wakeH, wakeM] = wakeTime.split(':').map(Number);
                let hours = wakeH - bedH + (wakeM - bedM) / 60;
                if (hours < 0) hours += 24;

                set({
                    sleepLogs: {
                        ...sleepLogs,
                        [today]: { bedtime, wakeTime, hours: Math.round(hours * 10) / 10 },
                    },
                });
            },

            // ─── Get Sleep Data ───────────────────────────────────────
            getTodaysSleep: () => {
                const { sleepLogs } = get();
                return sleepLogs[getToday()] || null;
            },

            // ─── Add Mewing ───────────────────────────────────────────
            addMewingMinutes: (minutes) => {
                const { mewingMinutes } = get();
                const today = getToday();
                set({
                    mewingMinutes: {
                        ...mewingMinutes,
                        [today]: (mewingMinutes[today] || 0) + minutes,
                    },
                });
            },

            // ─── Get Grooming Status ──────────────────────────────────
            isGroomingDue: (groomingItem) => {
                if (!groomingItem.lastDone) return true;
                const lastDone = new Date(groomingItem.lastDone);
                const now = new Date();
                const daysDiff = Math.floor((now - lastDone) / (1000 * 60 * 60 * 24));

                switch (groomingItem.frequency) {
                    case 'WEEKLY': return daysDiff >= 7;
                    case 'BIWEEKLY': return daysDiff >= 14;
                    case 'MONTHLY': return daysDiff >= 30;
                    default: return daysDiff >= 7;
                }
            },

            // ─── DEV ONLY ────────────────────────────────────────────
            __devReset: () => {
                set({
                    amRoutine: DEFAULT_AM_ROUTINE,
                    pmRoutine: DEFAULT_PM_ROUTINE,
                    grooming: DEFAULT_GROOMING,
                    dailyLogs: {},
                    sleepLogs: {},
                    mewingMinutes: {},
                    amStreakDays: 0,
                    pmStreakDays: 0,
                });
            },
        }),
        {
            name: 'forgeborn-lookmaxx',
            storage,
        }
    )
);

export default useLookmaxxStore;
