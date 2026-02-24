/**
 * Body Engine
 * Calculates BMR, TDEE, target calories, and body composition metrics
 * Uses adaptive TDEE based on actual activity, not static multipliers
 */

const {
    calculateBMR,
    calculateBMRKatchMcArdle,
    calculateTDEE,
    calculateTargetCalories,
    calculateDetailedMacros,
    calculateBMI,
    getBMICategory,
    calculateIdealWeight,
    calculateWaterIntake
} = require('../utils/calculations');

const {
    calculateAdaptiveTDEE,
    compareToStaticTDEE,
    calibrateTDEEFromWeight,
    getDailyTDEEMultiplier,
    generateWeeklyTDEESummary,
    NEAT_ESTIMATES
} = require('./AdaptiveTDEE');

const { validateCalorieSafety, validateProteinSafety } = require('../validators/SafetyValidator');
const { getCycleTDEEAdjustment } = require('./MenstrualCycleEngine');
const { getConditionTDEEAdjustment, getCarbAdjustment } = require('./HealthConditionFilter');

/**
 * Calculate all body metrics for a profile using adaptive TDEE
 * @param {Object} profile - User profile
 * @param {Object} options - Additional options for adaptive calculation
 * @returns {Object} All calculated metrics
 */
function calculateBodyMetrics(profile, options = {}) {
    const { gender, age, height_cm, weight_kg, body_fat_percent, goal_type } = profile;
    const { jobType, steps, workouts, dailyLog, useAdaptive = true } = options;

    // Calculate BMR (use Katch-McArdle if body fat is known)
    let bmr;
    let bmrMethod;
    if (body_fat_percent) {
        bmr = calculateBMRKatchMcArdle(weight_kg, body_fat_percent);
        bmrMethod = 'katch_mcardle';
    } else {
        bmr = calculateBMR({ gender, weightKg: weight_kg, heightCm: height_cm, age });
        bmrMethod = 'mifflin_st_jeor';
    }

    // Calculate TDEE - use adaptive if possible
    let tdee;
    let tdeeMethod;
    let tdeeComponents = null;

    if (useAdaptive && (jobType || steps || workouts)) {
        // Use component-based adaptive TDEE
        const adaptiveResult = calculateAdaptiveTDEE({
            gender,
            weightKg: weight_kg,
            heightCm: height_cm,
            age,
            jobType: jobType || profile.job_type || 'desk_job_office',
            steps: steps || profile.daily_steps || 0,
            workouts: workouts || []
        });

        tdee = adaptiveResult.total;
        tdeeMethod = 'adaptive_component';
        tdeeComponents = adaptiveResult.components;

        // Apply daily multiplier if log provided (fatigue/sleep/energy)
        if (dailyLog) {
            const multiplier = getDailyTDEEMultiplier(dailyLog);
            tdee = Math.round(tdee * multiplier);
            tdeeComponents.dailyMultiplier = multiplier;
        }
    } else {
        // Fall back to static multiplier method
        const activityLevel = profile.activity_level || 'sedentary';
        tdee = calculateTDEE(bmr, activityLevel);
        tdeeMethod = 'static_multiplier';
    }

    // Apply menstrual cycle adjustment for females (NEW)
    let cycleAdjustment = null;
    if (profile.gender === 'female' && profile.tracks_menstrual_cycle) {
        cycleAdjustment = getCycleTDEEAdjustment(profile);
        if (cycleAdjustment.adjustment !== 0) {
            tdee += cycleAdjustment.adjustment;
        }
    }

    // Apply health condition TDEE adjustment (NEW - e.g., thyroid)
    let conditionAdjustment = null;
    if (profile.health_conditions && profile.health_conditions.length > 0) {
        conditionAdjustment = getConditionTDEEAdjustment(profile.health_conditions, tdee);
        if (conditionAdjustment.adjustmentPercent !== 0) {
            tdee = conditionAdjustment.adjustedTDEE;
        }
    }

    // Calculate target calories
    const calorieResult = calculateTargetCalories({
        tdee,
        goalType: goal_type,
        gender,
        aggressiveness: 0.5
    });

    // Validate calorie safety
    const calorieCheck = validateCalorieSafety(calorieResult.targetCalories, gender, tdee);
    const targetCalories = calorieCheck.adjustedCalories;

    // Calculate macros
    const macros = calculateDetailedMacros({
        weightKg: weight_kg,
        targetCalories,
        goalType: goal_type
    });

    // Validate protein safety
    const proteinCheck = validateProteinSafety(macros.grams.protein, weight_kg);
    if (!proteinCheck.safe) {
        macros.grams.protein = proteinCheck.adjustedProtein;
    }

    // BMI
    const bmi = calculateBMI(weight_kg, height_cm);
    const bmiCategory = getBMICategory(bmi);

    // Ideal weight
    const idealWeight = calculateIdealWeight(gender, height_cm);

    // Water intake
    const waterIntake = calculateWaterIntake(weight_kg, profile.activity_level || 'sedentary', false);

    return {
        bmr,
        bmrMethod,
        tdee,
        tdeeMethod,
        tdeeComponents,
        targetCalories,
        calorieAdjustment: calorieResult.adjustment,
        calorieExplanation: calorieResult.explanation,
        macros: macros.grams,
        macroCalories: macros.calories,
        macroPercentages: macros.percentages,
        macroPerKg: macros.perKg,
        bmi,
        bmiCategory,
        idealWeight,
        waterIntake,
        warnings: [...calorieCheck.warnings, ...proteinCheck.warnings]
    };
}

