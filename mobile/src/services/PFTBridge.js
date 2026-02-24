/**
 * PFT Bridge - Full Core System Integration
 * Connects ALL engines to the mobile app WITHOUT any simplification
 * 
 * This bridge imports from pft-core.js which exports the EXACT same modules
 * as the original src/index.js
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DatabaseService from './DatabaseService';

// Import the entire PFT Core system
const PFTCore = require('../pft-core');

// Import HolisticWorkoutPlanner directly for goal-driven workouts
const HolisticWorkoutPlanner = require('../core/engines/HolisticWorkoutPlanner');

// Import IntakeAnalyzerEngine for food intake analysis
const IntakeAnalyzerEngine = require('../core/engines/IntakeAnalyzerEngine');

// Destructure all exports
const {
    // Models (Original)
    Profile,
    DailyLog,
    MealPlan,
    WorkoutPlan,
    LooksmaxingPlan,

    // Models (Super App)
    HealthLog,
    LooksLog,
    RoutineLog,
    MultiGoal,
    DecisionExplanation,
    UserMode,

    // Core Engines (6)
    BodyEngine,
    NutritionEngine,
    WorkoutEngine,
    LifestyleEngine,
    LooksmaxingEngine,
    AdaptationEngine,

    // V2 Engines (5)
    AdaptiveTDEE,
    MicronutrientEngine,
    MenstrualCycleEngine,
    PlateauEngine,
    HealthConditionFilter,

    // Super App Engines
    LifeAdvisorEngine,
    InsightsEngine,

    // Validators (3)
    InputValidator,
    GoalValidator,
    SafetyValidator,

    // Utilities
    calculations,
    constants,

    // Food Database
    FoodDatabase,

    // Services (6)
    PlanGeneratorService,
    FoodLoggingService,
    HabitTrackingService,
    DataExportService,
    WorkoutLoggingService,
    ProgressTrackingService,

    // Convenience
    initializeProfile,
    generateDailyPlan,
    generateWeeklyPlan,
    getOnboardingQuestions
} = PFTCore;

// ============================================================================
// STORAGE KEYS
// ============================================================================
const KEYS = {
    PROFILE: '@fitforge_profile',
    DAILY_LOGS: '@fitforge_logs',
    WEIGHT_HISTORY: '@fitforge_weights',
    HABITS: '@fitforge_habits',
    ADAPTIVE_TDEE: '@fitforge_adaptive_tdee',
    FASTING: '@fitforge_fasting',
    CYCLE: '@fitforge_cycle',
    // Super App Keys
    HEALTH_LOGS: '@fitforge_health_logs',
    LOOKS_LOGS: '@fitforge_looks_logs',
    ROUTINE_LOGS: '@fitforge_routine_logs',
    MULTI_GOALS: '@fitforge_multi_goals',
    USER_MODE: '@fitforge_user_mode'
};

// ============================================================================
// SAFE DEFAULTS HELPER
// ============================================================================

const createSafeProfile = (profile) => {
    if (!profile) return null;
    return {
        gender: profile.gender || 'male',
        age: profile.age || 25,
        height_cm: profile.height_cm || 170,
        weight_kg: profile.weight_kg || 70,
        activity_level: profile.activity_level || 'moderate',
        goal_type: profile.goal_type || 'maintenance',
        diet_type: profile.diet_type || 'vegetarian',
        experience_level: profile.experience_level || 'beginner',
        skin_type: profile.skin_type || 'normal',
        ...profile
    };
};

// ============================================================================
// RE-EXPORT ALL CORE MODULES (No simplification)
// ============================================================================

// Models (Original + Super App)
export { Profile, DailyLog, MealPlan, WorkoutPlan, LooksmaxingPlan };
export { HealthLog, LooksLog, RoutineLog, MultiGoal, DecisionExplanation, UserMode };

// All 13 Engines
export {
    BodyEngine,
    NutritionEngine,
    WorkoutEngine,
    LifestyleEngine,
    LooksmaxingEngine,
    AdaptationEngine,
    AdaptiveTDEE,
    MicronutrientEngine,
    MenstrualCycleEngine,
    PlateauEngine,
    HealthConditionFilter,
    LifeAdvisorEngine,
    InsightsEngine
};

// All 3 Validators
export { InputValidator, GoalValidator, SafetyValidator };

// Utilities
export { calculations, constants };

// Food Database
export { FoodDatabase };

// All 6 Services
export {
    PlanGeneratorService,
    FoodLoggingService,
    HabitTrackingService,
    DataExportService,
    WorkoutLoggingService,
    ProgressTrackingService
};

// Convenience exports
export { initializeProfile, generateDailyPlan, generateWeeklyPlan, getOnboardingQuestions };

// ============================================================================
// PROFILE MANAGEMENT (AsyncStorage layer)
// ============================================================================

export const getProfile = async () => {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
};

export const saveProfile = async (profile) => {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const createProfile = (profileData) => {
    // Use PlanGeneratorService.initializeProfile (the actual core function)
    return initializeProfile(profileData);
};

// ============================================================================
// BODY CALCULATIONS (Using ACTUAL BodyEngine)
// ============================================================================

export const calculateBodyMetrics = (profile) => {
    if (!profile) return { bmr: 0, tdee: 0, targetCalories: 0, macros: { protein: 0, carbs: 0, fats: 0 } };
    const safeProfile = createSafeProfile(profile);
    try {
        return BodyEngine.calculateBodyMetrics(safeProfile);
    } catch (e) {
        console.log('calculateBodyMetrics error:', e.message);
        return { bmr: 0, tdee: 0, targetCalories: 0, macros: { protein: 0, carbs: 0, fats: 0 } };
    }
};

export const enrichProfileWithMetrics = (profile) => {
    return BodyEngine.enrichProfileWithMetrics(profile);
};

export const getMetricsExplanation = (metrics) => {
    return BodyEngine.getMetricsExplanation(metrics);
};

// ============================================================================
// MEAL PLAN (Using ACTUAL NutritionEngine)
// ============================================================================

export const generateMealPlan = (profile, options = {}) => {
    if (!profile) return { meals: [], total_calories: 0 };
    const safeProfile = createSafeProfile(profile);
    try {
        const plan = NutritionEngine.generateMealPlan(safeProfile, options);

        // Transform to UI-compatible array format
        const meals = [];
        if (plan?.meals?.breakfast) {
            meals.push({
                name: 'Breakfast',
                time: plan.meals.breakfast.time || '08:00',
                calories: plan.meals.breakfast.total_calories || 0,
                items: plan.meals.breakfast.foods?.map(f => ({
                    name: f.name,
                    portion: `${f.quantity_grams || 100}g`
                })) || []
            });
        }
        if (plan?.meals?.lunch) {
            meals.push({
                name: 'Lunch',
                time: plan.meals.lunch.time || '13:00',
                calories: plan.meals.lunch.total_calories || 0,
                items: plan.meals.lunch.foods?.map(f => ({
                    name: f.name,
                    portion: `${f.quantity_grams || 100}g`
                })) || []
            });
        }
        if (plan?.meals?.dinner) {
            meals.push({
                name: 'Dinner',
                time: plan.meals.dinner.time || '20:00',
                calories: plan.meals.dinner.total_calories || 0,
                items: plan.meals.dinner.foods?.map(f => ({
                    name: f.name,
                    portion: `${f.quantity_grams || 100}g`
                })) || []
            });
        }
        if (plan?.meals?.snacks?.length > 0) {
            plan.meals.snacks.forEach((snack, i) => {
                meals.push({
                    name: `Snack ${i + 1}`,
                    time: snack.time || '16:00',
                    calories: snack.total_calories || 0,
                    items: snack.foods?.map(f => ({
                        name: f.name,
                        portion: `${f.quantity_grams || 100}g`
                    })) || []
                });
            });
        }

        return { ...plan, meals };
    } catch (e) {
        console.log('generateMealPlan error:', e.message);
        return { meals: [], total_calories: 0 };
    }
};

export const calculateMacros = (profile) => {
    if (!profile) return { calories: 2000, protein: 120, carbs: 200, fats: 60, fiber: 28, tdee: 2000, bmr: 1600 };
    try {
        const safeProfile = createSafeProfile(profile);
        const bodyMetrics = BodyEngine.calculateBodyMetrics(safeProfile);
        return {
            calories: bodyMetrics.targetCalories || 2000,
            protein: bodyMetrics.macros?.protein || 120,
            carbs: bodyMetrics.macros?.carbs || 200,
            fats: bodyMetrics.macros?.fats || 60,
            fiber: Math.round((bodyMetrics.targetCalories || 2000) / 1000 * 14),
            tdee: bodyMetrics.tdee || 2000,
            bmr: bodyMetrics.bmr || 1600
        };
    } catch (e) {
        console.log('calculateMacros error:', e.message);
        return { calories: 2000, protein: 120, carbs: 200, fats: 60, fiber: 28, tdee: 2000, bmr: 1600 };
    }
};

export const swapMealItem = (mealPlan, mealIndex, itemIndex, profile) => {
    return NutritionEngine.swapMealItem(mealPlan, mealIndex, itemIndex, profile);
};

// ============================================================================
// WORKOUT - HolisticWorkoutPlanner (Goal-Driven)
// ============================================================================

/**
 * Generate holistic workout using goal-driven planner
 * This is the PRIMARY workout generation method
 * Returns: { warmup, strength, cardio, yoga, cooldown, goal, rationale }
 */
