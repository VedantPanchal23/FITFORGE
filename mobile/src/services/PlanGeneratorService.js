/**
 * Plan Generator Service
 * Orchestrates all engines to generate complete daily plans
 * 
 * ARCHITECTURE:
 * - HolisticWorkoutPlanner is the PRIMARY workout generation engine
 * - Workouts are goal-driven, not style-driven
 * - System acts as a real coach, composing balanced routines automatically
 */

const { enrichProfileWithMetrics, calculateBodyMetrics, getMetricsExplanation } = require('../core/engines/BodyEngine');
const { generateMealPlan, generateMealPlanWithAlternatives } = require('../core/engines/NutritionEngine');
// HolisticWorkoutPlanner is now the primary workout engine
const HolisticWorkoutPlanner = require('../core/engines/HolisticWorkoutPlanner');
const { adjustForRecovery } = require('../core/engines/WorkoutEngine');
const { generateLifestyleRecommendations, getPriorityRecommendations } = require('../core/engines/LifestyleEngine');
const { generateLooksmaxingPlan } = require('../core/engines/LooksmaxingEngine');
const { generateAdaptationReport, adaptForMissedWorkout } = require('../core/engines/AdaptationEngine');
const { getSupplementSchedule, getRecommendedSupplements } = require('../core/engines/SupplementTimingEngine');
const { applyContextMode, getAllContextModes } = require('../core/engines/ContextModes');
const { getRecoveryStatus } = require('../core/models/DailyLog');
const { isProfileComplete } = require('../core/models/Profile');
const { runAllSafetyChecks } = require('../core/validators/SafetyValidator');

// Day mode configurations
const DAY_MODES = {
    normal: {
        name: 'Normal Day',
        icon: 'sun',
        workoutAdjustment: 1.0,
        mealComplexity: 'full',
        supplementsReminder: true
    },
    busy: {
        name: 'Busy Day',
        icon: 'briefcase',
        workoutOptions: [
            { type: 'skip', message: 'Take a rest day - you\'re busy!' },
            { type: 'quick', duration: 15, message: '15-min express workout' },
            { type: 'minimal', duration: 10, message: 'Just 10 min core/stretching' }
        ],
        mealComplexity: 'simple',
        quickMeals: true,
        supplementsReminder: true
    },
    low_energy: {
        name: 'Low Energy Day',
        icon: 'battery-low',
        workoutAdjustment: 0.7, // 70% volume
        workoutOptions: [
            { type: 'light', message: 'Light yoga or walking instead' },
            { type: 'rest', message: 'Complete rest - listen to your body' }
        ],
        mealComplexity: 'comfort',
        calorieAdjustment: 1.0, // Maintain calories
        supplementsReminder: true,
        recoveryTips: ['Prioritize sleep tonight', 'Stay hydrated', 'Consider light walk']
    },
    travel: {
        name: 'Travel Day',
        icon: 'plane',
        workoutOptions: [
            { type: 'hotel', message: 'Hotel room bodyweight workout' },
            { type: 'skip', message: 'Travel rest day' }
        ],
        mealComplexity: 'flexible',
        contextMode: 'travel',
        portionGuidance: true,
        supplementsReminder: true
    },
    social: {
        name: 'Social Event Day',
        icon: 'users',
        mealComplexity: 'flexible',
        contextMode: 'social',
        tips: ['Eat protein-rich snack before event', 'Focus on protein at the event', 'One treat is fine!']
    }
};

/**
 * Initialize a new profile with all calculated values
 */
function initializeProfile(profileData) {
    // Check completeness
    const completeness = isProfileComplete(profileData);
    if (!completeness.complete) {
        return {
            success: false,
            error: 'Profile incomplete',
            missing: completeness.missing
        };
    }

    // Enrich with calculated metrics
    const enrichedProfile = enrichProfileWithMetrics(profileData);

    // Run safety checks
    const safetyCheck = runAllSafetyChecks(enrichedProfile, {
        calories: enrichedProfile.target_calories,
        protein: enrichedProfile.protein_grams
    });

    // Apply any adjustments from safety checks
    if (safetyCheck.adjustments.calories) {
        enrichedProfile.target_calories = safetyCheck.adjustments.calories;
    }
    if (safetyCheck.adjustments.protein) {
        enrichedProfile.protein_grams = safetyCheck.adjustments.protein;
    }

    // Get explanations
    const metrics = calculateBodyMetrics(profileData);
    const explanations = getMetricsExplanation(metrics, enrichedProfile);

    return {
        success: true,
        profile: enrichedProfile,
        metrics,
        explanations,
        warnings: safetyCheck.warnings
    };
}

