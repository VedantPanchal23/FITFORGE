/**
 * Nutrition Engine Tests
 */

const {
    getAvailableFoods,
    filterByDietType,
    applyJainRestrictions,
    generateMealPlan
} = require('../../src/core/engines/NutritionEngine');

const { JAIN_FORBIDDEN_FOODS } = require('../../src/core/utils/constants');

describe('Diet Type Filtering', () => {
    const mockFoods = [
        { id: 'chicken', name: 'Chicken', diet_types: ['nonveg'] },
        { id: 'egg', name: 'Egg', diet_types: ['nonveg', 'veg_egg'] },
        { id: 'paneer', name: 'Paneer', diet_types: ['veg', 'veg_egg', 'jain'] },
        { id: 'potato', name: 'Potato', diet_types: ['veg', 'nonveg', 'veg_egg'], jain_forbidden: true }
    ];

    test('filters for vegetarian diet', () => {
        const filtered = filterByDietType(mockFoods, 'veg');
        expect(filtered.length).toBe(2);
        expect(filtered.some(f => f.id === 'chicken')).toBe(false);
    });

    test('filters for non-vegetarian diet', () => {
        const filtered = filterByDietType(mockFoods, 'nonveg');
        expect(filtered.length).toBe(3);
        expect(filtered.some(f => f.id === 'chicken')).toBe(true);
    });

    test('filters for veg+egg diet', () => {
        const filtered = filterByDietType(mockFoods, 'veg_egg');
        expect(filtered.some(f => f.id === 'egg')).toBe(true);
        expect(filtered.some(f => f.id === 'chicken')).toBe(false);
    });
});

describe('Jain Restrictions', () => {
    const mockFoods = [
        { id: 'paneer', name: 'Paneer' },
        { id: 'potato', name: 'Potato', jain_forbidden: true },
        { id: 'onion_dish', name: 'Onion Paratha' },
        { id: 'rice', name: 'Rice' },
        { id: 'garlic_bread', name: 'Garlic Bread' }
    ];

    test('removes jain_forbidden foods', () => {
        const filtered = applyJainRestrictions(mockFoods);
        expect(filtered.some(f => f.id === 'potato')).toBe(false);
        expect(filtered.some(f => f.id === 'paneer')).toBe(true);
    });

    test('removes foods containing forbidden ingredients', () => {
        const filtered = applyJainRestrictions(mockFoods);
        expect(filtered.some(f => f.id === 'onion_dish')).toBe(false);
        expect(filtered.some(f => f.id === 'garlic_bread')).toBe(false);
    });

    test('JAIN_FORBIDDEN_FOODS includes all root vegetables', () => {
        const roots = ['potato', 'onion', 'garlic', 'ginger', 'carrot', 'radish', 'beetroot'];
        roots.forEach(root => {
            expect(JAIN_FORBIDDEN_FOODS).toContain(root);
        });
    });
});

describe('Get Available Foods', () => {
    test('returns foods for basic profile', () => {
        const profile = {
            diet_type: 'veg',
            food_exclusions: []
        };

        const foods = getAvailableFoods(profile);
        expect(foods.length).toBeGreaterThan(0);
        expect(foods.every(f => f.diet_types.includes('veg'))).toBe(true);
    });

    test('applies Jain restrictions for Jain profile', () => {
        const profile = {
            diet_type: 'jain',
            food_exclusions: []
        };

        const foods = getAvailableFoods(profile);

        // Check no forbidden foods
        const forbiddenFound = foods.some(f =>
            JAIN_FORBIDDEN_FOODS.some(forbidden => f.id.toLowerCase().includes(forbidden))
        );
        expect(forbiddenFound).toBe(false);
    });

    test('applies custom exclusions', () => {
        const profile = {
            diet_type: 'nonveg',
            food_exclusions: ['chicken']
        };

        const foods = getAvailableFoods(profile);
        expect(foods.some(f => f.id.includes('chicken'))).toBe(false);
    });
});

describe('Meal Plan Generation', () => {
    const testProfile = {
        gender: 'male',
        weight_kg: 70,
        diet_type: 'veg',
        goal_type: 'muscle_gain',
        target_calories: 2500,
        protein_grams: 140,
        carbs_grams: 300,
        fats_grams: 80,
        food_exclusions: []
    };

    test('generates complete meal plan', () => {
        const plan = generateMealPlan(testProfile, '2024-01-15');

        expect(plan).toBeDefined();
        expect(plan.meals).toBeDefined();
        expect(plan.meals.breakfast).toBeDefined();
        expect(plan.meals.lunch).toBeDefined();
        expect(plan.meals.dinner).toBeDefined();
    });

    test('meal plan has calories', () => {
        const plan = generateMealPlan(testProfile, '2024-01-15');
        expect(plan.total_calories).toBeGreaterThan(0);
        expect(plan.total_protein).toBeGreaterThan(0);
    });

    test('meal plan respects diet type', () => {
        const jainProfile = {
            ...testProfile,
            diet_type: 'jain'
        };

        const plan = generateMealPlan(jainProfile, '2024-01-15');

        // Check all foods in plan
        const allFoods = [
            ...(plan.meals.breakfast?.foods || []),
            ...(plan.meals.lunch?.foods || []),
            ...(plan.meals.dinner?.foods || [])
        ];

        const hasForbidden = allFoods.some(food =>
            JAIN_FORBIDDEN_FOODS.some(forbidden =>
                food.name?.toLowerCase().includes(forbidden) ||
                food.id?.toLowerCase().includes(forbidden)
            )
        );

        expect(hasForbidden).toBe(false);
    });

    test('meal plan has explanation', () => {
        const plan = generateMealPlan(testProfile, '2024-01-15');
        expect(plan.explanation).toBeDefined();
        expect(plan.explanation.length).toBeGreaterThan(0);
    });
});