export const generateHolisticWorkout = (profile, context = {}) => {
    if (!profile) {
        return {
            goal: 'General Fitness',
            totalDuration: 45,
            warmup: { duration_mins: 5, exercises: [] },
            strength: { duration_mins: 15, exercises: [] },
            cardio: { duration_mins: 10, program: null },
            yoga: { duration_mins: 5, poses: [] },
            cooldown: { duration_mins: 5, exercises: [] },
            rationale: 'Complete your profile to get a personalized workout.'
        };
    }

    const safeProfile = createSafeProfile(profile);

    // Map profile goal to workout goal
    const goalMap = {
        'fat_loss': 'fat_loss',
        'muscle_gain': 'muscle_gain',
        'recomp': 'general_fitness',
        'health': 'general_fitness',
        'maintenance': 'general_fitness'
    };

    try {
        return HolisticWorkoutPlanner.generateHolisticWorkout(safeProfile, {
            goal: context.goal || goalMap[safeProfile.goal_type] || 'general_fitness',
            timeAvailable: context.timeAvailable || 45,
            equipment: context.equipment || safeProfile.equipment || 'none',
            injuries: context.injuries || safeProfile.injuries || [],
            energyLevel: context.energyLevel || 'moderate',
            recoveryStatus: context.recoveryStatus || 'good'
        });
    } catch (e) {
        console.log('generateHolisticWorkout error:', e.message);
        return {
            goal: 'General Fitness',
            totalDuration: 45,
            warmup: { duration_mins: 5, exercises: [] },
            strength: { duration_mins: 15, exercises: [] },
            cardio: { duration_mins: 10, program: null },
            yoga: { duration_mins: 5, poses: [] },
            cooldown: { duration_mins: 5, exercises: [] },
            rationale: 'Error generating workout. Please try again.'
        };
    }
};

