/**
 * Enhanced Daily Log Model
 * Includes psychology layer, detailed feedback, and behavioral tracking
 */

/**
 * Create default daily log with all fields
 */
function createDailyLog(date) {
    return {
        log_date: date || new Date().toISOString().split('T')[0],

        // === FOOD TRACKING ===
        food_compliance_percent: null,      // 0-100
        protein_completion_percent: null,   // 0-100
        carbs_completion_percent: null,     // 0-100
        fats_completion_percent: null,      // 0-100
        water_glasses: null,                // actual count
        fiber_adequate: null,               // true/false
        meals_on_time: null,                // true/false

        // === WORKOUT TRACKING ===
        workout_done: false,
        workout_skipped_reason: null,       // NEW: 'no_time', 'fatigue', 'sick', 'injury', 'motivation', 'forgot', 'other'
        workout_difficulty_felt: null,      // 1-5 (1=too easy, 5=too hard)
        workout_completion_percent: null,   // 0-100

        // === PHYSICAL STATUS ===
        energy_level: null,                 // 1-5
        sleep_hours: null,
        sleep_quality: null,                // 1-5 (NEW: separate from hours)
        soreness_level: null,               // 0-5 (0=none, 5=severe)
        soreness_areas: [],                 // NEW: ['legs', 'back', 'shoulders', etc]
        weight_kg: null,                    // optional

        // === PSYCHOLOGY LAYER (NEW) ===
        mood: null,                         // 1-5
        stress_level: null,                 // 1-5
        stress_source: null,                // 'work', 'family', 'health', 'financial', 'relationship', 'none', 'other'
        motivation_level: null,             // 1-5

        // === DIGESTION FEEDBACK (NEW) ===
        appetite_level: null,               // 'low', 'normal', 'high', 'excessive'
        digestion_quality: null,            // 'poor', 'normal', 'good'
        bloating: false,
        acidity: false,
        bowel_movement: null,               // 'none', 'normal', 'loose', 'constipated'

        // === LOOKSMAXING TRACKING ===
        skincare_done: false,
        facial_exercises_done: false,
        mewing_minutes: null,

        // === NOTES ===
        notes: null,                        // free text

        // === META ===
        created_at: new Date().toISOString()
    };
}

/**
 * Workout skip reasons with weights for adaptation
 */
const SKIP_REASONS = {
    no_time: { adaptable: false, recurring_concern: true, priority: 'schedule' },
    fatigue: { adaptable: true, suggests: 'reduce_intensity', priority: 'recovery' },
    sick: { adaptable: true, suggests: 'rest_day', priority: 'health' },
    injury: { adaptable: true, suggests: 'modify_exercises', priority: 'health' },
    motivation: { adaptable: true, suggests: 'reduce_volume', priority: 'psychology' },
    forgot: { adaptable: false, suggests: 'reminder', priority: 'habit' },
    weather: { adaptable: false, priority: 'environment' },
    travel: { adaptable: false, priority: 'schedule' },
    other: { adaptable: false, priority: 'unknown' }
};

/**
 * Calculate overall compliance score with weighted factors
 */
function calculateOverallCompliance(log) {
    const weights = {
        food: 0.30,
        protein: 0.25,
        workout: 0.20,
        water: 0.10,
        sleep: 0.15
    };

    let score = 0;
    let totalWeight = 0;

    if (log.food_compliance_percent != null) {
        score += log.food_compliance_percent * weights.food;
        totalWeight += weights.food;
    }

    if (log.protein_completion_percent != null) {
        score += log.protein_completion_percent * weights.protein;
        totalWeight += weights.protein;
    }

    if (log.workout_done) {
        const workoutScore = log.workout_completion_percent || 100;
        score += workoutScore * weights.workout;
        totalWeight += weights.workout;
    } else if (log.workout_skipped_reason) {
        // Give partial credit for valid reasons
        if (['sick', 'injury'].includes(log.workout_skipped_reason)) {
            score += 80 * weights.workout; // Not penalized much
        } else if (log.workout_skipped_reason === 'fatigue') {
            score += 50 * weights.workout;
        }
        totalWeight += weights.workout;
    }

    if (log.water_glasses != null) {
        const waterTarget = 8;
        const waterScore = Math.min(100, (log.water_glasses / waterTarget) * 100);
        score += waterScore * weights.water;
        totalWeight += weights.water;
    }

    if (log.sleep_hours != null) {
        const sleepTarget = 7.5;
        const sleepScore = Math.min(100, (log.sleep_hours / sleepTarget) * 100);
        score += sleepScore * weights.sleep;
        totalWeight += weights.sleep;
    }

    return totalWeight > 0 ? Math.round(score / totalWeight) : null;
}

