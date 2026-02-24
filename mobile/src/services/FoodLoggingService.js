/**
 * Food Logging Service
 * Tracks actual food eaten vs planned
 */

/**
 * Create a food log entry
 */
function createFoodLogEntry({
    logDate,
    mealType,
    foodId = null,
    foodName,
    quantityGrams = null,
    quantityUnit = 'grams',
    calories = null,
    protein = null,
    carbs = null,
    fats = null,
    source = 'logged',
    notes = null
}) {
    return {
        log_date: logDate,
        meal_type: mealType,
        food_id: foodId,
        food_name: foodName,
        quantity_grams: quantityGrams,
        quantity_unit: quantityUnit,
        calories,
        protein,
        carbs,
        fats,
        source,
        notes,
        created_at: new Date().toISOString()
    };
}

/**
 * Create a restaurant/outside food entry with estimation
 */
function createRestaurantEntry({
    logDate,
    mealType,
    description,
    portionSize = 'medium', // small, medium, large
    cuisineType = 'indian'
}) {
    // Rough estimates for typical restaurant portions
    const estimates = {
        small: { calories: 400, protein: 15, carbs: 50, fats: 15 },
        medium: { calories: 650, protein: 25, carbs: 80, fats: 25 },
        large: { calories: 900, protein: 35, carbs: 110, fats: 35 }
    };

    const est = estimates[portionSize] || estimates.medium;

    return createFoodLogEntry({
        logDate,
        mealType,
        foodName: description,
        calories: est.calories,
        protein: est.protein,
        carbs: est.carbs,
        fats: est.fats,
        source: 'restaurant',
        notes: `Estimated ${portionSize} portion, ${cuisineType} cuisine`
    });
}

/**
 * Calculate daily totals from food log entries
 */
function calculateDailyTotals(entries) {
    if (!entries || entries.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 };
    }

    return entries.reduce((totals, entry) => ({
        calories: totals.calories + (entry.calories || 0),
        protein: totals.protein + (entry.protein || 0),
        carbs: totals.carbs + (entry.carbs || 0),
        fats: totals.fats + (entry.fats || 0),
        meals: totals.meals + 1
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 });
}

/**
 * Compare actual vs planned for a day
 */
function compareActualVsPlanned(actualEntries, plannedMeals, targets) {
    const actual = calculateDailyTotals(actualEntries);

    const comparison = {
        calories: {
            planned: targets.calories,
            actual: actual.calories,
            difference: actual.calories - targets.calories,
            percent: Math.round((actual.calories / targets.calories) * 100)
        },
        protein: {
            planned: targets.protein,
            actual: actual.protein,
            difference: actual.protein - targets.protein,
            percent: Math.round((actual.protein / targets.protein) * 100)
        },
        carbs: {
            planned: targets.carbs,
            actual: actual.carbs,
            difference: actual.carbs - targets.carbs,
            percent: Math.round((actual.carbs / targets.carbs) * 100)
        },
        fats: {
            planned: targets.fats,
            actual: actual.fats,
            difference: actual.fats - targets.fats,
            percent: Math.round((actual.fats / targets.fats) * 100)
        }
    };

    // Calculate overall compliance
    const macroCompliance = Math.round(
        (comparison.calories.percent + comparison.protein.percent) / 2
    );

    comparison.overallCompliance = Math.min(100, macroCompliance);
    comparison.proteinMet = comparison.protein.percent >= 80;
    comparison.inCalorieRange = Math.abs(comparison.calories.difference) <= 200;

    return comparison;
}

/**
 * Get entries by meal type for a day
 */
function groupByMealType(entries) {
    return entries.reduce((groups, entry) => {
        const meal = entry.meal_type || 'other';
        if (!groups[meal]) groups[meal] = [];
        groups[meal].push(entry);
        return groups;
    }, {});
}

/**
 * Check protein distribution across meals
 */
function analyzeProteinDistribution(entries) {
    const byMeal = groupByMealType(entries);
    const mealProtein = {};

    for (const [meal, items] of Object.entries(byMeal)) {
        mealProtein[meal] = items.reduce((sum, item) => sum + (item.protein || 0), 0);
    }

    const mainMeals = ['breakfast', 'lunch', 'dinner'];
    const issues = [];

    for (const meal of mainMeals) {
        const protein = mealProtein[meal] || 0;
        if (protein < 20) {
            issues.push({
                meal,
                protein,
                issue: 'low_protein',
                suggestion: `Add protein source to ${meal} (aim for 25-40g)`
            });
        } else if (protein > 50) {
            issues.push({
                meal,
                protein,
                issue: 'excess_protein',
                suggestion: `Spread protein across meals (40-50g per meal is optimal)`
            });
        }
    }

    return {
        byMeal: mealProtein,
        issues,
        wellDistributed: issues.length === 0
    };
}

module.exports = {
    createFoodLogEntry,
    createRestaurantEntry,
    calculateDailyTotals,
    compareActualVsPlanned,
    groupByMealType,
    analyzeProteinDistribution
};