/**
 * Calculate adaptive TDEE for a specific day
 * Uses: workout done, steps, job type, fatigue status
 */
function calculateDailyTDEE(profile, dailyLog, workout = null) {
    const { gender, age, height_cm, weight_kg } = profile;

    // Build workout array
    const workouts = [];
    if (workout && dailyLog.workout_done) {
        workouts.push({
            type: getWorkoutIntensity(dailyLog.workout_difficulty_felt),
            durationMinutes: workout.estimated_duration_mins || 45
        });
    }

    const adaptiveResult = calculateAdaptiveTDEE({
        gender,
        weightKg: weight_kg,
        heightCm: height_cm,
        age,
        jobType: profile.job_type || 'desk_job_office',
        steps: dailyLog.steps || profile.daily_steps || 0,
        workouts
    });

    // Apply fatigue/sleep/energy multiplier
    const multiplier = getDailyTDEEMultiplier(dailyLog);
    const adjustedTDEE = Math.round(adaptiveResult.total * multiplier);

    return {
        baseTDEE: adaptiveResult.total,
        adjustedTDEE,
        multiplier,
        components: adaptiveResult.components,
        breakdown: adaptiveResult.breakdown
    };
}

/**
 * Map workout difficulty to intensity type
 */
function getWorkoutIntensity(difficultyFelt) {
    if (!difficultyFelt) return 'bodyweight_moderate';
    if (difficultyFelt <= 2) return 'bodyweight_light';
    if (difficultyFelt <= 3) return 'bodyweight_moderate';
    return 'bodyweight_intense';
}

/**
 * Calibrate TDEE based on actual weight changes over time
 * This is the gold standard method
 */
function calibrateTDEE(profile, weightHistory, periodDays = 14) {
    if (weightHistory.length < 2) {
        return {
            success: false,
            message: 'Need at least 2 weight measurements to calibrate'
        };
    }

    const startWeight = weightHistory[weightHistory.length - 1].weight_kg;
    const endWeight = weightHistory[0].weight_kg;
    const actualChange = endWeight - startWeight;

    // Calculate expected deficit/surplus
    const currentTDEE = profile.tdee || calculateBodyMetrics(profile).tdee;
    const targetCals = profile.target_calories;
    const dailyDifference = targetCals - currentTDEE;

    const calibration = calibrateTDEEFromWeight({
        currentTDEE,
        targetDeficitOrSurplus: dailyDifference,
        actualWeightChange: actualChange,
        periodDays
    });

    return {
        success: true,
        ...calibration,
        recommendation: calibration.suggestedTDEE !== currentTDEE
            ? `Consider updating your TDEE from ${currentTDEE} to ${calibration.suggestedTDEE} kcal`
            : 'Current TDEE estimate appears accurate'
    };
}

