/**
 * Safety Validator
 * Final safety checks before plan generation
 */

const { CALORIE_LIMITS, ADJUSTMENT_LIMITS } = require('../utils/constants');

function validateCalorieSafety(targetCalories, gender, tdee) {
    const minCalories = gender === 'male' ? CALORIE_LIMITS.minMale : CALORIE_LIMITS.minFemale;
    const warnings = [];
    let adjustedCalories = targetCalories;

    if (targetCalories < minCalories) {
        warnings.push(`Calories (${targetCalories}) below safe minimum. Adjusted to ${minCalories}.`);
        adjustedCalories = minCalories;
    }

    const deficit = tdee - targetCalories;
    if (deficit > CALORIE_LIMITS.maxDeficit) {
        const safeCalories = tdee - CALORIE_LIMITS.maxDeficit;
        warnings.push(`Deficit of ${deficit} kcal exceeds max safe deficit. Adjusted to ${safeCalories}.`);
        adjustedCalories = Math.max(adjustedCalories, safeCalories);
    }

    return { safe: warnings.length === 0, warnings, adjustedCalories };
}

function validateProteinSafety(proteinGrams, weightKg) {
    const proteinPerKg = proteinGrams / weightKg;
    const warnings = [];
    let adjustedProtein = proteinGrams;

    if (proteinPerKg < ADJUSTMENT_LIMITS.minProtein) {
        adjustedProtein = Math.round(weightKg * ADJUSTMENT_LIMITS.minProtein);
        warnings.push(`Protein (${proteinGrams}g) below minimum. Adjusted to ${adjustedProtein}g.`);
    }

    if (proteinPerKg > 3.0) {
        adjustedProtein = Math.round(weightKg * 2.5);
        warnings.push(`Protein (${proteinGrams}g) exceeds safe maximum. Adjusted to ${adjustedProtein}g.`);
    }

    return { safe: warnings.length === 0, warnings, adjustedProtein };
}

function validateWorkoutSafety(workoutPlan, recoveryStatus, consecutiveWorkoutDays) {
    const warnings = [];
    let modifications = [];

    // Check recovery status
    if (recoveryStatus && recoveryStatus.status === 'poor') {
        warnings.push('Recovery status is poor. Consider reducing workout intensity.');
        modifications.push({ type: 'reduce_intensity', reason: 'poor_recovery' });
    }

    // Check consecutive workout days
    if (consecutiveWorkoutDays >= 5) {
        warnings.push('5+ consecutive workout days. Rest day recommended.');
        modifications.push({ type: 'add_rest_day', reason: 'consecutive_days' });
    }

    // Check for injury-affected muscle groups
    if (workoutPlan && workoutPlan.muscle_groups) {
        // This would be checked against profile injuries
        // Implementation in WorkoutEngine
    }

    return { safe: warnings.length === 0, warnings, modifications };
}

function validateAdaptationSafety(proposedChange, currentValue, changeType) {
    const limits = {
        calories: ADJUSTMENT_LIMITS.caloriesPerDay,
        protein: 10, // max 10g change per day
        volume: 0.2  // max 20% change
    };

    const maxChange = limits[changeType] || 0;
    const actualChange = Math.abs(proposedChange - currentValue);

    if (actualChange > maxChange) {
        const safeValue = proposedChange > currentValue
            ? currentValue + maxChange
            : currentValue - maxChange;
        return {
            safe: false,
            message: `${changeType} change of ${actualChange} exceeds safe limit of ${maxChange}`,
            adjustedValue: safeValue
        };
    }

    return { safe: true, adjustedValue: proposedChange };
}

function runAllSafetyChecks(profile, targets) {
    const results = {
        passed: true,
        warnings: [],
        adjustments: {}
    };

    // Calorie safety
    const calorieCheck = validateCalorieSafety(targets.calories, profile.gender, profile.tdee);
    if (!calorieCheck.safe) {
        results.warnings.push(...calorieCheck.warnings);
        results.adjustments.calories = calorieCheck.adjustedCalories;
    }

    // Protein safety
    const proteinCheck = validateProteinSafety(targets.protein, profile.weight_kg);
    if (!proteinCheck.safe) {
        results.warnings.push(...proteinCheck.warnings);
        results.adjustments.protein = proteinCheck.adjustedProtein;
    }

    results.passed = results.warnings.length === 0;
    return results;
}

module.exports = {
    validateCalorieSafety,
    validateProteinSafety,
    validateWorkoutSafety,
    validateAdaptationSafety,
    runAllSafetyChecks
};
