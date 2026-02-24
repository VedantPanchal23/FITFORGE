/**
 * Intake Analyzer Engine
 * Analyzes planned vs actual food intake and suggests compensation
 * 
 * Features:
 * - Calculate daily planned intake from meal plan
 * - Calculate daily actual intake from food logs
 * - Detect macro deficits/surpluses
 * - Suggest compensation foods for protein gaps
 * - Provide tomorrow plan adjustments
 */

const { getAllFoods, getFoodsByDiet } = require('../../data/foods');

// ============================================================================
// CORE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get daily planned intake from a meal plan
 * @param {object} mealPlan - Generated meal plan from NutritionEngine
 * @returns {object} { calories, protein, carbs, fats }
 */
function getDailyPlannedIntake(mealPlan) {
    if (!mealPlan || !mealPlan.meals) {
        return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }

    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    // Sum up all meals
    const meals = Array.isArray(mealPlan.meals) ? mealPlan.meals : Object.values(mealPlan.meals);

    meals.forEach(meal => {
        if (!meal) return;

        // Handle new structure with primary/alternatives
        const mealData = meal.primary || meal;

        totals.calories += mealData.calories || 0;
        totals.protein += mealData.protein || 0;
        totals.carbs += mealData.carbs || 0;
        totals.fats += mealData.fats || 0;
    });

    // If meal plan has direct macro totals, use those
    if (mealPlan.totalMacros) {
        totals = { ...mealPlan.totalMacros };
    }

    return totals;
}

/**
 * Calculate actual intake from food log summary
 * @param {object} foodSummary - Result from getDailyFoodSummary()
 * @returns {object} { calories, protein, carbs, fats, itemCount }
 */
function getDailyActualIntake(foodSummary) {
    if (!foodSummary) {
        return { calories: 0, protein: 0, carbs: 0, fats: 0, itemCount: 0 };
    }

    return {
        calories: Math.round(foodSummary.total_calories || 0),
        protein: Math.round((foodSummary.total_protein || 0) * 10) / 10,
        carbs: Math.round((foodSummary.total_carbs || 0) * 10) / 10,
        fats: Math.round((foodSummary.total_fats || 0) * 10) / 10,
        itemCount: foodSummary.total_items || 0
    };
}

/**
 * Calculate deficit/surplus between planned and actual intake
 * @param {object} planned - Planned macros { calories, protein, carbs, fats }
 * @param {object} actual - Actual macros { calories, protein, carbs, fats }
 * @returns {object} Detailed deficit analysis
 */
function calculateDeficitSurplus(planned, actual) {
    const analysis = {
        calories: {
            planned: planned.calories || 0,
            actual: actual.calories || 0,
            difference: (actual.calories || 0) - (planned.calories || 0),
            percentComplete: planned.calories > 0
                ? Math.round((actual.calories / planned.calories) * 100)
                : 0,
            status: 'on_track'
        },
        protein: {
            planned: planned.protein || 0,
            actual: actual.protein || 0,
            difference: (actual.protein || 0) - (planned.protein || 0),
            percentComplete: planned.protein > 0
                ? Math.round((actual.protein / planned.protein) * 100)
                : 0,
            status: 'on_track'
        },
        carbs: {
            planned: planned.carbs || 0,
            actual: actual.carbs || 0,
            difference: (actual.carbs || 0) - (planned.carbs || 0),
            percentComplete: planned.carbs > 0
                ? Math.round((actual.carbs / planned.carbs) * 100)
                : 0,
            status: 'on_track'
        },
        fats: {
            planned: planned.fats || 0,
            actual: actual.fats || 0,
            difference: (actual.fats || 0) - (planned.fats || 0),
            percentComplete: planned.fats > 0
                ? Math.round((actual.fats / planned.fats) * 100)
                : 0,
            status: 'on_track'
        }
    };

    // Determine status for each macro
    Object.keys(analysis).forEach(macro => {
        const item = analysis[macro];
        if (item.percentComplete < 70) {
            item.status = 'deficit';
        } else if (item.percentComplete > 120) {
            item.status = 'surplus';
        } else if (item.percentComplete >= 90 && item.percentComplete <= 110) {
            item.status = 'on_target';
        }
    });

    // Overall assessment
    analysis.overallStatus = getOverallStatus(analysis);
    analysis.primaryConcern = getPrimaryConcern(analysis);

    return analysis;
}

