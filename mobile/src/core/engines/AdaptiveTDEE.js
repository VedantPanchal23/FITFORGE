/**
 * Adaptive TDEE Engine
 * Dynamic energy expenditure based on actual activity, not static multipliers
 */

const { ACTIVITY_MULTIPLIERS } = require('../utils/constants');

/**
 * NEAT (Non-Exercise Activity Thermogenesis) estimates based on lifestyle
 */
const NEAT_ESTIMATES = {
    desk_job_at_home: 200,      // Work from home, mostly sitting
    desk_job_office: 350,       // Office job with some walking
    standing_job: 500,          // Retail, teaching
    light_active_job: 700,      // Walking job, light manual work
    physical_job: 900,          // Construction, delivery
    very_physical_job: 1200     // Heavy labor
};

/**
 * Exercise calorie burn estimates (per hour, adjusts for weight)
 */
const EXERCISE_CALORIES_PER_HOUR = {
    // Home workouts
    bodyweight_light: { base: 200, perKg: 3 },
    bodyweight_moderate: { base: 300, perKg: 4.5 },
    bodyweight_intense: { base: 400, perKg: 6 },

    // Cardio
    walking_slow: { base: 150, perKg: 2 },
    walking_brisk: { base: 250, perKg: 3.5 },
    running_light: { base: 400, perKg: 6 },
    running_moderate: { base: 500, perKg: 8 },
    running_intense: { base: 600, perKg: 10 },
    cycling_light: { base: 200, perKg: 3 },
    cycling_moderate: { base: 350, perKg: 5 },

    // Other
    yoga: { base: 150, perKg: 2.5 },
    stretching: { base: 100, perKg: 1.5 },
    hiit: { base: 450, perKg: 7 }
};

/**
 * Calculate BMR using Mifflin-St Jeor
 */
