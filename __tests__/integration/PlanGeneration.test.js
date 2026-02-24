/**
 * Integration Tests
 * Tests complete flows from profile creation to plan generation
 */

const {
    initializeProfile,
    generateDailyPlan,
    generateWeeklyPlan,
    getOnboardingQuestions
} = require('../../src/services/PlanGeneratorService');

const { validateProfileInput } = require('../../src/core/validators/InputValidator');
const { validateWeightGoal } = require('../../src/core/validators/GoalValidator');

describe('Complete Profile Initialization', () => {
    const validProfile = {
        gender: 'male',
        age: 25,
        height_cm: 175,
        weight_kg: 70,
        body_fat_percent: null,
        goal_type: 'muscle_gain',
        target_weight_kg: 75,
        target_weeks: 20,
        diet_type: 'nonveg',
        food_exclusions: [],
        activity_level: 'moderate',
        sleep_hours_avg: 7,
        stress_level: 'medium',
        digestion_quality: 'good',
        experience_level: 'intermediate',
        injuries: [],
        skin_type: 'normal',
        skin_concerns: [],
        facial_goals: ['jawline'],
        hair_concerns: []
    };

    test('initializes profile with all calculated values', () => {
        const result = initializeProfile(validProfile);

        expect(result.success).toBe(true);
        expect(result.profile).toBeDefined();
        expect(result.profile.bmr).toBeGreaterThan(0);
        expect(result.profile.tdee).toBeGreaterThan(0);
        expect(result.profile.target_calories).toBeGreaterThan(0);
        expect(result.profile.protein_grams).toBeGreaterThan(0);
    });

    test('muscle gain has calorie surplus', () => {
        const result = initializeProfile(validProfile);
        expect(result.profile.target_calories).toBeGreaterThan(result.metrics.tdee);
    });

    test('fat loss has calorie deficit', () => {
        const fatLossProfile = { ...validProfile, goal_type: 'fat_loss', target_weight_kg: 65 };
        const result = initializeProfile(fatLossProfile);
        expect(result.profile.target_calories).toBeLessThan(result.metrics.tdee);
    });

    test('fails for incomplete profile', () => {
        const incomplete = { gender: 'male', age: 25 }; // Missing required fields
        const result = initializeProfile(incomplete);

        expect(result.success).toBe(false);
        expect(result.missing).toBeDefined();
        expect(result.missing.length).toBeGreaterThan(0);
    });

    test('provides explanations for calculations', () => {
        const result = initializeProfile(validProfile);

        expect(result.explanations).toBeDefined();
        expect(result.explanations.bmr).toBeDefined();
        expect(result.explanations.protein).toBeDefined();
    });
});

describe('Daily Plan Generation', () => {
    const testProfile = {
        gender: 'male',
        age: 25,
        height_cm: 175,
        weight_kg: 70,
        goal_type: 'muscle_gain',
        diet_type: 'veg',
        food_exclusions: [],
        activity_level: 'moderate',
        experience_level: 'intermediate',
        injuries: [],
        skin_type: 'oily',
        skin_concerns: ['dark_circles'],
        facial_goals: ['jawline'],
        target_calories: 2500,
        protein_grams: 140,
        carbs_grams: 300,
        fats_grams: 80
    };

    test('generates complete daily plan', () => {
        const plan = generateDailyPlan(testProfile, '2024-01-15');

        expect(plan.mealPlan).toBeDefined();
        expect(plan.workoutPlan).toBeDefined();
        expect(plan.lifestyle).toBeDefined();
        expect(plan.looksmaxingPlan).toBeDefined();
    });

    test('meal plan has all meals', () => {
        const plan = generateDailyPlan(testProfile, '2024-01-15');

        expect(plan.mealPlan.meals.breakfast).toBeDefined();
        expect(plan.mealPlan.meals.lunch).toBeDefined();
        expect(plan.mealPlan.meals.dinner).toBeDefined();
    });

    test('workout plan matches experience level', () => {
        const beginnerProfile = { ...testProfile, experience_level: 'beginner' };
        const plan = generateDailyPlan(beginnerProfile, '2024-01-15');

        // Beginner should have easier difficulty
        if (!plan.workoutPlan.is_rest_day) {
            expect(plan.workoutPlan.difficulty_level).toBe('easy');
        }
    });

    test('looksmaxing plan includes skincare for skin type', () => {
        const plan = generateDailyPlan(testProfile, '2024-01-15');

        expect(plan.looksmaxingPlan.skincare_am).toBeDefined();
        expect(plan.looksmaxingPlan.skincare_pm).toBeDefined();
        expect(plan.looksmaxingPlan.skincare_am.length).toBeGreaterThan(0);
    });

    test('lifestyle includes all areas', () => {
        const plan = generateDailyPlan(testProfile, '2024-01-15');

        expect(plan.lifestyle.sleep).toBeDefined();
        expect(plan.lifestyle.stress).toBeDefined();
        expect(plan.lifestyle.hydration).toBeDefined();
    });
});