/**
 * Generate complete daily plan using HolisticWorkoutPlanner
 * Workouts are now goal-driven, not style-driven
 */
function generateDailyPlan(profile, date, options = {}) {
    const { previousLog, experienceWeeks = 0, energyLevel = 'moderate', timeAvailable = 45 } = options;

    // Get recovery status from previous day if available
    const recoveryStatus = previousLog ? getRecoveryStatus(previousLog) : null;

    // Generate meal plan
    const mealPlan = generateMealPlan(profile, date);

    // Map profile goal to workout goal
    const workoutGoal = mapProfileGoalToWorkoutGoal(profile.goal_type);

    // Generate holistic workout using goal-driven planner
    const workoutPlan = HolisticWorkoutPlanner.generateHolisticWorkout(profile, {
        goal: workoutGoal,
        timeAvailable: timeAvailable,
        equipment: profile.equipment || 'none',
        injuries: profile.injuries || [],
        energyLevel: energyLevel,
        recoveryStatus: recoveryStatus?.status || 'good'
    });

    // Generate lifestyle recommendations
    const lifestyle = generateLifestyleRecommendations(profile);
    const priorities = getPriorityRecommendations(profile);

    // Generate looksmaxing plan
    const looksmaxingPlan = generateLooksmaxingPlan(profile, date, experienceWeeks);

    return {
        date,
        mealPlan,
        workoutPlan,
        lifestyle,
        looksmaxingPlan,
        priorities,
        recoveryStatus,
        summary: generateHolisticDaySummary(profile, mealPlan, workoutPlan)
    };
}

/**
 * Map profile goal to HolisticWorkoutPlanner goal
 */
function mapProfileGoalToWorkoutGoal(profileGoal) {
    const goalMap = {
        'fat_loss': 'fat_loss',
        'muscle_gain': 'muscle_gain',
        'recomp': 'general_fitness',
        'health': 'general_fitness',
        'endurance': 'endurance',
        'flexibility': 'flexibility',
        'posture': 'posture',
        'athletic': 'athletic_performance'
    };
    return goalMap[profileGoal] || 'general_fitness';
}

/**
 * Generate day summary for holistic workout
 */
function generateHolisticDaySummary(profile, mealPlan, workoutPlan) {
    const parts = [];

    parts.push(`Target: ${profile.target_calories} kcal | ${profile.protein_grams}g protein`);

    if (workoutPlan.goal) {
        const segments = [];
        if (workoutPlan.strength?.exercises?.length > 0) segments.push('Strength');
        if (workoutPlan.cardio?.program || workoutPlan.cardio?.duration_mins > 3) segments.push('Cardio');
        if (workoutPlan.yoga?.poses?.length > 0) segments.push('Yoga');

        parts.push(`${workoutPlan.goal} (${workoutPlan.totalDuration}min): ${segments.join(' + ')}`);
    } else {
        parts.push('Rest day - focus on recovery and nutrition');
    }

    return parts.join(' | ');
}

/**
 * Legacy summary function for backwards compatibility
 */
function generateDaySummary(profile, mealPlan, workoutPlan) {
    // Handle both old and new workout plan formats
    if (workoutPlan.goal) {
        return generateHolisticDaySummary(profile, mealPlan, workoutPlan);
    }

    const parts = [];
    parts.push(`Target: ${profile.target_calories} kcal | ${profile.protein_grams}g protein`);

    if (workoutPlan.is_rest_day) {
        parts.push('Rest day - focus on recovery and nutrition');
    } else {
        parts.push(`Workout: ${(workoutPlan.workout_type || 'general').replace('_', ' ')} (${workoutPlan.estimated_duration_mins || 45} min)`);
    }

    return parts.join(' | ');
}

/**
 * Generate weekly plan overview
 */
