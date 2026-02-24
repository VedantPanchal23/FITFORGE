/**
 * Adaptation Engine
 * Analyzes daily logs and adjusts plans based on feedback
 */

const { ADAPTATION_TRIGGERS, ADJUSTMENT_LIMITS, ADAPTATION_PRIORITIES } = require('../utils/constants');
const { analyzeRecoveryStatus } = require('../models/DailyLog');

/**
 * Analyze recent logs for patterns
 */
function analyzeLogPatterns(logs, days = 7) {
    if (!logs || logs.length === 0) return null;

    const recentLogs = logs.slice(0, days);

    return {
        avgFoodCompliance: average(recentLogs.map(l => l.food_compliance_percent).filter(Boolean)),
        avgProteinCompliance: average(recentLogs.map(l => l.protein_completion_percent).filter(Boolean)),
        avgEnergy: average(recentLogs.map(l => l.energy_level).filter(Boolean)),
        avgSleep: average(recentLogs.map(l => l.sleep_hours).filter(Boolean)),
        avgMood: average(recentLogs.map(l => l.mood).filter(Boolean)),
        avgStress: average(recentLogs.map(l => l.stress_level).filter(Boolean)),
        workoutCompletionRate: recentLogs.filter(l => l.workout_done).length / recentLogs.length,
        consecutiveSkips: countConsecutive(recentLogs, l => !l.workout_done),
        weights: recentLogs.map(l => l.weight_kg).filter(Boolean),
        recoveryStatuses: recentLogs.map(l => analyzeRecoveryStatus(l))
    };
}

/**
 * Detect weight stall
 */
function detectWeightStall(weights, goalType) {
    if (weights.length < 3) return { stalled: false };

    const first = weights[weights.length - 1];
    const last = weights[0];
    const change = last - first;
    const absChange = Math.abs(change);

    const threshold = ADAPTATION_TRIGGERS.weightStallThreshold;

    if (absChange < threshold) {
        return {
            stalled: true,
            direction: goalType === 'fat_loss' ? 'need_more_deficit' :
                goalType === 'muscle_gain' ? 'need_more_surplus' : 'stable',
            change: change
        };
    }

    // Check if change is in wrong direction
    if (goalType === 'fat_loss' && change > 0) {
        return { stalled: false, issue: 'gaining_on_cut', change };
    }
    if (goalType === 'muscle_gain' && change < -0.3) {
        return { stalled: false, issue: 'losing_on_bulk', change };
    }

    return { stalled: false, change };
}

/**
 * Detect fatigue pattern
 */
function detectFatiguePattern(patterns) {
    if (!patterns) return { fatigued: false };

    const issues = [];

    if (patterns.avgEnergy < ADAPTATION_TRIGGERS.lowEnergyThreshold) {
        issues.push('low_energy');
    }

    if (patterns.avgSleep < 6) {
        issues.push('sleep_debt');
    }

    const poorRecoveryCount = patterns.recoveryStatuses.filter(r => r.status === 'poor').length;
    if (poorRecoveryCount >= 3) {
        issues.push('poor_recovery');
    }

    return {
        fatigued: issues.length > 0,
        issues,
        severity: issues.length >= 2 ? 'high' : 'moderate'
    };
}

/**
 * Detect compliance issues
 */
function detectComplianceIssues(patterns) {
    const issues = [];

    if (patterns.avgProteinCompliance < ADAPTATION_TRIGGERS.lowProteinCompliance) {
        issues.push({
            type: 'low_protein',
            value: patterns.avgProteinCompliance,
            action: 'redistribute_protein'
        });
    }

    if (patterns.avgFoodCompliance < 70) {
        issues.push({
            type: 'low_food_compliance',
            value: patterns.avgFoodCompliance,
            action: 'simplify_meals'
        });
    }

    if (patterns.consecutiveSkips >= ADAPTATION_TRIGGERS.lowWorkoutCompliance) {
        issues.push({
            type: 'workout_skips',
            value: patterns.consecutiveSkips,
            action: 'reduce_workout_difficulty'
        });
    }

    return issues;
}