/**
 * Compare static vs adaptive TDEE for a profile
 */
function getTDEEComparison(profile, jobType, steps, workouts) {
    return compareToStaticTDEE({
        gender: profile.gender,
        weightKg: profile.weight_kg,
        heightCm: profile.height_cm,
        age: profile.age,
        activityLevel: profile.activity_level || 'sedentary',
        jobType: jobType || 'desk_job_office',
        steps: steps || 0,
        workouts: workouts || []
    });
}

/**
 * Weekly TDEE summary based on actual logs
 */
function getWeeklyTDEESummary(profile, dailyLogs) {
    const bmr = calculateBMR({
        gender: profile.gender,
        weightKg: profile.weight_kg,
        heightCm: profile.height_cm,
        age: profile.age
    });

    const jobNEAT = NEAT_ESTIMATES[profile.job_type || 'desk_job_office'] || 300;

    const baseComponents = {
        bmr,
        neat: jobNEAT,
        tef: Math.round(bmr * 1.5 * 0.1)
    };

    return generateWeeklyTDEESummary(dailyLogs, baseComponents);
}

/**
 * Update profile with calculated metrics
 */
function enrichProfileWithMetrics(profile, options = {}) {
    const metrics = calculateBodyMetrics(profile, options);

    return {
        ...profile,
        bmr: metrics.bmr,
        tdee: metrics.tdee,
        tdee_method: metrics.tdeeMethod,
        target_calories: metrics.targetCalories,
        protein_grams: metrics.macros.protein,
        carbs_grams: metrics.macros.carbs,
        fats_grams: metrics.macros.fats
    };
}

/**
 * Recalculate metrics after weight change
 */
function recalculateForWeightChange(profile, newWeight, options = {}) {
    const updatedProfile = { ...profile, weight_kg: newWeight };
    return calculateBodyMetrics(updatedProfile, options);
}

/**
 * Get explanation for calculated values
 */
function getMetricsExplanation(metrics, profile) {
    const tdeeExplanation = metrics.tdeeMethod === 'adaptive_component'
        ? `Your TDEE (${metrics.tdee} kcal) is calculated using components: BMR (${metrics.tdeeComponents?.bmr || '?'}), NEAT from ${profile.job_type || 'office job'} (${metrics.tdeeComponents?.neat || '?'}), exercise (${metrics.tdeeComponents?.exercise || 0}), and thermic effect of food.`
        : `Your TDEE (${metrics.tdee} kcal) is estimated using the ${profile.activity_level} activity multiplier. For more accuracy, set your job type and track actual workouts.`;

    return {
        bmr: `Your BMR (${metrics.bmr} kcal) is calculated using ${metrics.bmrMethod === 'katch_mcardle' ? 'Katch-McArdle (more accurate with known body fat)' : 'Mifflin-St Jeor'}.`,

        tdee: tdeeExplanation,

        targetCalories: `Target: ${metrics.targetCalories} kcal/day. ${metrics.calorieExplanation}`,

        protein: `${metrics.macros.protein}g protein (${metrics.macroPerKg.protein}g/kg) supports ${profile.goal_type === 'muscle_gain' ? 'muscle growth' : profile.goal_type === 'fat_loss' ? 'muscle preservation' : 'general health'}.`,

        carbs: `${metrics.macros.carbs}g carbs for training energy and recovery.`,

        fats: `${metrics.macros.fats}g fats for hormones and vitamin absorption.`,

        water: `Target: ${metrics.waterIntake.liters}L (${metrics.waterIntake.glasses} glasses) water daily.`
    };
}

/**
 * Get available job types for NEAT estimation
 */
function getJobTypes() {
    return Object.keys(NEAT_ESTIMATES).map(key => ({
        id: key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        neatCalories: NEAT_ESTIMATES[key]
    }));
}

module.exports = {
    calculateBodyMetrics,
    calculateDailyTDEE,
    calibrateTDEE,
    getTDEEComparison,
    getWeeklyTDEESummary,
    enrichProfileWithMetrics,
    recalculateForWeightChange,
    getMetricsExplanation,
    getJobTypes
};
