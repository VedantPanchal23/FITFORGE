/**
 * LooksLog Model
 * Tracks daily skincare, grooming, and facial exercise completion
 */

const createLooksLog = (data = {}) => {
    const today = new Date().toISOString().split('T')[0];

    return {
        date: data.date || today,

        // Skincare routines
        morning_routine_done: data.morning_routine_done || false,
        evening_routine_done: data.evening_routine_done || false,

        // Products used (for tracking what works)
        skincare_products_used: data.skincare_products_used || [],

        // Grooming tasks with completion status
        grooming_tasks: data.grooming_tasks || [
            { task: 'Face wash', done: false },
            { task: 'Moisturizer', done: false },
            { task: 'Sunscreen', done: false }
        ],

        // Facial exercises
        facial_exercises_done: data.facial_exercises_done || false,
        mewing_minutes: data.mewing_minutes || 0,

        // Hair care
        hair_routine_done: data.hair_routine_done || false,

        // Notes
        skin_condition_notes: data.skin_condition_notes || ''
    };
};

const validateLooksLog = (log) => {
    const errors = [];

    if (!Array.isArray(log.grooming_tasks)) {
        errors.push('Grooming tasks must be an array');
    }

    if (log.mewing_minutes < 0) {
        errors.push('Mewing minutes cannot be negative');
    }

    return { valid: errors.length === 0, errors };
};

// Calculate looks routine completion percentage
const calculateLooksScore = (log) => {
    let completed = 0;
    let total = 4; // morning, evening, facial, hair

    if (log.morning_routine_done) completed++;
    if (log.evening_routine_done) completed++;
    if (log.facial_exercises_done) completed++;
    if (log.hair_routine_done) completed++;

    // Add grooming task completion
    if (log.grooming_tasks && log.grooming_tasks.length > 0) {
        const groomingDone = log.grooming_tasks.filter(t => t.done).length;
        const groomingTotal = log.grooming_tasks.length;
        completed += groomingDone / groomingTotal;
        total++;
    }

    return Math.round((completed / total) * 100);
};

module.exports = {
    createLooksLog,
    validateLooksLog,
    calculateLooksScore
};
