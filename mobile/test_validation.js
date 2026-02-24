/**
 * FitForge Final Validation Test Suite
 * 
 * This script tests all core functionality without React Native dependencies
 * to identify bugs, errors, and missing functionality.
 */

const fs = require('fs');

// Test results collection
const bugs = [];
const warnings = [];
let testsPassed = 0;
let testsFailed = 0;

function log(msg) { console.log(msg); }
function logError(msg) { console.error('❌', msg); }
function logPass(msg) { console.log('✅', msg); testsPassed++; }
function logFail(msg, error) { console.log('❌', msg, error?.message || ''); testsFailed++; }

function reportBug(id, screen, steps, actual, expected, error, severity) {
    bugs.push({ id, screen, steps, actual, expected, error, severity });
}

// ===== TEST FLOW A: Core Module Imports =====
log('\n========================================');
log('FLOW A: Core Module Import Tests');
log('========================================\n');

// Test all engines
const engines = [
    'AdaptationEngine', 'AdaptiveTDEE', 'BodyEngine', 'ContextModes',
    'HealthConditionFilter', 'HolisticWorkoutPlanner', 'InsightsEngine',
    'LifeAdvisorEngine', 'LifestyleEngine', 'LooksmaxingEngine',
    'MealScheduler', 'MenstrualCycleEngine', 'MicronutrientEngine',
    'NutritionEngine', 'PlateauEngine', 'SupplementTimingEngine',
    'TrainingStyleEngine', 'WorkoutEngine', 'WorkoutGuidanceEngine'
];

let engineErrors = [];
engines.forEach(engine => {
    try {
        require(`./src/core/engines/${engine}.js`);
        logPass(`Engine: ${engine}`);
    } catch (e) {
        logFail(`Engine: ${engine}`, e);
        engineErrors.push({ engine, error: e.message });
        reportBug(`A-ENG-${engine}`, 'Engine Import', `require(${engine})`, e.message, 'Should import cleanly', e.message, 'HIGH');
    }
});

// Test all models
log('\n--- Model Imports ---');
const models = ['DailyLog', 'MealPlan', 'Profile', 'SupplementPlan', 'WorkoutPlan'];
models.forEach(model => {
    try {
        require(`./src/core/models/${model}.js`);
        logPass(`Model: ${model}`);
    } catch (e) {
        logFail(`Model: ${model}`, e);
        reportBug(`A-MOD-${model}`, 'Model Import', `require(${model})`, e.message, 'Should import cleanly', e.message, 'HIGH');
    }
});

// Test data loaders
log('\n--- Data Loaders ---');
let foodsLoaded = 0;
let exercisesLoaded = 0;
let supplementsLoaded = 0;

try {
    const foods = require('./src/data/foods/index.js');
    foodsLoaded = foods.getAllFoods().length;
    if (foodsLoaded >= 150) {
        logPass(`Food Loader: ${foodsLoaded} foods`);
    } else {
        logFail(`Food Loader: Only ${foodsLoaded} foods (expected 150+)`);
        reportBug('A-DATA-01', 'Food Loader', 'getAllFoods()', `${foodsLoaded} foods`, '150+ foods', 'Incomplete data', 'MEDIUM');
    }
} catch (e) {
    logFail('Food Loader', e);
    reportBug('A-DATA-02', 'Food Loader', 'require index.js', e.message, 'Should load', e.message, 'HIGH');
}

try {
    const yoga = require('./src/data/exercises/yoga.json');
    const cardio = require('./src/data/exercises/cardio.json');
    const mobility = require('./src/data/exercises/mobility.json');
    const warmups = require('./src/data/exercises/warmups.json');
    const bodyweight = require('./src/data/exercises/bodyweight_exercises.json');
    exercisesLoaded = yoga.length + cardio.length + mobility.length + warmups.length + bodyweight.length;
    logPass(`Exercise Data: ${exercisesLoaded} exercises`);
} catch (e) {
    logFail('Exercise Data', e);
    reportBug('A-DATA-03', 'Exercise Loader', 'require exercise JSONs', e.message, 'Should load', e.message, 'HIGH');
}

