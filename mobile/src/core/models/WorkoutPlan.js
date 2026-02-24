/**
 * WorkoutPlan Model
 * Data model for daily workout plans
 * Supports full session structure with phases and workout style variations
 */

const DEFAULT_WORKOUT_PLAN = {
    plan_date: null,
    workout: {
        warmup: [],
        exercises: [],
        cooldown: [],
        stretching: []
    },
    phases: [], // Full session phases: warmup, main, cooldown
    muscle_groups: [],
    workout_type: 'full_body',
    workout_style: 'gym', // gym, yoga, cardio, calisthenics, mobility, hiit
    style_name: 'Gym Workout',
    style_icon: 'barbell',
    estimated_duration_mins: 45,
    difficulty_level: 'moderate',
    is_rest_day: 0,
    explanation: null,
    preWorkoutGuidance: null,
    postWorkoutGuidance: null,
    alternativeWorkouts: [],
    optionalStretching: null
};

function createExercise(data) {
    return {
        name: data.name,
        muscle_group: data.muscle_group,
        sets: data.sets || 3,
        reps: data.reps || '10-12',
        rest_seconds: data.rest_seconds || 60,
        tempo: data.tempo || null,
        notes: data.notes || null,
        difficulty: data.difficulty || 5,
        alternatives: data.alternatives || []
    };
}

function createWorkoutPlan(data) {
    if (data.is_rest_day) {
        return {
            plan_date: data.plan_date || new Date().toISOString().split('T')[0],
            workout: { warmup: [], exercises: [], cooldown: [] },
            muscle_groups: [],
            workout_type: 'rest',
            estimated_duration_mins: 0,
            difficulty_level: 'easy',
            is_rest_day: 1,
            explanation: 'Rest day for recovery'
        };
    }
    return { ...DEFAULT_WORKOUT_PLAN, ...data, plan_date: data.plan_date || new Date().toISOString().split('T')[0] };
}

function calculateWorkoutDuration(workout) {
    const warmupTime = (workout.warmup?.length || 0) * 2;
    const exerciseTime = (workout.exercises || []).reduce((total, ex) => {
        const setTime = (ex.sets || 3) * 0.75; // 45 sec per set avg
        const restTime = ((ex.sets || 3) - 1) * (ex.rest_seconds || 60) / 60;
        return total + setTime + restTime;
    }, 0);
    const cooldownTime = (workout.cooldown?.length || 0) * 2;
    return Math.round(warmupTime + exerciseTime + cooldownTime);
}

function serializeWorkoutPlan(plan) {
    return {
        ...plan,
        workout: JSON.stringify(plan.workout),
        muscle_groups: JSON.stringify(plan.muscle_groups)
    };
}

function deserializeWorkoutPlan(row) {
    if (!row) return null;
    return {
        ...row,
        workout: JSON.parse(row.workout || '{}'),
        muscle_groups: JSON.parse(row.muscle_groups || '[]')
    };
}

module.exports = {
    DEFAULT_WORKOUT_PLAN,
    createExercise,
    createWorkoutPlan,
    calculateWorkoutDuration,
    serializeWorkoutPlan,
    deserializeWorkoutPlan
};