// Legacy function - now wraps generateHolisticWorkout
export const generateWorkoutPlan = (profile, date = new Date()) => {
    // Return holistic workout for backwards compatibility
    return generateHolisticWorkout(profile, {});
};

export const getExercisesByMuscle = (muscle, profile) => {
    return WorkoutEngine.getExercisesByMuscle(muscle, profile);
};

// Expose planner utilities for UI
export const getAvailableGoals = () => HolisticWorkoutPlanner.getAvailableGoals();
export const getTimeOptions = () => HolisticWorkoutPlanner.getTimeOptions();
export const getEquipmentOptions = () => HolisticWorkoutPlanner.getEquipmentOptions();

// ============================================================================
// LOOKSMAXING (Using ACTUAL LooksmaxingEngine)
// ============================================================================

export const generateLooksmaxingPlan = (profile) => {
    if (!profile) return { skincare: { morning: [], evening: [] }, facial_exercises: [], grooming_tasks: [] };
    const safeProfile = createSafeProfile(profile);
    try {
        const plan = LooksmaxingEngine.generateLooksmaxingPlan(safeProfile);

        // Transform to UI-compatible format (skincare.morning/evening)
        return {
            ...plan,
            skincare: {
                morning: (plan.skincare_am || []).map(s => ({
                    name: s.step || s.name,
                    duration: s.duration_secs ? `${Math.ceil(s.duration_secs / 60)} min` : '1 min'
                })),
                evening: (plan.skincare_pm || []).map(s => ({
                    name: s.step || s.name,
                    duration: s.duration_secs ? `${Math.ceil(s.duration_secs / 60)} min` : '1 min'
                }))
            },
            hairCare: {
                tip: plan.lifestyle_tips?.find(t => t.toLowerCase().includes('hair')) || 'Oil hair 1-2x weekly. Use mild shampoo.'
            }
        };
    } catch (e) {
        console.log('generateLooksmaxingPlan error:', e.message);
        return { skincare: { morning: [], evening: [] }, facial_exercises: [], grooming_tasks: [] };
    }
};

