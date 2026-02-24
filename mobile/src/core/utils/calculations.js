/**
 * PFT Calculation Utilities
 * Pure functions for health & fitness calculations
 */

const {
    ACTIVITY_MULTIPLIERS,
    CALORIE_LIMITS,
    WEIGHT_CHANGE_LIMITS,
    MACRO_RATIOS,
    CALORIES_PER_GRAM
} = require('./constants');

// =============================================================================
// BMR CALCULATIONS
// =============================================================================

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * Most accurate for most populations
 * 
 * @param {Object} params
 * @param {string} params.gender - 'male' or 'female'
 * @param {number} params.weightKg - Weight in kilograms
 * @param {number} params.heightCm - Height in centimeters
 * @param {number} params.age - Age in years
 * @returns {number} BMR in kcal/day
 */
function calculateBMR({ gender, weightKg, heightCm, age }) {
    // Mifflin-St Jeor Equation
    // Male: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
    // Female: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161

    const baseBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age);

    if (gender === 'male') {
        return Math.round(baseBMR + 5);
    } else {
        return Math.round(baseBMR - 161);
    }
}

/**
 * Calculate BMR using Katch-McArdle Formula (if body fat % is known)
 * More accurate when lean body mass is known
 * 
 * @param {number} weightKg - Weight in kilograms
 * @param {number} bodyFatPercent - Body fat percentage
 * @returns {number} BMR in kcal/day
 */
function calculateBMRKatchMcArdle(weightKg, bodyFatPercent) {
    // Lean Body Mass = Weight × (1 - Body Fat %)
    const leanBodyMass = weightKg * (1 - bodyFatPercent / 100);

    // BMR = 370 + (21.6 × LBM)
    return Math.round(370 + (21.6 * leanBodyMass));
}

// =============================================================================
// TDEE CALCULATIONS
// =============================================================================

/**
 * Calculate Total Daily Energy Expenditure
 * 
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level key
 * @returns {number} TDEE in kcal/day
 */
function calculateTDEE(bmr, activityLevel) {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.sedentary;
    return Math.round(bmr * multiplier);
}

// =============================================================================
// TARGET CALORIES
// =============================================================================

/**
 * Calculate target daily calories based on goal
 * 
 * @param {Object} params
 * @param {number} params.tdee - Total Daily Energy Expenditure
 * @param {string} params.goalType - 'fat_loss', 'muscle_gain', 'recomp', 'health'
 * @param {string} params.gender - 'male' or 'female'
 * @param {number} [params.aggressiveness=0.5] - 0-1 scale, how aggressive the deficit/surplus
 * @returns {Object} { targetCalories, deficit/surplus, explanation }
 */
function calculateTargetCalories({ tdee, goalType, gender, aggressiveness = 0.5 }) {
    const minCalories = gender === 'male' ? CALORIE_LIMITS.minMale : CALORIE_LIMITS.minFemale;

    let targetCalories;
    let adjustment;
    let explanation;

    switch (goalType) {
        case 'fat_loss':
            // Scale deficit based on aggressiveness (250-500 kcal)
            adjustment = -Math.round(250 + (aggressiveness * 250));
            adjustment = Math.max(adjustment, -CALORIE_LIMITS.maxDeficit);
            targetCalories = tdee + adjustment;
            explanation = `Deficit of ${Math.abs(adjustment)} kcal for steady fat loss`;
            break;

        case 'muscle_gain':
            // Scale surplus based on aggressiveness (150-300 kcal)
            adjustment = Math.round(150 + (aggressiveness * 150));
            adjustment = Math.min(adjustment, CALORIE_LIMITS.maxSurplus);
            targetCalories = tdee + adjustment;
            explanation = `Surplus of ${adjustment} kcal for lean muscle gain`;
            break;

        case 'recomp':
            // Slight deficit or maintenance
            adjustment = Math.round(-100 * aggressiveness);
            targetCalories = tdee + adjustment;
            explanation = 'Near maintenance calories for body recomposition';
            break;

        case 'health':
        default:
            adjustment = 0;
            targetCalories = tdee;
            explanation = 'Maintenance calories for general health';
    }

    // Enforce minimum calories
    if (targetCalories < minCalories) {
        targetCalories = minCalories;
        explanation += ` (raised to safe minimum of ${minCalories} kcal)`;
    }

    return {
        targetCalories,
        adjustment,
        explanation
    };
}

