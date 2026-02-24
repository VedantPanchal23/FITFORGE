/**
 * LifeAdvisorEngine
 * Core orchestration layer that combines all domain engines into ONE coherent daily plan.
 * Implements cross-domain rules, conflict resolution, and decision explanations.
 */

const { createDecisionExplanation, fromTemplate } = require('../models/DecisionExplanation');
const { getModeAdjustments, shouldExpireMode } = require('../models/UserMode');
const { calculateHealthScore } = require('../models/HealthLog');
const { calculateLooksScore } = require('../models/LooksLog');
const { calculateDisciplineScore } = require('../models/RoutineLog');

// ============================================================================
// PRIORITY SYSTEM (1 = highest priority)
// ============================================================================
const PRIORITY_ORDER = {
    SAFETY: 1,      // Medical/Safety concerns
    RECOVERY: 2,    // Sleep, fatigue, stress
    NUTRITION: 3,   // Protein target, fasting compliance
    WORKOUT: 4,     // Training schedule
    LOOKS: 5,       // Skincare, grooming
    DISCIPLINE: 6   // Habit streaks, schedule adherence
};

// ============================================================================
// CROSS-DOMAIN RULES
// ============================================================================
const CROSS_DOMAIN_RULES = [
    // Recovery-based rules
    {
        id: 'low_sleep',
        condition: (ctx) => ctx.healthLog?.sleep_hours !== null && ctx.healthLog.sleep_hours < 6,
        priority: PRIORITY_ORDER.RECOVERY,
        apply: (plan) => {
            plan.adjustments.workoutIntensity *= 0.7;
            plan.adjustments.addRecoveryFocus = true;
            return plan;
        },
        explanation: 'low_sleep'
    },
    {
        id: 'very_low_sleep',
        condition: (ctx) => ctx.healthLog?.sleep_hours !== null && ctx.healthLog.sleep_hours < 4,
        priority: PRIORITY_ORDER.SAFETY,
        apply: (plan) => {
            plan.adjustments.workoutIntensity = 0;
            plan.adjustments.restDay = true;
            return plan;
        },
        explanation: {
            reason: 'Critical sleep deprivation',
            rule: 'sleep_hours < 4',
            action: 'Rest day enforced',
            humanExplanation: 'With less than 4 hours of sleep, training would be counterproductive and risky. Today is a mandatory rest day.'
        }
    },
    {
        id: 'high_stress',
        condition: (ctx) => ctx.healthLog?.stress_level >= 8,
        priority: PRIORITY_ORDER.RECOVERY,
        apply: (plan) => {
            plan.adjustments.workoutIntensity *= 0.6;
            plan.adjustments.skipHeavyFacialExercises = true;
            plan.adjustments.addBreathingExercise = true;
            return plan;
        },
        explanation: 'high_stress'
    },

    // Hydration rules
    {
        id: 'low_water_afternoon',
        condition: (ctx) => {
            const hour = new Date().getHours();
            return hour >= 18 && (ctx.healthLog?.water_glasses || 0) < 4;
        },
        priority: PRIORITY_ORDER.NUTRITION,
        apply: (plan) => {
            plan.adjustments.hydrationReminders = 'high';
            return plan;
        },
        explanation: 'low_water'
    },

    // Mood rules
    {
        id: 'low_mood_pattern',
        condition: (ctx) => {
            if (!ctx.recentHealthLogs || ctx.recentHealthLogs.length < 2) return false;
            const last2 = ctx.recentHealthLogs.slice(0, 2);
            return last2.every(log => log.mood !== null && log.mood < 4);
        },
        priority: PRIORITY_ORDER.RECOVERY,
        apply: (plan) => {
            plan.adjustments.workoutIntensity *= 0.7;
            plan.adjustments.lightRoutine = true;
            plan.adjustments.addMoodBoostActivities = true;
            return plan;
        },
        explanation: 'low_mood'
    },

    // Fasting rules
    {
        id: 'fasting_active',
        condition: (ctx) => ctx.profile?.fasting_mode === true,
        priority: PRIORITY_ORDER.NUTRITION,
        apply: (plan) => {
            plan.adjustments.shiftProteinTiming = true;
            plan.adjustments.concentrateMeals = true;
            return plan;
        },
        explanation: 'fasting_mode'
    },

    // Screen time rules
    {
        id: 'high_screen_time',
        condition: (ctx) => ctx.healthLog?.screen_time_hours > 5,
        priority: PRIORITY_ORDER.DISCIPLINE,
        apply: (plan) => {
            plan.adjustments.addSleepHygieneTasks = true;
            plan.adjustments.blueBlockingReminder = true;
            return plan;
        },
        explanation: 'high_screen_time'
    },

    // Skincare consistency rules
    {
        id: 'missed_morning_skincare',
        condition: (ctx) => {
            const hour = new Date().getHours();
            return hour > 12 && ctx.looksLog?.morning_routine_done === false;
        },
        priority: PRIORITY_ORDER.LOOKS,
        apply: (plan) => {
            plan.adjustments.eveningSkincareReminder = 'high';
            return plan;
        },
        explanation: 'missed_skin_routine'
    },

    // Energy-based rules
    {
        id: 'low_energy',
        condition: (ctx) => ctx.healthLog?.energy_level !== null && ctx.healthLog.energy_level < 4,
        priority: PRIORITY_ORDER.RECOVERY,
        apply: (plan) => {
            plan.adjustments.workoutIntensity *= 0.8;
            plan.adjustments.restSuggestion = true;
            return plan;
        },
        explanation: {
            reason: 'Low energy detected',
            rule: 'energy_level < 4',
            action: 'Lighter day suggested',
            humanExplanation: 'Your energy is low today. The routine has been lightened to allow recovery.'
        }
    }
];

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Generate a unified daily plan combining all domains
 */
