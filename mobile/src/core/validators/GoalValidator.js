/**
 * Goal Validator V2
 * Validates user goals for safety and realism
 * Includes BMI underweight check, max deficit duration, and body fat floors
 */

const { WEIGHT_CHANGE_LIMITS, GOAL_WARNINGS, PLATEAU_THRESHOLDS } = require('../utils/constants');
const { calculateBMI, calculateSafeTimeline } = require('../utils/calculations');

/**
 * Validate that goal is safe for user's BMI
 */
function validateBMISafety(profile) {
    const bmi = calculateBMI(profile.weight_kg, profile.height_cm);
    const errors = [];
    const warnings = [];

    // Block fat loss for underweight users
    if (bmi < 18.5 && profile.goal_type === 'fat_loss') {
        errors.push({
            type: 'underweight_deficit',
            message: 'Cannot set fat loss goal when underweight (BMI < 18.5)',
            bmi: Math.round(bmi * 10) / 10,
            suggestion: 'Consider muscle gain or health maintenance goal instead'
        });
    }

    // Warn if already low BMI
    if (bmi < 20 && profile.goal_type === 'fat_loss') {
        warnings.push({
            type: 'low_bmi_warning',
            message: `Your BMI (${bmi.toFixed(1)}) is already in the lower healthy range`,
            suggestion: 'Consider recomp (body recomposition) instead of fat loss'
        });
    }

    // Check body fat floor
    if (profile.body_fat_percent) {
        const bfFloor = profile.gender === 'male' ? 6 : 14;
        if (profile.body_fat_percent < bfFloor && profile.goal_type === 'fat_loss') {
            errors.push({
                type: 'bodyfat_floor',
                message: `Body fat (${profile.body_fat_percent}%) is already at/below healthy minimum`,
                minimum: bfFloor,
                suggestion: 'Focus on muscle gain or maintenance'
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Check if user has been in deficit too long
 */
function validateDeficitDuration(profile, weightHistory) {
    if (profile.goal_type !== 'fat_loss' || !profile.goal_start_date) {
        return { valid: true };
    }

    const startDate = new Date(profile.goal_start_date);
    const now = new Date();
    const weeksInDeficit = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
    const maxWeeks = PLATEAU_THRESHOLDS.maxConsecutiveDeficit;

    if (weeksInDeficit >= maxWeeks) {
        return {
            valid: false,
            weeksInDeficit,
            maxWeeks,
            message: `You've been in a calorie deficit for ${weeksInDeficit} weeks.`,
            action: 'diet_break_required',
            suggestion: 'A 1-week diet break at maintenance calories is recommended to reset metabolic hormones'
        };
    }

    if (weeksInDeficit >= maxWeeks - 2) {
        return {
            valid: true,
            warning: true,
            weeksInDeficit,
            message: `${weeksInDeficit} weeks in deficit. Diet break recommended in ${maxWeeks - weeksInDeficit} weeks.`
        };
    }

    return { valid: true, weeksInDeficit };
}

/**
 * Validate weight goal
 */
function validateWeightGoal(currentWeight, targetWeight, targetWeeks, gender, heightCm) {
    const warnings = [];
    const suggestions = [];
    let valid = true;

    if (!targetWeight || !targetWeeks) {
        return { valid: true, warnings: [], suggestions: [], adjustedGoal: null };
    }

    const weightChange = targetWeight - currentWeight;
    const isLoss = weightChange < 0;
    const weeklyChange = Math.abs(weightChange) / targetWeeks;
    const limits = WEIGHT_CHANGE_LIMITS[gender];
    const maxWeekly = isLoss ? limits.maxLoss : limits.maxGain;

    // Check rate of change
    if (weeklyChange > maxWeekly) {
        valid = false;
        const safeTimeline = calculateSafeTimeline({ currentWeight, targetWeight, gender });
        warnings.push(`Weekly ${isLoss ? 'loss' : 'gain'} of ${weeklyChange.toFixed(2)} kg exceeds safe limit of ${maxWeekly} kg/week`);
        suggestions.push(`Extend timeline to at least ${safeTimeline.recommendedWeeks} weeks for safe progress`);
    }

    // Check target BMI
    const targetBMI = calculateBMI(targetWeight, heightCm);
    if (targetBMI < 18.5) {
        warnings.push(`Target weight results in underweight BMI (${targetBMI.toFixed(1)})`);
        const minHealthyWeight = Math.round(18.5 * Math.pow(heightCm / 100, 2) * 10) / 10;
        suggestions.push(`Consider target weight of at least ${minHealthyWeight} kg for healthy BMI`);
    }

    // Aggressive fat loss warning
    if (isLoss && weeklyChange > GOAL_WARNINGS.aggressiveFatLoss.weeklyLossKg) {
        warnings.push(GOAL_WARNINGS.aggressiveFatLoss.message);
    }

    // Generate adjusted goal if invalid
    let adjustedGoal = null;
    if (!valid) {
        const safeTimeline = calculateSafeTimeline({ currentWeight, targetWeight, gender });
        adjustedGoal = {
            targetWeight,
            targetWeeks: safeTimeline.recommendedWeeks,
            weeklyChange: safeTimeline.weeklyChange
        };
    }

    return { valid, warnings, suggestions, adjustedGoal };
}

/**
 * Validate goal consistency
 */
function validateGoalConsistency(goalType, targetWeight, currentWeight) {
    const warnings = [];
    const weightChange = targetWeight - currentWeight;

    if (goalType === 'fat_loss' && weightChange > 0) {
        warnings.push('Fat loss goal selected but target weight is higher than current weight');
    }
    if (goalType === 'muscle_gain' && weightChange < 0) {
        warnings.push('Muscle gain goal selected but target weight is lower than current weight');
    }

    return { valid: warnings.length === 0, warnings };
}

/**
 * Validate timeline realism
 */
function validateTimelineRealism(targetWeeks, weightChange, gender) {
    const absChange = Math.abs(weightChange);
    const isLoss = weightChange < 0;
    const limits = WEIGHT_CHANGE_LIMITS[gender];
    const maxWeekly = isLoss ? limits.maxLoss : limits.maxGain;
    const minWeeks = Math.ceil(absChange / maxWeekly);

    if (targetWeeks < minWeeks) {
        return {
            valid: false,
            minWeeks,
            message: `Minimum ${minWeeks} weeks needed for safe ${isLoss ? 'loss' : 'gain'} of ${absChange.toFixed(1)} kg`
        };
    }
    return { valid: true, minWeeks };
}

/**
 * Full goal validation
 */
function validateGoal(profile) {
    const results = {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: []
    };

    // 1. BMI safety check
    const bmiCheck = validateBMISafety(profile);
    if (!bmiCheck.valid) {
        results.valid = false;
        results.errors.push(...bmiCheck.errors);
    }
    results.warnings.push(...bmiCheck.warnings);

    // 2. Weight goal check
    if (profile.target_weight_kg && profile.target_weeks) {
        const weightCheck = validateWeightGoal(
            profile.weight_kg,
            profile.target_weight_kg,
            profile.target_weeks,
            profile.gender,
            profile.height_cm
        );
        if (!weightCheck.valid) {
            results.valid = false;
        }
        results.warnings.push(...weightCheck.warnings.map(w => ({ type: 'weight_goal', message: w })));
        results.suggestions.push(...weightCheck.suggestions);
        if (weightCheck.adjustedGoal) {
            results.adjustedGoal = weightCheck.adjustedGoal;
        }
    }

    // 3. Goal consistency
    if (profile.target_weight_kg) {
        const consistencyCheck = validateGoalConsistency(profile.goal_type, profile.target_weight_kg, profile.weight_kg);
        results.warnings.push(...consistencyCheck.warnings.map(w => ({ type: 'consistency', message: w })));
    }

    return results;
}

module.exports = {
    validateBMISafety,
    validateDeficitDuration,
    validateWeightGoal,
    validateGoalConsistency,
    validateTimelineRealism,
    validateGoal
};
