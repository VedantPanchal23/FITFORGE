/**
 * Workout Engine
 * Generates workout plans based on profile, experience, and recovery status
 */

const { WORKOUT_SPLITS, REP_RANGES, REST_PERIODS, RECOVERY_TIMES } = require('../utils/constants');
const { createWorkoutPlan, createExercise } = require('../models/WorkoutPlan');
const { getStyleDetails, TRAINING_STYLES } = require('./TrainingStyleEngine');
const { getPreWorkoutGuidance, getPostWorkoutGuidance } = require('./WorkoutGuidanceEngine');

// Load exercise database
let exerciseDatabase = [];
try {
    exerciseDatabase = require('../../data/exercises/bodyweight_exercises.json');
} catch (e) {
    console.warn('Exercise database not loaded:', e.message);
}

/**
 * Get exercises by category
 */
function getExercisesByCategory(category) {
    return exerciseDatabase.filter(ex => ex.category === category);
}

/**
 * Get exercises for muscle groups
 */
function getExercisesForMuscleGroups(muscleGroups) {
    return exerciseDatabase.filter(ex =>
        ex.muscle_groups.some(mg => muscleGroups.includes(mg))
    );
}

/**
 * Filter exercises by difficulty
 */
function filterByDifficulty(exercises, experienceLevel) {
    const maxDifficulty = { beginner: 4, intermediate: 6, advanced: 10 };
    const max = maxDifficulty[experienceLevel] || 5;
    return exercises.filter(ex => ex.difficulty <= max);
}

/**
 * Filter out exercises with contraindications
 */
function filterByInjuries(exercises, injuries) {
    if (!injuries || injuries.length === 0) return exercises;
    return exercises.filter(ex => {
        if (!ex.contraindications) return true;
        return !ex.contraindications.some(c => injuries.includes(c));
    });
}

/**
 * Get workout type for day of week
 */
function getWorkoutTypeForDay(experienceLevel, dayOfWeek) {
    const split = WORKOUT_SPLITS[experienceLevel];
    return split.pattern[dayOfWeek % 7];
}

/**
 * Get muscle groups for workout type
 */
function getMuscleGroupsForType(workoutType) {
    const muscleMap = {
        push: ['chest', 'shoulders', 'triceps'],
        pull: ['lats', 'upper_back', 'biceps', 'rear_delts'],
        legs: ['quads', 'hamstrings', 'glutes', 'calves'],
        upper: ['chest', 'shoulders', 'triceps', 'lats', 'upper_back', 'biceps'],
        lower: ['quads', 'hamstrings', 'glutes', 'calves'],
        full_body: ['chest', 'shoulders', 'triceps', 'lats', 'upper_back', 'quads', 'glutes'],
        rest: [],
        mobility: ['spine', 'hips', 'shoulders']
    };
    return muscleMap[workoutType] || [];
}

/**
 * Build warmup exercises
 */
function buildWarmup() {
    const warmupExercises = getExercisesByCategory('warmup');
    const mobilityExercises = getExercisesByCategory('mobility');

    return [
        ...warmupExercises.slice(0, 3),
        ...mobilityExercises.slice(0, 2)
    ].map(ex => ({
        name: ex.name,
        reps: ex.reps_range?.min || 10,
        unit: ex.unit || 'reps'
    }));
}

/**
 * Build cooldown exercises
 */
function buildCooldown() {
    const mobilityExercises = getExercisesByCategory('mobility');
    return mobilityExercises.slice(0, 3).map(ex => ({
        name: ex.name,
        duration: ex.unit === 'seconds' ? ex.reps_range?.max || 30 : null,
        reps: ex.unit !== 'seconds' ? ex.reps_range?.min || 10 : null
    }));
}

/**
 * Select exercises for workout
 */