// =============================================================================
// MACRO CALCULATIONS
// =============================================================================

/**
 * Calculate macronutrient targets
 * 
 * @param {Object} params
 * @param {number} params.weightKg - Body weight in kg
 * @param {number} params.targetCalories - Target daily calories
 * @param {string} params.goalType - Goal type
 * @returns {Object} { protein, carbs, fats } in grams
 */
function calculateMacros({ weightKg, targetCalories, goalType }) {
    const ratios = MACRO_RATIOS[goalType] || MACRO_RATIOS.health;

    // Use middle of range for protein and fats
    const proteinPerKg = (ratios.protein.min + ratios.protein.max) / 2;
    const fatsPerKg = (ratios.fats.min + ratios.fats.max) / 2;

    // Calculate protein and fats first (priority)
    const proteinGrams = Math.round(weightKg * proteinPerKg);
    const fatsGrams = Math.round(weightKg * fatsPerKg);

    // Calculate calories from protein and fats
    const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;
    const fatsCalories = fatsGrams * CALORIES_PER_GRAM.fats;

    // Remaining calories go to carbs
    const remainingCalories = targetCalories - proteinCalories - fatsCalories;
    const carbsGrams = Math.round(remainingCalories / CALORIES_PER_GRAM.carbs);

    return {
        protein: proteinGrams,
        carbs: Math.max(carbsGrams, 50), // Minimum 50g carbs for brain function
        fats: fatsGrams
    };
}

/**
 * Calculate macros with detailed breakdown and validation
 * 
 * @param {Object} params
 * @param {number} params.weightKg
 * @param {number} params.targetCalories
 * @param {string} params.goalType
 * @returns {Object} Detailed macro breakdown
 */
function calculateDetailedMacros({ weightKg, targetCalories, goalType }) {
    const macros = calculateMacros({ weightKg, targetCalories, goalType });

    // Calculate actual calories
    const proteinCalories = macros.protein * CALORIES_PER_GRAM.protein;
    const carbsCalories = macros.carbs * CALORIES_PER_GRAM.carbs;
    const fatsCalories = macros.fats * CALORIES_PER_GRAM.fats;
    const totalCalories = proteinCalories + carbsCalories + fatsCalories;

    // Calculate percentages
    const proteinPercent = Math.round((proteinCalories / totalCalories) * 100);
    const carbsPercent = Math.round((carbsCalories / totalCalories) * 100);
    const fatsPercent = Math.round((fatsCalories / totalCalories) * 100);

    return {
        grams: macros,
        calories: {
            protein: proteinCalories,
            carbs: carbsCalories,
            fats: fatsCalories,
            total: totalCalories
        },
        percentages: {
            protein: proteinPercent,
            carbs: carbsPercent,
            fats: fatsPercent
        },
        perKg: {
            protein: Math.round((macros.protein / weightKg) * 10) / 10,
            carbs: Math.round((macros.carbs / weightKg) * 10) / 10,
            fats: Math.round((macros.fats / weightKg) * 10) / 10
        }
    };
}

// =============================================================================
// WEIGHT CHANGE CALCULATIONS
// =============================================================================

/**
 * Calculate expected weekly weight change
 * 
 * @param {number} calorieAdjustment - Daily calorie surplus/deficit
 * @returns {number} Expected weekly weight change in kg
 */
function calculateWeeklyWeightChange(calorieAdjustment) {
    // 7700 kcal ≈ 1 kg of body weight
    const weeklyCalorieChange = calorieAdjustment * 7;
    return Math.round((weeklyCalorieChange / 7700) * 100) / 100;
}

/**
 * Calculate safe timeline for weight goal
 * 
 * @param {Object} params
 * @param {number} params.currentWeight - Current weight in kg
 * @param {number} params.targetWeight - Target weight in kg
 * @param {string} params.gender - 'male' or 'female'
 * @returns {Object} { minWeeks, maxWeeks, recommendedWeeks, weeklyChange }
 */
