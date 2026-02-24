/**
 * MealPlan Model
 * Data model for daily meal plans
 * Supports alternatives per meal slot for the adaptive coach upgrade
 */

const DEFAULT_MEAL_PLAN = {
    plan_date: null,
    meals: {
        breakfast: { primary: null, alternatives: [], macroTarget: null },
        lunch: { primary: null, alternatives: [], macroTarget: null },
        dinner: { primary: null, alternatives: [], macroTarget: null },
        snacks: []
    },
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
    total_fiber: 0,
    explanation: null,
    contextMode: 'normal',
    rescheduled: null,
    swapHistory: []
};

function createMeal(mealType, time, foods) {
    const totals = foods.reduce((acc, food) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fats: acc.fats + (food.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return {
        meal_type: mealType,
        time,
        foods,
        total_calories: Math.round(totals.calories),
        total_protein: Math.round(totals.protein),
        total_carbs: Math.round(totals.carbs),
        total_fats: Math.round(totals.fats)
    };
}

function createMealPlan(data) {
    const plan = {
        ...DEFAULT_MEAL_PLAN,
        ...data,
        plan_date: data.plan_date || new Date().toISOString().split('T')[0]
    };

    if (plan.meals && !data.total_calories) {
        const allMeals = [plan.meals.breakfast, plan.meals.lunch, plan.meals.dinner, ...(plan.meals.snacks || [])].filter(Boolean);
        const totals = allMeals.reduce((acc, meal) => ({
            calories: acc.calories + (meal.total_calories || 0),
            protein: acc.protein + (meal.total_protein || 0),
            carbs: acc.carbs + (meal.total_carbs || 0),
            fats: acc.fats + (meal.total_fats || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        plan.total_calories = totals.calories;
        plan.total_protein = totals.protein;
        plan.total_carbs = totals.carbs;
        plan.total_fats = totals.fats;
    }
    return plan;
}

function validateMealPlanTargets(mealPlan, targets) {
    const tolerance = 0.05;
    const deviations = {
        calories: Math.abs(mealPlan.total_calories - targets.calories) / targets.calories,
        protein: Math.abs(mealPlan.total_protein - targets.protein) / targets.protein
    };
    const proteinValid = deviations.protein <= tolerance;
    const caloriesValid = deviations.calories <= tolerance * 2;

    return { valid: proteinValid && caloriesValid, deviations };
}

function serializeMealPlan(mealPlan) {
    return { ...mealPlan, meals: JSON.stringify(mealPlan.meals) };
}

function deserializeMealPlan(row) {
    if (!row) return null;
    return { ...row, meals: JSON.parse(row.meals || '{}') };
}

module.exports = {
    DEFAULT_MEAL_PLAN,
    createMeal,
    createMealPlan,
    validateMealPlanTargets,
    serializeMealPlan,
    deserializeMealPlan
};
