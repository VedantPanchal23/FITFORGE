/**
 * PFT Core - Personal Fitness Tracker
 * Main entry point for the core logic library (Mobile Version)
 * 
 * This file exports all 13 engines, 6 services, validators, and models
 * exactly as the original src/index.js but adapted for React Native
 */

// Models (Original 5)
const Profile = require('./core/models/Profile');
const DailyLog = require('./core/models/DailyLog');
const MealPlan = require('./core/models/MealPlan');
const WorkoutPlan = require('./core/models/WorkoutPlan');
const LooksmaxingPlan = require('./core/models/LooksmaxingPlan');

// Models (Super App - 6 new)
const HealthLog = require('./core/models/HealthLog');
const LooksLog = require('./core/models/LooksLog');
const RoutineLog = require('./core/models/RoutineLog');
const MultiGoal = require('./core/models/MultiGoal');
const DecisionExplanation = require('./core/models/DecisionExplanation');
const UserMode = require('./core/models/UserMode');

// Core Engines (6)
const BodyEngine = require('./core/engines/BodyEngine');
const NutritionEngine = require('./core/engines/NutritionEngine');
const WorkoutEngine = require('./core/engines/WorkoutEngine');
const LifestyleEngine = require('./core/engines/LifestyleEngine');
const LooksmaxingEngine = require('./core/engines/LooksmaxingEngine');
const AdaptationEngine = require('./core/engines/AdaptationEngine');

// V2 Engines (5)
const AdaptiveTDEE = require('./core/engines/AdaptiveTDEE');
const MicronutrientEngine = require('./core/engines/MicronutrientEngine');
const MenstrualCycleEngine = require('./core/engines/MenstrualCycleEngine');
const PlateauEngine = require('./core/engines/PlateauEngine');
const HealthConditionFilter = require('./core/engines/HealthConditionFilter');

// Super App Engines (2 new)
const LifeAdvisorEngine = require('./core/engines/LifeAdvisorEngine');
const InsightsEngine = require('./core/engines/InsightsEngine');

// Validators (3)
const InputValidator = require('./core/validators/InputValidator');
const GoalValidator = require('./core/validators/GoalValidator');
const SafetyValidator = require('./core/validators/SafetyValidator');

// Utilities
const calculations = require('./core/utils/calculations');
const constants = require('./core/utils/constants');

// Food Database
const FoodDatabase = require('./data/foods/index');

// Services (6)
const PlanGeneratorService = require('./services/PlanGeneratorService');
const FoodLoggingService = require('./services/FoodLoggingService');
const HabitTrackingService = require('./services/HabitTrackingService');
const DataExportService = require('./services/DataExportService');
const WorkoutLoggingService = require('./services/WorkoutLoggingService');
const ProgressTrackingService = require('./services/ProgressTrackingService');

module.exports = {
    // Models (5 original + 6 new = 11)
    Profile,
    DailyLog,
    MealPlan,
    WorkoutPlan,
    LooksmaxingPlan,
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

    // Super App Engines (2)
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

    // Convenience exports
    initializeProfile: PlanGeneratorService.initializeProfile,
    generateDailyPlan: PlanGeneratorService.generateDailyPlan,
    generateWeeklyPlan: PlanGeneratorService.generateWeeklyPlan,
    getOnboardingQuestions: PlanGeneratorService.getOnboardingQuestions
};