function generateUnifiedDailyPlan(context) {
    const { profile, goals, healthLog, looksLog, routineLog, recentHealthLogs, userMode } = context;

    // Start with base plan
    const plan = {
        date: new Date().toISOString().split('T')[0],
        adjustments: {
            workoutIntensity: 1.0,
            mealComplexity: 'full',
            routineLevel: 'full'
        },
        explanations: [],
        timeline: [],
        priorities: []
    };

    // Apply mode adjustments first
    const modeAdjustments = getModeAdjustments(userMode?.mode || 'normal');
    Object.assign(plan.adjustments, modeAdjustments);

    if (userMode?.mode && userMode.mode !== 'normal') {
        plan.explanations.push(createDecisionExplanation({
            reason: `${userMode.mode} mode active`,
            rule: `mode = ${userMode.mode}`,
            action: 'All plans adjusted for current mode',
            humanExplanation: `You're in ${userMode.mode} mode. Plans have been adjusted accordingly.`,
            priority: PRIORITY_ORDER.SAFETY
        }));
    }

    // Build context for rules
    const ruleContext = {
        profile,
        healthLog,
        looksLog,
        routineLog,
        recentHealthLogs,
        goals
    };

    // Apply cross-domain rules
    const appliedRules = applyCrossDomainRules(plan, ruleContext);
    plan.explanations.push(...appliedRules);

    // Resolve any conflicts (e.g., rest day overrides workout intensity)
    resolveConflicts(plan.adjustments);

    // Sort explanations by priority
    plan.explanations.sort((a, b) => (a.priority || 6) - (b.priority || 6));

    // Generate timeline
    plan.timeline = generateDailyTimeline(plan, context);

    // Calculate life score
    plan.lifeScore = calculateLifeScore(context);

    return plan;
}

/**
 * Apply all applicable cross-domain rules
 */
function applyCrossDomainRules(plan, context) {
    const explanations = [];

    // Sort rules by priority
    const sortedRules = [...CROSS_DOMAIN_RULES].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
        try {
            if (rule.condition(context)) {
                rule.apply(plan);

                // Generate explanation
                let explanation;
                if (typeof rule.explanation === 'string') {
                    explanation = fromTemplate(rule.explanation, { priority: rule.priority });
                } else {
                    explanation = createDecisionExplanation({
                        ...rule.explanation,
                        priority: rule.priority
                    });
                }

                if (explanation) {
                    explanations.push(explanation);
                }
            }
        } catch (e) {
            // Rule evaluation failed, skip silently
        }
    }

    return explanations;
}

/**
 * Resolve conflicts between adjustments using priority system
 */
function resolveConflicts(adjustments) {
    // If rest day is enforced (safety), override workout intensity
    if (adjustments.restDay) {
        adjustments.workoutIntensity = 0;
    }

    // Ensure intensity doesn't go negative
    adjustments.workoutIntensity = Math.max(0, adjustments.workoutIntensity);

    return adjustments;
}

