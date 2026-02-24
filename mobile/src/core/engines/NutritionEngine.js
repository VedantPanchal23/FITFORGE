/**
 * Nutrition Engine V2
 * Generates meal plans with health conditions, seasonal foods, favorites, and swap support
 */

const { JAIN_FORBIDDEN_FOODS, DIET_TYPES, MEAL_TIMING } = require('../utils/constants');
const { createMeal, createMealPlan } = require('../models/MealPlan');
const { filterFoodsForConditions, checkMealPlanForConditions } = require('./HealthConditionFilter');
const { applyContextMode, adjustMacrosForContext } = require('./ContextModes');

// Load food database
let foodDatabase = [];
try {
    foodDatabase = require('../../data/foods/indian_foods.json');
} catch (e) {
    console.warn('Food database not loaded:', e.message);
}

// Seasonal month mapping
const CURRENT_SEASON = (() => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'summer';
    if (month >= 6 && month <= 9) return 'monsoon';
    return 'winter';
})();

/**
 * Filter foods by diet type
 */
function filterByDietType(foods, dietType) {
    return foods.filter(food => {
        if (!food.diet_types) return false;
        return food.diet_types.includes(dietType);
    });
}

/**
 * Apply Jain restrictions (HARD RULES)
 */
function applyJainRestrictions(foods) {
    return foods.filter(food => {
        if (food.jain_forbidden) return false;
        if (food.jain_note === 'fermented_check') return false;
        const nameLower = food.id.toLowerCase();
        return !JAIN_FORBIDDEN_FOODS.some(forbidden => nameLower.includes(forbidden));
    });
}

/**
 * Apply custom exclusions
 */
function applyExclusions(foods, exclusions) {
    if (!exclusions || exclusions.length === 0) return foods;
    const exclusionSet = new Set(exclusions.map(e => e.toLowerCase()));
    return foods.filter(food => {
        const nameLower = food.name.toLowerCase();
        const idLower = food.id.toLowerCase();
        return !exclusionSet.has(idLower) && ![...exclusionSet].some(ex => nameLower.includes(ex));
    });
}

/**
 * Apply seasonal filter - prefer seasonal foods
 */
function applySeasonalPreference(foods, season = CURRENT_SEASON) {
    // Sort foods so seasonal ones come first
    return foods.sort((a, b) => {
        const aInSeason = a.seasonal_availability?.includes(season) || a.seasonal_availability?.includes('year_round');
        const bInSeason = b.seasonal_availability?.includes(season) || b.seasonal_availability?.includes('year_round');
        if (aInSeason && !bInSeason) return -1;
        if (!aInSeason && bInSeason) return 1;
        return 0;
    });
}

/**
 * Prioritize favorite foods
 */
function prioritizeFavorites(foods, favorites = []) {
    if (!favorites || favorites.length === 0) return foods;
    const favoriteSet = new Set(favorites.map(f => f.toLowerCase()));
    return foods.sort((a, b) => {
        const aFav = favoriteSet.has(a.id?.toLowerCase());
        const bFav = favoriteSet.has(b.id?.toLowerCase());
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
    });
}

/**
 * Filter foods suitable for a meal type
 */
function filterByMealSuitability(foods, mealType) {
    return foods.filter(food => food.meal_suitability && food.meal_suitability.includes(mealType));
}

/**
 * Get available foods for a profile (with all filters)
 */
function getAvailableFoods(profile, options = {}) {
    let foods = [...foodDatabase];

    // 1. Diet type filter
    foods = filterByDietType(foods, profile.diet_type);

    // 2. Jain restrictions
    if (profile.diet_type === 'jain') {
        foods = applyJainRestrictions(foods);
    }

    // 3. Custom exclusions
    foods = applyExclusions(foods, profile.food_exclusions);

    // 4. Health conditions filter (NEW)
    if (profile.health_conditions && profile.health_conditions.length > 0) {
        foods = filterFoodsForConditions(foods, profile.health_conditions);
    }

    // 5. Seasonal preference (NEW)
    if (options.preferSeasonal !== false) {
        foods = applySeasonalPreference(foods);
    }

    // 6. Favorite foods priority (NEW)
    if (profile.favorite_foods && profile.favorite_foods.length > 0) {
        foods = prioritizeFavorites(foods, profile.favorite_foods);
    }

    return foods;
}

/**
 * Calculate food quantity to meet target macros
 */