/**
 * Get overall intake status
 */
function getOverallStatus(analysis) {
    const proteinStatus = analysis.protein.status;
    const calorieStatus = analysis.calories.status;

    if (proteinStatus === 'deficit' && analysis.protein.percentComplete < 70) {
        return 'low_protein';
    }
    if (calorieStatus === 'deficit' && analysis.calories.percentComplete < 60) {
        return 'undereating';
    }
    if (calorieStatus === 'surplus' && analysis.calories.percentComplete > 130) {
        return 'overeating';
    }
    if (analysis.protein.status === 'on_target' && analysis.calories.status === 'on_track') {
        return 'good';
    }
    return 'fair';
}

/**
 * Get the primary concern for messaging
 */
function getPrimaryConcern(analysis) {
    // Priority: protein deficit > calorie deficit > surplus
    if (analysis.protein.status === 'deficit') {
        return {
            type: 'protein_deficit',
            amount: Math.abs(analysis.protein.difference),
            message: `You're ${Math.abs(Math.round(analysis.protein.difference))}g short on protein today.`
        };
    }
    if (analysis.calories.status === 'deficit' && analysis.calories.percentComplete < 80) {
        return {
            type: 'calorie_deficit',
            amount: Math.abs(analysis.calories.difference),
            message: `You're ${Math.abs(Math.round(analysis.calories.difference))} kcal under target.`
        };
    }
    if (analysis.calories.status === 'surplus') {
        return {
            type: 'calorie_surplus',
            amount: analysis.calories.difference,
            message: `You're ${Math.round(analysis.calories.difference)} kcal over target.`
        };
    }
    return null;
}

// ============================================================================
// COMPENSATION SUGGESTIONS
// ============================================================================

/**
 * Suggest compensation foods for protein deficit
 * @param {number} proteinGap - Grams of protein needed
 * @param {object} profile - User profile for diet restrictions
 * @returns {array} List of food suggestions with portions
 */
function suggestCompensationFoods(proteinGap, profile = {}) {
    if (proteinGap <= 0) return [];

    const dietType = profile.diet_type || 'nonveg';
    const suggestions = [];

    // High-protein foods with quick/easy options prioritized
    const compensationFoods = [
        // Quick protein sources
        { id: 'greek_yogurt', name: 'Greek Yogurt', protein_per_100g: 10, portion: 200, category: 'dairy', diets: ['veg', 'nonveg'] },
        { id: 'curd', name: 'Curd (Dahi)', protein_per_100g: 11, portion: 200, category: 'dairy', diets: ['veg', 'nonveg', 'jain'] },
        { id: 'whey_protein', name: 'Whey Protein (1 scoop)', protein_per_100g: 80, portion: 30, category: 'supplement', diets: ['veg', 'nonveg'] },
        { id: 'paneer', name: 'Paneer', protein_per_100g: 18, portion: 100, category: 'dairy', diets: ['veg', 'nonveg', 'jain'] },
        { id: 'cottage_cheese', name: 'Cottage Cheese', protein_per_100g: 11, portion: 150, category: 'dairy', diets: ['veg', 'nonveg'] },
        { id: 'eggs_boiled', name: 'Boiled Eggs', protein_per_100g: 13, portion: 100, unit: '2 eggs', category: 'protein', diets: ['nonveg', 'eggetarian'] },
        { id: 'chicken_breast', name: 'Chicken Breast', protein_per_100g: 31, portion: 100, category: 'protein', diets: ['nonveg'] },
        { id: 'tofu', name: 'Tofu', protein_per_100g: 8, portion: 150, category: 'protein', diets: ['vegan', 'veg', 'nonveg'] },
        { id: 'moong_sprouts', name: 'Moong Sprouts', protein_per_100g: 7, portion: 150, category: 'legumes', diets: ['vegan', 'veg', 'nonveg', 'jain'] },
        { id: 'soya_chunks', name: 'Soya Chunks (cooked)', protein_per_100g: 52, portion: 50, category: 'protein', diets: ['vegan', 'veg', 'nonveg'] },
        { id: 'chana', name: 'Chana (Chickpeas)', protein_per_100g: 19, portion: 100, category: 'legumes', diets: ['vegan', 'veg', 'nonveg', 'jain'] },
        { id: 'almonds', name: 'Almonds', protein_per_100g: 21, portion: 30, category: 'nuts', diets: ['vegan', 'veg', 'nonveg', 'jain'] },
        { id: 'peanuts', name: 'Roasted Peanuts', protein_per_100g: 26, portion: 40, category: 'nuts', diets: ['vegan', 'veg', 'nonveg', 'jain'] },
    ];

    // Filter by diet type
    const filteredFoods = compensationFoods.filter(food =>
        food.diets.includes(dietType) || food.diets.includes('nonveg')
    );

    // Calculate how much protein each suggestion provides
    filteredFoods.forEach(food => {
        const proteinProvided = (food.protein_per_100g * food.portion) / 100;

        if (proteinProvided >= 5) { // Only suggest if provides at least 5g
            suggestions.push({
                foodId: food.id,
                name: food.name,
                portion: food.portion,
                unit: food.unit || `${food.portion}g`,
                proteinProvided: Math.round(proteinProvided * 10) / 10,
                coversGap: proteinProvided >= proteinGap,
                percentOfGap: Math.round((proteinProvided / proteinGap) * 100)
            });
        }
    });

    // Sort by protein provided (descending)
    suggestions.sort((a, b) => b.proteinProvided - a.proteinProvided);

    // Return top 5 suggestions
    return suggestions.slice(0, 5);
}