/**
 * Generate daily timeline across all modules
 */
function generateDailyTimeline(plan, context) {
    const { profile } = context;
    const timeline = [];

    // Morning block
    timeline.push({ time: '06:00', activity: 'Wake up', domain: 'routine', icon: 'sunrise' });

    if (!plan.adjustments.skipSkincare) {
        timeline.push({ time: '06:15', activity: 'Morning skincare routine', domain: 'looks', icon: 'droplet' });
    }

    if (plan.adjustments.addBreathingExercise) {
        timeline.push({ time: '06:30', activity: 'Breathing exercise (4-7-8)', domain: 'health', icon: 'wind', why: 'High stress detected' });
    }

    // Workout if not rest day
    if (plan.adjustments.workoutIntensity > 0) {
        const intensity = Math.round(plan.adjustments.workoutIntensity * 100);
        timeline.push({
            time: '07:00',
            activity: `Workout (${intensity}% intensity)`,
            domain: 'body',
            icon: 'activity',
            why: intensity < 100 ? 'Intensity adjusted for recovery' : null
        });
        timeline.push({ time: '07:45', activity: 'Post-workout stretch', domain: 'body', icon: 'move' });
    } else {
        timeline.push({ time: '07:00', activity: 'Rest day - light stretching only', domain: 'body', icon: 'moon', why: 'Rest enforced for recovery' });
    }

    // Meals
    timeline.push({ time: '08:30', activity: 'Breakfast', domain: 'food', icon: 'coffee' });
    timeline.push({ time: '13:00', activity: 'Lunch', domain: 'food', icon: 'sun' });
    timeline.push({ time: '16:30', activity: 'Snack', domain: 'food', icon: 'cookie' });
    timeline.push({ time: '20:00', activity: 'Dinner', domain: 'food', icon: 'moon' });

    // Hydration reminders
    if (plan.adjustments.hydrationReminders === 'high') {
        timeline.push({ time: '18:00', activity: 'Hydration catch-up', domain: 'health', icon: 'droplet', why: 'Behind on water goal' });
    }

    // Evening routine
    if (!plan.adjustments.skipSkincare) {
        timeline.push({ time: '21:30', activity: 'Evening skincare routine', domain: 'looks', icon: 'moon' });
    }

    if (plan.adjustments.addSleepHygieneTasks) {
        timeline.push({ time: '21:00', activity: 'Screen time limit - blue light glasses', domain: 'health', icon: 'eye-off', why: 'High screen time today' });
    }

    timeline.push({ time: '22:30', activity: 'Target bedtime', domain: 'routine', icon: 'moon' });

    return timeline;
}

/**
 * Calculate overall life score (0-100)
 */
function calculateLifeScore(context) {
    const { healthLog, looksLog, routineLog, todayFoodLog, todayWorkoutDone } = context;

    let score = 0;
    let factors = 0;

    // Health (30%)
    if (healthLog) {
        score += calculateHealthScore(healthLog) * 0.3;
        factors += 0.3;
    }

    // Looks (15%)
    if (looksLog) {
        score += calculateLooksScore(looksLog) * 0.15;
        factors += 0.15;
    }

    // Routine (25%)
    if (routineLog) {
        score += calculateDisciplineScore(routineLog) * 0.25;
        factors += 0.25;
    }

    // Food (15%) - simplified
    if (todayFoodLog) {
        const foodScore = todayFoodLog.calories > 0 ? 80 : 0;
        score += foodScore * 0.15;
        factors += 0.15;
    }

    // Workout (15%)
    if (todayWorkoutDone !== undefined) {
        score += (todayWorkoutDone ? 100 : 0) * 0.15;
        factors += 0.15;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
}

/**
 * Get explanation for a specific recommendation
 */
function explainRecommendation(recommendationId, context) {
    const rule = CROSS_DOMAIN_RULES.find(r => r.id === recommendationId);
    if (!rule) return null;

    if (typeof rule.explanation === 'string') {
        return fromTemplate(rule.explanation, context);
    }
    return createDecisionExplanation(rule.explanation);
}

module.exports = {
    PRIORITY_ORDER,
    CROSS_DOMAIN_RULES,
    generateUnifiedDailyPlan,
    applyCrossDomainRules,
    resolveConflicts,
    generateDailyTimeline,
    calculateLifeScore,
    explainRecommendation
};
