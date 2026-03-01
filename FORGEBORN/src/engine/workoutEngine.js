/**
 * FORGEBORN — WORKOUT PLAN GENERATOR
 * 
 * Generates personalized workout plans based on:
 * - Fitness goals (from onboarding)
 * - Experience level
 * - Training days per week
 * - Equipment available
 * 
 * Inspired by: Fitbod (AI plan generation), Hevy (structured programs)
 */

import { exercises, MuscleGroup, Difficulty, Equipment } from '../data/exerciseDB';

// ─── SPLIT TEMPLATES ──────────────────────────────────────────────────────────
// Based on training days per week

const SPLITS = {
    2: { // Full body × 2
        name: '2-DAY FULL BODY',
        days: [
            { name: 'FULL BODY A', muscles: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.LEGS, MuscleGroup.SHOULDERS, MuscleGroup.CORE] },
            { name: 'FULL BODY B', muscles: [MuscleGroup.BACK, MuscleGroup.CHEST, MuscleGroup.LEGS, MuscleGroup.BICEPS, MuscleGroup.TRICEPS, MuscleGroup.CORE] },
        ],
    },
    3: { // Push Pull Legs
        name: '3-DAY PPL',
        days: [
            { name: 'PUSH', muscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS] },
            { name: 'PULL', muscles: [MuscleGroup.BACK, MuscleGroup.BICEPS, MuscleGroup.FOREARMS] },
            { name: 'LEGS', muscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES, MuscleGroup.CORE] },
        ],
    },
    4: { // Upper Lower × 2
        name: '4-DAY UPPER/LOWER',
        days: [
            { name: 'UPPER A', muscles: [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS] },
            { name: 'LOWER A', muscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES, MuscleGroup.CORE] },
            { name: 'UPPER B', muscles: [MuscleGroup.BACK, MuscleGroup.SHOULDERS, MuscleGroup.BICEPS, MuscleGroup.TRICEPS] },
            { name: 'LOWER B', muscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES, MuscleGroup.CORE] },
        ],
    },
    5: { // Bro Split
        name: '5-DAY SPLIT',
        days: [
            { name: 'CHEST', muscles: [MuscleGroup.CHEST, MuscleGroup.TRICEPS] },
            { name: 'BACK', muscles: [MuscleGroup.BACK, MuscleGroup.BICEPS] },
            { name: 'SHOULDERS + ARMS', muscles: [MuscleGroup.SHOULDERS, MuscleGroup.BICEPS, MuscleGroup.TRICEPS] },
            { name: 'LEGS', muscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES] },
            { name: 'FULL BODY + WEAK POINTS', muscles: [MuscleGroup.CORE, MuscleGroup.FOREARMS, MuscleGroup.SHOULDERS, MuscleGroup.BACK] },
        ],
    },
    6: { // PPL × 2
        name: '6-DAY PPL',
        days: [
            { name: 'PUSH A', muscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS] },
            { name: 'PULL A', muscles: [MuscleGroup.BACK, MuscleGroup.BICEPS, MuscleGroup.FOREARMS] },
            { name: 'LEGS A', muscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES, MuscleGroup.CORE] },
            { name: 'PUSH B', muscles: [MuscleGroup.SHOULDERS, MuscleGroup.CHEST, MuscleGroup.TRICEPS] },
            { name: 'PULL B', muscles: [MuscleGroup.BACK, MuscleGroup.BICEPS] },
            { name: 'LEGS B', muscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES, MuscleGroup.CORE] },
        ],
    },
    7: { // Every day
        name: '7-DAY WARRIOR',
        days: [
            { name: 'CHEST + TRICEPS', muscles: [MuscleGroup.CHEST, MuscleGroup.TRICEPS] },
            { name: 'BACK + BICEPS', muscles: [MuscleGroup.BACK, MuscleGroup.BICEPS] },
            { name: 'LEGS', muscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES] },
            { name: 'SHOULDERS + CORE', muscles: [MuscleGroup.SHOULDERS, MuscleGroup.CORE] },
            { name: 'FULL BODY PUSH', muscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS] },
            { name: 'FULL BODY PULL', muscles: [MuscleGroup.BACK, MuscleGroup.BICEPS, MuscleGroup.FOREARMS] },
            { name: 'LEGS + CORE', muscles: [MuscleGroup.LEGS, MuscleGroup.GLUTES, MuscleGroup.CORE] },
        ],
    },
};

// ─── GOAL-BASED EXERCISE PREFERENCES ─────────────────────────────────────────