export const generateSkincareRoutine = (profile) => {
    const plan = LooksmaxingEngine.generateLooksmaxingPlan(profile);
    return {
        morning: plan?.skincare?.morning || [],
        evening: plan?.skincare?.evening || []
    };
};

// ============================================================================
// LIFESTYLE (Using ACTUAL LifestyleEngine)
// ============================================================================

export const calculateLifestyleAdjustments = (profile) => {
    return LifestyleEngine.calculateLifestyleAdjustments(profile);
};

export const getSleepRecommendations = (profile) => {
    return LifestyleEngine.getSleepRecommendations(profile);
};

// ============================================================================
// ADAPTIVE TDEE (Using ACTUAL AdaptiveTDEE)
// ============================================================================

export const updateAdaptiveTDEE = async (profile, dailyLog) => {
    const data = await AsyncStorage.getItem(KEYS.ADAPTIVE_TDEE);
    const history = data ? JSON.parse(data) : { weightLogs: [], adaptedTDEE: null };

    if (dailyLog.weight) {
        history.weightLogs.push({
            date: dailyLog.date,
            weight: dailyLog.weight,
            calories: dailyLog.calories
        });
    }

    const adaptedTDEE = AdaptiveTDEE.calculateAdaptiveTDEE(profile, history.weightLogs);
    history.adaptedTDEE = adaptedTDEE;
    history.adaptation = adaptedTDEE - BodyEngine.calculateBodyMetrics(profile).tdee;

    await AsyncStorage.setItem(KEYS.ADAPTIVE_TDEE, JSON.stringify(history));
    return history;
};

export const getAdaptiveTDEE = async () => {
    const data = await AsyncStorage.getItem(KEYS.ADAPTIVE_TDEE);
    return data ? JSON.parse(data) : null;
};

// ============================================================================
// MICRONUTRIENTS (Using ACTUAL MicronutrientEngine)
// ============================================================================

export const analyzeMicronutrients = (mealPlan, profile) => {
    return MicronutrientEngine.analyzeMicronutrients(mealPlan, profile);
};

export const getMicronutrientDeficiencies = (profile) => {
    return MicronutrientEngine.getDeficiencyRisks(profile);
};

export const getSuggestedFoodsForDeficiency = (nutrient, profile) => {
    return MicronutrientEngine.getSuggestedFoods(nutrient, profile);
};

// ============================================================================
// MENSTRUAL CYCLE (Using ACTUAL MenstrualCycleEngine)
// ============================================================================

export const getCyclePhase = (lastPeriodDate, cycleLength = 28) => {
    return MenstrualCycleEngine.getCurrentPhase(lastPeriodDate, cycleLength);
};

export const getCycleAdjustments = (profile, phase) => {
    return MenstrualCycleEngine.getPhaseAdjustments(profile, phase);
};

export const getCycleTDEEMultiplier = (phase) => {
    return MenstrualCycleEngine.getTDEEMultiplier(phase);
};

// ============================================================================
// PLATEAU DETECTION (Using ACTUAL PlateauEngine)
// ============================================================================

export const detectPlateau = async (profile) => {
    const history = await getWeightHistory();
    return PlateauEngine.detectPlateau(profile, history);
};

export const getPlateauBreakingStrategy = async (profile) => {
    const plateau = await detectPlateau(profile);
    if (plateau?.isPlateaued) {
        return PlateauEngine.getBreakingStrategy(profile, plateau);
    }
    return null;
};

// ============================================================================
// HEALTH CONDITIONS (Using ACTUAL HealthConditionFilter)
// ============================================================================

export const filterForHealthConditions = (foods, profile) => {
    return HealthConditionFilter.filterFoods(foods, profile);
};

export const getHealthConditionRecommendations = (profile) => {
    return HealthConditionFilter.getRecommendations(profile);
};

// ============================================================================
// ADAPTATION ENGINE
// ============================================================================

export const checkForAdaptation = async (profile) => {
    const logs = await getDailyLogs();
    return AdaptationEngine.checkForAdaptation(profile, Object.values(logs));
};

export const getAdaptationRecommendations = async (profile) => {
    const adaptation = await checkForAdaptation(profile);
    if (adaptation?.needsAdaptation) {
        return AdaptationEngine.getRecommendations(profile, adaptation);
    }
    return null;
};