try {
    const SE = require('./src/core/engines/SupplementTimingEngine.js');
    supplementsLoaded = SE.getAllSupplements().length;
    if (supplementsLoaded >= 15) {
        logPass(`Supplements: ${supplementsLoaded} items`);
    } else {
        logFail(`Supplements: Only ${supplementsLoaded} items`);
    }
} catch (e) {
    logFail('Supplements', e);
    reportBug('A-DATA-04', 'Supplement Loader', 'getAllSupplements()', e.message, 'Should load', e.message, 'HIGH');
}

// ===== TEST FLOW B: Plan Generation =====
log('\n========================================');
log('FLOW B: Plan Generation Tests');
log('========================================\n');

const testProfile = {
    gender: 'male',
    age: 25,
    height_cm: 175,
    weight_kg: 75,
    goal_type: 'fat_loss',
    diet_type: 'veg',
    activity_level: 'moderate',
    experience_level: 'intermediate',
    target_calories: 1800,
    protein_grams: 150,
    carbs_grams: 200,
    fats_grams: 60,
    equipment: 'none',
    injuries: []
};

// Test PlanGeneratorService
let planGenWorks = false;
let dailyPlan = null;
try {
    const PGS = require('./src/services/PlanGeneratorService.js');
    dailyPlan = PGS.generateDailyPlan(testProfile, '2026-01-18');

    if (!dailyPlan) {
        logFail('generateDailyPlan returned null');
        reportBug('B-PLAN-01', 'PlanGeneratorService', 'generateDailyPlan()', 'null', 'Valid plan object', 'null return', 'HIGH');
    } else {
        planGenWorks = true;
        logPass('generateDailyPlan() returns plan');

        // Check plan structure
        if (!dailyPlan.workoutPlan) {
            logFail('Missing workoutPlan in daily plan');
            reportBug('B-PLAN-02', 'PlanGeneratorService', 'generateDailyPlan()', 'No workoutPlan', 'workoutPlan object', 'Missing key', 'HIGH');
        } else {
            logPass('workoutPlan exists');
        }

        if (!dailyPlan.mealPlan) {
            logFail('Missing mealPlan in daily plan');
            reportBug('B-PLAN-03', 'PlanGeneratorService', 'generateDailyPlan()', 'No mealPlan', 'mealPlan object', 'Missing key', 'HIGH');
        } else {
            logPass('mealPlan exists');
        }
    }
} catch (e) {
    logFail('PlanGeneratorService', e);
    reportBug('B-PLAN-00', 'PlanGeneratorService', 'generateDailyPlan()', e.message, 'Should work', e.message, 'CRITICAL');
}

// ===== TEST FLOW C: Holistic Workout Structure =====
log('\n========================================');
log('FLOW C: Holistic Workout Validation');
log('========================================\n');