function generateWeeklyPlan(profile, startDate, options = {}) {
    const plans = [];
    const date = new Date(startDate);

    for (let i = 0; i < 7; i++) {
        const dateStr = date.toISOString().split('T')[0];
        const previousLog = i > 0 ? options.logs?.[i - 1] : null;

        plans.push(generateDailyPlan(profile, dateStr, { ...options, previousLog }));
        date.setDate(date.getDate() + 1);
    }

    return {
        startDate,
        endDate: date.toISOString().split('T')[0],
        plans,
        weekSummary: generateWeekSummary(plans, profile)
    };
}

/**
 * Generate week summary
 */
function generateWeekSummary(plans, profile) {
    const workoutDays = plans.filter(p => !p.workoutPlan.is_rest_day).length;
    const restDays = plans.filter(p => p.workoutPlan.is_rest_day).length;

    const muscleGroups = new Set();
    plans.forEach(p => {
        if (p.workoutPlan.muscle_groups) {
            p.workoutPlan.muscle_groups.forEach(mg => muscleGroups.add(mg));
        }
    });

    return {
        totalCalories: profile.target_calories * 7,
        totalProtein: profile.protein_grams * 7,
        workoutDays,
        restDays,
        musclesCovered: Array.from(muscleGroups),
        goal: profile.goal_type
    };
}

/**
 * Process end-of-day feedback and adapt
 */
function processEndOfDayFeedback(profile, logs) {
    const report = generateAdaptationReport(profile, logs);

    if (!report.hasData) {
        return {
            success: false,
            message: report.message
        };
    }

    return {
        success: true,
        report,
        nextDayAdjustments: report.adjustments
    };
}

/**
 * Get onboarding questions
 */
function getOnboardingQuestions() {
    return {
        sections: [
            {
                id: 'demographics',
                title: 'Basic Information',
                questions: [
                    { id: 'gender', type: 'select', label: 'Gender', options: ['male', 'female'], required: true },
                    { id: 'age', type: 'number', label: 'Age (years)', min: 13, max: 100, required: true },
                    { id: 'height_cm', type: 'number', label: 'Height (cm)', min: 100, max: 250, required: true },
                    { id: 'weight_kg', type: 'number', label: 'Current Weight (kg)', min: 30, max: 300, required: true }
                ]
            },
            {
                id: 'goals',
                title: 'Your Goals',
                questions: [
                    {
                        id: 'goal_type', type: 'select', label: 'Primary Goal',
                        options: [
                            { value: 'fat_loss', label: 'Fat Loss' },
                            { value: 'muscle_gain', label: 'Muscle Gain' },
                            { value: 'recomp', label: 'Body Recomposition' },
                            { value: 'health', label: 'General Health' }
                        ], required: true
                    },
                    { id: 'target_weight_kg', type: 'number', label: 'Target Weight (kg)', required: false },
                    { id: 'target_weeks', type: 'number', label: 'Target Timeline (weeks)', min: 4, max: 104, required: false }
                ]
            },
            {
                id: 'diet',
                title: 'Diet Preferences',
                questions: [
                    {
                        id: 'diet_type', type: 'select', label: 'Diet Type',
                        options: [
                            { value: 'veg', label: 'Vegetarian' },
                            { value: 'nonveg', label: 'Non-Vegetarian' },
                            { value: 'veg_egg', label: 'Vegetarian + Eggs' },
                            { value: 'jain', label: 'Jain (No Root Vegetables)' }
                        ], required: true
                    },
                    { id: 'food_exclusions', type: 'multi_text', label: 'Foods to Exclude', required: false }
                ]
            },
            {
                id: 'lifestyle',
                title: 'Lifestyle',
                questions: [
                    {
                        id: 'activity_level', type: 'select', label: 'Activity Level',
                        options: ['sedentary', 'light', 'moderate', 'active', 'very_active'], required: true
                    },
                    { id: 'sleep_hours_avg', type: 'number', label: 'Average Sleep (hours)', min: 3, max: 14 },
                    { id: 'stress_level', type: 'select', label: 'Stress Level', options: ['low', 'medium', 'high'] },
                    { id: 'digestion_quality', type: 'select', label: 'Digestion Quality', options: ['poor', 'average', 'good'] }
                ]
            },
            {
                id: 'workout',
                title: 'Workout Experience',
                questions: [
                    {
                        id: 'experience_level', type: 'select', label: 'Experience Level',
                        options: ['beginner', 'intermediate', 'advanced'], required: true
                    },
                    {
                        id: 'injuries', type: 'multi_select', label: 'Any Injuries?',
                        options: ['wrist_injury', 'shoulder_injury', 'knee_injury', 'ankle_injury', 'back_injury', 'none']
                    }
                ]
            },
            {
                id: 'looksmaxing',
                title: 'Appearance Goals',
                questions: [
                    {
                        id: 'skin_type', type: 'select', label: 'Skin Type',
                        options: ['oily', 'dry', 'combination', 'normal']
                    },
                    {
                        id: 'skin_concerns', type: 'multi_select', label: 'Skin Concerns',
                        options: ['acne', 'dark_circles', 'uneven_tone', 'wrinkles', 'pores', 'none']
                    },
                    {
                        id: 'facial_goals', type: 'multi_select', label: 'Facial Improvement Goals',
                        options: ['jawline', 'symmetry', 'skin_clarity', 'under_eye', 'cheekbones', 'none']
                    },
                    {
                        id: 'hair_concerns', type: 'multi_select', label: 'Hair Concerns',
                        options: ['thinning', 'dandruff', 'dryness', 'oiliness', 'gray', 'none']
                    }
                ]
            }
        ]
    };
}