function calculateSafeTimeline({ currentWeight, targetWeight, gender }) {
    const weightChange = targetWeight - currentWeight;
    const isLoss = weightChange < 0;
    const absChange = Math.abs(weightChange);

    const limits = WEIGHT_CHANGE_LIMITS[gender];
    const maxWeeklyChange = isLoss ? limits.maxLoss : limits.maxGain;

    // Minimum weeks = change / max rate
    const minWeeks = Math.ceil(absChange / maxWeeklyChange);

    // Recommended is 1.5x minimum for sustainability
    const recommendedWeeks = Math.ceil(minWeeks * 1.5);

    // Maximum is 2x minimum (very conservative)
    const maxWeeks = Math.ceil(minWeeks * 2);

    // Recommended weekly change
    const weeklyChange = absChange / recommendedWeeks;

    return {
        minWeeks,
        maxWeeks,
        recommendedWeeks,
        weeklyChange: Math.round(weeklyChange * 100) / 100,
        isRealistic: minWeeks <= 104, // Max 2 years
        totalChange: weightChange
    };
}

/**
 * Validate if a weight goal is realistic and safe
 * 
 * @param {Object} params
 * @param {number} params.currentWeight
 * @param {number} params.targetWeight
 * @param {number} params.targetWeeks
 * @param {string} params.gender
 * @param {number} params.heightCm
 * @returns {Object} { valid, warnings, suggestions }
 */
function validateWeightGoal({ currentWeight, targetWeight, targetWeeks, gender, heightCm }) {
    const warnings = [];
    const suggestions = [];
    let valid = true;

    const weightChange = targetWeight - currentWeight;
    const isLoss = weightChange < 0;
    const weeklyChange = Math.abs(weightChange) / targetWeeks;

    const limits = WEIGHT_CHANGE_LIMITS[gender];
    const maxWeekly = isLoss ? limits.maxLoss : limits.maxGain;

    // Check rate of change
    if (weeklyChange > maxWeekly) {
        valid = false;
        const safeTimeline = calculateSafeTimeline({ currentWeight, targetWeight, gender });
        warnings.push(`Weekly ${isLoss ? 'loss' : 'gain'} of ${weeklyChange.toFixed(2)} kg exceeds safe limit of ${maxWeekly} kg`);
        suggestions.push(`Recommend extending timeline to ${safeTimeline.recommendedWeeks} weeks`);
    }

    // Check target BMI
    const targetBMI = calculateBMI(targetWeight, heightCm);
    if (targetBMI < 18.5) {
        warnings.push(`Target weight would result in underweight BMI of ${targetBMI.toFixed(1)}`);
        const minHealthyWeight = 18.5 * Math.pow(heightCm / 100, 2);
        suggestions.push(`Consider a target weight of at least ${minHealthyWeight.toFixed(1)} kg`);
    }

    if (targetBMI > 30) {
        warnings.push(`Target weight would result in obese BMI of ${targetBMI.toFixed(1)}`);
    }

    // Check for extreme goals
    const percentChange = Math.abs(weightChange / currentWeight) * 100;
    if (percentChange > 30) {
        warnings.push(`Target represents a ${percentChange.toFixed(0)}% change in body weight`);
        suggestions.push('Consider setting intermediate goals');
    }

    return {
        valid,
        warnings,
        suggestions,
        details: {
            weeklyChange,
            maxAllowed: maxWeekly,
            targetBMI,
            percentChange
        }
    };
}

// =============================================================================
// BODY COMPOSITION
// =============================================================================

/**
 * Calculate BMI
 * 
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number} BMI value
 */
function calculateBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category
 * 
 * @param {number} bmi
 * @returns {Object} { category, description }
 */
function getBMICategory(bmi) {
    if (bmi < 16) return { category: 'severely_underweight', description: 'Severely Underweight' };
    if (bmi < 18.5) return { category: 'underweight', description: 'Underweight' };
    if (bmi < 25) return { category: 'normal', description: 'Normal Weight' };
    if (bmi < 30) return { category: 'overweight', description: 'Overweight' };
    if (bmi < 35) return { category: 'obese_1', description: 'Obese Class I' };
    if (bmi < 40) return { category: 'obese_2', description: 'Obese Class II' };
    return { category: 'obese_3', description: 'Obese Class III' };
}