try {
    const HWP = require('./src/core/engines/HolisticWorkoutPlanner.js');

    const workout = HWP.generateHolisticWorkout(testProfile, {
        goal: 'fat_loss',
        timeAvailable: 45,
        equipment: 'none',
        injuries: [],
        energyLevel: 'high'
    });

    // Check all required sections
    const sections = ['warmup', 'strength', 'cardio', 'yoga', 'cooldown'];
    sections.forEach(section => {
        if (!workout[section]) {
            logFail(`Missing section: ${section}`);
            reportBug(`C-WORK-${section}`, 'WorkoutScreen', 'generateHolisticWorkout()', `No ${section}`, `${section} object`, 'Missing section', 'HIGH');
        } else {
            logPass(`Section: ${section} exists`);
        }
    });

    // Check warmup has exercises
    if (workout.warmup?.exercises?.length > 0) {
        logPass(`Warmup: ${workout.warmup.exercises.length} exercises`);
    } else {
        logFail('Warmup has no exercises');
        reportBug('C-WORK-W1', 'WorkoutScreen', 'warmup.exercises', 'Empty array', 'Exercise list', 'No warmup exercises', 'MEDIUM');
    }

    // Check strength has exercises
    if (workout.strength?.exercises?.length > 0) {
        logPass(`Strength: ${workout.strength.exercises.length} exercises`);
    } else {
        logFail('Strength has no exercises');
        reportBug('C-WORK-S1', 'WorkoutScreen', 'strength.exercises', 'Empty array', 'Exercise list', 'No strength exercises', 'HIGH');
    }

    // Check cardio has program
    if (workout.cardio?.program || workout.cardio?.description) {
        logPass(`Cardio: ${workout.cardio.program?.name || 'basic'}`);
    } else if (workout.cardio?.duration_mins < 3) {
        logPass('Cardio: Skipped (duration < 3 min)');
    } else {
        logFail('Cardio has no program');
        reportBug('C-WORK-C1', 'WorkoutScreen', 'cardio.program', 'Missing', 'Cardio program', 'No cardio', 'MEDIUM');
    }

    // Check yoga has poses
    if (workout.yoga?.poses?.length > 0) {
        logPass(`Yoga: ${workout.yoga.poses.length} poses`);
    } else if (workout.yoga?.duration_mins < 3) {
        logPass('Yoga: Skipped (duration < 3 min)');
    } else {
        logFail('Yoga has no poses');
        warnings.push('Yoga section empty - may be expected for short workouts');
    }

    // Check cooldown has exercises
    if (workout.cooldown?.exercises?.length > 0) {
        logPass(`Cooldown: ${workout.cooldown.exercises.length} exercises`);
    } else {
        logFail('Cooldown has no exercises');
        reportBug('C-WORK-CD1', 'WorkoutScreen', 'cooldown.exercises', 'Empty', 'Exercise list', 'No cooldown', 'MEDIUM');
    }

    // Check goal and rationale
    if (workout.goal) {
        logPass(`Goal: ${workout.goal}`);
    } else {
        logFail('Missing goal in workout');
        reportBug('C-WORK-G1', 'WorkoutScreen', 'workout.goal', 'Missing', 'Goal string', 'No goal', 'LOW');
    }

} catch (e) {
    logFail('HolisticWorkoutPlanner', e);
    reportBug('C-WORK-00', 'WorkoutScreen', 'generateHolisticWorkout()', e.message, 'Should work', e.message, 'CRITICAL');
}

// ===== TEST FLOW D: Meal Generation =====
log('\n========================================');
log('FLOW D: Meal Generation Validation');
log('========================================\n');

try {
    const NE = require('./src/core/engines/NutritionEngine.js');

    // Test basic meal generation
    const mealPlan = NE.generateMealPlan(testProfile, '2026-01-18');

    if (!mealPlan) {
        logFail('generateMealPlan returned null');
        reportBug('D-MEAL-01', 'FoodScreen', 'generateMealPlan()', 'null', 'Meal plan object', 'null return', 'HIGH');
    } else {
        logPass('generateMealPlan() works');

        // Check meals structure
        if (mealPlan.meals) {
            const mealTypes = ['breakfast', 'lunch', 'dinner'];
            mealTypes.forEach(mt => {
                if (mealPlan.meals[mt]) {
                    logPass(`Meal: ${mt} exists`);
                } else {
                    logFail(`Meal: ${mt} missing`);
                    reportBug(`D-MEAL-${mt}`, 'FoodScreen', `mealPlan.meals.${mt}`, 'Missing', 'Meal object', 'No meal', 'HIGH');
                }
            });
        } else {
            logFail('No meals object in mealPlan');
            reportBug('D-MEAL-02', 'FoodScreen', 'mealPlan.meals', 'Missing', 'Meals object', 'No meals', 'CRITICAL');
        }
    }

    // Test meal with alternatives
    try {
        const mealWithAlts = NE.generateMealPlanWithAlternatives(testProfile, '2026-01-18', {
            contextMode: 'normal',
            includeAlternatives: true
        });

        if (mealWithAlts) {
            logPass('generateMealPlanWithAlternatives() works');
        } else {
            logFail('generateMealPlanWithAlternatives returned null');
        }
    } catch (e) {
        logFail('generateMealPlanWithAlternatives()', e);
        reportBug('D-MEAL-ALT', 'FoodScreen', 'generateMealPlanWithAlternatives()', e.message, 'Should work', e.message, 'MEDIUM');
    }

} catch (e) {
    logFail('NutritionEngine', e);
    reportBug('D-MEAL-00', 'FoodScreen', 'NutritionEngine', e.message, 'Should work', e.message, 'CRITICAL');
}

