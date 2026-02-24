/**
 * System Integration Test
 * Verifies all engines and services work together correctly
 */

const PFT = require('../../src/index');

describe('Full System Integration', () => {

    describe('All Modules Load Successfully', () => {
        test('all engines are exported', () => {
            expect(PFT.BodyEngine).toBeDefined();
            expect(PFT.NutritionEngine).toBeDefined();
            expect(PFT.WorkoutEngine).toBeDefined();
            expect(PFT.LifestyleEngine).toBeDefined();
            expect(PFT.LooksmaxingEngine).toBeDefined();
            expect(PFT.AdaptationEngine).toBeDefined();
            expect(PFT.AdaptiveTDEE).toBeDefined();
            expect(PFT.MicronutrientEngine).toBeDefined();
            expect(PFT.MenstrualCycleEngine).toBeDefined();
            expect(PFT.PlateauEngine).toBeDefined();
            expect(PFT.HealthConditionFilter).toBeDefined();
        });

        test('all services are exported', () => {
            expect(PFT.PlanGeneratorService).toBeDefined();
            expect(PFT.FoodLoggingService).toBeDefined();
            expect(PFT.HabitTrackingService).toBeDefined();
            expect(PFT.DataExportService).toBeDefined();
            expect(PFT.WorkoutLoggingService).toBeDefined();
            expect(PFT.ProgressTrackingService).toBeDefined();
        });

        test('all validators are exported', () => {
            expect(PFT.InputValidator).toBeDefined();
            expect(PFT.GoalValidator).toBeDefined();
            expect(PFT.SafetyValidator).toBeDefined();
        });

        test('constants include V3 additions', () => {
            expect(PFT.constants.FASTING_MODES).toBeDefined();
            expect(PFT.constants.UNIT_CONVERSIONS).toBeDefined();
            expect(PFT.constants.SPECIAL_OCCASIONS).toBeDefined();
            expect(PFT.constants.FEMALE_CYCLE_PHASES).toBeDefined();
            expect(PFT.constants.HEALTH_CONDITIONS).toBeDefined();
        });
    });

    describe('Profile → BodyEngine → NutritionEngine Flow', () => {
        test('complete profile flow works', () => {
            // Create profile
            const profile = PFT.Profile.createProfile({
                gender: 'male',
                age: 25,
                height_cm: 175,
                weight_kg: 75,
                goal_type: 'fat_loss',
                diet_type: 'nonveg',
                experience_level: 'beginner',
                activity_level: 'moderate'
            });

            expect(profile).toBeDefined();
            expect(profile.gender).toBe('male');

            // Calculate body metrics
            const metrics = PFT.BodyEngine.calculateBodyMetrics(profile);
            expect(metrics.bmr).toBeGreaterThan(1400);
            expect(metrics.tdee).toBeGreaterThan(metrics.bmr);
            expect(metrics.targetCalories).toBeLessThan(metrics.tdee);
        });
    });

    describe('Female Cycle Integration', () => {
        test('cycle TDEE adjustment works', () => {
            const femaleProfile = PFT.Profile.createProfile({
                gender: 'female',
                age: 28,
                height_cm: 165,
                weight_kg: 60,
                activity_level: 'moderate',
                experience_level: 'beginner',
                tracks_menstrual_cycle: true,
                cycle_length: 28,
                last_period_date: new Date().toISOString().split('T')[0]
            });

            const cycleStatus = PFT.MenstrualCycleEngine.getCycleStatus(femaleProfile);
            expect(cycleStatus).not.toBeNull();
            expect(cycleStatus.tracking).toBe(true);
            expect(cycleStatus.cycleDay).toBeDefined();
        });
    });

    describe('Health Condition Filtering', () => {
        test('lactose intolerance filters foods', () => {
            const conditions = ['lactose_intolerance'];
            const foods = [
                { id: 'milk_full', name: 'Full Cream Milk' },
                { id: 'chicken_breast', name: 'Chicken Breast' },
                { id: 'paneer', name: 'Paneer' }
            ];

            const filtered = PFT.HealthConditionFilter.filterFoodsForConditions(foods, conditions);
            expect(filtered.some(f => f.id === 'milk_full')).toBe(false);
            expect(filtered.some(f => f.id === 'chicken_breast')).toBe(true);
        });
    });

    describe('Goal Validator Safety Checks', () => {
        test('underweight BMI blocks fat loss', () => {
            const underweightProfile = {
                weight_kg: 45,
                height_cm: 175,
                goal_type: 'fat_loss',
                gender: 'male'
            };

            const validation = PFT.GoalValidator.validateBMISafety(underweightProfile);
            expect(validation.valid).toBe(false);
            expect(validation.errors[0].type).toBe('underweight_deficit');
        });
    });

    describe('Plateau Detection', () => {
        test('detects weight plateau', () => {
            const stableWeights = [];
            for (let i = 0; i < 20; i++) {
                stableWeights.push({
                    log_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    weight_kg: 75 + (Math.random() * 0.2 - 0.1) // Very small variance
                });
            }

            const plateau = PFT.PlateauEngine.detectPlateau(stableWeights, 'fat_loss');
            expect(plateau.inPlateau).toBe(true);
        });
    });

    describe('Habit Tracking', () => {
        test('streak updates correctly', () => {
            const streak = {
                habit_name: 'water_8',
                current_streak: 5,
                longest_streak: 5,
                last_completed_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                total_completions: 5
            };

            const log = { water_liters: 2.5 };
            const today = new Date().toISOString().split('T')[0];

            const updated = PFT.HabitTrackingService.updateStreak(
                streak,
                log,
                (l) => l.water_liters >= 2,
                today
            );

            expect(updated.current_streak).toBe(6);
            expect(updated.last_completed_date).toBe(today);
        });
    });

    describe('Progress Tracking', () => {
        test('calculates weight progress', () => {
            const profile = {
                weight_kg: 72,
                target_weight_kg: 65,
                goal_start_weight: 80
            };

            const progress = PFT.ProgressTrackingService.calculateWeightProgress(profile);
            expect(progress.hasGoal).toBe(true);
            expect(progress.progressPercent).toBeGreaterThan(50);
        });
    });

    describe('Food Logging', () => {
        test('calculates daily totals', () => {
            const entries = [
                { calories: 400, protein: 30, carbs: 40, fats: 15 },
                { calories: 600, protein: 40, carbs: 60, fats: 20 },
                { calories: 500, protein: 35, carbs: 50, fats: 18 }
            ];

            const totals = PFT.FoodLoggingService.calculateDailyTotals(entries);
            expect(totals.calories).toBe(1500);
            expect(totals.protein).toBe(105);
        });
    });

    describe('Workout Logging', () => {
        test('calculates workout completion', () => {
            const logged = [
                { exercise_id: 'pushups', sets_done: 3 },
                { exercise_id: 'squats', sets_done: 4 }
            ];
            const planned = {
                exercises: [
                    { id: 'pushups', sets: 3 },
                    { id: 'squats', sets: 4 },
                    { id: 'planks', sets: 3 }
                ]
            };

            const completion = PFT.WorkoutLoggingService.calculateWorkoutCompletion(logged, planned);
            expect(completion.completionPercent).toBeGreaterThan(50);
        });
    });

    describe('Fasting Mode Constants', () => {
        test('ramadan mode has correct structure', () => {
            const ramadan = PFT.constants.FASTING_MODES.ramadan;
            expect(ramadan.name).toBe('Ramadan Fast');
            expect(ramadan.hydration_priority).toBe(true);
            expect(ramadan.workout_timing).toBe('before_iftar');
        });

        test('IF 16:8 has eating window', () => {
            const if16 = PFT.constants.FASTING_MODES.intermittent_16_8;
            expect(if16.fasting_hours).toBe(16);
            expect(if16.eating_window.start).toBe('12:00');
        });
    });

    describe('Unit Conversions', () => {
        test('kg to lbs conversion', () => {
            const lbs = 70 * PFT.constants.UNIT_CONVERSIONS.kg_to_lbs;
            expect(Math.round(lbs)).toBe(154);
        });

        test('cm to feet/inches conversion', () => {
            const result = PFT.constants.UNIT_CONVERSIONS.cm_to_feet_inches(175);
            expect(result.feet).toBe(5);
            expect(result.inches).toBe(9);
        });
    });

    describe('Special Occasions', () => {
        test('diwali occasion has advice', () => {
            const diwali = PFT.constants.SPECIAL_OCCASIONS.diwali;
            expect(diwali.typical_excess_calories).toBe(1000);
            expect(diwali.advice).toContain('Enjoy mindfully');
        });
    });

});
