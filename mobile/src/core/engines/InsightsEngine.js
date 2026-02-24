/**
 * InsightsEngine
 * Rule-based pattern detection (no AI) to generate actionable insights
 */

// ============================================================================
// INSIGHT RULES
// ============================================================================
const INSIGHT_RULES = [
    // Sleep patterns
    {
        id: 'sleep_workout_correlation',
        name: 'Sleep on Workout Days',
        analyze: (logs) => {
            if (!logs.healthLogs || logs.healthLogs.length < 7) return null;

            const workoutDays = logs.healthLogs.filter(h => {
                const dailyLog = logs.dailyLogs?.find(d => d.date === h.date);
                return dailyLog?.workout_done;
            });

            const restDays = logs.healthLogs.filter(h => {
                const dailyLog = logs.dailyLogs?.find(d => d.date === h.date);
                return !dailyLog?.workout_done;
            });

            if (workoutDays.length < 2 || restDays.length < 2) return null;

            const avgWorkoutSleep = average(workoutDays.map(d => d.sleep_hours).filter(Boolean));
            const avgRestSleep = average(restDays.map(d => d.sleep_hours).filter(Boolean));

            if (avgWorkoutSleep > avgRestSleep + 0.5) {
                return {
                    insight: 'You sleep better on workout days',
                    data: { workoutDaySleep: avgWorkoutSleep.toFixed(1), restDaySleep: avgRestSleep.toFixed(1) },
                    type: 'positive',
                    domain: 'health'
                };
            } else if (avgRestSleep > avgWorkoutSleep + 0.5) {
                return {
                    insight: 'You sleep better on rest days - consider evening workout timing',
                    data: { workoutDaySleep: avgWorkoutSleep.toFixed(1), restDaySleep: avgRestSleep.toFixed(1) },
                    type: 'actionable',
                    domain: 'health'
                };
            }
            return null;
        }
    },

    // Skincare consistency
    {
        id: 'skincare_consistency',
        name: 'Skincare Streak',
        analyze: (logs) => {
            if (!logs.looksLogs || logs.looksLogs.length < 7) return null;

            const last7 = logs.looksLogs.slice(0, 7);
            const completeDays = last7.filter(l => l.morning_routine_done && l.evening_routine_done).length;

            const prev7 = logs.looksLogs.slice(7, 14);
            const prevCompleteDays = prev7.filter(l => l.morning_routine_done && l.evening_routine_done).length;

            if (completeDays > prevCompleteDays) {
                const improvement = Math.round(((completeDays - prevCompleteDays) / Math.max(1, prevCompleteDays)) * 100);
                return {
                    insight: `Skincare consistency improved ${improvement > 100 ? 'significantly' : improvement + '%'} this week`,
                    data: { thisWeek: completeDays, lastWeek: prevCompleteDays },
                    type: 'positive',
                    domain: 'looks'
                };
            } else if (completeDays < 3) {
                return {
                    insight: 'Skincare routine only completed ' + completeDays + '/7 days - consistency is key',
                    data: { completeDays },
                    type: 'warning',
                    domain: 'looks'
                };
            }
            return null;
        }
    },

    // Protein target
    {
        id: 'protein_target_streak',
        name: 'Protein Target',
        analyze: (logs) => {
            if (!logs.dailyLogs || logs.dailyLogs.length < 7 || !logs.profile?.protein_target) return null;

            const last7 = logs.dailyLogs.slice(0, 7);
            const missedDays = last7.filter(d => (d.protein || 0) < logs.profile.protein_target * 0.9).length;

            if (missedDays >= 3) {
                return {
                    insight: `Protein target missed ${missedDays} days this week - consider meal prep`,
                    data: { missedDays, target: logs.profile.protein_target },
                    type: 'actionable',
                    domain: 'food'
                };
            } else if (missedDays === 0) {
                return {
                    insight: 'Perfect protein intake this week!',
                    data: { target: logs.profile.protein_target },
                    type: 'positive',
                    domain: 'food'
                };
            }
            return null;
        }
    },

    // Water habit
    {
        id: 'water_habit',
        name: 'Hydration Pattern',
        analyze: (logs) => {
            if (!logs.healthLogs || logs.healthLogs.length < 7) return null;

            const last7 = logs.healthLogs.slice(0, 7);
            const avgWater = average(last7.map(h => h.water_glasses || 0));

            if (avgWater < 5) {
                return {
                    insight: `Average water intake is only ${avgWater.toFixed(1)} glasses/day - aim for 8`,
                    data: { avgWater: avgWater.toFixed(1) },
                    type: 'warning',
                    domain: 'health'
                };
            } else if (avgWater >= 7.5) {
                return {
                    insight: 'Excellent hydration this week!',
                    data: { avgWater: avgWater.toFixed(1) },
                    type: 'positive',
                    domain: 'health'
                };
            }
            return null;
        }
    },

    // Discipline trend
    {
        id: 'discipline_trend',
        name: 'Discipline Score',
        analyze: (logs) => {
            if (!logs.routineLogs || logs.routineLogs.length < 14) return null;

            const thisWeek = logs.routineLogs.slice(0, 7);
            const lastWeek = logs.routineLogs.slice(7, 14);

            const thisWeekAvg = average(thisWeek.map(r => r.discipline_score || 0));
            const lastWeekAvg = average(lastWeek.map(r => r.discipline_score || 0));

            if (thisWeekAvg > lastWeekAvg + 10) {
                return {
                    insight: 'Discipline score up this week! Keep the momentum',
                    data: { thisWeek: Math.round(thisWeekAvg), lastWeek: Math.round(lastWeekAvg) },
                    type: 'positive',
                    domain: 'routine'
                };
            } else if (thisWeekAvg < lastWeekAvg - 10) {
                return {
                    insight: 'Discipline dipped this week - what can you remove from your plate?',
                    data: { thisWeek: Math.round(thisWeekAvg), lastWeek: Math.round(lastWeekAvg) },
                    type: 'actionable',
                    domain: 'routine'
                };
            }
            return null;
        }
    },

    // Stress-sleep correlation
    {
        id: 'stress_sleep_link',
        name: 'Stress Sleep Link',
        analyze: (logs) => {
            if (!logs.healthLogs || logs.healthLogs.length < 7) return null;

            const highStressDays = logs.healthLogs.filter(h => h.stress_level >= 7);
            const lowStressDays = logs.healthLogs.filter(h => h.stress_level !== null && h.stress_level < 5);

            if (highStressDays.length < 2 || lowStressDays.length < 2) return null;

            const highStressSleep = average(highStressDays.map(d => d.sleep_hours).filter(Boolean));
            const lowStressSleep = average(lowStressDays.map(d => d.sleep_hours).filter(Boolean));

            if (lowStressSleep > highStressSleep + 1) {
                return {
                    insight: 'You get 1+ hour more sleep on low-stress days - stress management impacts recovery',
                    data: { highStressSleep: highStressSleep.toFixed(1), lowStressSleep: lowStressSleep.toFixed(1) },
                    type: 'actionable',
                    domain: 'health'
                };
            }
            return null;
        }
    },

    // Workout consistency
    {
        id: 'workout_consistency',
        name: 'Workout Streak',
        analyze: (logs) => {
            if (!logs.dailyLogs || logs.dailyLogs.length < 7) return null;

            let streak = 0;
            for (const log of logs.dailyLogs) {
                if (log.workout_done) streak++;
                else break;
            }

            if (streak >= 5) {
                return {
                    insight: `${streak}-day workout streak! You're building momentum`,
                    data: { streak },
                    type: 'positive',
                    domain: 'body'
                };
            }
            return null;
        }
    }
];

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Generate insights from all available logs
 */
function generateInsights(logs) {
    const insights = [];

    for (const rule of INSIGHT_RULES) {
        try {
            const insight = rule.analyze(logs);
            if (insight) {
                insights.push({
                    id: rule.id,
                    ...insight
                });
            }
        } catch (e) {
            // Rule failed, skip
        }
    }

    // Sort: positive first, then actionable, then warnings
    const typeOrder = { positive: 1, actionable: 2, warning: 3 };
    insights.sort((a, b) => (typeOrder[a.type] || 4) - (typeOrder[b.type] || 4));

    return insights;
}

/**
 * Get insights for a specific domain
 */
function getInsightsByDomain(logs, domain) {
    return generateInsights(logs).filter(i => i.domain === domain);
}

/**
 * Get top N insights
 */
function getTopInsights(logs, count = 3) {
    return generateInsights(logs).slice(0, count);
}

// Helper
function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

module.exports = {
    INSIGHT_RULES,
    generateInsights,
    getInsightsByDomain,
    getTopInsights
};