// ===== TEST FLOW E: Context Modes =====
log('\n========================================');
log('FLOW E: Context Mode Validation');
log('========================================\n');

try {
    const CM = require('./src/core/engines/ContextModes.js');
    const foods = require('./src/data/foods/index.js');
    const allFoods = foods.getAllFoods();

    // Test quick mode
    const quickFoods = CM.applyContextMode(allFoods, 'quick', testProfile);
    if (quickFoods.length > 0) {
        logPass(`Quick mode: ${quickFoods.length} foods`);
    } else {
        logFail('Quick mode: No foods returned');
        reportBug('E-CTX-QUICK', 'FoodScreen', 'applyContextMode(quick)', '0 foods', '10+ quick foods', 'Empty result', 'HIGH');
    }

    // Test restaurant mode
    const restaurantFoods = CM.applyContextMode(allFoods, 'restaurant', testProfile);
    if (restaurantFoods.length > 0) {
        logPass(`Restaurant mode: ${restaurantFoods.length} foods`);
    } else {
        logFail('Restaurant mode: No foods returned');
        reportBug('E-CTX-REST', 'FoodScreen', 'applyContextMode(restaurant)', '0 foods', '10+ restaurant foods', 'Empty result', 'HIGH');
    }

    // Test budget mode
    const budgetFoods = CM.applyContextMode(allFoods, 'budget', testProfile);
    if (budgetFoods.length > 0) {
        logPass(`Budget mode: ${budgetFoods.length} foods`);
    } else {
        logFail('Budget mode: No foods returned');
        reportBug('E-CTX-BUDG', 'FoodScreen', 'applyContextMode(budget)', '0 foods', '10+ budget foods', 'Empty result', 'HIGH');
    }

} catch (e) {
    logFail('ContextModes', e);
    reportBug('E-CTX-00', 'FoodScreen', 'ContextModes', e.message, 'Should work', e.message, 'HIGH');
}

// ===== TEST FLOW F: Supplement Schedule =====
log('\n========================================');
log('FLOW F: Supplement Scheduling');
log('========================================\n');

try {
    const SE = require('./src/core/engines/SupplementTimingEngine.js');

    // Test schedule generation
    const schedule = SE.getSupplementSchedule(['vitamin_d3', 'protein_powder', 'creatine'], testProfile);
    if (schedule && Object.keys(schedule).length > 0) {
        logPass(`Supplement schedule: ${Object.keys(schedule).length} time slots`);
    } else {
        logFail('Empty supplement schedule');
        reportBug('F-SUPP-01', 'HomeScreen', 'getSupplementSchedule()', 'Empty', 'Schedule object', 'No schedule', 'MEDIUM');
    }

    // Test recommendations
    const recs = SE.getRecommendedSupplements(testProfile);
    if (recs && recs.length > 0) {
        logPass(`Recommendations: ${recs.length} supplements`);
    } else {
        logFail('No recommendations');
        reportBug('F-SUPP-02', 'ProfileScreen', 'getRecommendedSupplements()', 'Empty', 'Recommendation list', 'No recs', 'LOW');
    }

} catch (e) {
    logFail('SupplementTimingEngine', e);
    reportBug('F-SUPP-00', 'Supplements', 'SupplementTimingEngine', e.message, 'Should work', e.message, 'MEDIUM');
}

