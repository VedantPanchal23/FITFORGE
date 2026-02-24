/**
 * Health Condition Filter
 * Filters foods and exercises based on user health conditions
 */

const { HEALTH_CONDITIONS } = require('../utils/constants');

/**
 * Filter foods based on health conditions
 */
function filterFoodsForConditions(foods, conditions) {
    if (!conditions || conditions.length === 0) return foods;

    let filtered = [...foods];

    for (const condition of conditions) {
        const conditionData = HEALTH_CONDITIONS[condition];
        if (!conditionData) continue;

        if (conditionData.avoid) {
            filtered = filtered.filter(food =>
                !conditionData.avoid.includes(food.id) &&
                !conditionData.avoid.some(avoid => food.id?.includes(avoid))
            );
        }

        if (conditionData.avoid_high_gi && food.glycemic_index) {
            filtered = filtered.filter(food =>
                !food.glycemic_index || food.glycemic_index < 70
            );
        }
    }

    return filtered;
}

/**
 * Get alternatives for a food based on health conditions
 */
function getAlternatives(foodId, conditions) {
    const alternatives = new Set();

    for (const condition of conditions) {
        const conditionData = HEALTH_CONDITIONS[condition];
        if (!conditionData?.alternatives) continue;

        if (conditionData.avoid?.includes(foodId)) {
            conditionData.alternatives.forEach(alt => alternatives.add(alt));
        }
    }

    return Array.from(alternatives);
}

/**
 * Get nutrition notes for conditions
 */
function getConditionNotes(conditions) {
    const notes = [];

    for (const condition of conditions) {
        const conditionData = HEALTH_CONDITIONS[condition];
        if (conditionData?.notes) {
            notes.push({
                condition,
                note: conditionData.notes
            });
        }
    }

    return notes;
}

/**
 * Get TDEE adjustment for thyroid condition
 */
function getConditionTDEEAdjustment(conditions, baseTDEE) {
    let adjustment = 0;

    for (const condition of conditions) {
        const conditionData = HEALTH_CONDITIONS[condition];
        if (conditionData?.tdee_adjustment) {
            adjustment += conditionData.tdee_adjustment;
        }
    }

    return {
        adjustedTDEE: Math.round(baseTDEE * (1 + adjustment)),
        adjustmentPercent: Math.round(adjustment * 100),
        reason: adjustment !== 0 ? 'Adjusted for metabolic condition' : null
    };
}

/**
 * Get carb adjustment for PCOS
 */
function getCarbAdjustment(conditions, baseCarbs) {
    let reduction = 0;

    for (const condition of conditions) {
        const conditionData = HEALTH_CONDITIONS[condition];
        if (conditionData?.carb_reduction) {
            reduction = Math.max(reduction, conditionData.carb_reduction);
        }
    }

    if (reduction > 0) {
        return {
            adjustedCarbs: Math.round(baseCarbs * (1 - reduction)),
            reduction: Math.round(reduction * 100),
            reason: 'Reduced carbs for hormonal condition'
        };
    }

    return { adjustedCarbs: baseCarbs, reduction: 0 };
}

/**
 * Check if a specific food is safe for conditions
 */
function isFoodSafe(foodId, conditions) {
    for (const condition of conditions) {
        const conditionData = HEALTH_CONDITIONS[condition];
        if (conditionData?.avoid?.includes(foodId)) {
            return {
                safe: false,
                reason: `Not recommended for ${condition.replace('_', ' ')}`,
                alternatives: conditionData.alternatives || []
            };
        }
    }

    return { safe: true };
}

/**
 * Get all condition warnings for a meal plan
 */
function checkMealPlanForConditions(mealPlan, conditions) {
    const warnings = [];

    if (!mealPlan?.meals || !conditions || conditions.length === 0) {
        return warnings;
    }

    const allFoods = [];
    for (const meal of Object.values(mealPlan.meals)) {
        if (meal?.foods) {
            allFoods.push(...meal.foods.map(f => f.id || f.food_id));
        }
    }

    for (const foodId of allFoods) {
        const safety = isFoodSafe(foodId, conditions);
        if (!safety.safe) {
            warnings.push({
                foodId,
                ...safety
            });
        }
    }

    return warnings;
}

/**
 * Get list of available health conditions
 */
function getAvailableConditions() {
    return Object.entries(HEALTH_CONDITIONS).map(([id, data]) => ({
        id,
        name: id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        notes: data.notes
    }));
}

module.exports = {
    filterFoodsForConditions,
    getAlternatives,
    getConditionNotes,
    getConditionTDEEAdjustment,
    getCarbAdjustment,
    isFoodSafe,
    checkMealPlanForConditions,
    getAvailableConditions
};