/**
 * Generate adjustments based on analysis
 */
function generateAdjustments(profile, patterns, goalType) {
    const adjustments = [];

    // Check weight stall
    const weightStatus = detectWeightStall(patterns.weights, goalType);
    if (weightStatus.stalled) {
        if (goalType === 'fat_loss') {
            adjustments.push({
                type: 'calories',
                change: -ADJUSTMENT_LIMITS.caloriesPerDay,
                reason: 'No weight change detected. Small calorie reduction.',
                priority: ADAPTATION_PRIORITIES.aesthetics
            });
        } else if (goalType === 'muscle_gain') {
            adjustments.push({
                type: 'calories',
                change: ADJUSTMENT_LIMITS.caloriesPerDay,
                reason: 'No weight change detected. Small calorie increase.',
                priority: ADAPTATION_PRIORITIES.aesthetics
            });
        }
    }

    // Check fatigue
    const fatigueStatus = detectFatiguePattern(patterns);
    if (fatigueStatus.fatigued) {
        if (fatigueStatus.severity === 'high') {
            adjustments.push({
                type: 'workout_volume',
                change: -0.2, // -20%
                reason: 'High fatigue detected. Reducing workout volume.',
                priority: ADAPTATION_PRIORITIES.recovery
            });
            adjustments.push({
                type: 'rest_day',
                change: 1,
                reason: 'Adding extra rest day for recovery.',
                priority: ADAPTATION_PRIORITIES.recovery
            });
        }

        if (fatigueStatus.issues.includes('sleep_debt')) {
            adjustments.push({
                type: 'lifestyle',
                change: 'sleep_priority',
                reason: 'Sleep debt detected. Prioritizing sleep recommendations.',
                priority: ADAPTATION_PRIORITIES.health
            });
        }
    }

    // Check compliance
    const complianceIssues = detectComplianceIssues(patterns);
    for (const issue of complianceIssues) {
        if (issue.type === 'low_protein') {
            adjustments.push({
                type: 'meal_plan',
                change: 'add_protein_snacks',
                reason: `Protein compliance at ${issue.value.toFixed(0)}%. Adding protein-rich snacks.`,
                priority: ADAPTATION_PRIORITIES.performance
            });
        }

        if (issue.type === 'workout_skips') {
            adjustments.push({
                type: 'workout_difficulty',
                change: 'reduce',
                reason: `${issue.value} consecutive workout skips. Reducing difficulty.`,
                priority: ADAPTATION_PRIORITIES.performance
            });
        }
    }

    // Sort by priority (higher = more important)
    adjustments.sort((a, b) => b.priority - a.priority);

    return adjustments;
}

/**
 * Apply calorie adjustment safely
 */
function applyCalorieAdjustment(currentCalories, adjustment, gender) {
    const { validateCalorieSafety } = require('../validators/SafetyValidator');

    const newCalories = currentCalories + adjustment;
    const check = validateCalorieSafety(newCalories, gender, currentCalories + 500);

    return {
        newCalories: check.adjustedCalories,
        applied: adjustment,
        capped: check.adjustedCalories !== newCalories,
        warnings: check.warnings
    };
}

/**
 * Generate adaptation report
 */
function generateAdaptationReport(profile, logs) {
    const patterns = analyzeLogPatterns(logs);

    if (!patterns) {
        return {
            hasData: false,
            message: 'Not enough data for adaptation. Log at least 3 days.'
        };
    }

    const adjustments = generateAdjustments(profile, patterns, profile.goal_type);

    return {
        hasData: true,
        analysisDate: new Date().toISOString().split('T')[0],
        patterns: {
            avgEnergy: patterns.avgEnergy?.toFixed(1),
            avgSleep: patterns.avgSleep?.toFixed(1),
            avgFoodCompliance: patterns.avgFoodCompliance?.toFixed(0),
            avgProteinCompliance: patterns.avgProteinCompliance?.toFixed(0),
            workoutCompletionRate: (patterns.workoutCompletionRate * 100).toFixed(0),
            weightTrend: patterns.weights.length >= 2
                ? (patterns.weights[0] - patterns.weights[patterns.weights.length - 1]).toFixed(2)
                : null
        },
        adjustments,
        summary: adjustments.length > 0
            ? `${adjustments.length} adjustment(s) recommended based on your feedback.`
            : 'Current plan is working well. No changes needed.'
    };
}