// ============================================================================
// FOOD DATABASE ACCESS
// ============================================================================

export const searchFoods = (query) => FoodDatabase.searchFoods(query);
export const getFoodById = (id) => FoodDatabase.getFoodById(id);
export const getFoodsByCategory = (category) => FoodDatabase.getFoodsByCategory(category);
export const getFoodsByDiet = (dietType) => FoodDatabase.getFoodsByDiet(dietType);
export const getSubstitutes = (foodId, dietType) => FoodDatabase.getSubstitutes(foodId, dietType);
export const getSeasonalStatus = (foodId) => FoodDatabase.getSeasonalStatus(foodId);
export const getNutritionForPortion = (foodId, grams) => FoodDatabase.getNutritionForPortion(foodId, grams);
export const getFoodCount = () => FoodDatabase.getFoodCount();

// ============================================================================
// VALIDATION (Using ACTUAL Validators)
// ============================================================================

export const validateProfile = (profile) => InputValidator.validateProfile(profile);
export const validateGoal = (profile) => GoalValidator.validateGoal(profile);
export const runSafetyChecks = (profile) => SafetyValidator.runAllSafetyChecks(profile);

// ============================================================================
// DATA STORAGE (AsyncStorage layer for mobile)
// ============================================================================

export const getDailyLog = async (date) => {
    const logs = await AsyncStorage.getItem(KEYS.DAILY_LOGS);
    const parsed = logs ? JSON.parse(logs) : {};
    return parsed[date] || null;
};

export const getDailyLogs = async () => {
    // Use DatabaseService for SQLite persistence
    const DB = await import('./DatabaseService');
    return await DB.getDailyLogs();
};

export const saveDailyLog = async (date, log) => {
    // Use DatabaseService for SQLite persistence
    const DB = await import('./DatabaseService');
    const dataWithDate = { ...log, date };
    await DB.saveDailyLog(dataWithDate);

    // Also handle any weight updates
    if (log.weight) {
        const profile = await getProfile();
        if (profile) {
            await updateAdaptiveTDEE(profile, log);
        }
    }
};

// Note: getWeightHistory and logWeight moved to use DatabaseService (see WEIGHT LOGGING section)

export const getHabits = async () => {
    const data = await AsyncStorage.getItem(KEYS.HABITS);
    return data ? JSON.parse(data) : {};
};

export const updateHabit = async (habitId, completed) => {
    const habits = await getHabits();
    const today = new Date().toISOString().split('T')[0];

    if (!habits[habitId]) {
        habits[habitId] = { streak: 0, lastDate: null, total: 0 };
    }

    const habit = habits[habitId];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (completed && habit.lastDate !== today) {
        habit.streak = habit.lastDate === yesterdayStr ? habit.streak + 1 : 1;
        habit.lastDate = today;
        habit.total++;
    }

    await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
    return habit;
};

// ============================================================================
// SQLITE-BASED LOGS (Using DatabaseService)
// ============================================================================

export const saveHealthLog = async (date, data) => {
    await DatabaseService.initDatabase();
    return await DatabaseService.saveHealthLog(date, data);
};

export const getHealthLog = async (date) => {
    await DatabaseService.initDatabase();
    return await DatabaseService.getHealthLog(date);
};

export const getHealthLogs = async (days = 30) => {
    try {
        await DatabaseService.initDatabase();
        return await DatabaseService.getHealthLogs(days);
    } catch (error) {
        console.log('getHealthLogs error:', error);
        return [];
    }
};

export const saveLooksLog = async (date, data) => {
    await DatabaseService.initDatabase();
    return await DatabaseService.saveLooksLog(date, data);
};

export const getLooksLog = async (date) => {
    await DatabaseService.initDatabase();
    return await DatabaseService.getLooksLog(date);
};

export const saveRoutineLog = async (date, data) => {
    await DatabaseService.initDatabase();
    return await DatabaseService.saveRoutineLog(date, data);
};

export const getRoutineLog = async (date) => {
    await DatabaseService.initDatabase();
    return await DatabaseService.getRoutineLog(date);
};

export const getLooksLogs = async (days = 14) => {
    try {
        await DatabaseService.initDatabase();
        return await DatabaseService.getLooksLogs(days);
    } catch (error) {
        console.log('getLooksLogs error:', error);
        return [];
    }
};