/**
 * Get human-readable compensation message
 * @param {array} suggestions - Compensation food suggestions
 * @param {number} proteinGap - Protein deficit in grams
 * @returns {string} Formatted message
 */
function formatCompensationMessage(suggestions, proteinGap) {
    if (!suggestions || suggestions.length === 0) return '';

    const lines = [`Suggested compensation for ${Math.round(proteinGap)}g protein:`];

    suggestions.slice(0, 3).forEach((s, i) => {
        lines.push(`• Add ${s.unit} ${s.name} (+${s.proteinProvided}g protein)`);
    });

    return lines.join('\n');
}

// ============================================================================
// TOMORROW ADAPTATION
// ============================================================================

/**
 * Generate adjustments for tomorrow's plan based on today's intake
 * @param {object} analysis - Today's deficit/surplus analysis
 * @param {object} profile - User profile
 * @returns {object} Adjustment recommendations
 */
function adjustTomorrowPlan(analysis, profile) {
    const adjustments = {
        calories: 0,
        protein: 0,
        recommendations: [],
        mealSuggestions: []
    };

    if (!analysis) return adjustments;

    const concern = analysis.primaryConcern;

    // Protein deficit handling
    if (analysis.protein.status === 'deficit') {
        const proteinGap = Math.abs(analysis.protein.difference);

        // Add extra protein to tomorrow if significant deficit
        if (proteinGap > 20) {
            adjustments.protein = Math.min(proteinGap * 0.3, 15); // Add up to 15g extra
            adjustments.recommendations.push({
                type: 'increase_protein',
                message: `Tomorrow: Adding ${Math.round(adjustments.protein)}g extra protein to compensate`,
                priority: 'high'
            });
            adjustments.mealSuggestions.push({
                meal: 'breakfast',
                suggestion: 'Add eggs or paneer to breakfast for extra protein'
            });
        }
    }

    // Calorie surplus handling
    if (analysis.calories.status === 'surplus') {
        const surplus = analysis.calories.difference;

        if (surplus > 200) {
            adjustments.calories = -Math.min(surplus * 0.3, 200); // Reduce up to 200 kcal
            adjustments.recommendations.push({
                type: 'reduce_calories',
                message: `Tomorrow: Lighter meals to compensate for today's surplus`,
                priority: 'medium'
            });
            adjustments.mealSuggestions.push({
                meal: 'dinner',
                suggestion: 'Have a lighter dinner with more vegetables'
            });
        }
    }

    // Calorie deficit handling (undereating)
    if (analysis.calories.status === 'deficit' && analysis.calories.percentComplete < 70) {
        adjustments.recommendations.push({
            type: 'eat_more',
            message: 'Ensure you eat adequate calories - undereating affects metabolism',
            priority: 'high'
        });
    }

    // Add general coaching message
    adjustments.coachMessage = generateCoachMessage(analysis);

    return adjustments;
}