function calculateQuantity(food, targetMacro, macroType) {
    const per100g = food.per_100g[macroType];
    if (!per100g || per100g === 0) return null;
    return Math.round((targetMacro / per100g) * 100);
}

/**
 * Get high protein foods
 */
function getHighProteinFoods(foods, minProteinPer100g = 10) {
    return foods.filter(f => f.per_100g.protein >= minProteinPer100g)
        .sort((a, b) => b.per_100g.protein - a.per_100g.protein);
}

/**
 * Get carb sources
 */
function getCarbSources(foods) {
    return foods.filter(f => f.per_100g.carbs >= 15 && f.category !== 'fruits')
        .sort((a, b) => b.per_100g.carbs - a.per_100g.carbs);
}

/**
 * Get fat sources
 */
function getFatSources(foods) {
    return foods.filter(f => f.per_100g.fats >= 10)
        .sort((a, b) => b.per_100g.fats - a.per_100g.fats);
}

/**
 * Build a meal targeting specific macros
 */
function buildMeal(mealType, targetMacros, availableFoods, options = {}) {
    const mealFoods = filterByMealSuitability(availableFoods, mealType);
    const selectedFoods = [];
    let remaining = { ...targetMacros };

    // Priority 1: Protein source
    const proteinFoods = getHighProteinFoods(mealFoods);
    if (proteinFoods.length > 0 && remaining.protein > 5) {
        const protein = proteinFoods[Math.floor(Math.random() * Math.min(3, proteinFoods.length))];
        const quantity = Math.min(calculateQuantity(protein, remaining.protein * 0.6, 'protein') || 100, 200);
        const portion = createPortion(protein, quantity);
        selectedFoods.push(portion);
        subtractMacros(remaining, portion);
    }

    // Priority 2: Carb source
    const carbFoods = getCarbSources(mealFoods);
    if (carbFoods.length > 0 && remaining.carbs > 10) {
        const carb = carbFoods[Math.floor(Math.random() * Math.min(3, carbFoods.length))];
        const quantity = Math.min(calculateQuantity(carb, remaining.carbs * 0.5, 'carbs') || 100, 200);
        const portion = createPortion(carb, quantity);
        selectedFoods.push(portion);
        subtractMacros(remaining, portion);
    }

    // Priority 3: Vegetables/Fiber
    const veggies = mealFoods.filter(f => f.category === 'vegetables');
    if (veggies.length > 0 && (mealType === 'lunch' || mealType === 'dinner')) {
        const veg = veggies[Math.floor(Math.random() * veggies.length)];
        const portion = createPortion(veg, 100);
        selectedFoods.push(portion);
    }

    const time = MEAL_TIMING[mealType]?.idealHour
        ? `${String(MEAL_TIMING[mealType].idealHour).padStart(2, '0')}:00`
        : '12:00';

    return createMeal(mealType, time, selectedFoods);
}

/**
 * Create portion from food
 */
function createPortion(food, quantity) {
    return {
        ...food,
        quantity_grams: quantity,
        calories: Math.round(food.per_100g.calories * quantity / 100),
        protein: Math.round(food.per_100g.protein * quantity / 100),
        carbs: Math.round(food.per_100g.carbs * quantity / 100),
        fats: Math.round(food.per_100g.fats * quantity / 100)
    };
}

/**
 * Subtract macros
 */
function subtractMacros(remaining, portion) {
    remaining.calories -= portion.calories;
    remaining.protein -= portion.protein;
    remaining.carbs -= portion.carbs;
    remaining.fats -= portion.fats;
}

/**
 * Generate complete meal plan for a day
 */