describe('Weekly Plan Generation', () => {
    const testProfile = {
        gender: 'female',
        age: 28,
        height_cm: 165,
        weight_kg: 60,
        goal_type: 'fat_loss',
        diet_type: 'veg_egg',
        food_exclusions: [],
        activity_level: 'light',
        experience_level: 'beginner',
        injuries: [],
        target_calories: 1600,
        protein_grams: 120,
        carbs_grams: 150,
        fats_grams: 55
    };

    test('generates 7 days of plans', () => {
        const weekPlan = generateWeeklyPlan(testProfile, '2024-01-15');

        expect(weekPlan.plans.length).toBe(7);
    });

    test('includes rest days', () => {
        const weekPlan = generateWeeklyPlan(testProfile, '2024-01-15');

        const restDays = weekPlan.plans.filter(p => p.workoutPlan.is_rest_day);
        expect(restDays.length).toBeGreaterThan(0);
    });

    test('week summary has totals', () => {
        const weekPlan = generateWeeklyPlan(testProfile, '2024-01-15');

        expect(weekPlan.weekSummary.totalCalories).toBe(testProfile.target_calories * 7);
        expect(weekPlan.weekSummary.workoutDays).toBeGreaterThan(0);
        expect(weekPlan.weekSummary.restDays).toBeGreaterThan(0);
    });
});

describe('Jain Profile Flow', () => {
    const jainProfile = {
        gender: 'female',
        age: 30,
        height_cm: 160,
        weight_kg: 55,
        goal_type: 'health',
        diet_type: 'jain',
        food_exclusions: [],
        activity_level: 'sedentary',
        experience_level: 'beginner',
        injuries: [],
        target_calories: 1700,
        protein_grams: 90,
        carbs_grams: 200,
        fats_grams: 60
    };

    test('jain meal plan has no forbidden foods', () => {
        const plan = generateDailyPlan(jainProfile, '2024-01-15');

        const allFoods = [
            ...(plan.mealPlan.meals.breakfast?.foods || []),
            ...(plan.mealPlan.meals.lunch?.foods || []),
            ...(plan.mealPlan.meals.dinner?.foods || [])
        ];

        const forbiddenIngredients = ['onion', 'garlic', 'potato', 'carrot', 'ginger'];

        const hasForbidden = allFoods.some(food =>
            forbiddenIngredients.some(f =>
                (food.name || '').toLowerCase().includes(f) ||
                (food.id || '').toLowerCase().includes(f)
            )
        );

        expect(hasForbidden).toBe(false);
    });
});

describe('Onboarding Questions', () => {
    test('has all required sections', () => {
        const questions = getOnboardingQuestions();

        const sectionIds = questions.sections.map(s => s.id);
        expect(sectionIds).toContain('demographics');
        expect(sectionIds).toContain('goals');
        expect(sectionIds).toContain('diet');
        expect(sectionIds).toContain('lifestyle');
        expect(sectionIds).toContain('workout');
        expect(sectionIds).toContain('looksmaxing');
    });

    test('demographics section has required fields', () => {
        const questions = getOnboardingQuestions();
        const demographics = questions.sections.find(s => s.id === 'demographics');

        const questionIds = demographics.questions.map(q => q.id);
        expect(questionIds).toContain('gender');
        expect(questionIds).toContain('age');
        expect(questionIds).toContain('height_cm');
        expect(questionIds).toContain('weight_kg');
    });

    test('diet section includes jain option', () => {
        const questions = getOnboardingQuestions();
        const diet = questions.sections.find(s => s.id === 'diet');
        const dietTypeQ = diet.questions.find(q => q.id === 'diet_type');

        const options = dietTypeQ.options.map(o => typeof o === 'object' ? o.value : o);
        expect(options).toContain('jain');
    });
});

describe('Input Validation', () => {
    test('validates complete valid input', () => {
        const input = {
            gender: 'male',
            age: 25,
            height_cm: 175,
            weight_kg: 70,
            goal_type: 'muscle_gain',
            diet_type: 'nonveg',
            experience_level: 'intermediate'
        };

        const result = validateProfileInput(input);
        expect(result.valid).toBe(true);
    });

    test('rejects invalid gender', () => {
        const input = {
            gender: 'other',
            age: 25,
            height_cm: 175,
            weight_kg: 70,
            goal_type: 'muscle_gain',
            diet_type: 'nonveg',
            experience_level: 'intermediate'
        };

        const result = validateProfileInput(input);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('Gender'))).toBe(true);
    });

    test('rejects out of range age', () => {
        const input = {
            gender: 'male',
            age: 10, // Too young
            height_cm: 175,
            weight_kg: 70,
            goal_type: 'muscle_gain',
            diet_type: 'nonveg',
            experience_level: 'intermediate'
        };

        const result = validateProfileInput(input);
        expect(result.valid).toBe(false);
    });
});

describe('Goal Validation', () => {
    test('rejects dangerous weight loss rate', () => {
        const result = validateWeightGoal(80, 70, 5, 'male', 175);
        // 10kg in 5 weeks = 2kg/week - too fast
        expect(result.valid).toBe(false);
        expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('accepts reasonable weight loss rate', () => {
        const result = validateWeightGoal(80, 75, 10, 'male', 175);
        // 5kg in 10 weeks = 0.5kg/week - safe
        expect(result.valid).toBe(true);
    });

    test('provides adjusted goal for unsafe timeline', () => {
        const result = validateWeightGoal(80, 70, 5, 'male', 175);

        if (!result.valid && result.adjustedGoal) {
            expect(result.adjustedGoal.targetWeeks).toBeGreaterThan(5);
        }
    });
});