function selectExercises(muscleGroups, profile, count = 5) {
    let exercises = getExercisesForMuscleGroups(muscleGroups);
    exercises = filterByDifficulty(exercises, profile.experience_level);
    exercises = filterByInjuries(exercises, profile.injuries);

    // Prioritize compound/beginner-friendly for beginners
    if (profile.experience_level === 'beginner') {
        exercises.sort((a, b) => (b.beginner_friendly ? 1 : 0) - (a.beginner_friendly ? 1 : 0));
    }

    // Select diverse exercises
    const selected = [];
    const usedMuscles = new Set();

    for (const ex of exercises) {
        if (selected.length >= count) break;

        // Try to cover different muscle groups
        const newMuscle = ex.muscle_groups.find(m => !usedMuscles.has(m));
        if (newMuscle || selected.length < 3) {
            selected.push(ex);
            ex.muscle_groups.forEach(m => usedMuscles.add(m));
        }
    }

    return selected;
}

/**
 * Build workout exercises with sets/reps
 */
function buildWorkoutExercises(muscleGroups, profile, goalType) {
    const exercises = selectExercises(muscleGroups, profile);
    const repRange = goalType === 'muscle_gain' ? REP_RANGES.hypertrophy : REP_RANGES.endurance;

    return exercises.map(ex => createExercise({
        name: ex.name,
        muscle_group: ex.muscle_groups[0],
        sets: profile.experience_level === 'beginner' ? 3 : 4,
        reps: `${ex.reps_range?.min || repRange.min}-${ex.reps_range?.max || repRange.max}`,
        rest_seconds: REST_PERIODS.hypertrophy.min,
        difficulty: ex.difficulty,
        alternatives: ex.regressions || []
    }));
}

/**
 * Generate workout plan for a specific date
 */
function generateWorkoutPlan(profile, date, dayOfWeek) {
    const workoutType = getWorkoutTypeForDay(profile.experience_level, dayOfWeek);

    // Rest day
    if (workoutType === 'rest') {
        return createWorkoutPlan({
            plan_date: date,
            is_rest_day: 1,
            workout_type: 'rest',
            explanation: 'Rest day for recovery. Light walking or stretching recommended.'
        });
    }

    const muscleGroups = getMuscleGroupsForType(workoutType);
    const warmup = buildWarmup();
    const exercises = buildWorkoutExercises(muscleGroups, profile, profile.goal_type);
    const cooldown = buildCooldown();

    const plan = createWorkoutPlan({
        plan_date: date,
        workout: { warmup, exercises, cooldown },
        muscle_groups: muscleGroups,
        workout_type: workoutType,
        difficulty_level: profile.experience_level === 'beginner' ? 'easy' : 'moderate',
        explanation: generateWorkoutExplanation(workoutType, muscleGroups, profile)
    });

    return plan;
}

/**
 * Generate explanation for workout
 */
function generateWorkoutExplanation(workoutType, muscleGroups, profile) {
    const parts = [];

    if (workoutType) {
        parts.push(`${workoutType.replace('_', ' ').toUpperCase()} workout.`);
    }

    if (muscleGroups?.length > 0) {
        parts.push(`Targets: ${muscleGroups.slice(0, 4).join(', ')}.`);
    }

    if (profile?.experience_level) {
        parts.push(`Designed for ${profile.experience_level} level.`);
    }

    if (profile?.goal_type === 'muscle_gain') {
        parts.push('Focus on time under tension and full range of motion.');
    } else if (profile?.goal_type === 'fat_loss') {
        parts.push('Keep rest periods short for elevated heart rate.');
    }

    return parts.join(' ');
}

/**
 * Adjust workout based on recovery status
 */
function adjustForRecovery(workoutPlan, recoveryStatus) {
    if (!recoveryStatus || recoveryStatus.status === 'excellent' || recoveryStatus.status === 'good') {
        return workoutPlan;
    }

    // Reduce volume for poor recovery
    if (recoveryStatus.status === 'poor') {
        const adjusted = { ...workoutPlan };
        adjusted.workout.exercises = adjusted.workout.exercises.map(ex => ({
            ...ex,
            sets: Math.max(2, ex.sets - 1)
        }));
        adjusted.explanation += ' Volume reduced due to recovery status.';
        return adjusted;
    }

    return workoutPlan;
}

/**
 * Get progressive overload suggestion
 */