export const getRoutineLogs = async (days = 14) => {
    try {
        await DatabaseService.initDatabase();
        return await DatabaseService.getRoutineLogs(days);
    } catch (error) {
        console.log('getRoutineLogs error:', error);
        return [];
    }
};

// ============================================================================
// WEIGHT LOGGING
// ============================================================================

export const logWeight = async (weightKg, bodyFatPercent = null) => {
    try {
        await DatabaseService.initDatabase();
        const today = new Date().toISOString().split('T')[0];
        await DatabaseService.addWeight(today, weightKg, bodyFatPercent);

        // Also update profile with new weight
        const profile = await getProfile();
        if (profile) {
            await saveProfile({ ...profile, weight_kg: weightKg });
        }

        return true;
    } catch (error) {
        console.log('logWeight error:', error);
        return false;
    }
};

export const getWeightHistory = async (limit = 30) => {
    try {
        await DatabaseService.initDatabase();
        return await DatabaseService.getWeightHistory(limit);
    } catch (error) {
        console.log('getWeightHistory error:', error);
        return [];
    }
};

// Alias for backwards compatibility
export const addWeightEntry = logWeight;

// ============================================================================
// FOOD LOGGING
// ============================================================================

export const logFood = async (date, mealType, food) => {
    try {
        await DatabaseService.initDatabase();
        // Calculate macros based on quantity
        const per100g = food.per_100g || {};
        const multiplier = (food.quantity_grams || 100) / 100;

        const logEntry = {
            id: food.id,
            name: food.name,
            quantity_grams: food.quantity_grams || 100,
            calories: Math.round((per100g.calories || food.calories || 0) * multiplier),
            protein: Math.round((per100g.protein || food.protein || 0) * multiplier * 10) / 10,
            carbs: Math.round((per100g.carbs || food.carbs || 0) * multiplier * 10) / 10,
            fats: Math.round((per100g.fats || food.fats || 0) * multiplier * 10) / 10,
            source: food.source || 'manual'
        };

        return await DatabaseService.saveFoodLog(date, mealType, logEntry);
    } catch (error) {
        console.log('logFood error:', error);
        return null;
    }
};

export const getFoodLogs = async (date) => {
    try {
        await DatabaseService.initDatabase();
        return await DatabaseService.getFoodLogs(date);
    } catch (error) {
        console.log('getFoodLogs error:', error);
        return [];
    }
};

export const getFoodLogsByMeal = async (date, mealType) => {
    try {
        await DatabaseService.initDatabase();
        return await DatabaseService.getFoodLogsByMeal(date, mealType);
    } catch (error) {
        console.log('getFoodLogsByMeal error:', error);
        return [];
    }
};

export const deleteFoodLog = async (id) => {
    try {
        await DatabaseService.initDatabase();
        await DatabaseService.deleteFoodLog(id);
        return true;
    } catch (error) {
        console.log('deleteFoodLog error:', error);
        return false;
    }
};

export const getDailyFoodSummary = async (date) => {
    try {
        await DatabaseService.initDatabase();
        return await DatabaseService.getDailyFoodSummary(date);
    } catch (error) {
        console.log('getDailyFoodSummary error:', error);
        return { total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0, total_items: 0 };
    }
};

// ============================================================================
// INTAKE ANALYSIS (Using IntakeAnalyzerEngine)
// ============================================================================

/**
 * Get complete intake summary for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {object} Summary with planned, actual, analysis, and suggestions
 */
export const getIntakeSummary = async (date) => {
    try {
        const profile = await getProfile();
        if (!profile) return null;

        const mealPlan = generateMealPlan(profile);
        const foodSummary = await getDailyFoodSummary(date);

        return IntakeAnalyzerEngine.getIntakeSummary(mealPlan, foodSummary, profile);
    } catch (error) {
        console.log('getIntakeSummary error:', error);
        return null;
    }
};

/**
 * Calculate deficit/surplus for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {object} Detailed deficit analysis
 */
export const calculateIntakeDeficit = async (date) => {
    try {
        const profile = await getProfile();
        if (!profile) return null;

        const mealPlan = generateMealPlan(profile);
        const foodSummary = await getDailyFoodSummary(date);

        const planned = IntakeAnalyzerEngine.getDailyPlannedIntake(mealPlan);
        const actual = IntakeAnalyzerEngine.getDailyActualIntake(foodSummary);

        return IntakeAnalyzerEngine.calculateDeficitSurplus(planned, actual);
    } catch (error) {
        console.log('calculateIntakeDeficit error:', error);
        return null;
    }
};

