/**
 * Body Engine Tests
 */

const {
    calculateBMR,
    calculateTDEE,
    calculateTargetCalories,
    calculateMacros,
    calculateBMI,
    validateWeightGoal,
    calculateSafeTimeline
} = require('../../src/core/utils/calculations');

const { calculateBodyMetrics, enrichProfileWithMetrics } = require('../../src/core/engines/BodyEngine');

describe('BMR Calculations', () => {
    test('calculates BMR for adult male correctly', () => {
        const bmr = calculateBMR({ gender: 'male', weightKg: 70, heightCm: 175, age: 25 });
        // Expected: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 ≈ 1674
        expect(bmr).toBeGreaterThan(1600);
        expect(bmr).toBeLessThan(1750);
    });

    test('calculates BMR for adult female correctly', () => {
        const bmr = calculateBMR({ gender: 'female', weightKg: 60, heightCm: 165, age: 25 });
        // Expected: 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 ≈ 1345
        expect(bmr).toBeGreaterThan(1300);
        expect(bmr).toBeLessThan(1400);
    });

    test('BMR decreases with age', () => {
        const bmr25 = calculateBMR({ gender: 'male', weightKg: 70, heightCm: 175, age: 25 });
        const bmr45 = calculateBMR({ gender: 'male', weightKg: 70, heightCm: 175, age: 45 });
        expect(bmr25).toBeGreaterThan(bmr45);
        expect(bmr25 - bmr45).toBe(100); // 5 kcal per year * 20 years
    });

    test('female BMR is lower than male for same stats', () => {
        const maleBMR = calculateBMR({ gender: 'male', weightKg: 70, heightCm: 170, age: 30 });
        const femaleBMR = calculateBMR({ gender: 'female', weightKg: 70, heightCm: 170, age: 30 });
        expect(maleBMR).toBeGreaterThan(femaleBMR);
        expect(maleBMR - femaleBMR).toBe(166); // +5 for male, -161 for female = 166 difference
    });
});

describe('TDEE Calculations', () => {
    test('TDEE increases with activity level', () => {
        const bmr = 1600;
        const sedentary = calculateTDEE(bmr, 'sedentary');
        const active = calculateTDEE(bmr, 'active');
        const veryActive = calculateTDEE(bmr, 'very_active');

        expect(sedentary).toBe(1920); // 1600 * 1.2
        expect(active).toBe(2760); // 1600 * 1.725
        expect(veryActive).toBe(3040); // 1600 * 1.9
        expect(sedentary).toBeLessThan(active);
        expect(active).toBeLessThan(veryActive);
    });

    test('defaults to sedentary for unknown activity level', () => {
        const bmr = 1600;
        const tdee = calculateTDEE(bmr, 'unknown_level');
        expect(tdee).toBe(1920);
    });
});

describe('Target Calories', () => {
    test('fat loss creates calorie deficit', () => {
        const result = calculateTargetCalories({ tdee: 2000, goalType: 'fat_loss', gender: 'male' });
        expect(result.targetCalories).toBeLessThan(2000);
        expect(result.adjustment).toBeLessThan(0);
    });

    test('muscle gain creates calorie surplus', () => {
        const result = calculateTargetCalories({ tdee: 2000, goalType: 'muscle_gain', gender: 'male' });
        expect(result.targetCalories).toBeGreaterThan(2000);
        expect(result.adjustment).toBeGreaterThan(0);
    });

    test('health maintains calories', () => {
        const result = calculateTargetCalories({ tdee: 2000, goalType: 'health', gender: 'male' });
        expect(result.targetCalories).toBe(2000);
    });

    test('never goes below minimum calories for females', () => {
        const result = calculateTargetCalories({ tdee: 1400, goalType: 'fat_loss', gender: 'female' });
        expect(result.targetCalories).toBeGreaterThanOrEqual(1200);
    });

    test('never goes below minimum calories for males', () => {
        const result = calculateTargetCalories({ tdee: 1700, goalType: 'fat_loss', gender: 'male' });
        expect(result.targetCalories).toBeGreaterThanOrEqual(1500);
    });
});

describe('Macro Calculations', () => {
    test('calculates macros for fat loss', () => {
        const macros = calculateMacros({ weightKg: 70, targetCalories: 1800, goalType: 'fat_loss' });

        // Protein should be 2.0-2.2g/kg
        expect(macros.protein / 70).toBeGreaterThanOrEqual(1.9);
        expect(macros.protein / 70).toBeLessThanOrEqual(2.3);

        // All macros should be positive
        expect(macros.protein).toBeGreaterThan(0);
        expect(macros.carbs).toBeGreaterThan(0);
        expect(macros.fats).toBeGreaterThan(0);
    });

    test('carbs have minimum floor', () => {
        const macros = calculateMacros({ weightKg: 50, targetCalories: 1200, goalType: 'fat_loss' });
        expect(macros.carbs).toBeGreaterThanOrEqual(50);
    });
});

describe('BMI Calculations', () => {
    test('calculates BMI correctly', () => {
        const bmi = calculateBMI(70, 175);
        // 70 / (1.75^2) = 70 / 3.0625 = 22.86
        expect(bmi).toBeCloseTo(22.9, 1);
    });
});

describe('Weight Goal Validation', () => {
    test('rejects aggressive weight loss', () => {
        const result = validateWeightGoal({
            currentWeight: 80,
            targetWeight: 70,
            targetWeeks: 4, // 2.5kg/week - too aggressive
            gender: 'male',
            heightCm: 175
        });

        expect(result.valid).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('accepts safe weight loss rate', () => {
        const result = validateWeightGoal({
            currentWeight: 80,
            targetWeight: 75,
            targetWeeks: 10, // 0.5kg/week - safe
            gender: 'male',
            heightCm: 175
        });

        expect(result.valid).toBe(true);
    });

    test('warns about underweight target', () => {
        const result = validateWeightGoal({
            currentWeight: 70,
            targetWeight: 50, // Would be underweight
            targetWeeks: 40,
            gender: 'male',
            heightCm: 175
        });

        expect(result.warnings.some(w => w.includes('underweight'))).toBe(true);
    });
});

describe('Safe Timeline Calculation', () => {
    test('calculates minimum weeks for weight goal', () => {
        const timeline = calculateSafeTimeline({
            currentWeight: 80,
            targetWeight: 70,
            gender: 'male'
        });

        // 10kg loss at max 0.75kg/week = ~14 weeks minimum
        expect(timeline.minWeeks).toBeGreaterThanOrEqual(13);
        expect(timeline.recommendedWeeks).toBeGreaterThan(timeline.minWeeks);
    });
});

describe('Body Metrics Integration', () => {
    test('enrichProfileWithMetrics adds all calculated fields', () => {
        const profile = {
            gender: 'male',
            age: 25,
            height_cm: 175,
            weight_kg: 70,
            activity_level: 'moderate',
            goal_type: 'muscle_gain'
        };

        const enriched = enrichProfileWithMetrics(profile);

        expect(enriched.bmr).toBeDefined();
        expect(enriched.tdee).toBeDefined();
        expect(enriched.target_calories).toBeDefined();
        expect(enriched.protein_grams).toBeDefined();
        expect(enriched.carbs_grams).toBeDefined();
        expect(enriched.fats_grams).toBeDefined();
    });
});