function getProgressionSuggestion(exerciseName, currentReps, currentSets) {
    const exercise = exerciseDatabase.find(ex => ex.name === exerciseName);
    if (!exercise) return null;

    const maxReps = exercise.reps_range?.max || 15;

    if (currentReps >= maxReps) {
        if (exercise.progressions && exercise.progressions.length > 0) {
            const nextExercise = exerciseDatabase.find(ex => ex.id === exercise.progressions[1]);
            if (nextExercise) {
                return { type: 'progression', exercise: nextExercise.name };
            }
        }
        return { type: 'add_sets', newSets: currentSets + 1 };
    }

    return { type: 'add_reps', newReps: currentReps + 1 };
}

/**
 * Build dynamic warmup exercises based on workout type
 * @param {array} targetMuscleGroups - muscles being worked
 * @returns {array} warmup exercises
 */
function buildDynamicWarmup(targetMuscleGroups = []) {
    const generalWarmup = [
        { name: 'Jumping Jacks', reps: 30, type: 'cardio', duration_secs: null },
        { name: 'Arm Circles', reps: 15, type: 'dynamic', notes: 'each direction' },
        { name: 'Hip Circles', reps: 10, type: 'dynamic', notes: 'each direction' },
        { name: 'High Knees', reps: 20, type: 'cardio', notes: 'each leg' },
        { name: 'Bodyweight Squats', reps: 10, type: 'activation' }
    ];

    const muscleSpecificWarmup = {
        chest: [
            { name: 'Arm Swings', reps: 15, type: 'dynamic' },
            { name: 'Push-Up Position Hold', duration_secs: 20, type: 'activation' }
        ],
        shoulders: [
            { name: 'Shoulder Circles', reps: 10, type: 'dynamic', notes: 'each direction' },
            { name: 'Wall Slides', reps: 10, type: 'activation' }
        ],
        back: [
            { name: 'Cat-Cow Stretch', reps: 10, type: 'dynamic' },
            { name: 'Thoracic Rotations', reps: 8, type: 'dynamic', notes: 'each side' }
        ],
        legs: [
            { name: 'Leg Swings', reps: 10, type: 'dynamic', notes: 'each leg/direction' },
            { name: 'Walking Lunges', reps: 10, type: 'activation' }
        ],
        quads: [
            { name: 'Leg Swings (Front-Back)', reps: 10, type: 'dynamic', notes: 'each leg' },
            { name: 'Bodyweight Squats', reps: 10, type: 'activation' }
        ],
        hamstrings: [
            { name: 'Inchworms', reps: 5, type: 'dynamic' },
            { name: 'Good Mornings (bodyweight)', reps: 10, type: 'activation' }
        ],
        glutes: [
            { name: 'Glute Bridges', reps: 10, type: 'activation' },
            { name: 'Fire Hydrants', reps: 10, type: 'activation', notes: 'each side' }
        ]
    };

    // Add muscle-specific exercises
    const specificExercises = [];
    targetMuscleGroups.slice(0, 3).forEach(muscle => {
        if (muscleSpecificWarmup[muscle]) {
            specificExercises.push(...muscleSpecificWarmup[muscle]);
        }
    });

    return {
        duration_mins: 7,
        exercises: [...generalWarmup, ...specificExercises.slice(0, 3)],
        instructions: 'Complete all movements with control. Skip any that cause pain.'
    };
}

/**
 * Build static stretching for cooldown
 * @param {array} muscleGroups - muscles worked
 * @returns {array} stretching exercises
 */
function buildStaticStretching(muscleGroups = []) {
    const stretchDatabase = {
        chest: { name: 'Doorway Chest Stretch', duration_secs: 30, notes: 'each side' },
        shoulders: { name: 'Cross-Body Shoulder Stretch', duration_secs: 30, notes: 'each arm' },
        triceps: { name: 'Overhead Tricep Stretch', duration_secs: 30, notes: 'each arm' },
        biceps: { name: 'Wall Bicep Stretch', duration_secs: 30, notes: 'each arm' },
        lats: { name: 'Child\'s Pose', duration_secs: 45 },
        upper_back: { name: 'Thread the Needle', duration_secs: 30, notes: 'each side' },
        quads: { name: 'Standing Quad Stretch', duration_secs: 30, notes: 'each leg' },
        hamstrings: { name: 'Standing Hamstring Stretch', duration_secs: 30, notes: 'each leg' },
        glutes: { name: 'Figure-4 Stretch', duration_secs: 30, notes: 'each side' },
        calves: { name: 'Calf Stretch (Wall)', duration_secs: 30, notes: 'each leg' },
        hip_flexors: { name: 'Kneeling Hip Flexor Stretch', duration_secs: 30, notes: 'each side' }
    };

    const stretches = [];
    muscleGroups.forEach(muscle => {
        if (stretchDatabase[muscle]) {
            stretches.push(stretchDatabase[muscle]);
        }
    });

    // Always include some general stretches
    const generalStretches = [
        { name: 'Deep Breathing', duration_secs: 60, notes: '5-6 deep breaths' }
    ];

    return {
        duration_mins: 5,
        exercises: [...stretches.slice(0, 4), ...generalStretches],
        instructions: 'Hold each stretch for the full duration. Breathe deeply and relax.'
    };
}