function calculateBMR({ gender, weightKg, heightCm, age }) {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * Calculate NEAT based on job type and lifestyle
 */
function calculateNEAT(jobType, steps = 0) {
    let baseNEAT = NEAT_ESTIMATES[jobType] || 300;

    // Add step-based bonus (rough: 0.04 kcal per step)
    if (steps > 0) {
        const stepCalories = steps * 0.04;
        baseNEAT = Math.max(baseNEAT, stepCalories);
    }

    return Math.round(baseNEAT);
}

/**
 * Calculate exercise calorie burn
 */
function calculateExerciseBurn(workoutType, durationMinutes, weightKg) {
    const workout = EXERCISE_CALORIES_PER_HOUR[workoutType];
    if (!workout) {
        // Default to moderate bodyweight
        const defaultWorkout = EXERCISE_CALORIES_PER_HOUR.bodyweight_moderate;
        return Math.round((defaultWorkout.base + defaultWorkout.perKg * weightKg) * (durationMinutes / 60));
    }

    const hourlyBurn = workout.base + workout.perKg * weightKg;
    return Math.round(hourlyBurn * (durationMinutes / 60));
}

/**
 * Thermic Effect of Food (TEF)
 * Typically 10% of calorie intake
 */
function calculateTEF(calorieIntake) {
    return Math.round(calorieIntake * 0.10);
}

/**
 * Calculate adaptive TDEE using component method
 * TDEE = BMR + NEAT + Exercise + TEF
 */
function calculateAdaptiveTDEE({
    gender,
    weightKg,
    heightCm,
    age,
    jobType = 'desk_job_office',
    steps = 0,
    workouts = [], // Array of { type, durationMinutes }
    estimatedIntake = null
}) {
    const bmr = calculateBMR({ gender, weightKg, heightCm, age });
    const neat = calculateNEAT(jobType, steps);

    // Calculate exercise burn
    let exerciseBurn = 0;
    workouts.forEach(workout => {
        exerciseBurn += calculateExerciseBurn(workout.type, workout.durationMinutes, weightKg);
    });

    // TEF - use estimated intake or estimate from BMR
    const estimatedCalories = estimatedIntake || (bmr * 1.5);
    const tef = calculateTEF(estimatedCalories);

    const tdee = bmr + neat + exerciseBurn + tef;

    return {
        total: Math.round(tdee),
        components: {
            bmr,
            neat,
            exercise: exerciseBurn,
            tef
        },
        breakdown: {
            bmrPercent: Math.round((bmr / tdee) * 100),
            neatPercent: Math.round((neat / tdee) * 100),
            exercisePercent: Math.round((exerciseBurn / tdee) * 100),
            tefPercent: Math.round((tef / tdee) * 100)
        }
    };
}

/**
 * Compare static vs adaptive TDEE
 */
function compareToStaticTDEE({
    gender,
    weightKg,
    heightCm,
    age,
    activityLevel,
    jobType,
    steps,
    workouts
}) {
    const bmr = calculateBMR({ gender, weightKg, heightCm, age });

    // Static method
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
    const staticTDEE = Math.round(bmr * multiplier);

    // Adaptive method
    const adaptiveResult = calculateAdaptiveTDEE({
        gender, weightKg, heightCm, age, jobType, steps, workouts
    });

    const difference = adaptiveResult.total - staticTDEE;

    return {
        static: staticTDEE,
        adaptive: adaptiveResult.total,
        difference,
        differencePercent: Math.round((difference / staticTDEE) * 100),
        recommendation: difference > 200
            ? 'Adaptive TDEE suggests higher energy needs'
            : difference < -200
                ? 'Static method may be overestimating'
                : 'Both methods agree within reasonable range',
        components: adaptiveResult.components
    };
}

/**
 * Adjust TDEE based on actual weight changes
 * The gold standard: if you're not losing/gaining as expected, TDEE estimate is wrong
 */
function calibrateTDEEFromWeight({
    currentTDEE,
    targetDeficitOrSurplus,
    actualWeightChange, // kg, positive = gain, negative = loss
    periodDays = 7
}) {
    // 1 kg of body mass ≈ 7700 kcal (mix of fat and muscle)
    const expectedChange = (targetDeficitOrSurplus * periodDays) / 7700;

    const difference = actualWeightChange - expectedChange;

    // If actual loss is less than expected, TDEE is lower than estimated
    // If actual loss is more than expected, TDEE is higher than estimated
    const tdeeAdjustment = Math.round((difference * 7700) / periodDays);

    return {
        expectedChange: Math.round(expectedChange * 100) / 100,
        actualChange: actualWeightChange,
        difference: Math.round(difference * 100) / 100,
        suggestedTDEE: currentTDEE + tdeeAdjustment,
        adjustment: tdeeAdjustment,
        confidence: periodDays >= 14 ? 'high' : periodDays >= 7 ? 'moderate' : 'low',
        note: tdeeAdjustment > 100
            ? 'Your actual TDEE appears higher than estimated'
            : tdeeAdjustment < -100
                ? 'Your actual TDEE appears lower than estimated'
                : 'Current TDEE estimate appears accurate'
    };
}

/**
 * Adjust TDEE based on daily factors (fatigue, recovery, stress)
 */
function getDailyTDEEMultiplier(dailyLog) {
    let multiplier = 1.0;

    // Fatigue reduces NEAT
    if (dailyLog.energy_level != null && dailyLog.energy_level <= 2) {
        multiplier -= 0.05; // 5% reduction
    }

    // High stress can increase or decrease (we assume slight increase due to cortisol)
    if (dailyLog.stress_level != null && dailyLog.stress_level >= 4) {
        multiplier += 0.02;
    }

    // Poor sleep reduces NEAT
    if (dailyLog.sleep_hours != null && dailyLog.sleep_hours < 6) {
        multiplier -= 0.05;
    }

    // High soreness reduces activity
    if (dailyLog.soreness_level != null && dailyLog.soreness_level >= 4) {
        multiplier -= 0.08;
    }

    return Math.max(0.85, Math.min(1.10, multiplier));
}

/**
 * Generate weekly TDEE summary
 */
function generateWeeklyTDEESummary(dailyLogs, baselineComponents) {
    if (dailyLogs.length === 0) {
        return {
            averageTDEE: baselineComponents.bmr * 1.5,
            note: 'No logs available'
        };
    }

    let totalExercise = 0;
    let daysWithWorkout = 0;
    let avgMultiplier = 0;

    dailyLogs.forEach(log => {
        if (log.workout_done) {
            daysWithWorkout++;
            totalExercise += 250; // Estimate per workout
        }
        avgMultiplier += getDailyTDEEMultiplier(log);
    });

    avgMultiplier /= dailyLogs.length;

    const baseTDEE = baselineComponents.bmr + baselineComponents.neat + baselineComponents.tef;
    const adjustedBase = baseTDEE * avgMultiplier;
    const avgExercise = totalExercise / 7;
    const weeklyAvgTDEE = Math.round(adjustedBase + avgExercise);

    return {
        averageTDEE: weeklyAvgTDEE,
        workoutDays: daysWithWorkout,
        multiplierUsed: Math.round(avgMultiplier * 100) / 100,
        components: {
            base: Math.round(adjustedBase),
            exercise: Math.round(avgExercise)
        }
    };
}

module.exports = {
    NEAT_ESTIMATES,
    EXERCISE_CALORIES_PER_HOUR,
    calculateBMR,
    calculateNEAT,
    calculateExerciseBurn,
    calculateTEF,
    calculateAdaptiveTDEE,
    compareToStaticTDEE,
    calibrateTDEEFromWeight,
    getDailyTDEEMultiplier,
    generateWeeklyTDEESummary
};
