/**
 * Plateau Detection Engine
 * Detects weight plateaus and generates intervention strategies
 */

const { PLATEAU_THRESHOLDS, REFEED_PROTOCOLS, COMPLIANCE_THRESHOLDS } = require('../utils/constants');

/**
 * Detect if user is in a weight plateau
 */
function detectPlateau(weightHistory, goalType) {
    if (!weightHistory || weightHistory.length < PLATEAU_THRESHOLDS.daysToDetect) {
        return { inPlateau: false, reason: 'insufficient_data' };
    }

    const recentWeights = weightHistory.slice(0, PLATEAU_THRESHOLDS.daysToDetect);
    const avgRecent = average(recentWeights.map(w => w.weight_kg));
    const oldestRecent = recentWeights[recentWeights.length - 1].weight_kg;
    const newestRecent = recentWeights[0].weight_kg;

    const change = Math.abs(newestRecent - oldestRecent);
    const threshold = 0.3; // Less than 0.3kg change in 14 days = plateau

    if (change < threshold) {
        const daysSinceChange = PLATEAU_THRESHOLDS.daysToDetect;

        return {
            inPlateau: true,
            days: daysSinceChange,
            severity: getSeverity(daysSinceChange),
            avgWeight: Math.round(avgRecent * 10) / 10,
            action: getPlateauAction(daysSinceChange, goalType)
        };
    }

    return { inPlateau: false };
}

/**
 * Get plateau severity level
 */
function getSeverity(days) {
    if (days >= PLATEAU_THRESHOLDS.refeedTrigger) return 'severe';
    if (days >= PLATEAU_THRESHOLDS.actionRequired) return 'moderate';
    return 'mild';
}

/**
 * Get recommended action for plateau
 */
function getPlateauAction(days, goalType) {
    if (days < PLATEAU_THRESHOLDS.daysToDetect) {
        return { type: 'wait', message: 'Too early to determine. Continue as planned.' };
    }

    if (days < PLATEAU_THRESHOLDS.actionRequired) {
        return {
            type: 'minor_adjustment',
            message: 'Potential plateau detected. Consider these options:',
            options: [
                'Increase daily steps by 2000',
                'Reduce calories by 100 for 1 week',
                'Add one extra workout session'
            ]
        };
    }

    if (days < PLATEAU_THRESHOLDS.refeedTrigger) {
        if (goalType === 'fat_loss') {
            return {
                type: 'refeed',
                message: 'Plateau confirmed. Time for a refeed day.',
                protocol: REFEED_PROTOCOLS.refeed_day,
                alternative: 'Or reduce deficit by 200 calories'
            };
        }
        return {
            type: 'calorie_increase',
            message: 'Weight not moving. Increase calories by 150-200.',
            notes: 'Track for 2 more weeks before next adjustment'
        };
    }

    // Severe plateau
    return {
        type: 'diet_break',
        message: 'Extended plateau. Consider a diet break.',
        protocol: REFEED_PROTOCOLS.diet_break,
        explanation: 'A week at maintenance calories can reset metabolic adaptations'
    };
}

/**
 * Generate refeed day plan
 */
function generateRefeedDayPlan(profile) {
    const maintenanceCalories = profile.tdee;
    const refeedCalories = maintenanceCalories; // Back to maintenance

    // High carb focus during refeed
    const protein = profile.protein_grams; // Keep protein same
    const fats = Math.round(profile.weight_kg * 0.6); // Reduce fats to ~0.6g/kg
    const carbCalories = refeedCalories - (protein * 4) - (fats * 9);
    const carbs = Math.round(carbCalories / 4);

    return {
        date: 'next_scheduled',
        isRefeedDay: true,
        calories: refeedCalories,
        macros: {
            protein,
            carbs, // Higher than normal
            fats   // Lower than normal
        },
        notes: [
            'Eat at maintenance calories today',
            'Focus on complex carbs: rice, oats, potatoes, fruit',
            'Keep protein the same',
            'Reduce fats slightly to make room for carbs',
            'This is NOT a cheat day - stick to healthy foods'
        ],
        expectedBenefits: [
            'Leptin hormone boost',
            'Glycogen replenishment',
            'Mental break from deficit',
            'Temporary weight increase from water (normal!)'
        ]
    };
}

/**
 * Generate diet break plan
 */