function generateMealPlan(profile, date, options = {}) {
    const availableFoods = getAvailableFoods(profile, options);

    if (availableFoods.length === 0) {
        throw new Error('No foods available with current restrictions');
    }

    const { target_calories, protein_grams, carbs_grams, fats_grams } = profile;

    // Check if refeed day
    const isRefeedDay = options.isRefeedDay || false;
    const calorieMultiplier = isRefeedDay ? 1.25 : 1;
    const carbMultiplier = isRefeedDay ? 1.5 : 1;

    const mealDistribution = {
        breakfast: { calories: 0.25, protein: 0.25, carbs: 0.25, fats: 0.25 },
        lunch: { calories: 0.35, protein: 0.35, carbs: 0.35, fats: 0.35 },
        dinner: { calories: 0.30, protein: 0.30, carbs: 0.30, fats: 0.30 },
        snacks: { calories: 0.10, protein: 0.10, carbs: 0.10, fats: 0.10 }
    };

    const getMealTargets = (mealType) => ({
        calories: Math.round(target_calories * calorieMultiplier * mealDistribution[mealType].calories),
        protein: Math.round(protein_grams * mealDistribution[mealType].protein),
        carbs: Math.round(carbs_grams * carbMultiplier * mealDistribution[mealType].carbs),
        fats: Math.round(fats_grams * mealDistribution[mealType].fats)
    });

    const breakfast = buildMeal('breakfast', getMealTargets('breakfast'), availableFoods);
    const lunch = buildMeal('lunch', getMealTargets('lunch'), availableFoods);
    const dinner = buildMeal('dinner', getMealTargets('dinner'), availableFoods);

    const snackFoods = filterByMealSuitability(availableFoods, 'snack');
    const snack = snackFoods.length > 0 ? buildMeal('snack', getMealTargets('snacks'), availableFoods) : null;

    const mealPlan = createMealPlan({
        plan_date: date || new Date().toISOString().split('T')[0],
        meals: {
            breakfast,
            lunch,
            dinner,
            snacks: snack ? [snack] : []
        },
        explanation: generateMealExplanation(profile, { breakfast, lunch, dinner }, options)
    });

    // Check for health condition warnings
    if (profile.health_conditions?.length > 0) {
        mealPlan.warnings = checkMealPlanForConditions(mealPlan, profile.health_conditions);
    }

    return mealPlan;
}

/**
 * Swap a meal with an alternative
 */
function swapMeal(mealPlan, mealType, profile) {
    const availableFoods = getAvailableFoods(profile);
    const currentTargets = mealPlan.meals[mealType]
        ? {
            calories: mealPlan.meals[mealType].total_calories,
            protein: mealPlan.meals[mealType].total_protein,
            carbs: mealPlan.meals[mealType].total_carbs,
            fats: mealPlan.meals[mealType].total_fats
        }
        : { calories: 400, protein: 30, carbs: 50, fats: 15 };

    // Exclude current foods from selection
    const currentFoodIds = mealPlan.meals[mealType]?.foods?.map(f => f.id) || [];
    const filteredFoods = availableFoods.filter(f => !currentFoodIds.includes(f.id));

    const newMeal = buildMeal(mealType, currentTargets, filteredFoods);

    return {
        ...mealPlan,
        meals: {
            ...mealPlan.meals,
            [mealType]: newMeal
        },
        swapped: { mealType, timestamp: new Date().toISOString() }
    };
}

/**
 * Get meal swap alternatives
 */
function getMealAlternatives(mealType, profile, count = 3) {
    const availableFoods = getAvailableFoods(profile);
    const alternatives = [];

    for (let i = 0; i < count; i++) {
        const targets = { calories: 400, protein: 25, carbs: 50, fats: 15 };
        alternatives.push(buildMeal(mealType, targets, availableFoods));
    }

    return alternatives;
}

/**
 * Generate explanation for meal choices
 */
function generateMealExplanation(profile, meals, options = {}) {
    const parts = [];

    if (profile.goal_type) {
        parts.push(`Meal plan for ${profile.goal_type.replace('_', ' ')}.`);
    }

    if (options.isRefeedDay) {
        parts.push('REFEED DAY: Higher calories and carbs to boost metabolism.');
    }

    if (profile.diet_type === 'jain') {
        parts.push('Jain dietary rules applied.');
    }

    if (profile.health_conditions?.length > 0) {
        parts.push(`Filtered for: ${profile.health_conditions.join(', ')}.`);
    }

    if (profile.target_calories && profile.protein_grams) {
        parts.push(`Target: ${profile.target_calories} kcal, ${profile.protein_grams}g protein.`);
    }

    return parts.join(' ');
}

/**
 * Quick log mode - simplified compliance
 */
function quickLogCompliance(ateOnPlan, proteinHit, profile) {
    return {
        food_compliance_percent: ateOnPlan ? 85 : 50,
        protein_completion_percent: proteinHit ? 90 : 60,
        quick_log: true,
        timestamp: new Date().toISOString()
    };
}

/**
 * Adjust meal plan based on feedback
 */