/**
 * Build optional extended stretching routine
 * @param {array} muscleGroups - muscles that were worked
 * @returns {object} optional stretching routine
 */
function buildTargetedStretching(muscleGroups = []) {
    const routines = {
        upper: [
            { name: 'Wall Angels', reps: 10 },
            { name: 'Doorway Stretch', duration_secs: 45 },
            { name: 'Thread the Needle', duration_secs: 30, notes: 'each side' },
            { name: 'Neck Circles', reps: 5, notes: 'each direction' }
        ],
        lower: [
            { name: 'Pigeon Pose', duration_secs: 45, notes: 'each side' },
            { name: 'Frog Stretch', duration_secs: 45 },
            { name: '90-90 Stretch', duration_secs: 30, notes: 'each side' },
            { name: 'Couch Stretch', duration_secs: 30, notes: 'each leg' }
        ],
        full_body: [
            { name: 'Forward Fold', duration_secs: 45 },
            { name: 'Cat-Cow', reps: 10 },
            { name: 'Child\'s Pose', duration_secs: 60 },
            { name: 'Supine Twist', duration_secs: 30, notes: 'each side' }
        ]
    };

    // Determine routine type based on muscle groups
    const hasUpper = muscleGroups.some(m => ['chest', 'shoulders', 'triceps', 'biceps', 'lats'].includes(m));
    const hasLower = muscleGroups.some(m => ['quads', 'hamstrings', 'glutes', 'calves'].includes(m));

    let routine;
    if (hasUpper && hasLower) {
        routine = routines.full_body;
    } else if (hasLower) {
        routine = routines.lower;
    } else {
        routine = routines.upper;
    }

    return {
        title: 'Optional Extended Stretching',
        duration_mins: 10,
        exercises: routine,
        instructions: 'Do this if you have extra time for better recovery and flexibility.',
        optional: true
    };
}

/**
 * Build workout by training style
 * @param {object} profile - user profile
 * @param {string} workoutStyle - training style (gym, yoga, cardio, etc.)
 * @returns {object} workout exercises and instructions
 */
function buildWorkoutByStyle(profile, workoutStyle) {
    const styleConfig = getStyleDetails(workoutStyle);

    switch (workoutStyle) {
        case 'yoga':
            return buildYogaWorkout(profile);
        case 'cardio':
            return buildCardioWorkout(profile);
        case 'hiit':
            return buildHIITWorkout(profile);
        case 'mobility':
            return buildMobilityWorkout(profile);
        case 'calisthenics':
            return buildCalisthenicsWorkout(profile);
        default:
            return buildGymWorkout(profile);
    }
}

function buildYogaWorkout(profile) {
    const level = profile.experience_level || 'intermediate';
    const asanas = [
        { name: 'Sun Salutation A', reps: level === 'beginner' ? 3 : 5 },
        { name: 'Warrior I', duration_secs: 30, notes: 'each side' },
        { name: 'Warrior II', duration_secs: 30, notes: 'each side' },
        { name: 'Triangle Pose', duration_secs: 30, notes: 'each side' },
        { name: 'Tree Pose', duration_secs: 30, notes: 'each side' },
        { name: 'Chair Pose', duration_secs: 20 },
        { name: 'Downward Dog', duration_secs: 45 },
        { name: 'Pigeon Pose', duration_secs: 45, notes: 'each side' }
    ];

    return {
        exercises: level === 'beginner' ? asanas.slice(0, 5) : asanas,
        muscleGroups: ['full_body', 'core', 'hips'],
        instructions: 'Flow through poses mindfully. Focus on breath.'
    };
}