// Utility functions
function average(arr) {
    if (!arr || arr.length === 0) return null;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function countConsecutive(arr, condition) {
    let count = 0;
    for (const item of arr) {
        if (condition(item)) count++;
        else break;
    }
    return count;
}

/**
 * Adapt plan when user skips a workout
 * @param {object} profile - user profile
 * @param {object} missedWorkout - the workout that was skipped
 * @param {array} remainingWeekPlan - remaining workouts this week
 * @returns {object} adaptation strategy
 */
function adaptForMissedWorkout(profile, missedWorkout, remainingWeekPlan = []) {
    const adaptations = [];

    // Strategy 1: Quick alternative for today
    adaptations.push({
        type: 'alternative_today',
        description: 'Quick alternative for today',
        priority: 1,
        options: [
            { name: '15-min HIIT', duration: 15, intensity: 'high', description: 'Quick high-intensity session' },
            { name: 'Mobility routine', duration: 20, intensity: 'low', description: 'Joint health and recovery' },
            { name: '10-min core', duration: 10, intensity: 'moderate', description: 'Quick core workout' },
            { name: 'Light walk', duration: 20, intensity: 'low', description: '20 min brisk walk' }
        ]
    });

    // Strategy 2: Reduce intensity of next workout to prevent overload
    adaptations.push({
        type: 'reduce_volume',
        description: 'Reduced sets for next workout since you missed today',
        priority: 2,
        details: {
            setReduction: 1, // Remove 1 set per exercise
            reason: 'Prevent overload after rest'
        }
    });

    // Strategy 3: Reschedule to later in week if possible
    const openSlot = findOpenSlotInWeek(remainingWeekPlan);
    if (openSlot) {
        adaptations.push({
            type: 'reschedule',
            description: 'Move this workout to later in the week',
            priority: 3,
            details: {
                suggestedDay: openSlot.dayName,
                suggestedDate: openSlot.date,
                originalWorkout: missedWorkout?.workout_type || 'workout'
            }
        });
    }

    // Strategy 4: Combine with another workout (if appropriate)
    if (canCombineWorkouts(missedWorkout, remainingWeekPlan)) {
        adaptations.push({
            type: 'combine',
            description: 'Combine with another workout later this week',
            priority: 4,
            details: {
                message: 'Add key exercises from missed workout to a later session'
            }
        });
    }

    return {
        message: 'No worries! Here\'s how we adapt:',
        adaptations: adaptations.sort((a, b) => a.priority - b.priority),
        encouragement: getEncouragementMessage(profile),
        missedWorkoutInfo: {
            type: missedWorkout?.workout_type,
            muscles: missedWorkout?.muscle_groups || []
        }
    };
}

/**
 * Adjust next day workout based on context
 * @param {object} tomorrowPlan - tomorrow's workout plan
 * @param {string} reason - why adjustment is needed
 * @returns {object} adjusted workout plan
 */
function adjustNextDayWorkout(tomorrowPlan, reason) {
    if (!tomorrowPlan || !tomorrowPlan.workout) {
        return tomorrowPlan;
    }

    const adjusted = { ...tomorrowPlan };

    switch (reason) {
        case 'missed_previous':
            // Lighter session after missing a day
            if (adjusted.workout.exercises) {
                adjusted.workout.exercises = adjusted.workout.exercises.map(ex => ({
                    ...ex,
                    sets: Math.max(2, (ex.sets || 3) - 1)
                }));
            }
            if (adjusted.phases) {
                adjusted.phases = adjusted.phases.map(phase => ({
                    ...phase,
                    exercises: phase.exercises?.map(ex => ({
                        ...ex,
                        sets: ex.sets ? Math.max(2, ex.sets - 1) : ex.sets
                    }))
                }));
            }
            adjusted.note = 'Volume reduced since you missed yesterday. Focus on form.';
            adjusted.adjusted = true;
            adjusted.adjustmentReason = 'missed_previous';
            break;

        case 'low_energy':
            // Even lighter - focus on movement quality
            if (adjusted.workout.exercises) {
                adjusted.workout.exercises = adjusted.workout.exercises.map(ex => ({
                    ...ex,
                    sets: Math.max(2, (ex.sets || 3) - 1)
                })).slice(0, 4); // Fewer exercises
            }
            adjusted.note = 'Light session today - listen to your body.';
            adjusted.adjusted = true;
            adjusted.adjustmentReason = 'low_energy';
            break;

        case 'poor_recovery':
            // Convert to mobility/active recovery
            adjusted.workout_type = 'recovery';
            adjusted.note = 'Switched to recovery session based on your feedback.';
            adjusted.adjusted = true;
            adjusted.adjustmentReason = 'poor_recovery';
            break;

        default:
            break;
    }

    return adjusted;
}

/**
 * Handle streak break gracefully
 * @param {object} profile - user profile
 * @param {number} streakDays - days of streak before break
 * @returns {object} recovery plan
 */
function handleStreakBreak(profile, streakDays) {
    const response = {
        acknowledgement: '',
        recoveryPlan: [],
        mindset: ''
    };

    if (streakDays >= 14) {
        response.acknowledgement = `You had an amazing ${streakDays}-day streak! One break doesn't erase that progress.`;
        response.mindset = 'Long streaks show commitment. A single break is just a pause, not a stop.';
    } else if (streakDays >= 7) {
        response.acknowledgement = `Great ${streakDays}-day streak! Everyone needs a break sometimes.`;
        response.mindset = 'A week of consistency is great. Let\'s get back on track.';
    } else {
        response.acknowledgement = 'Building habits takes time. Let\'s keep going.';
        response.mindset = 'Focus on the next workout, not the missed one.';
    }

    response.recoveryPlan = [
        {
            day: 'Today',
            action: 'Rest or light activity (20 min walk)',
            priority: 'optional'
        },
        {
            day: 'Tomorrow',
            action: 'Resume regular workout (slightly reduced volume)',
            priority: 'recommended'
        },
        {
            day: 'Day 3',
            action: 'Back to normal intensity',
            priority: 'normal'
        }
    ];

    return response;
}

// Helper functions for missed workout adaptation
function findOpenSlotInWeek(remainingWeekPlan) {
    if (!remainingWeekPlan || remainingWeekPlan.length === 0) return null;

    const restDays = remainingWeekPlan.filter(day =>
        day.is_rest_day || day.workout_type === 'rest'
    );

    if (restDays.length > 0) {
        const slot = restDays[0];
        return {
            dayName: slot.dayName || 'later this week',
            date: slot.plan_date
        };
    }

    return null;
}

function canCombineWorkouts(missedWorkout, remainingPlan) {
    if (!missedWorkout || !remainingPlan || remainingPlan.length === 0) return false;

    // Can combine if there's a full body day or similar muscle group day
    const missedMuscles = missedWorkout?.muscle_groups || [];

    return remainingPlan.some(day => {
        if (day.is_rest_day) return false;
        const dayMuscles = day.muscle_groups || [];

        // Check for overlap or full body
        return day.workout_type === 'full_body' ||
            missedMuscles.some(m => dayMuscles.includes(m));
    });
}

function getEncouragementMessage(profile) {
    const messages = [
        'One missed workout won\'t affect your progress. Consistency over perfection!',
        'Rest is part of the process. Your body adapts during recovery.',
        'Even top athletes take unplanned rest days. Keep moving forward!',
        'Missing one workout is nothing in the long run. Focus on the next one.',
        'Progress isn\'t linear. What matters is you\'re here and ready to continue.'
    ];

    return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = {
    analyzeLogPatterns,
    detectWeightStall,
    detectFatiguePattern,
    detectComplianceIssues,
    generateAdjustments,
    applyCalorieAdjustment,
    generateAdaptationReport,
    adaptForMissedWorkout,
    adjustNextDayWorkout,
    handleStreakBreak
};