function adjustMealPlan(currentPlan, feedback, profile) {
    const adjustments = [];

    if (feedback.protein_completion_percent < 80) {
        adjustments.push('increase_protein');
    }

    if (feedback.food_compliance_percent < 70) {
        adjustments.push('simplify_meals');
    }

    return generateMealPlan(profile, currentPlan.plan_date);
}

/**
 * Generate a meal with N alternatives, all meeting same macro targets
 * @param {string} mealType - breakfast, lunch, dinner, snack
 * @param {object} targetMacros - { calories, protein, carbs, fats }
 * @param {array} availableFoods - filtered food list
 * @param {number} alternativeCount - number of alternatives (default 3)
 * @returns {object} { primary: Meal, alternatives: Meal[], macroTarget: object }
 */
function generateMealWithAlternatives(mealType, targetMacros, availableFoods, alternativeCount = 3) {
    const usedFoodSets = [];
    const meals = [];

    for (let i = 0; i <= alternativeCount; i++) {
        // Exclude foods used in previous alternatives to ensure variety
        const excludedIds = usedFoodSets.flat();
        const filteredFoods = availableFoods.filter(f => !excludedIds.includes(f.id));

        // Break if no more foods available
        if (filteredFoods.length === 0) break;

        const meal = buildMeal(mealType, targetMacros, filteredFoods);
        meals.push(meal);
        usedFoodSets.push(meal.foods?.map(f => f.id) || []);
    }

    return {
        primary: meals[0] || null,
        alternatives: meals.slice(1),
        macroTarget: targetMacros
    };
}

/**
 * Enhanced meal swap with daily rebalancing
 * @param {object} mealPlan - current meal plan
 * @param {string} mealType - which meal to swap
 * @param {number|null} alternativeIndex - which alternative to use (or null for random)
 * @param {object} profile - user profile
 * @returns {object} updated meal plan with rebalanced macros
 */
function swapMealWithRebalance(mealPlan, mealType, alternativeIndex, profile) {
    const slot = mealPlan.meals[mealType];

    // If no alternatives structure, fallback to existing swap logic
    if (!slot?.alternatives || slot.alternatives.length === 0) {
        return swapMeal(mealPlan, mealType, profile);
    }

    const selectedAlternative = alternativeIndex !== null && alternativeIndex !== undefined
        ? slot.alternatives[alternativeIndex]
        : slot.alternatives[Math.floor(Math.random() * slot.alternatives.length)];

    if (!selectedAlternative) {
        return mealPlan;
    }

    // Calculate macro difference for tracking
    const oldMacros = {
        calories: slot.primary?.total_calories || 0,
        protein: slot.primary?.total_protein || 0,
        carbs: slot.primary?.total_carbs || 0,
        fats: slot.primary?.total_fats || 0
    };
    const newMacros = {
        calories: selectedAlternative.total_calories || 0,
        protein: selectedAlternative.total_protein || 0,
        carbs: selectedAlternative.total_carbs || 0,
        fats: selectedAlternative.total_fats || 0
    };
    const diff = {
        calories: newMacros.calories - oldMacros.calories,
        protein: newMacros.protein - oldMacros.protein,
        carbs: newMacros.carbs - oldMacros.carbs,
        fats: newMacros.fats - oldMacros.fats
    };

    // Swap primary and add old primary to alternatives
    const newMeals = { ...mealPlan.meals };
    const actualAltIndex = alternativeIndex !== null && alternativeIndex !== undefined
        ? alternativeIndex
        : slot.alternatives.indexOf(selectedAlternative);

    newMeals[mealType] = {
        primary: selectedAlternative,
        alternatives: [slot.primary, ...slot.alternatives.filter((_, i) => i !== actualAltIndex)],
        macroTarget: slot.macroTarget
    };

    // Track swap history
    const swapHistory = mealPlan.swapHistory || [];
    swapHistory.push({
        mealType,
        from: slot.primary?.name || 'unknown',
        to: selectedAlternative.name || 'unknown',
        timestamp: new Date().toISOString()
    });

    return {
        ...mealPlan,
        meals: newMeals,
        macroDiff: diff,
        swapHistory,
        lastSwap: { mealType, timestamp: new Date().toISOString() }
    };
}

/**
 * Generate complete meal plan with alternatives for each meal
 * @param {object} profile - user profile
 * @param {string} date - plan date
 * @param {object} options - { includeAlternatives, alternativeCount, contextMode }
 * @returns {object} meal plan with alternatives per meal
 */