// ===== TEST FLOW G: Goal Variations =====
log('\n========================================');
log('FLOW G: Goal Variation Tests');
log('========================================\n');

const goals = ['fat_loss', 'muscle_gain', 'flexibility', 'endurance', 'general_fitness'];
goals.forEach(goal => {
    try {
        const HWP = require('./src/core/engines/HolisticWorkoutPlanner.js');
        const workout = HWP.generateHolisticWorkout({ ...testProfile, goal_type: goal }, {
            goal,
            timeAvailable: 45,
            equipment: 'none',
            energyLevel: 'moderate'
        });

        if (workout.goal && workout.warmup && workout.cooldown) {
            logPass(`Goal: ${goal} → ${workout.goal}`);
        } else {
            logFail(`Goal: ${goal} incomplete workout`);
            reportBug(`G-GOAL-${goal}`, 'WorkoutScreen', `goal=${goal}`, 'Incomplete', 'Full workout', 'Missing sections', 'MEDIUM');
        }
    } catch (e) {
        logFail(`Goal: ${goal}`, e);
        reportBug(`G-GOAL-${goal}-ERR`, 'WorkoutScreen', `goal=${goal}`, e.message, 'Should work', e.message, 'HIGH');
    }
});

// ===== TEST FLOW H: Low Energy Mode =====
log('\n========================================');
log('FLOW H: Low Energy Mode');
log('========================================\n');

try {
    const HWP = require('./src/core/engines/HolisticWorkoutPlanner.js');
    const normalWorkout = HWP.generateHolisticWorkout(testProfile, {
        goal: 'general_fitness',
        timeAvailable: 45,
        equipment: 'none',
        energyLevel: 'high'
    });

    const lowEnergyWorkout = HWP.generateHolisticWorkout(testProfile, {
        goal: 'general_fitness',
        timeAvailable: 45,
        equipment: 'none',
        energyLevel: 'low'
    });

    if (lowEnergyWorkout.distribution.cardio < normalWorkout.distribution.cardio) {
        logPass('Low energy reduces cardio');
    } else {
        logFail('Low energy did not reduce cardio');
        warnings.push('Low energy mode may not properly adjust cardio');
    }

    if (lowEnergyWorkout.energyLevel === 'low') {
        logPass('Energy level recorded in output');
    } else {
        logFail('Energy level not recorded');
    }

} catch (e) {
    logFail('Low energy mode', e);
    reportBug('H-ENERGY-00', 'WorkoutScreen', 'energyLevel=low', e.message, 'Should work', e.message, 'MEDIUM');
}

// ===== FINAL REPORT =====
log('\n========================================');
log('FINAL QA REPORT');
log('========================================\n');

log(`Tests Passed: ${testsPassed}`);
log(`Tests Failed: ${testsFailed}`);
log(`Bugs Found: ${bugs.length}`);
log(`Warnings: ${warnings.length}`);

if (bugs.length > 0) {
    log('\n--- BUG REPORT ---\n');
    bugs.forEach((bug, i) => {
        log(`BUG ${i + 1}: ${bug.id}`);
        log(`  Screen: ${bug.screen}`);
        log(`  Steps: ${bug.steps}`);
        log(`  Actual: ${bug.actual}`);
        log(`  Expected: ${bug.expected}`);
        log(`  Error: ${bug.error}`);
        log(`  Severity: ${bug.severity}`);
        log('');
    });
}

if (warnings.length > 0) {
    log('\n--- WARNINGS ---\n');
    warnings.forEach(w => log(`⚠️  ${w}`));
}

log('\n========================================');
log('TEST COMPLETE');
log('========================================');
