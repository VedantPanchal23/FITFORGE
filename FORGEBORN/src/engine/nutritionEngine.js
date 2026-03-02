/**
 * FORGEBORN — NUTRITION ENGINE
 * 
 * TDEE calculator, macro splitter, meal plan generator.
 * Based on Mifflin-St Jeor equation (most accurate for most people).
 * Inspired by: MacroFactor (dynamic adjustment), HealthifyMe (Indian focus)
 */

// ─── ACTIVITY MULTIPLIERS ─────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS = {
    SEDENTARY: 1.2,       // Desk job, no exercise
    LIGHT: 1.375,         // 1-2 days/week
    MODERATE: 1.55,       // 3-5 days/week (default for most lifters)
    ACTIVE: 1.725,        // 6-7 days/week
    VERY_ACTIVE: 1.9,     // 2x/day training, physical job
};

// ─── GOAL ADJUSTMENTS ─────────────────────────────────────────────────────────

const GOAL_CALORIE_ADJUSTMENT = {
    WEIGHT_LOSS: -500,        // 500 cal deficit (~0.5 kg/week loss)
    LEAN_BULK: 250,           // 250 cal surplus (lean gains)
    MUSCLE_GAIN: 400,         // 400 cal surplus (aggressive bulk)
    BODYBUILDING: 300,        // 300 cal surplus
    STRENGTH: 300,            // 300 cal surplus
    MAINTAIN: 0,              // Maintenance
    CALISTHENICS: 0,          // Maintenance
    ENDURANCE: -200,          // Slight deficit
    FULL_BODY: 100,           // Slight surplus
};

/**
 * Calculate BMR using Mifflin-St Jeor equation.
 * Most accurate formula for most people.
 */
export function calculateBMR(weight, height, age, gender) {
    if (gender === 'MALE') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    return 10 * weight + 6.25 * height - 5 * age - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure).
 */
export function calculateTDEE(weight, height, age, gender, trainingDaysPerWeek = 5) {
    const bmr = calculateBMR(weight, height, age, gender);

    // Map training days to activity level
    let multiplier;
    if (trainingDaysPerWeek <= 1) multiplier = ACTIVITY_MULTIPLIERS.SEDENTARY;
    else if (trainingDaysPerWeek <= 2) multiplier = ACTIVITY_MULTIPLIERS.LIGHT;
    else if (trainingDaysPerWeek <= 5) multiplier = ACTIVITY_MULTIPLIERS.MODERATE;
    else if (trainingDaysPerWeek <= 6) multiplier = ACTIVITY_MULTIPLIERS.ACTIVE;
    else multiplier = ACTIVITY_MULTIPLIERS.VERY_ACTIVE;

    return Math.round(bmr * multiplier);
}

/**
 * Calculate target calories based on goal.
 */
export function calculateTargetCalories(tdee, goal = 'FULL_BODY') {
    const adjustment = GOAL_CALORIE_ADJUSTMENT[goal] || 0;
    return Math.round(tdee + adjustment);
}

/**
 * Split calories into macronutrients.
 * 
 * Protein: 2.0-2.2g per kg bodyweight (for muscle building)
 * Fats: 0.8-1.0g per kg bodyweight (for hormones)
 * Carbs: remaining calories
 */
export function calculateMacros(targetCalories, weight, goal = 'FULL_BODY') {
    let proteinPerKg, fatPerKg;

    switch (goal) {
        case 'WEIGHT_LOSS':
            proteinPerKg = 2.2;  // High protein to preserve muscle
            fatPerKg = 0.8;
            break;
        case 'BODYBUILDING':
        case 'MUSCLE_GAIN':
        case 'LEAN_BULK':
            proteinPerKg = 2.0;
            fatPerKg = 0.9;
            break;
        case 'STRENGTH':
            proteinPerKg = 1.8;
            fatPerKg = 1.0;
            break;
        case 'ENDURANCE':
            proteinPerKg = 1.6;
            fatPerKg = 0.8;
            break;
        case 'CALISTHENICS':
            proteinPerKg = 2.0;
            fatPerKg = 0.8;
            break;
        default:
            proteinPerKg = 1.8;
            fatPerKg = 0.9;
    }

    const protein = Math.round(weight * proteinPerKg);
    const fats = Math.round(weight * fatPerKg);
    const proteinCalories = protein * 4;
    const fatCalories = fats * 9;
    const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
    const carbs = Math.round(carbCalories / 4);

    return {
        protein,
        carbs,
        fats,
        proteinCalories,
        carbCalories: carbs * 4,
        fatCalories: fats * 9,
    };
}

/**
 * Generate a full nutrition profile from user data.
 */
export function generateNutritionPlan(profile) {
    const weight = profile.weight || 70;
    const height = profile.height || 175;
    const age = profile.age || 22;
    const gender = profile.gender || 'MALE';
    const trainingDays = profile.trainingDaysPerWeek || 5;
    const goals = profile.fitnessGoal || ['FULL_BODY'];
    const primaryGoal = goals[0] || 'FULL_BODY';
    const mealsPerDay = profile.mealsPerDay || 4;

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(weight, height, age, gender, trainingDays);
    const targetCalories = calculateTargetCalories(tdee, primaryGoal);
    const macros = calculateMacros(targetCalories, weight, primaryGoal);

    // Per-meal targets
    const perMeal = {
        calories: Math.round(targetCalories / mealsPerDay),
        protein: Math.round(macros.protein / mealsPerDay),
        carbs: Math.round(macros.carbs / mealsPerDay),
        fats: Math.round(macros.fats / mealsPerDay),
    };

    // Water target (ml)
    const waterTarget = Math.round(weight * 35); // 35ml per kg
    const waterGlasses = Math.ceil(waterTarget / 250); // 250ml per glass

    return {
        bmr,
        tdee,
        targetCalories,
        macros,
        perMeal,
        mealsPerDay,
        waterTarget,
        waterGlasses,
        goal: primaryGoal,
        deficit: targetCalories - tdee,
    };
}

export default {
    calculateBMR,
    calculateTDEE,
    calculateTargetCalories,
    calculateMacros,
    generateNutritionPlan,
};
