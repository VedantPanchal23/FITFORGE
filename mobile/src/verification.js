/**
 * Core System Verification Test
 * Run this to verify ALL 11 engines, 6 services, 3 validators are executing
 */

// Test that pft-core.js loads and exports everything
const PFTCore = require('./pft-core');

const TESTS = [];

function test(name, fn) {
    try {
        const result = fn();
        TESTS.push({ name, passed: true, result });
        console.log(`✅ ${name}`);
        return true;
    } catch (error) {
        TESTS.push({ name, passed: false, error: error.message });
        console.log(`❌ ${name}: ${error.message}`);
        return false;
    }
}

export function runVerification() {
    console.log('\n========================================');
    console.log('  PFT CORE SYSTEM VERIFICATION');
    console.log('========================================\n');

    // Test profile
    const testProfile = {
        gender: 'male',
        age: 25,
        height_cm: 175,
        weight_kg: 78,
        activity_level: 'moderate',
        goal_type: 'fat_loss',
        target_weight_kg: 70,
        diet_type: 'non_vegetarian',
        experience_level: 'intermediate'
    };

    // ==========================================
    // ENGINE TESTS (11)
    // ==========================================
    console.log('--- ENGINES (11) ---');

    test('BodyEngine.calculateBodyMetrics', () => {
        const result = PFTCore.BodyEngine.calculateBodyMetrics(testProfile);
        if (!result.bmr || !result.tdee) throw new Error('Missing BMR or TDEE');
        return `BMR=${result.bmr}, TDEE=${result.tdee}`;
    });

    test('NutritionEngine.generateMealPlan', () => {
        const result = PFTCore.NutritionEngine.generateMealPlan(testProfile);
        if (!result || !result.meals) throw new Error('No meals generated');
        return `${result.meals?.length || 0} meals`;
    });

    test('WorkoutEngine.generateWorkoutPlan', () => {
        const result = PFTCore.WorkoutEngine.generateWorkoutPlan(testProfile);
        if (!result) throw new Error('No workout plan');
        return `${result.exercises?.length || 0} exercises`;
    });

    test('LifestyleEngine.calculateAdjustments', () => {
        const result = PFTCore.LifestyleEngine.calculateLifestyleAdjustments(testProfile);
        return 'Adjustments calculated';
    });

    test('LooksmaxingEngine.generatePlan', () => {
        const profile = { ...testProfile, skin_type: 'oily', skin_concerns: ['acne'] };
        const result = PFTCore.LooksmaxingEngine.generateLooksmaxingPlan(profile);
        return `Skincare: ${result?.skincare?.morning?.length || 0} morning steps`;
    });

    test('AdaptationEngine.checkAdaptation', () => {
        const logs = [{ date: '2024-01-01', calories: 2000 }];
        const result = PFTCore.AdaptationEngine.checkForAdaptation(testProfile, logs);
        return 'Adaptation check complete';
    });

    test('AdaptiveTDEE.calculate', () => {
        const weightLogs = [{ date: '2024-01-01', weight: 78 }, { date: '2024-01-08', weight: 77.5 }];
        const result = PFTCore.AdaptiveTDEE.calculateAdaptiveTDEE(testProfile, weightLogs);
        return `Adaptive TDEE: ${result || 'calculated'}`;
    });

    test('MicronutrientEngine.analyze', () => {
        const mealPlan = { meals: [{ items: [{ name: 'Chicken', nutrients: { iron: 2 } }] }] };
        const result = PFTCore.MicronutrientEngine.analyzeMicronutrients(mealPlan, testProfile);
        return 'Micronutrients analyzed';
    });

    test('MenstrualCycleEngine.getPhase', () => {
        const result = PFTCore.MenstrualCycleEngine.getCurrentPhase('2024-01-01', 28);
        return `Phase: ${result?.phase || 'calculated'}`;
    });

    test('PlateauEngine.detect', () => {
        const history = [{ date: '2024-01-01', weight: 78 }];
        const result = PFTCore.PlateauEngine.detectPlateau(testProfile, history);
        return `Plateaued: ${result?.isPlateaued || false}`;
    });

    test('HealthConditionFilter.filter', () => {
        const profile = { ...testProfile, health_conditions: ['diabetes'] };
        const foods = [{ name: 'Apple', diabetesOk: true }];
        const result = PFTCore.HealthConditionFilter.filterFoods(foods, profile);
        return 'Health filter applied';
    });

    // ==========================================
    // SERVICE TESTS (6)
    // ==========================================
    console.log('\n--- SERVICES (6) ---');

    test('PlanGeneratorService.getOnboardingQuestions', () => {
        const result = PFTCore.PlanGeneratorService.getOnboardingQuestions();
        if (!result) throw new Error('No questions');
        return `${Object.keys(result).length} sections`;
    });

    test('FoodLoggingService exists', () => {
        if (!PFTCore.FoodLoggingService) throw new Error('Not found');
        return 'Available';
    });

    test('HabitTrackingService exists', () => {
        if (!PFTCore.HabitTrackingService) throw new Error('Not found');
        return 'Available';
    });

    test('DataExportService exists', () => {
        if (!PFTCore.DataExportService) throw new Error('Not found');
        return 'Available';
    });

    test('WorkoutLoggingService exists', () => {
        if (!PFTCore.WorkoutLoggingService) throw new Error('Not found');
        return 'Available';
    });

    test('ProgressTrackingService exists', () => {
        if (!PFTCore.ProgressTrackingService) throw new Error('Not found');
        return 'Available';
    });

    // ==========================================
    // VALIDATOR TESTS (3)
    // ==========================================
    console.log('\n--- VALIDATORS (3) ---');

    test('InputValidator.validateProfile', () => {
        const result = PFTCore.InputValidator.validateProfile(testProfile);
        return `Valid: ${result?.isValid}`;
    });

    test('GoalValidator.validateGoal', () => {
        const result = PFTCore.GoalValidator.validateGoal(testProfile);
        return 'Goal validated';
    });

    test('SafetyValidator.runChecks', () => {
        const result = PFTCore.SafetyValidator.runAllSafetyChecks(testProfile);
        return `Blockers: ${result?.hasBlockers || false}`;
    });

    // ==========================================
    // MODEL TESTS (5)
    // ==========================================
    console.log('\n--- MODELS (5) ---');

    test('Profile model', () => {
        if (!PFTCore.Profile) throw new Error('Not found');
        return 'Available';
    });

    test('DailyLog model', () => {
        if (!PFTCore.DailyLog) throw new Error('Not found');
        return 'Available';
    });

    test('MealPlan model', () => {
        if (!PFTCore.MealPlan) throw new Error('Not found');
        return 'Available';
    });

    test('WorkoutPlan model', () => {
        if (!PFTCore.WorkoutPlan) throw new Error('Not found');
        return 'Available';
    });

    test('LooksmaxingPlan model', () => {
        if (!PFTCore.LooksmaxingPlan) throw new Error('Not found');
        return 'Available';
    });

    // ==========================================
    // FOOD DATABASE TEST
    // ==========================================
    console.log('\n--- FOOD DATABASE ---');

    test('FoodDatabase.getFoodCount', () => {
        const count = PFTCore.FoodDatabase.getFoodCount?.() || PFTCore.FoodDatabase.foods?.length || 0;
        return `${count} foods`;
    });

    // ==========================================
    // SUMMARY
    // ==========================================
    const passed = TESTS.filter(t => t.passed).length;
    const failed = TESTS.filter(t => !t.passed).length;

    console.log('\n========================================');
    console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
    console.log('========================================\n');

    return { passed, failed, tests: TESTS };
}

export default runVerification;