/**
 * Get compensation food suggestions for protein deficit
 * @param {number} proteinGap - Grams of protein needed
 * @returns {array} List of food suggestions
 */
export const getCompensationFoods = async (proteinGap) => {
    try {
        const profile = await getProfile();
        return IntakeAnalyzerEngine.suggestCompensationFoods(proteinGap, profile);
    } catch (error) {
        console.log('getCompensationFoods error:', error);
        return [];
    }
};

/**
 * Get tomorrow plan adjustments based on today's intake
 * @param {string} date - Today's date
 * @returns {object} Adjustment recommendations
 */
export const getTomorrowAdjustments = async (date) => {
    try {
        const analysis = await calculateIntakeDeficit(date);
        const profile = await getProfile();
        return IntakeAnalyzerEngine.adjustTomorrowPlan(analysis, profile);
    } catch (error) {
        console.log('getTomorrowAdjustments error:', error);
        return { calories: 0, protein: 0, recommendations: [] };
    }
};

/**
 * Analyze meal completion for the day
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {object} Meal status breakdown
 */
export const analyzeMealCompletion = async (date) => {
    try {
        await DatabaseService.initDatabase();
        const foodLogs = await DatabaseService.getFoodLogs(date);
        return IntakeAnalyzerEngine.analyzeMealCompletion(foodLogs);
    } catch (error) {
        console.log('analyzeMealCompletion error:', error);
        return { byMeal: {}, missingMeals: [], loggedMeals: [], completionRate: 0 };
    }
};

// ============================================================================
// EXPORT/IMPORT (Using DataExportService pattern)
// ============================================================================

export const exportAllData = async () => {
    const profile = await getProfile();
    const logs = await getDailyLogs();
    const weights = await getWeightHistory();
    const habits = await getHabits();
    const adaptiveTDEE = await getAdaptiveTDEE();

    return {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        profile,
        dailyLogs: logs,
        weightHistory: weights,
        habits,
        adaptiveTDEE
    };
};

export const importData = async (data) => {
    if (data.profile) await saveProfile(data.profile);
    if (data.dailyLogs) await AsyncStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(data.dailyLogs));
    if (data.weightHistory) await AsyncStorage.setItem(KEYS.WEIGHT_HISTORY, JSON.stringify(data.weightHistory));
    if (data.habits) await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(data.habits));
    if (data.adaptiveTDEE) await AsyncStorage.setItem(KEYS.ADAPTIVE_TDEE, JSON.stringify(data.adaptiveTDEE));
};

export const clearAllData = async () => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
};

// ============================================================================
// COMPLETE DAILY PLAN (Using PlanGeneratorService)
// ============================================================================

export const generateCompleteDailyPlan = async (profile, date = new Date()) => {
    // Use actual PlanGeneratorService
    const dailyPlan = generateDailyPlan(profile, date);

    // Get adaptive TDEE
    const adaptiveTDEEData = await getAdaptiveTDEE();
    const effectiveTDEE = adaptiveTDEEData?.adaptedTDEE || dailyPlan?.bodyMetrics?.tdee;

    // Detect plateau
    const plateau = await detectPlateau(profile);

    // Check adaptation
    const adaptation = await checkForAdaptation(profile);

    // Analyze micronutrients
    let micronutrients = null;
    if (dailyPlan?.mealPlan) {
        micronutrients = analyzeMicronutrients(dailyPlan.mealPlan, profile);
    }

    return {
        ...dailyPlan,
        effectiveTDEE,
        plateau,
        adaptation,
        micronutrients
    };
};

// ============================================================================
// SUPER APP: HEALTH, LOOKS, ROUTINE LOGS
// NOTE: These functions are now SQLite-based and defined above in section
// "SQLITE-BASED LOGS (Using DatabaseService)"
// ============================================================================


// ============================================================================
// SUPER APP: MULTI-GOALS
// ============================================================================

export const getMultiGoals = async () => {
    const data = await AsyncStorage.getItem(KEYS.MULTI_GOALS);
    return data ? JSON.parse(data) : { goals: [] };
};

export const saveMultiGoals = async (multiGoal) => {
    await AsyncStorage.setItem(KEYS.MULTI_GOALS, JSON.stringify(multiGoal));
};

export const addGoal = async (goal) => {
    const multiGoal = await getMultiGoals();
    multiGoal.goals.push(goal);
    await saveMultiGoals(multiGoal);
    return multiGoal;
};