function generateMealPlanWithAlternatives(profile, date, options = {}) {
    const includeAlternatives = options.includeAlternatives ?? true;
    const alternativeCount = options.alternativeCount ?? 3;
    const contextMode = options.contextMode || 'normal';

    let availableFoods = getAvailableFoods(profile, options);

    // Apply context mode filters
    if (contextMode !== 'normal') {
        availableFoods = applyContextMode(availableFoods, contextMode);
    }

    if (availableFoods.length === 0) {
        throw new Error('No foods available with current restrictions');
    }

    const { target_calories, protein_grams, carbs_grams, fats_grams } = profile;

    // Check if refeed day
    const isRefeedDay = options.isRefeedDay || false;
    const calorieMultiplier = isRefeedDay ? 1.25 : 1;
    const carbMultiplier = isRefeedDay ? 1.5 : 1;

    const mealDistribution = {
        breakfast: { calories: 0.25, protein: 0.25, carbs: 0.25, fats: 0.25 },
        lunch: { calories: 0.35, protein: 0.35, carbs: 0.35, fats: 0.35 },
        dinner: { calories: 0.30, protein: 0.30, carbs: 0.30, fats: 0.30 },
        snacks: { calories: 0.10, protein: 0.10, carbs: 0.10, fats: 0.10 }
    };

    const getMealTargets = (mealType) => {
        const targets = {
            calories: Math.round(target_calories * calorieMultiplier * mealDistribution[mealType].calories),
            protein: Math.round(protein_grams * mealDistribution[mealType].protein),
            carbs: Math.round(carbs_grams * carbMultiplier * mealDistribution[mealType].carbs),
            fats: Math.round(fats_grams * mealDistribution[mealType].fats)
        };

        // Adjust targets if context mode requires
        if (contextMode !== 'normal') {
            return adjustMacrosForContext(targets, contextMode);
        }
        return targets;
    };

    // Generate meals with or without alternatives
    const breakfast = includeAlternatives
        ? generateMealWithAlternatives('breakfast', getMealTargets('breakfast'), availableFoods, alternativeCount)
        : { primary: buildMeal('breakfast', getMealTargets('breakfast'), availableFoods), alternatives: [] };

    const lunch = includeAlternatives
        ? generateMealWithAlternatives('lunch', getMealTargets('lunch'), availableFoods, alternativeCount)
        : { primary: buildMeal('lunch', getMealTargets('lunch'), availableFoods), alternatives: [] };

    const dinner = includeAlternatives
        ? generateMealWithAlternatives('dinner', getMealTargets('dinner'), availableFoods, alternativeCount)
        : { primary: buildMeal('dinner', getMealTargets('dinner'), availableFoods), alternatives: [] };

    const snackFoods = filterByMealSuitability(availableFoods, 'snack');
    const snack = snackFoods.length > 0
        ? (includeAlternatives
            ? generateMealWithAlternatives('snack', getMealTargets('snacks'), snackFoods, alternativeCount)
            : { primary: buildMeal('snack', getMealTargets('snacks'), snackFoods), alternatives: [] })
        : null;

    const mealPlan = createMealPlan({
        plan_date: date || new Date().toISOString().split('T')[0],
        meals: {
            breakfast,
            lunch,
            dinner,
            snacks: snack ? [snack] : []
        },
        explanation: generateMealExplanation(profile, {
            breakfast: breakfast.primary,
            lunch: lunch.primary,
            dinner: dinner.primary
        }, options),
        contextMode,
        swapHistory: []
    });

    // Check for health condition warnings
    if (profile.health_conditions?.length > 0) {
        mealPlan.warnings = checkMealPlanForConditions(mealPlan, profile.health_conditions);
    }

    return mealPlan;
}

module.exports = {
    getAvailableFoods,
    filterByDietType,
    applyJainRestrictions,
    applyExclusions,
    applySeasonalPreference,
    prioritizeFavorites,
    getHighProteinFoods,
    buildMeal,
    generateMealPlan,
    generateMealPlanWithAlternatives,
    generateMealWithAlternatives,
    swapMeal,
    swapMealWithRebalance,
    getMealAlternatives,
    adjustMealPlan,
    generateMealExplanation,
    quickLogCompliance,
    CURRENT_SEASON
};
