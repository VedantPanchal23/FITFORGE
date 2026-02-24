/**
 * Workout Logging Service
 * Tracks actual workout performance vs planned
 */

/**
 * Create a workout log entry
 */
function createWorkoutLogEntry({
    logDate,
    exerciseId = null,
    exerciseName,
    setsPlanned,
    setsDone,
    repsPerSet = [],
    restSeconds = 60,
    difficultyFelt = 3,
    notes = null
}) {
    return {
        log_date: logDate,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        sets_planned: setsPlanned,
        sets_done: setsDone,
        reps_per_set: JSON.stringify(repsPerSet),
        rest_seconds: restSeconds,
        difficulty_felt: difficultyFelt,
        notes,
        created_at: new Date().toISOString()
    };
}

/**
 * Calculate workout completion rate
 */
function calculateWorkoutCompletion(logEntries, plannedWorkout) {
    if (!plannedWorkout || !plannedWorkout.exercises) {
        return { completionPercent: 0, reason: 'no_planned_workout' };
    }

    const plannedExercises = plannedWorkout.exercises.length;
    const plannedTotalSets = plannedWorkout.exercises.reduce((sum, ex) => sum + (ex.sets || 3), 0);

    const doneExercises = logEntries.length;
    const doneTotalSets = logEntries.reduce((sum, entry) => sum + (entry.sets_done || 0), 0);

    const exerciseCompletion = (doneExercises / plannedExercises) * 100;
    const setCompletion = (doneTotalSets / plannedTotalSets) * 100;

    // Weight: 40% exercises, 60% sets
    const overall = Math.round(exerciseCompletion * 0.4 + setCompletion * 0.6);

    return {
        completionPercent: Math.min(100, overall),
        exercisesDone: doneExercises,
        exercisesPlanned: plannedExercises,
        setsDone: doneTotalSets,
        setsPlanned: plannedTotalSets
    };
}

/**
 * Track exercise progression over time
 */
function getExerciseProgression(exerciseId, workoutLogs, limit = 10) {
    const history = workoutLogs
        .filter(log => log.exercise_id === exerciseId)
        .slice(0, limit)
        .map(log => ({
            date: log.log_date,
            sets: log.sets_done,
            reps: JSON.parse(log.reps_per_set || '[]'),
            totalReps: JSON.parse(log.reps_per_set || '[]').reduce((a, b) => a + b, 0),
            difficulty: log.difficulty_felt
        }));

    if (history.length < 2) {
        return { hasProgression: false, history };
    }

    const oldest = history[history.length - 1];
    const newest = history[0];
    const repChange = newest.totalReps - oldest.totalReps;
    const setChange = newest.sets - oldest.sets;

    return {
        hasProgression: true,
        history,
        summary: {
            periodDays: daysBetween(oldest.date, newest.date),
            repChange,
            setChange,
            improving: repChange > 0 || setChange > 0
        }
    };
}

/**
 * Log quick workout (simplified)
 */
function quickLogWorkout(logDate, completed, difficultyFelt, skippedReason = null) {
    return {
        log_date: logDate,
        workout_done: completed ? 1 : 0,
        workout_difficulty_felt: difficultyFelt,
        workout_skipped_reason: completed ? null : skippedReason,
        quick_log: true,
        created_at: new Date().toISOString()
    };
}

/**
 * Compare actual vs planned workout
 */
function compareWorkoutPerformance(logEntries, plannedWorkout) {
    if (!plannedWorkout?.exercises) {
        return { comparable: false };
    }

    const comparison = plannedWorkout.exercises.map(planned => {
        const logged = logEntries.find(e =>
            e.exercise_id === planned.id ||
            e.exercise_name?.toLowerCase() === planned.name?.toLowerCase()
        );

        if (!logged) {
            return {
                exercise: planned.name,
                status: 'skipped',
                plannedSets: planned.sets,
                doneSets: 0
            };
        }

        const plannedSets = planned.sets || 3;
        const doneSets = logged.sets_done || 0;
        const completion = Math.round((doneSets / plannedSets) * 100);

        return {
            exercise: planned.name,
            status: doneSets >= plannedSets ? 'completed' : 'partial',
            plannedSets,
            doneSets,
            completion,
            difficulty: logged.difficulty_felt
        };
    });

    const completed = comparison.filter(c => c.status === 'completed').length;
    const partial = comparison.filter(c => c.status === 'partial').length;
    const skipped = comparison.filter(c => c.status === 'skipped').length;

    return {
        comparable: true,
        exercises: comparison,
        summary: {
            completed,
            partial,
            skipped,
            total: comparison.length,
            overallStatus: skipped > completed ? 'poor' : completed === comparison.length ? 'excellent' : 'good'
        }
    };
}

// Utility
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs(Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
}

module.exports = {
    createWorkoutLogEntry,
    calculateWorkoutCompletion,
    getExerciseProgression,
    quickLogWorkout,
    compareWorkoutPerformance
};