function buildCardioWorkout(profile) {
    return {
        exercises: [
            { name: 'Steady-State Cardio', duration_mins: 25, options: ['Running', 'Cycling', 'Elliptical', 'Rowing'] },
            { name: 'Optional: Intervals', sets: 5, work_secs: 30, rest_secs: 60 }
        ],
        muscleGroups: ['cardiovascular', 'legs'],
        instructions: 'Maintain heart rate at 65-75% of max. Can talk but not sing.'
    };
}

function buildHIITWorkout(profile) {
    const exercises = [
        { name: 'Burpees', work_secs: 30, rest_secs: 30 },
        { name: 'Mountain Climbers', work_secs: 30, rest_secs: 30 },
        { name: 'Jump Squats', work_secs: 30, rest_secs: 30 },
        { name: 'Push-Ups', work_secs: 30, rest_secs: 30 },
        { name: 'High Knees', work_secs: 30, rest_secs: 30 },
        { name: 'Plank Jacks', work_secs: 30, rest_secs: 30 }
    ];

    const rounds = profile.experience_level === 'beginner' ? 2 : 3;

    return {
        exercises,
        rounds,
        muscleGroups: ['full_body', 'cardiovascular'],
        instructions: `Complete ${rounds} rounds. Push hard during work, recover during rest.`
    };
}

function buildMobilityWorkout(profile) {
    return {
        exercises: [
            { name: 'Foam Rolling - Quads', duration_secs: 60 },
            { name: 'Foam Rolling - IT Band', duration_secs: 60, notes: 'each side' },
            { name: 'Foam Rolling - Upper Back', duration_secs: 60 },
            { name: 'Hip 90-90 Stretch', duration_secs: 45, notes: 'each side' },
            { name: 'World\'s Greatest Stretch', reps: 5, notes: 'each side' },
            { name: 'Cat-Cow', reps: 15 },
            { name: 'Thread the Needle', duration_secs: 30, notes: 'each side' },
            { name: 'Pigeon Pose', duration_secs: 60, notes: 'each side' }
        ],
        muscleGroups: ['full_body', 'hips', 'spine'],
        instructions: 'Move slowly and mindfully. This is active recovery.'
    };
}

function buildCalisthenicsWorkout(profile) {
    const level = profile.experience_level || 'intermediate';

    const exercises = [
        { name: 'Pull-Ups', sets: 3, reps: level === 'beginner' ? '3-5' : '8-12', alternatives: ['Negative Pull-Ups', 'Band-Assisted Pull-Ups'] },
        { name: 'Dips', sets: 3, reps: level === 'beginner' ? '5-8' : '10-15', alternatives: ['Bench Dips'] },
        { name: 'Push-Ups', sets: 3, reps: level === 'beginner' ? '8-12' : '15-20', alternatives: ['Incline Push-Ups'] },
        { name: 'Pistol Squat Progression', sets: 3, reps: '5-8', notes: 'each leg', alternatives: ['Assisted Pistols', 'Step-Ups'] },
        { name: 'Hanging Leg Raises', sets: 3, reps: level === 'beginner' ? '5-8' : '10-15', alternatives: ['Knee Raises'] }
    ];

    return {
        exercises,
        muscleGroups: ['pull', 'push', 'legs', 'core'],
        instructions: 'Focus on form over reps. Use progressions as needed.'
    };
}

function buildGymWorkout(profile) {
    const dayOfWeek = new Date().getDay();
    const workoutType = getWorkoutTypeForDay(profile.experience_level, dayOfWeek);
    const muscleGroups = getMuscleGroupsForType(workoutType);
    const exercises = buildWorkoutExercises(muscleGroups, profile, profile.goal_type);

    return {
        exercises,
        muscleGroups,
        instructions: generateWorkoutExplanation(workoutType, muscleGroups, profile)
    };
}

