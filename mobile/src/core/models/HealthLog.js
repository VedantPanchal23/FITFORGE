/**
 * HealthLog Model
 * Tracks daily health metrics: sleep, energy, stress, water, mood, etc.
 */

const createHealthLog = (data = {}) => {
    const today = new Date().toISOString().split('T')[0];

    return {
        date: data.date || today,

        // Sleep
        sleep_hours: data.sleep_hours || null,
        sleep_quality: data.sleep_quality || null, // 'poor' | 'average' | 'good'

        // Energy & Stress (1-10 scale)
        energy_level: data.energy_level || null,
        stress_level: data.stress_level || null,

        // Hydration
        water_glasses: data.water_glasses || 0,

        // Digestion
        digestion_quality: data.digestion_quality || null, // 'poor' | 'average' | 'good'

        // Mental Health
        mood: data.mood || null, // 1-10
        screen_time_hours: data.screen_time_hours || null,
        breathing_exercise_done: data.breathing_exercise_done || false,

        // Notes
        notes: data.notes || ''
    };
};

const validateHealthLog = (log) => {
    const errors = [];

    if (log.sleep_hours !== null && (log.sleep_hours < 0 || log.sleep_hours > 24)) {
        errors.push('Sleep hours must be between 0 and 24');
    }

    if (log.sleep_quality && !['poor', 'average', 'good'].includes(log.sleep_quality)) {
        errors.push('Sleep quality must be poor, average, or good');
    }

    if (log.energy_level !== null && (log.energy_level < 1 || log.energy_level > 10)) {
        errors.push('Energy level must be between 1 and 10');
    }

    if (log.stress_level !== null && (log.stress_level < 1 || log.stress_level > 10)) {
        errors.push('Stress level must be between 1 and 10');
    }

    if (log.mood !== null && (log.mood < 1 || log.mood > 10)) {
        errors.push('Mood must be between 1 and 10');
    }

    if (log.water_glasses < 0) {
        errors.push('Water glasses cannot be negative');
    }

    return { valid: errors.length === 0, errors };
};

// Get health score for a log (0-100)
const calculateHealthScore = (log) => {
    let score = 0;
    let factors = 0;

    // Sleep (30 points max)
    if (log.sleep_hours !== null) {
        const sleepScore = Math.min(30, (log.sleep_hours / 8) * 30);
        score += sleepScore;
        factors++;
    }

    // Water (20 points max)
    if (log.water_glasses > 0) {
        const waterScore = Math.min(20, (log.water_glasses / 8) * 20);
        score += waterScore;
        factors++;
    }

    // Energy (20 points max)
    if (log.energy_level !== null) {
        score += (log.energy_level / 10) * 20;
        factors++;
    }

    // Stress inverse (15 points max - lower stress = higher score)
    if (log.stress_level !== null) {
        score += ((10 - log.stress_level) / 10) * 15;
        factors++;
    }

    // Mood (15 points max)
    if (log.mood !== null) {
        score += (log.mood / 10) * 15;
        factors++;
    }

    return factors > 0 ? Math.round(score) : 0;
};

module.exports = {
    createHealthLog,
    validateHealthLog,
    calculateHealthScore
};
