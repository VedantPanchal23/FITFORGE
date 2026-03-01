/**
 * FORGEBORN — WORKOUT STORE
 * 
 * Manages workout state: current plan, active workout, exercise logs, PRs.
 * Inspired by: Hevy (set-by-set logging, PR tracking), Strong (fast logging)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateWorkoutPlan, getTodaysWorkout } from '../engine/workoutEngine';

const storage = createJSONStorage(() => AsyncStorage);

const useWorkoutStore = create(
    persist(
        (set, get) => ({
            // Current plan (generated from profile)
            currentPlan: null,
            lastPlanDate: null,

            // Active workout tracking
            activeWorkout: null, // { dayName, exercises, startedAt, sets: { [exerciseId]: [...] } }

            // History
            workoutHistory: [], // [{ date, dayName, exercises, duration, totalVolume, setsCompleted }]

            // Personal records
            personalRecords: {}, // { [exerciseId]: { maxWeight, maxReps, maxVolume, date } }

            // Stats
            totalWorkoutsCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,

            // ─── Generate Plan ────────────────────────────────────────
            generatePlan: (profile) => {
                const plan = generateWorkoutPlan(profile);
                set({
                    currentPlan: plan,
                    lastPlanDate: new Date().toISOString(),
                });
                return plan;
            },

            // ─── Get Today's Workout ──────────────────────────────────
            getTodaysWorkout: (daysSinceCommitment) => {
                const { currentPlan } = get();
                if (!currentPlan) return null;
                return getTodaysWorkout(currentPlan, daysSinceCommitment);
            },

            // ─── Start Workout ────────────────────────────────────────
            startWorkout: (todaysWorkout) => {
                const sets = {};
                todaysWorkout.exercises.forEach(ex => {
                    sets[ex.id] = Array.from({ length: ex.sets }, () => ({
                        weight: 0,
                        reps: 0,
                        completed: false,
                    }));
                });

                set({
                    activeWorkout: {
                        dayName: todaysWorkout.name,
                        exercises: todaysWorkout.exercises,
                        startedAt: Date.now(),
                        currentExerciseIndex: 0,
                        currentSetIndex: 0,
                        sets,
                        isResting: false,
                        restEndTime: null,
                    },
                });
            },

            // ─── Log Set ──────────────────────────────────────────────
            logSet: (exerciseId, setIndex, weight, reps) => {
                const { activeWorkout, personalRecords } = get();
                if (!activeWorkout) return;

                const newSets = { ...activeWorkout.sets };
                newSets[exerciseId] = [...newSets[exerciseId]];
                newSets[exerciseId][setIndex] = {
                    weight: parseFloat(weight) || 0,
                    reps: parseInt(reps) || 0,
                    completed: true,
                };

                // Check for PR
                const volume = (parseFloat(weight) || 0) * (parseInt(reps) || 0);
                const currentPR = personalRecords[exerciseId];
                let newPRs = personalRecords;

                if (!currentPR || volume > (currentPR.maxVolume || 0)) {
                    newPRs = {
                        ...personalRecords,
                        [exerciseId]: {
                            maxWeight: Math.max(parseFloat(weight) || 0, currentPR?.maxWeight || 0),
                            maxReps: Math.max(parseInt(reps) || 0, currentPR?.maxReps || 0),
                            maxVolume: Math.max(volume, currentPR?.maxVolume || 0),
                            date: new Date().toISOString(),
                        },
                    };
                }

                set({
                    activeWorkout: { ...activeWorkout, sets: newSets },
                    personalRecords: newPRs,
                });
            },

            // ─── Start Rest ───────────────────────────────────────────
            startRest: (seconds) => {
                const { activeWorkout } = get();
                if (!activeWorkout) return;

                set({
                    activeWorkout: {
                        ...activeWorkout,
                        isResting: true,
                        restEndTime: Date.now() + (seconds * 1000),
                    },
                });
            },

            // ─── End Rest ─────────────────────────────────────────────
            endRest: () => {
                const { activeWorkout } = get();
                if (!activeWorkout) return;

                set({
                    activeWorkout: {
                        ...activeWorkout,
                        isResting: false,
                        restEndTime: null,
                    },
                });
            },

            // ─── Move to Next Exercise ────────────────────────────────
            nextExercise: () => {
                const { activeWorkout } = get();
                if (!activeWorkout) return;

                const nextIndex = activeWorkout.currentExerciseIndex + 1;
                if (nextIndex < activeWorkout.exercises.length) {
                    set({
                        activeWorkout: {
                            ...activeWorkout,
                            currentExerciseIndex: nextIndex,
                            currentSetIndex: 0,
                            isResting: false,
                            restEndTime: null,
                        },
                    });
                }
            },

            // ─── Previous Exercise ────────────────────────────────────
            prevExercise: () => {
                const { activeWorkout } = get();
                if (!activeWorkout) return;

                const prevIndex = activeWorkout.currentExerciseIndex - 1;
                if (prevIndex >= 0) {
                    set({
                        activeWorkout: {
                            ...activeWorkout,
                            currentExerciseIndex: prevIndex,
                            currentSetIndex: 0,
                        },
                    });
                }
            },

            // ─── Finish Workout ───────────────────────────────────────
            finishWorkout: () => {
                const { activeWorkout, workoutHistory, totalWorkoutsCompleted, currentStreak, longestStreak } = get();
                if (!activeWorkout) return;

                const duration = Math.round((Date.now() - activeWorkout.startedAt) / 1000 / 60);

                // Calculate total volume
                let totalVolume = 0;
                let setsCompleted = 0;
                Object.values(activeWorkout.sets).forEach(setArr => {
                    setArr.forEach(s => {
                        if (s.completed) {
                            totalVolume += s.weight * s.reps;
                            setsCompleted++;
                        }
                    });
                });

                const record = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    dayName: activeWorkout.dayName,
                    exercises: activeWorkout.exercises.map(e => e.name),
                    sets: activeWorkout.sets,
                    duration,
                    totalVolume,
                    setsCompleted,
                };

                // Check streak
                const today = new Date().toDateString();
                const lastWorkout = workoutHistory.length > 0
                    ? new Date(workoutHistory[0].date).toDateString()
                    : null;

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const isConsecutive = lastWorkout === yesterday.toDateString() || lastWorkout === today;

                const newStreak = isConsecutive ? currentStreak + 1 : 1;

                set({
                    activeWorkout: null,
                    workoutHistory: [record, ...workoutHistory].slice(0, 90), // Keep 90 days
                    totalWorkoutsCompleted: totalWorkoutsCompleted + 1,
                    currentStreak: newStreak,
                    longestStreak: Math.max(newStreak, longestStreak),
                });

                return record;
            },

            // ─── Cancel Workout ───────────────────────────────────────
            cancelWorkout: () => {
                set({ activeWorkout: null });
            },

            // ─── Get Stats ────────────────────────────────────────────
            getThisWeekWorkouts: () => {
                const { workoutHistory } = get();
                const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                return workoutHistory.filter(w => new Date(w.date).getTime() > weekAgo);
            },

            // ─── DEV ONLY ────────────────────────────────────────────
            __devReset: () => {
                set({
                    currentPlan: null,
                    lastPlanDate: null,
                    activeWorkout: null,
                    workoutHistory: [],
                    personalRecords: {},
                    totalWorkoutsCompleted: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                });
            },
        }),
        {
            name: 'forgeborn-workout',
            storage,
        }
    )
);

export default useWorkoutStore;