/**
 * Generate complete session with all phases
 * @param {object} profile - user profile
 * @param {string} date - workout date
 * @param {string} workoutStyle - gym, yoga, cardio, etc.
 * @param {string} workoutTime - scheduled time "HH:MM"
 * @returns {object} complete session with phases and guidance
 */
function generateFullSession(profile, date, workoutStyle = 'gym', workoutTime = '07:00') {
    const styleConfig = getStyleDetails(workoutStyle);

    // Rest day handling
    if (styleConfig.isRestDay) {
        return createWorkoutPlan({
            plan_date: date,
            is_rest_day: 1,
            workout_type: 'rest',
            workout_style: 'rest',
            style_name: styleConfig.name,
            explanation: 'Rest day for recovery. Light walking or stretching recommended.',
            suggestions: styleConfig.suggestions || [],
            preWorkoutGuidance: null,
            postWorkoutGuidance: null
        });
    }

    // Build main workout
    const mainWorkout = buildWorkoutByStyle(profile, workoutStyle);
    const muscleGroups = mainWorkout.muscleGroups || [];

    // Build all phases
    const warmup = buildDynamicWarmup(muscleGroups);
    const cooldown = buildStaticStretching(muscleGroups);
    const optionalStretching = buildTargetedStretching(muscleGroups);

    // Get guidance
    const preGuidance = getPreWorkoutGuidance(profile, workoutTime, workoutStyle);
    const postGuidance = getPostWorkoutGuidance(profile, workoutStyle, styleConfig.defaultDuration);

    // Calculate total duration
    const totalDuration = warmup.duration_mins +
        (styleConfig.defaultDuration - warmup.duration_mins - cooldown.duration_mins) +
        cooldown.duration_mins;

    const session = createWorkoutPlan({
        plan_date: date,
        workout_style: workoutStyle,
        style_name: styleConfig.name,
        style_icon: styleConfig.icon,
        estimated_duration_mins: totalDuration,
        phases: [
            {
                name: 'Warm-Up',
                order: 1,
                duration_mins: warmup.duration_mins,
                exercises: warmup.exercises,
                instructions: warmup.instructions
            },
            {
                name: 'Main Workout',
                order: 2,
                duration_mins: styleConfig.defaultDuration - warmup.duration_mins - cooldown.duration_mins,
                exercises: mainWorkout.exercises,
                instructions: mainWorkout.instructions,
                rounds: mainWorkout.rounds || null
            },
            {
                name: 'Cool-Down',
                order: 3,
                duration_mins: cooldown.duration_mins,
                exercises: cooldown.exercises,
                instructions: cooldown.instructions
            }
        ],
        optionalStretching,
        muscle_groups: muscleGroups,
        workout_type: workoutStyle,
        difficulty_level: profile.experience_level === 'beginner' ? 'easy' : 'moderate',
        preWorkoutGuidance: preGuidance,
        postWorkoutGuidance: postGuidance,
        explanation: generateWorkoutExplanation(workoutStyle, muscleGroups, profile)
    });

    return session;
}

/**
 * Generate workout alternatives for today
 * @param {object} profile - user profile
 * @param {string} date - date
 * @param {number} count - number of alternatives
 * @returns {array} alternative workout options
 */
function generateWorkoutAlternatives(profile, date, count = 3) {
    const styles = ['gym', 'hiit', 'cardio', 'yoga', 'mobility'];
    const alternatives = [];

    for (let i = 0; i < count && i < styles.length; i++) {
        const styleConfig = getStyleDetails(styles[i]);
        alternatives.push({
            style: styles[i],
            name: styleConfig.name,
            icon: styleConfig.icon,
            duration: styleConfig.defaultDuration,
            description: styleConfig.description
        });
    }

    return alternatives;
}

module.exports = {
    getExercisesByCategory,
    getExercisesForMuscleGroups,
    filterByDifficulty,
    filterByInjuries,
    getWorkoutTypeForDay,
    getMuscleGroupsForType,
    selectExercises,
    generateWorkoutPlan,
    generateFullSession,
    generateWorkoutAlternatives,
    adjustForRecovery,
    getProgressionSuggestion,
    buildDynamicWarmup,
    buildStaticStretching,
    buildWorkoutByStyle
};