/**
 * Analyze recovery status from log
 */
function analyzeRecoveryStatus(log) {
    let score = 100;
    const issues = [];
    const recommendations = [];

    // Sleep impact
    if (log.sleep_hours != null) {
        if (log.sleep_hours < 6) {
            score -= 30;
            issues.push('critical_sleep_deficit');
            recommendations.push('Priority: Get 8+ hours tonight');
        } else if (log.sleep_hours < 7) {
            score -= 15;
            issues.push('mild_sleep_deficit');
        }
    }

    if (log.sleep_quality != null && log.sleep_quality <= 2) {
        score -= 15;
        issues.push('poor_sleep_quality');
    }

    // Soreness impact
    if (log.soreness_level != null) {
        if (log.soreness_level >= 4) {
            score -= 25;
            issues.push('high_soreness');
            recommendations.push('Active recovery recommended, avoid intense training');
        } else if (log.soreness_level >= 3) {
            score -= 10;
            issues.push('moderate_soreness');
        }
    }

    // Energy impact
    if (log.energy_level != null && log.energy_level <= 2) {
        score -= 20;
        issues.push('low_energy');
        recommendations.push('Check nutrition and sleep adequacy');
    }

    // Stress impact
    if (log.stress_level != null && log.stress_level >= 4) {
        score -= 15;
        issues.push('high_stress');
        recommendations.push('Include stress-reduction activity today');
    }

    // Determine status
    let status;
    if (score >= 85) status = 'excellent';
    else if (score >= 70) status = 'good';
    else if (score >= 50) status = 'moderate';
    else status = 'poor';

    return {
        score: Math.max(0, score),
        status,
        issues,
        recommendations,
        canTrainIntense: score >= 70 && !issues.includes('high_soreness')
    };
}

/**
 * Analyze psychological state
 */
function analyzePsychologicalState(log) {
    const state = {
        overall: 'neutral',
        concerns: [],
        recommendations: []
    };

    // Motivation analysis
    if (log.motivation_level != null) {
        if (log.motivation_level <= 2) {
            state.concerns.push('low_motivation');
            state.recommendations.push('Set a small, achievable goal for today');

            if (log.workout_skipped_reason === 'motivation') {
                state.concerns.push('motivation_affecting_workouts');
                state.recommendations.push('Consider reducing workout duration temporarily');
            }
        }
    }

    // Stress analysis
    if (log.stress_level != null && log.stress_level >= 4) {
        state.concerns.push('high_stress');

        if (log.stress_source && log.stress_source !== 'none') {
            state.concerns.push(`stress_from_${log.stress_source}`);
        }

        state.recommendations.push('Include 10 min relaxation/breathing today');
    }

    // Mood analysis
    if (log.mood != null && log.mood <= 2) {
        state.concerns.push('low_mood');
        state.recommendations.push('Consider outdoor activity or social connection');
    }

    // Correlate with behavior
    if (log.appetite_level === 'excessive' && log.stress_level >= 3) {
        state.concerns.push('stress_eating_risk');
        state.recommendations.push('Plan meals ahead, have healthy snacks available');
    }

    if (log.appetite_level === 'low' && (log.mood <= 2 || log.stress_level >= 4)) {
        state.concerns.push('stress_appetite_suppression');
        state.recommendations.push('Eat small, nutrient-dense meals even if not hungry');
    }

    // Overall state
    if (state.concerns.length === 0) {
        state.overall = 'positive';
    } else if (state.concerns.length <= 2) {
        state.overall = 'manageable';
    } else {
        state.overall = 'needs_attention';
    }

    return state;
}

/**
 * Analyze digestion status
 */
