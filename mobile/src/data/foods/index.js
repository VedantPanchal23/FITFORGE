/**
 * Food Database Loader
 * Consolidates all food data and provides query functions
 */

const grains = require('./grains.json');
const legumes = require('./legumes.json');
const proteins = require('./proteins.json');
const dairyFats = require('./dairy_fats.json');
const vegetables = require('./vegetables.json');
const fruitsNuts = require('./fruits_nuts.json');
const portions = require('./portions.json');
const substitutions = require('./substitutions.json');
// NEW: Context-aware meal databases
const quickMeals = require('./quick_meals.json');
const restaurantMeals = require('./restaurant_meals.json');

// Combine all foods
const allFoods = [
    ...grains,
    ...legumes,
    ...proteins,
    ...dairyFats,
    ...vegetables,
    ...fruitsNuts,
    ...quickMeals,        // 46 quick/budget/no-cook meals
    ...restaurantMeals    // 32 restaurant meals with portion tips
];


// Create lookup maps
const foodById = new Map();
const foodByName = new Map();
const foodsByCategory = new Map();

allFoods.forEach(food => {
    foodById.set(food.id, food);
    foodByName.set(food.name.toLowerCase(), food);

    if (!foodsByCategory.has(food.category)) {
        foodsByCategory.set(food.category, []);
    }
    foodsByCategory.get(food.category).push(food);
});

/**
 * Get food by ID
 */
function getFoodById(id) {
    return foodById.get(id) || null;
}

/**
 * Search foods by name (partial match)
 */
function searchFoods(query) {
    const q = query.toLowerCase();
    return allFoods.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.name_hindi?.includes(query) ||
        f.regional_names?.some(r => r.toLowerCase().includes(q))
    );
}

/**
 * Get foods by category
 */
function getFoodsByCategory(category) {
    return foodsByCategory.get(category) || [];
}

/**
 * Get foods by diet type with Jain enforcement
 */
function getFoodsByDiet(dietType) {
    return allFoods.filter(food => {
        if (!food.diet_types?.includes(dietType)) return false;
        if (dietType === 'jain' && food.jain_forbidden) return false;
        if (dietType === 'jain' && food.jain_note === 'fermented_check') return false;
        return true;
    });
}

/**
 * Get substitutes for a food
 */
function getSubstitutes(foodId, dietType = 'nonveg') {
    const food = getFoodById(foodId);
    if (!food) return [];

    // Find substitution category
    let subs = [];
    for (const [category, rules] of Object.entries(substitutions.substitution_rules)) {
        if (rules[foodId]) {
            subs = rules[foodId];
            break;
        }
    }

    // If Jain diet, use Jain-specific substitutions
    if (dietType === 'jain' && substitutions.jain_substitutions[foodId]) {
        subs = substitutions.jain_substitutions[foodId];
    }

    // Filter by diet type and return actual food objects
    return subs
        .map(id => getFoodById(id))
        .filter(f => f && f.diet_types?.includes(dietType));
}

/**
 * Get equivalent portions for a macro target
 */
function getEquivalentPortions(macroType, targetGrams) {
    const equivalents = substitutions.equivalent_portions[`${macroType}_${targetGrams}g`];
    if (!equivalents) return null;

    return equivalents.map(eq => ({
        ...eq,
        food: getFoodById(eq.food)
    })).filter(eq => eq.food);
}

/**
 * Convert household measure to grams
 */
function convertToGrams(foodId, measure, quantity = 1) {
    const food = getFoodById(foodId);
    if (!food) return null;

    // Check food-specific portions
    if (food.household_portions) {
        const portion = food.household_portions.find(p => p.name === measure);
        if (portion) {
            return portion.grams * quantity;
        }
    }

    // Check per_piece
    if (food.per_piece && measure === 'piece') {
        return food.per_piece.grams * quantity;
    }

    // Check standard portions
    const standard = portions.standard_portions[measure] || portions.standard_portions[`${foodId}_${measure}`];
    if (standard) {
        return (standard.grams || standard.ml) * quantity;
    }

    // Check household measures
    const household = portions.household_measures[measure];
    if (household) {
        return (household.grams_approx || household.ml) * quantity;
    }

    return null;
}

/**
 * Get nutrition for a portion
 */
function getNutritionForPortion(foodId, grams) {
    const food = getFoodById(foodId);
    if (!food || !food.per_100g) return null;

    const multiplier = grams / 100;
    const nutrition = {};

    for (const [key, value] of Object.entries(food.per_100g)) {
        if (typeof value === 'number') {
            nutrition[key] = Math.round(value * multiplier * 10) / 10;
        }
    }

    return nutrition;
}

/**
 * Check seasonal availability
 */
function getSeasonalStatus(foodId) {
    const food = getFoodById(foodId);
    if (!food?.seasonal) return { available: true, note: 'year_round' };

    const month = new Date().getMonth();
    const season = month >= 2 && month <= 5 ? 'summer' :
        month >= 6 && month <= 9 ? 'monsoon' : 'winter';

    const seasonData = substitutions.seasonal_availability[season];

    if (seasonData?.abundant?.includes(foodId)) {
        return { available: true, note: 'peak_season', season };
    }
    if (seasonData?.scarce?.includes(foodId)) {
        return { available: true, note: 'off_season', season, suggestion: 'Consider frozen or alternative' };
    }
    if (seasonData?.avoid?.includes(foodId)) {
        return { available: false, note: seasonData.note || 'not_recommended', season };
    }

    return { available: true, note: 'available', season };
}

/**
 * Get micronutrient-rich foods for a specific nutrient
 */
function getMicronutrientRich(nutrient, minAmount, dietType = 'nonveg') {
    const nutrientKey = nutrient.toLowerCase().replace(/[- ]/g, '_');

    return allFoods
        .filter(f => {
            if (!f.diet_types?.includes(dietType)) return false;
            if (dietType === 'jain' && f.jain_forbidden) return false;

            const value = f.per_100g?.[nutrientKey] || f.per_100g?.[`${nutrientKey}_mg`] || f.per_100g?.[`${nutrientKey}_mcg`];
            return value && value >= minAmount;
        })
        .sort((a, b) => {
            const aVal = a.per_100g?.[nutrientKey] || a.per_100g?.[`${nutrientKey}_mg`] || a.per_100g?.[`${nutrientKey}_mcg`] || 0;
            const bVal = b.per_100g?.[nutrientKey] || b.per_100g?.[`${nutrientKey}_mg`] || b.per_100g?.[`${nutrientKey}_mcg`] || 0;
            return bVal - aVal;
        });
}

/**
 * Get all foods
 */
function getAllFoods() {
    return allFoods;
}

/**
 * Get food count
 */
function getFoodCount() {
    return allFoods.length;
}

module.exports = {
    getAllFoods,
    getFoodById,
    searchFoods,
    getFoodsByCategory,
    getFoodsByDiet,
    getSubstitutes,
    getEquivalentPortions,
    convertToGrams,
    getNutritionForPortion,
    getSeasonalStatus,
    getMicronutrientRich,
    getFoodCount,
    portions,
    substitutions
};