/**
 * Generate motivational coach message based on analysis
 */
function generateCoachMessage(analysis) {
    if (!analysis) return '';

    if (analysis.overallStatus === 'good' || analysis.overallStatus === 'fair') {
        if (analysis.protein.percentComplete >= 90) {
            return 'Great job hitting your protein target today! 💪';
        }
        return 'Solid day! Keep up the consistency.';
    }

    if (analysis.overallStatus === 'low_protein') {
        return 'Protein is key for your goals. Let\'s do better tomorrow!';
    }

    if (analysis.overallStatus === 'undereating') {
        return 'Your body needs fuel to perform. Try to eat closer to your targets.';
    }

    if (analysis.overallStatus === 'overeating') {
        return 'One day won\'t derail progress. Stay mindful tomorrow.';
    }

    return 'Every day is a chance to improve. You\'ve got this!';
}

// ============================================================================
// COMBINED SUMMARY
// ============================================================================

/**
 * Get complete intake summary for UI display
 * @param {object} mealPlan - Today's meal plan
 * @param {object} foodSummary - Today's food log summary
 * @param {object} profile - User profile
 * @returns {object} Complete summary with analysis and suggestions
 */
function getIntakeSummary(mealPlan, foodSummary, profile = {}) {
    const planned = getDailyPlannedIntake(mealPlan);
    const actual = getDailyActualIntake(foodSummary);
    const analysis = calculateDeficitSurplus(planned, actual);

    const summary = {
        planned,
        actual,
        analysis,
        hasLogs: actual.itemCount > 0,
        itemsLogged: actual.itemCount
    };

    // Add compensation suggestions if protein deficit
    if (analysis.protein.status === 'deficit') {
        const proteinGap = Math.abs(analysis.protein.difference);
        summary.compensationSuggestions = suggestCompensationFoods(proteinGap, profile);
        summary.compensationMessage = formatCompensationMessage(
            summary.compensationSuggestions,
            proteinGap
        );
    }

    // Add tomorrow adjustments
    summary.tomorrowAdjustments = adjustTomorrowPlan(analysis, profile);

    return summary;
}

// ============================================================================
// MEAL-LEVEL ANALYSIS
// ============================================================================

/**
 * Analyze which meals are logged vs missing
 * @param {array} foodLogs - All food logs for the day
 * @returns {object} Meal status breakdown
 */
function analyzeMealCompletion(foodLogs) {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealStatus = {};

    mealTypes.forEach(meal => {
        const logsForMeal = foodLogs.filter(log => log.meal_type === meal);
        mealStatus[meal] = {
            logged: logsForMeal.length > 0,
            itemCount: logsForMeal.length,
            items: logsForMeal.map(log => ({
                name: log.food_name,
                calories: log.calories,
                protein: log.protein
            })),
            totalCalories: logsForMeal.reduce((sum, log) => sum + (log.calories || 0), 0),
            totalProtein: logsForMeal.reduce((sum, log) => sum + (log.protein || 0), 0)
        };
    });

    const missingMeals = mealTypes.filter(meal => !mealStatus[meal].logged);
    const loggedMeals = mealTypes.filter(meal => mealStatus[meal].logged);

    return {
        byMeal: mealStatus,
        missingMeals,
        loggedMeals,
        completionRate: Math.round((loggedMeals.length / mealTypes.length) * 100)
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Core analysis
    getDailyPlannedIntake,
    getDailyActualIntake,
    calculateDeficitSurplus,

    // Compensation
    suggestCompensationFoods,
    formatCompensationMessage,

    // Adaptation
    adjustTomorrowPlan,
    generateCoachMessage,

    // Combined
    getIntakeSummary,
    analyzeMealCompletion
};