/**
 * Regenerate plan for a specific day mode
 * @param {object} profile - user profile
 * @param {string} date - plan date
 * @param {string} dayMode - busy, low_energy, travel, social, normal
 * @returns {object} adjusted daily plan
 */
function regeneratePlanForDayMode(profile, date, dayMode = 'normal') {
    const mode = DAY_MODES[dayMode];
    if (!mode) {
        return generateDailyPlan(profile, date);
    }

    const basePlan = generateDailyPlan(profile, date);

    // Apply mode-specific adjustments
    const adjustedPlan = { ...basePlan };
    adjustedPlan.dayMode = dayMode;
    adjustedPlan.dayModeName = mode.name;
    adjustedPlan.dayModeIcon = mode.icon;

    // Adjust workout based on mode
    if (mode.workoutOptions) {
        adjustedPlan.workoutAlternatives = mode.workoutOptions;
    }

    if (mode.workoutAdjustment && mode.workoutAdjustment !== 1.0) {
        adjustedPlan.workoutPlan = adjustWorkoutVolume(adjustedPlan.workoutPlan, mode.workoutAdjustment);
    }

    // Adjust meals based on mode
    if (mode.quickMeals || mode.contextMode) {
        try {
            adjustedPlan.mealPlan = generateMealPlanWithAlternatives(profile, date, {
                contextMode: mode.contextMode || 'quick',
                includeAlternatives: true
            });
        } catch (e) {
            // Fall back to regular meal plan if context filtering fails
            console.warn('Context mode meal generation failed, using regular:', e.message);
        }
    }

    // Add mode-specific tips and guidance
    adjustedPlan.modeTips = mode.tips || mode.recoveryTips || [];

    return adjustedPlan;
}

/**
 * Adjust workout volume by multiplier
 */
function adjustWorkoutVolume(workoutPlan, multiplier) {
    if (!workoutPlan || workoutPlan.is_rest_day) return workoutPlan;

    const adjusted = { ...workoutPlan };

    if (adjusted.workout?.exercises) {
        adjusted.workout.exercises = adjusted.workout.exercises.map(ex => ({
            ...ex,
            sets: Math.max(2, Math.round((ex.sets || 3) * multiplier))
        }));
    }

    if (adjusted.phases) {
        adjusted.phases = adjusted.phases.map(phase => ({
            ...phase,
            exercises: phase.exercises?.map(ex => ({
                ...ex,
                sets: ex.sets ? Math.max(2, Math.round(ex.sets * multiplier)) : ex.sets,
                reps: ex.reps && typeof ex.reps === 'number' ? Math.round(ex.reps * multiplier) : ex.reps
            }))
        }));
    }

    adjusted.volumeAdjusted = true;
    adjusted.volumeMultiplier = multiplier;

    return adjusted;
}

