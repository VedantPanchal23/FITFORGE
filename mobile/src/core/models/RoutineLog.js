/**
 * RoutineLog Model
 * Tracks daily habits, wake/sleep times, discipline score
 */

const createRoutineLog = (data = {}) => {
    const today = new Date().toISOString().split('T')[0];

    return {
        date: data.date || today,

        // Schedule
        wake_time: data.wake_time || null, // 'HH:MM' format
        sleep_time: data.sleep_time || null,

        // Habits with completion
        habits: data.habits || [
            { id: 'morning_routine', name: 'Morning Routine', done: false },
            { id: 'workout', name: 'Workout', done: false },
            { id: 'healthy_meals', name: 'Healthy Meals', done: false },
            { id: 'no_junk', name: 'No Junk Food', done: false },
            { id: 'water_goal', name: 'Water Goal', done: false },
            { id: 'sleep_goal', name: 'Sleep on Time', done: false }
        ],

        // Focus/productivity
        focus_hours: data.focus_hours || 0, // study/work hours
        distractions_avoided: data.distractions_avoided || false,

        // Notes
        notes: data.notes || ''
    };
};

const validateRoutineLog = (log) => {
    const errors = [];

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (log.wake_time && !timeRegex.test(log.wake_time)) {
        errors.push('Wake time must be in HH:MM format');
    }

    if (log.sleep_time && !timeRegex.test(log.sleep_time)) {
        errors.push('Sleep time must be in HH:MM format');
    }

    if (!Array.isArray(log.habits)) {
        errors.push('Habits must be an array');
    }

    return { valid: errors.length === 0, errors };
};

// Calculate discipline score (0-100)
const calculateDisciplineScore = (log) => {
    if (!log.habits || log.habits.length === 0) return 0;

    const habitsCompleted = log.habits.filter(h => h.done).length;
    const habitsTotal = log.habits.length;

    let score = (habitsCompleted / habitsTotal) * 80; // 80% from habits

    // Bonus for schedule adherence
    if (log.wake_time) score += 5;
    if (log.sleep_time) score += 5;

    // Bonus for focus
    if (log.focus_hours >= 4) score += 5;
    if (log.distractions_avoided) score += 5;

    return Math.min(100, Math.round(score));
};

// Get habit streak for a specific habit across logs
const getHabitStreak = (habitId, logs) => {
    let streak = 0;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const log of sortedLogs) {
        const habit = log.habits?.find(h => h.id === habitId);
        if (habit?.done) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

module.exports = {
    createRoutineLog,
    validateRoutineLog,
    calculateDisciplineScore,
    getHabitStreak
};
