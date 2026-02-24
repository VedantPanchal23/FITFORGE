/**
 * Menstrual Cycle Engine
 * Tracks and adjusts for female cycle phases
 */

const { FEMALE_CYCLE_PHASES } = require('../utils/constants');

/**
 * Calculate current cycle day from last period date
 */
function getCurrentCycleDay(lastPeriodDate, cycleLength = 28) {
    if (!lastPeriodDate) return null;

    const last = new Date(lastPeriodDate);
    const today = new Date();
    const diffTime = Math.abs(today - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Normalize to current cycle
    return (diffDays % cycleLength) + 1;
}

/**
 * Get current phase based on cycle day
 */
function getCurrentPhase(cycleDay, cycleLength = 28) {
    if (!cycleDay) return null;

    // Adjust phase ranges for non-28-day cycles
    const ratio = cycleLength / 28;

    for (const [phase, data] of Object.entries(FEMALE_CYCLE_PHASES)) {
        const adjustedStart = Math.round(data.dayRange[0] * ratio);
        const adjustedEnd = Math.round(data.dayRange[1] * ratio);

        if (cycleDay >= adjustedStart && cycleDay <= adjustedEnd) {
            return {
                phase,
                ...data,
                cycleDay,
                daysInPhase: cycleDay - adjustedStart + 1,
                daysRemaining: adjustedEnd - cycleDay
            };
        }
    }

    // Default to luteal for days past ovulation
    return {
        phase: 'luteal',
        ...FEMALE_CYCLE_PHASES.luteal,
        cycleDay
    };
}

/**
 * Get TDEE adjustment for current phase
 */
function getCycleTDEEAdjustment(profile) {
    if (!profile.tracks_menstrual_cycle || profile.gender !== 'female') {
        return { adjustment: 0, reason: null };
    }

    const cycleDay = getCurrentCycleDay(profile.last_period_date, profile.cycle_length);
    const phase = getCurrentPhase(cycleDay, profile.cycle_length);

    if (!phase) {
        return { adjustment: 0, reason: 'Cycle data not available' };
    }

    return {
        adjustment: phase.tdeeAdjust || 0,
        reason: phase.notes,
        phase: phase.phase,
        cycleDay
    };
}

/**
 * Get workout recommendation for current phase
 */
function getPhaseWorkoutAdvice(phase) {
    const advice = {
        menstrual: {
            intensity: 'reduce',
            suggestion: 'Light activity, yoga, walking. Heavy lifts optional based on energy.',
            avoidIfNeeded: ['high_intensity', 'heavy_compound'],
            benefit: 'Listen to your body - rest is productive during this phase'
        },
        follicular: {
            intensity: 'increase',
            suggestion: 'Best time for PRs, heavy lifting, and challenging workouts.',
            prioritize: ['strength', 'high_intensity', 'new_exercises'],
            benefit: 'Higher pain tolerance and faster recovery in this phase'
        },
        ovulation: {
            intensity: 'peak',
            suggestion: 'Peak performance days. Push your limits!',
            prioritize: ['max_effort', 'personal_records'],
            benefit: 'Highest energy and strength of the cycle'
        },
        luteal: {
            intensity: 'moderate',
            suggestion: 'Maintain workouts but don\'t expect PRs. Focus on consistency.',
            note: 'Water retention is normal - ignore scale fluctuations',
            benefit: 'Good time for moderate steady-state work'
        }
    };

    return advice[phase] || advice.luteal;
}

/**
 * Get nutrition advice for current phase
 */
function getPhaseNutritionAdvice(phase) {
    const advice = {
        menstrual: {
            focus: ['iron_rich_foods', 'vitamin_c', 'hydration'],
            notes: 'Iron loss during menstruation. Pair iron foods with vitamin C.',
            cravings: 'Some cravings normal. Dark chocolate is fine in moderation.',
            foods: ['spinach', 'lentils', 'dates', 'orange', 'dark_chocolate']
        },
        follicular: {
            focus: ['protein', 'complex_carbs'],
            notes: 'Rising estrogen supports muscle building. Good time for higher carbs.',
            foods: ['eggs', 'chicken', 'oats', 'sweet_potato']
        },
        ovulation: {
            focus: ['antioxidants', 'fiber', 'lean_protein'],
            notes: 'Appetite may decrease naturally. Support with nutrient-dense foods.',
            foods: ['berries', 'leafy_greens', 'fish', 'quinoa']
        },
        luteal: {
            focus: ['magnesium', 'calcium', 'complex_carbs'],
            notes: 'Increased hunger is NORMAL. Add 100-200 calories if needed.',
            cravings: 'Carb cravings are hormonal. Choose healthy carbs.',
            foods: ['banana', 'almonds', 'yogurt', 'dark_chocolate', 'whole_grains']
        }
    };

    return advice[phase] || advice.luteal;
}

/**
 * Predict next period date
 */
function predictNextPeriod(lastPeriodDate, cycleLength = 28) {
    if (!lastPeriodDate) return null;

    const next = new Date(lastPeriodDate);
    next.setDate(next.getDate() + cycleLength);
    return next.toISOString().split('T')[0];
}

/**
 * Get full cycle status for display
 */
function getCycleStatus(profile) {
    if (!profile.tracks_menstrual_cycle || profile.gender !== 'female') {
        return null;
    }

    const cycleDay = getCurrentCycleDay(profile.last_period_date, profile.cycle_length);
    const phase = getCurrentPhase(cycleDay, profile.cycle_length);

    if (!phase) {
        return {
            tracking: true,
            needsUpdate: true,
            message: 'Please update your last period date'
        };
    }

    return {
        tracking: true,
        cycleDay,
        phase: phase.phase,
        phaseDisplay: phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1),
        daysRemaining: phase.daysRemaining,
        notes: phase.notes,
        cravingsNormal: phase.cravingsNormal,
        waterRetention: phase.waterRetention || false,
        tdeeAdjustment: phase.tdeeAdjust,
        workoutAdvice: getPhaseWorkoutAdvice(phase.phase),
        nutritionAdvice: getPhaseNutritionAdvice(phase.phase),
        nextPeriod: predictNextPeriod(profile.last_period_date, profile.cycle_length)
    };
}

/**
 * Log period start
 */
function logPeriodStart(profile, date = null) {
    const periodDate = date || new Date().toISOString().split('T')[0];

    return {
        ...profile,
        last_period_date: periodDate,
        updated_at: new Date().toISOString()
    };
}

module.exports = {
    getCurrentCycleDay,
    getCurrentPhase,
    getCycleTDEEAdjustment,
    getPhaseWorkoutAdvice,
    getPhaseNutritionAdvice,
    predictNextPeriod,
    getCycleStatus,
    logPeriodStart
};