/**
 * Generate enhanced daily plan with alternatives and context
 * NOW USES HolisticWorkoutPlanner - goal-driven, not style-driven
 * @param {object} profile - user profile
 * @param {string} date - plan date
 * @param {object} options - { dayMode, contextMode, includeSupplements, timeAvailable, energyLevel }
 * @returns {object} enhanced daily plan
 */
function generateEnhancedDailyPlan(profile, date, options = {}) {
    const {
        dayMode = 'normal',
        contextMode = 'normal',
        includeSupplements = true,
        previousLog,
        timeAvailable = 45,
        energyLevel = 'moderate'
    } = options;

    const recoveryStatus = previousLog ? getRecoveryStatus(previousLog) : null;

    // Generate meal plan with alternatives
    let mealPlan;
    try {
        mealPlan = generateMealPlanWithAlternatives(profile, date, {
            contextMode,
            includeAlternatives: true,
            alternativeCount: 3
        });
    } catch (e) {
        // Fallback to regular meal plan
        mealPlan = generateMealPlan(profile, date);
    }

    // Map profile goal to workout goal
    const workoutGoal = mapProfileGoalToWorkoutGoal(profile.goal_type);

    // Determine energy level based on day mode
    let effectiveEnergyLevel = energyLevel;
    if (dayMode === 'low_energy') effectiveEnergyLevel = 'low';
    if (dayMode === 'busy') effectiveEnergyLevel = 'moderate';

    // Determine time based on day mode
    let effectiveTime = timeAvailable;
    if (dayMode === 'busy') effectiveTime = Math.min(timeAvailable, 20);

    // Generate holistic workout using goal-driven planner
    const workoutPlan = HolisticWorkoutPlanner.generateHolisticWorkout(profile, {
        goal: workoutGoal,
        timeAvailable: effectiveTime,
        equipment: profile.equipment || 'none',
        injuries: profile.injuries || [],
        energyLevel: effectiveEnergyLevel,
        recoveryStatus: recoveryStatus?.status || 'good'
    });

    // Generate lifestyle recommendations
    const lifestyle = generateLifestyleRecommendations(profile);
    const priorities = getPriorityRecommendations(profile);

    // Generate looksmaxing plan
    const looksmaxingPlan = generateLooksmaxingPlan(profile, date, options.experienceWeeks || 0);

    // Generate supplement schedule if applicable
    let supplementPlan = null;
    if (includeSupplements && profile.supplements && profile.supplements.length > 0) {
        supplementPlan = getSupplementSchedule(profile.supplements, profile);
    }

    const plan = {
        date,
        dayMode,
        dayModeName: DAY_MODES[dayMode]?.name || 'Normal Day',
        mealPlan,
        workoutPlan,
        // Include goal options for UI display
        availableGoals: HolisticWorkoutPlanner.getAvailableGoals(),
        timeOptions: HolisticWorkoutPlanner.getTimeOptions(),
        equipmentOptions: HolisticWorkoutPlanner.getEquipmentOptions(),
        lifestyle,
        looksmaxingPlan,
        priorities,
        supplementPlan,
        recoveryStatus,
        summary: generateHolisticDaySummary(profile, mealPlan, workoutPlan)
    };

    // Apply day mode adjustments if needed
    if (dayMode !== 'normal') {
        const mode = DAY_MODES[dayMode];
        if (mode) {
            plan.dayModeIcon = mode.icon;
            plan.modeTips = mode.tips || mode.recoveryTips || [];
        }
    }

    return plan;

}

/**
 * Get available day modes
 */
function getAvailableDayModes() {
    return Object.entries(DAY_MODES).map(([id, mode]) => ({
        id,
        name: mode.name,
        icon: mode.icon,
        description: mode.workoutOptions ? `${mode.workoutOptions.length} workout options` : 'Standard day'
    }));
}

module.exports = {
    initializeProfile,
    generateDailyPlan,
    generateEnhancedDailyPlan,
    generateWeeklyPlan,
    regeneratePlanForDayMode,
    processEndOfDayFeedback,
    getOnboardingQuestions,
    generateDaySummary,
    generateWeekSummary,
    getAvailableDayModes,
    DAY_MODES
};