/**
 * Estimate body fat percentage using Navy Method
 * 
 * @param {Object} params
 * @param {string} params.gender
 * @param {number} params.waistCm - Waist circumference
 * @param {number} params.neckCm - Neck circumference
 * @param {number} params.heightCm
 * @param {number} [params.hipCm] - Hip circumference (required for females)
 * @returns {number} Estimated body fat percentage
 */
function estimateBodyFatNavy({ gender, waistCm, neckCm, heightCm, hipCm }) {
    if (gender === 'male') {
        // Male formula
        const bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
        return Math.round(bodyFat * 10) / 10;
    } else {
        // Female formula (requires hip measurement)
        if (!hipCm) throw new Error('Hip measurement required for female body fat estimation');
        const bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
        return Math.round(bodyFat * 10) / 10;
    }
}

/**
 * Calculate lean body mass
 * 
 * @param {number} weightKg
 * @param {number} bodyFatPercent
 * @returns {number} Lean body mass in kg
 */
function calculateLeanBodyMass(weightKg, bodyFatPercent) {
    return Math.round(weightKg * (1 - bodyFatPercent / 100) * 10) / 10;
}

/**
 * Estimate ideal body weight using Devine formula
 * 
 * @param {string} gender
 * @param {number} heightCm
 * @returns {Object} { ideal, range }
 */
function calculateIdealWeight(gender, heightCm) {
    const heightInches = heightCm / 2.54;
    const inchesOver5Feet = Math.max(0, heightInches - 60);

    let ideal;
    if (gender === 'male') {
        // Devine formula: 50 + 2.3 × (inches over 5 feet)
        ideal = 50 + (2.3 * inchesOver5Feet);
    } else {
        // Devine formula: 45.5 + 2.3 × (inches over 5 feet)
        ideal = 45.5 + (2.3 * inchesOver5Feet);
    }

    return {
        ideal: Math.round(ideal * 10) / 10,
        range: {
            min: Math.round(ideal * 0.9 * 10) / 10,
            max: Math.round(ideal * 1.1 * 10) / 10
        }
    };
}

// =============================================================================
// WATER INTAKE
// =============================================================================

/**
 * Calculate recommended daily water intake
 * 
 * @param {number} weightKg
 * @param {string} activityLevel
 * @param {boolean} isWorkoutDay
 * @returns {Object} { liters, glasses }
 */
function calculateWaterIntake(weightKg, activityLevel, isWorkoutDay = false) {
    // Base: 30-35ml per kg
    let mlPerKg = 33;

    // Adjust for activity
    const activityBonus = {
        sedentary: 0,
        light: 0.1,
        moderate: 0.15,
        active: 0.2,
        very_active: 0.25
    };

    mlPerKg += mlPerKg * (activityBonus[activityLevel] || 0);

    // Add for workout day
    if (isWorkoutDay) {
        mlPerKg += 5; // Extra 5ml/kg on workout days
    }

    const totalMl = weightKg * mlPerKg;
    const liters = Math.round(totalMl / 100) / 10;
    const glasses = Math.round(totalMl / 250); // 250ml glasses

    return { liters, glasses, ml: Math.round(totalMl) };
}

// =============================================================================
// DATE/TIME HELPERS
// =============================================================================

/**
 * Get today's date in YYYY-MM-DD format
 * 
 * @returns {string}
 */
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get date N days from now
 * 
 * @param {number} days - Number of days (negative for past)
 * @returns {string} Date in YYYY-MM-DD format
 */
function getDateOffset(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * Calculate days between two dates
 * 
 * @param {string} date1 - YYYY-MM-DD
 * @param {string} date2 - YYYY-MM-DD
 * @returns {number} Number of days
 */
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    // BMR
    calculateBMR,
    calculateBMRKatchMcArdle,

    // TDEE
    calculateTDEE,

    // Calories
    calculateTargetCalories,

    // Macros
    calculateMacros,
    calculateDetailedMacros,

    // Weight
    calculateWeeklyWeightChange,
    calculateSafeTimeline,
    validateWeightGoal,

    // Body composition
    calculateBMI,
    getBMICategory,
    estimateBodyFatNavy,
    calculateLeanBodyMass,
    calculateIdealWeight,

    // Water
    calculateWaterIntake,

    // Date helpers
    getTodayDate,
    getDateOffset,
    daysBetween
};