const GOAL_CONFIG = {
    FULL_BODY: {
        compoundFirst: true,
        preferredEquipment: null, // all OK
        setRange: [3, 4],
        repRange: '8-12',
    },
    BODYBUILDING: {
        compoundFirst: true,
        preferredEquipment: [Equipment.BARBELL, Equipment.DUMBBELL, Equipment.CABLE, Equipment.MACHINE],
        setRange: [3, 5],
        repRange: '8-12',
    },
    CALISTHENICS: {
        compoundFirst: true,
        preferredEquipment: [Equipment.BODYWEIGHT],
        setRange: [3, 5],
        repRange: '8-15',
    },
    STRENGTH: {
        compoundFirst: true,
        preferredEquipment: [Equipment.BARBELL, Equipment.DUMBBELL],
        setRange: [4, 5],
        repRange: '3-6',
    },
    WEIGHT_LOSS: {
        compoundFirst: true,
        preferredEquipment: null,
        setRange: [3, 4],
        repRange: '12-15',
    },
    ENDURANCE: {
        compoundFirst: false,
        preferredEquipment: null,
        setRange: [2, 3],
        repRange: '15-20',
    },
};

// ─── DIFFICULTY MAPPING ───────────────────────────────────────────────────────

const LEVEL_FILTER = {
    BEGINNER: [Difficulty.BEGINNER],
    INTERMEDIATE: [Difficulty.BEGINNER, Difficulty.INTERMEDIATE],
    ADVANCED: [Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED],
};

// ─── PLAN GENERATOR ───────────────────────────────────────────────────────────

/**
 * Generate a full week workout plan.
 * 
 * @param {Object} profile - User profile from userStore
 * @returns {Object} - { splitName, days: [{ name, exercises: [...] }] }
 */
export function generateWorkoutPlan(profile) {
    const trainingDays = profile.trainingDaysPerWeek || 5;
    const goals = profile.fitnessGoals || profile.fitnessGoal || ['FULL_BODY'];
    const level = profile.experienceLevel || 'INTERMEDIATE';
    const wantsCardio = profile.wantsCardio || false;
    const wantsYoga = profile.wantsYoga || false;

    // Get the split template
    const splitKey = Math.min(Math.max(trainingDays, 2), 7);
    const split = SPLITS[splitKey];

    // Get goal config (use first goal as primary)
    const primaryGoal = goals[0] || 'FULL_BODY';
    const goalConfig = GOAL_CONFIG[primaryGoal] || GOAL_CONFIG.FULL_BODY;

    // Allowed difficulties
    const allowedDifficulties = LEVEL_FILTER[level] || LEVEL_FILTER.INTERMEDIATE;

    // Generate exercises for each day
    const days = split.days.map((day) => {
        const dayExercises = [];

        day.muscles.forEach((muscle) => {
            // Get all exercises for this muscle at allowed difficulty
            let available = exercises.filter(e =>
                e.muscle === muscle &&
                allowedDifficulties.includes(e.difficulty)
            );

            // Filter by goal equipment preference
            if (goalConfig.preferredEquipment) {
                const filtered = available.filter(e =>
                    goalConfig.preferredEquipment.includes(e.equipment)
                );
                if (filtered.length >= 2) available = filtered;
            }

            // Determine how many exercises per muscle group
            const isPrimaryMuscle = day.muscles.indexOf(muscle) < 2;
            const exerciseCount = isPrimaryMuscle ? 3 : 2;

            // Sort: compounds first if goal requires
            if (goalConfig.compoundFirst) {
                available.sort((a, b) => {
                    const aCompound = (a.secondary || []).length;
                    const bCompound = (b.secondary || []).length;
                    return bCompound - aCompound;
                });
            }

            // Pick exercises (avoid duplicates)
            const picked = [];
            for (const exercise of available) {
                if (picked.length >= exerciseCount) break;
                if (!dayExercises.find(e => e.id === exercise.id)) {
                    picked.push({
                        ...exercise,
                        sets: goalConfig.setRange[0] + (isPrimaryMuscle ? 1 : 0),
                        reps: goalConfig.repRange || exercise.defaultReps,
                        rest: exercise.restSeconds,
                    });
                }
            }

            dayExercises.push(...picked);
        });

        // Calculate estimated duration
        const totalSets = dayExercises.reduce((sum, e) => sum + e.sets, 0);
        const avgRestMinutes = dayExercises.reduce((sum, e) => sum + (e.rest || 60), 0) / dayExercises.length / 60;
        const estimatedMinutes = Math.round(totalSets * (0.5 + avgRestMinutes)); // 30s per set + rest

        return {
            name: day.name,
            muscles: day.muscles,
            exercises: dayExercises,
            totalSets,
            estimatedMinutes,
            exerciseCount: dayExercises.length,
        };
    });

    return {
        splitName: split.name,
        trainingDays: splitKey,
        days,
        goals,
        level,
    };
}

/**
 * Get today's workout based on day of week and commitment day.
 */
export function getTodaysWorkout(plan, daysSinceCommitment) {
    if (!plan || !plan.days || plan.days.length === 0) return null;
    const dayIndex = daysSinceCommitment % plan.days.length;
    return { ...plan.days[dayIndex], dayIndex, dayNumber: dayIndex + 1 };
}

export default { generateWorkoutPlan, getTodaysWorkout };