export const updateGoal = async (goalId, updates) => {
    const multiGoal = await getMultiGoals();
    const idx = multiGoal.goals.findIndex(g => g.id === goalId);
    if (idx !== -1) {
        multiGoal.goals[idx] = { ...multiGoal.goals[idx], ...updates };
        await saveMultiGoals(multiGoal);
    }
    return multiGoal;
};

export const removeGoal = async (goalId) => {
    const multiGoal = await getMultiGoals();
    multiGoal.goals = multiGoal.goals.filter(g => g.id !== goalId);
    await saveMultiGoals(multiGoal);
    return multiGoal;
};

// ============================================================================
// SUPER APP: USER MODE
// ============================================================================

export const getUserMode = async () => {
    const data = await AsyncStorage.getItem(KEYS.USER_MODE);
    return data ? JSON.parse(data) : { mode: 'normal', activeSince: new Date().toISOString() };
};

export const setUserMode = async (mode, options = {}) => {
    const userMode = {
        mode,
        activeSince: new Date().toISOString(),
        autoExpiry: options.autoExpiry || null,
        reason: options.reason || ''
    };
    await AsyncStorage.setItem(KEYS.USER_MODE, JSON.stringify(userMode));
    return userMode;
};

// ============================================================================
// SUPER APP: UNIFIED LIFE ADVISOR PLAN
// ============================================================================

export const generateUnifiedLifePlan = async (date = new Date()) => {
    try {
        const today = date.toISOString().split('T')[0];

        // Gather all context
        const profile = await getProfile();
        const goals = await getMultiGoals();
        const healthLog = await getHealthLog(today);
        const looksLog = await getLooksLog(today);
        const routineLog = await getRoutineLog(today);
        const recentHealthLogs = await getHealthLogs(7);
        const userMode = await getUserMode();
        const dailyLog = await getDailyLog(today);

        // Build context with safe defaults
        const context = {
            profile: profile ? createSafeProfile(profile) : null,
            goals,
            healthLog,
            looksLog,
            routineLog,
            recentHealthLogs,
            userMode,
            todayFoodLog: dailyLog,
            todayWorkoutDone: dailyLog?.workout_done
        };

        // Generate unified plan using LifeAdvisorEngine
        const unifiedPlan = LifeAdvisorEngine.generateUnifiedDailyPlan(context);

        // Generate insights
        const allLogs = {
            healthLogs: recentHealthLogs,
            looksLogs: await getLooksLogs(14),
            routineLogs: await getRoutineLogs(14),
            dailyLogs: Object.values(await getDailyLogs()),
            profile
        };
        let insights = InsightsEngine.getTopInsights(allLogs, 3);

        // Provide default insights for new users
        if (insights.length === 0) {
            insights = [
                {
                    id: 'welcome',
                    insight: 'Welcome! Complete your first day to start tracking progress.',
                    type: 'positive',
                    domain: 'routine'
                },
                {
                    id: 'tip_food',
                    insight: 'Log your meals, workouts, and routines to unlock personalized insights.',
                    type: 'actionable',
                    domain: 'health'
                }
            ];
        }

        return {
            ...unifiedPlan,
            insights,
            // Ensure lifeScore defaults to a reasonable starting value
            lifeScore: unifiedPlan.lifeScore || (profile ? 50 : 0)
        };
    } catch (error) {
        console.log('generateUnifiedLifePlan error:', error);
        // Return safe default plan on error
        return {
            date: new Date().toISOString().split('T')[0],
            adjustments: { workoutIntensity: 1.0 },
            explanations: [],
            timeline: [
                { time: '06:00', activity: 'Wake up', domain: 'routine', icon: 'sunrise' },
                { time: '07:00', activity: 'Morning workout', domain: 'body', icon: 'activity' },
                { time: '08:30', activity: 'Breakfast', domain: 'food', icon: 'coffee' },
                { time: '13:00', activity: 'Lunch', domain: 'food', icon: 'sun' },
                { time: '20:00', activity: 'Dinner', domain: 'food', icon: 'moon' },
                { time: '22:30', activity: 'Bedtime', domain: 'routine', icon: 'moon' }
            ],
            lifeScore: 50,
            insights: [
                { id: 'error', insight: 'Unable to load full plan. Pull down to refresh.', type: 'warning', domain: 'routine' }
            ]
        };
    }
};