function analyzeDigestionStatus(log) {
    const status = {
        overall: 'good',
        issues: [],
        recommendations: []
    };

    if (log.digestion_quality === 'poor') {
        status.issues.push('poor_digestion');
        status.recommendations.push('Eat slowly, chew thoroughly');
        status.recommendations.push('Include probiotic food (curd/buttermilk)');
    }

    if (log.bloating) {
        status.issues.push('bloating');
        status.recommendations.push('Avoid gas-forming foods today');
        status.recommendations.push('Take a short walk after meals');
    }

    if (log.acidity) {
        status.issues.push('acidity');
        status.recommendations.push('Avoid spicy/oily foods');
        status.recommendations.push('Don\'t lie down immediately after eating');
    }

    if (log.bowel_movement === 'constipated') {
        status.issues.push('constipation');
        status.recommendations.push('Increase fiber and water intake');
        status.recommendations.push('Include papaya or prunes');
    }

    if (log.bowel_movement === 'loose') {
        status.issues.push('loose_motions');
        status.recommendations.push('Stick to bland, easily digestible foods');
        status.recommendations.push('Stay hydrated');
    }

    if (status.issues.length > 2) {
        status.overall = 'poor';
    } else if (status.issues.length > 0) {
        status.overall = 'moderate';
    }

    return status;
}

/**
 * Get skip reason details
 */
function getSkipReasonDetails(reason) {
    return SKIP_REASONS[reason] || SKIP_REASONS.other;
}

/**
 * Validate daily log
 */
function validateDailyLog(log) {
    const errors = [];

    // Date required
    if (!log.log_date) {
        errors.push('Log date is required');
    }

    // Range validations
    const rangeFields = [
        { field: 'food_compliance_percent', min: 0, max: 100 },
        { field: 'protein_completion_percent', min: 0, max: 100 },
        { field: 'energy_level', min: 1, max: 5 },
        { field: 'mood', min: 1, max: 5 },
        { field: 'stress_level', min: 1, max: 5 },
        { field: 'motivation_level', min: 1, max: 5 },
        { field: 'sleep_quality', min: 1, max: 5 },
        { field: 'soreness_level', min: 0, max: 5 },
        { field: 'workout_difficulty_felt', min: 1, max: 5 }
    ];

    rangeFields.forEach(({ field, min, max }) => {
        if (log[field] != null && (log[field] < min || log[field] > max)) {
            errors.push(`${field} must be between ${min} and ${max}`);
        }
    });

    // Valid skip reason
    if (log.workout_skipped_reason && !SKIP_REASONS[log.workout_skipped_reason]) {
        errors.push(`Invalid workout skip reason: ${log.workout_skipped_reason}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Generate log summary for display
 */
function generateLogSummary(log) {
    const compliance = calculateOverallCompliance(log);
    const recovery = analyzeRecoveryStatus(log);
    const psychology = analyzePsychologicalState(log);
    const digestion = analyzeDigestionStatus(log);

    return {
        date: log.log_date,
        overallCompliance: compliance,
        recovery: {
            status: recovery.status,
            score: recovery.score
        },
        psychology: {
            state: psychology.overall,
            concerns: psychology.concerns.length
        },
        digestion: {
            status: digestion.overall
        },
        highlights: generateHighlights(log, compliance, recovery, psychology),
        actionItems: [
            ...recovery.recommendations.slice(0, 2),
            ...psychology.recommendations.slice(0, 2),
            ...digestion.recommendations.slice(0, 1)
        ].slice(0, 3)
    };
}

/**
 * Generate highlights from log
 */
function generateHighlights(log, compliance, recovery, psychology) {
    const highlights = [];

    if (compliance >= 80) highlights.push('✅ Great compliance!');
    if (log.workout_done) highlights.push('💪 Workout completed');
    if (log.sleep_hours >= 7.5) highlights.push('😴 Good sleep');
    if (recovery.status === 'excellent') highlights.push('🔋 Fully recovered');
    if (log.protein_completion_percent >= 90) highlights.push('🥩 Protein target hit');
    if (log.skincare_done && log.facial_exercises_done) highlights.push('✨ Looksmaxing done');

    // Concerns
    if (compliance < 50) highlights.push('⚠️ Low compliance');
    if (recovery.status === 'poor') highlights.push('⚠️ Recovery needed');
    if (psychology.overall === 'needs_attention') highlights.push('⚠️ Check mental state');

    return highlights;
}

module.exports = {
    createDailyLog,
    SKIP_REASONS,
    calculateOverallCompliance,
    analyzeRecoveryStatus,
    analyzePsychologicalState,
    analyzeDigestionStatus,
    getSkipReasonDetails,
    validateDailyLog,
    generateLogSummary
};