function generateDietBreakPlan(profile) {
    return {
        duration: REFEED_PROTOCOLS.diet_break.duration_days,
        calories: profile.tdee,
        macros: {
            protein: profile.protein_grams,
            carbs: Math.round((profile.tdee * 0.4) / 4),
            fats: Math.round((profile.tdee * 0.3) / 9)
        },
        workout: 'Maintain current intensity but can reduce volume by 20%',
        notes: [
            'Full week at maintenance calories',
            'NOT a free-for-all - stick to healthy foods',
            'Expect 1-2kg water weight gain (temporary)',
            'After diet break, return to previous deficit',
            'Studies show this improves long-term adherence'
        ],
        schedule: {
            day1: 'Increase to maintenance',
            days2_6: 'Maintain consistent intake',
            day7: 'Transition day - slight reduction',
            nextWeek: 'Return to deficit'
        }
    };
}

/**
 * Calculate 7-day moving average weight
 */
function calculateMovingAverage(weightHistory, days = 7) {
    if (!weightHistory || weightHistory.length < days) {
        return null;
    }

    const recentWeights = weightHistory.slice(0, days).map(w => w.weight_kg);
    return Math.round(average(recentWeights) * 10) / 10;
}

/**
 * Get weight trend analysis
 */
function analyzeWeightTrend(weightHistory, goalType) {
    if (!weightHistory || weightHistory.length < 7) {
        return { trend: 'unknown', message: 'Need more data' };
    }

    const avg7day = calculateMovingAverage(weightHistory, 7);
    const avg14day = weightHistory.length >= 14
        ? calculateMovingAverage(weightHistory.slice(7), 7)
        : null;

    if (!avg14day) {
        return { trend: 'unknown', avgWeight: avg7day, message: 'Need 2 weeks of data for trend' };
    }

    const change = avg7day - avg14day;
    const weeklyChange = change; // Already representing ~1 week

    let trend, status;

    if (goalType === 'fat_loss') {
        if (weeklyChange < -0.3) {
            trend = 'good';
            status = 'Losing weight as expected';
        } else if (weeklyChange < 0) {
            trend = 'slow';
            status = 'Losing slowly - may need adjustment';
        } else if (weeklyChange < 0.3) {
            trend = 'stalled';
            status = 'Weight stable - potential plateau';
        } else {
            trend = 'gaining';
            status = 'Weight increasing - review intake';
        }
    } else if (goalType === 'muscle_gain') {
        if (weeklyChange > 0.3) {
            trend = 'fast';
            status = 'Gaining quickly - some may be fat';
        } else if (weeklyChange > 0) {
            trend = 'good';
            status = 'Gaining at healthy rate';
        } else {
            trend = 'stalled';
            status = 'Not gaining - increase calories';
        }
    } else {
        trend = Math.abs(weeklyChange) < 0.3 ? 'stable' : 'fluctuating';
        status = 'Weight is ' + trend;
    }

    return {
        trend,
        status,
        avg7day,
        avg14day,
        weeklyChange: Math.round(weeklyChange * 10) / 10,
        dailyFluctuation: 'Normal daily weight can vary 1-2kg from water, food, sodium'
    };
}

/**
 * Check if compliance is causing the plateau
 */
function diagnoseCompliance(dailyLogs) {
    if (!dailyLogs || dailyLogs.length < 7) {
        return { diagnosable: false };
    }

    const recentLogs = dailyLogs.slice(0, 7);

    const avgFoodCompliance = average(recentLogs.map(l => l.food_compliance_percent).filter(Boolean));
    const avgProteinCompliance = average(recentLogs.map(l => l.protein_completion_percent).filter(Boolean));
    const workoutsDone = recentLogs.filter(l => l.workout_done).length;

    const issues = [];

    if (avgFoodCompliance && avgFoodCompliance < 70) {
        issues.push({
            type: 'food_tracking',
            severity: 'high',
            message: 'Food compliance is low. The plateau may be from untracked eating.'
        });
    }

    if (avgProteinCompliance && avgProteinCompliance < 80) {
        issues.push({
            type: 'protein',
            severity: 'medium',
            message: 'Protein intake is inconsistent. This can affect muscle retention.'
        });
    }

    if (workoutsDone < 2) {
        issues.push({
            type: 'exercise',
            severity: 'medium',
            message: 'Few workouts this week. Exercise affects metabolism.'
        });
    }

    return {
        diagnosable: true,
        avgFoodCompliance,
        avgProteinCompliance,
        workoutsDone,
        issues,
        plateauLikelyFromCompliance: issues.some(i => i.severity === 'high')
    };
}

// Utility
function average(arr) {
    if (!arr || arr.length === 0) return null;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

module.exports = {
    detectPlateau,
    getSeverity,
    getPlateauAction,
    generateRefeedDayPlan,
    generateDietBreakPlan,
    calculateMovingAverage,
    analyzeWeightTrend,
    diagnoseCompliance
};
