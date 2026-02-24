/**
 * Data Export Service
 * Backup and export functionality
 */

/**
 * Export all user data to JSON
 */
function exportAllData(db) {
    return {
        exportDate: new Date().toISOString(),
        version: '1.0',
        profile: db.getProfile ? db.getProfile() : null,
        dailyLogs: db.getAllDailyLogs ? db.getAllDailyLogs() : [],
        foodLog: db.getAllFoodLogs ? db.getAllFoodLogs() : [],
        workoutLog: db.getAllWorkoutLogs ? db.getAllWorkoutLogs() : [],
        mealPlans: db.getAllMealPlans ? db.getAllMealPlans() : [],
        workoutPlans: db.getAllWorkoutPlans ? db.getAllWorkoutPlans() : [],
        weightHistory: db.getWeightHistory ? db.getWeightHistory() : [],
        habitStreaks: db.getHabitStreaks ? db.getHabitStreaks() : [],
        progressPhotos: db.getProgressPhotos ? db.getProgressPhotos() : [],
        adaptationHistory: db.getAdaptationHistory ? db.getAdaptationHistory() : []
    };
}

/**
 * Export to JSON string for file save
 */
function exportToJSON(db) {
    const data = exportAllData(db);
    return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON backup
 */
function importFromJSON(jsonString, db) {
    try {
        const data = JSON.parse(jsonString);

        if (!data.version) {
            return { success: false, error: 'Invalid backup file format' };
        }

        const imported = {
            profile: false,
            dailyLogs: 0,
            weightHistory: 0
        };

        // Import profile
        if (data.profile && db.saveProfile) {
            db.saveProfile(data.profile);
            imported.profile = true;
        }

        // Import daily logs
        if (data.dailyLogs && db.saveDailyLog) {
            data.dailyLogs.forEach(log => {
                try {
                    db.saveDailyLog(log);
                    imported.dailyLogs++;
                } catch (e) { /* Skip duplicates */ }
            });
        }

        // Import weight history
        if (data.weightHistory && db.saveWeight) {
            data.weightHistory.forEach(entry => {
                try {
                    db.saveWeight(entry.log_date, entry.weight_kg);
                    imported.weightHistory++;
                } catch (e) { /* Skip duplicates */ }
            });
        }

        return { success: true, imported };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

/**
 * Generate weekly report
 */
function generateWeeklyReport(dailyLogs, weightHistory, targets) {
    if (dailyLogs.length === 0) {
        return { hasData: false };
    }

    const report = {
        hasData: true,
        weekStart: dailyLogs[dailyLogs.length - 1]?.log_date,
        weekEnd: dailyLogs[0]?.log_date,
        daysLogged: dailyLogs.length,

        averages: {
            calories: avg(dailyLogs.map(l => l.actual_calories).filter(Boolean)),
            protein: avg(dailyLogs.map(l => l.actual_protein).filter(Boolean)),
            sleep: avg(dailyLogs.map(l => l.sleep_hours).filter(Boolean)),
            energy: avg(dailyLogs.map(l => l.energy_level).filter(Boolean)),
            compliance: avg(dailyLogs.map(l => l.food_compliance_percent).filter(Boolean))
        },

        workouts: {
            done: dailyLogs.filter(l => l.workout_done === 1).length,
            skipped: dailyLogs.filter(l => l.workout_done === 0).length,
            skipReasons: countSkipReasons(dailyLogs)
        },

        weight: calculateWeightChange(weightHistory),

        highlights: [],
        improvements: []
    };

    // Generate highlights
    if (report.averages.compliance >= 80) {
        report.highlights.push('Great compliance this week!');
    }
    if (report.workouts.done >= 4) {
        report.highlights.push(`${report.workouts.done} workouts completed!`);
    }
    if (report.averages.sleep >= 7) {
        report.highlights.push('Good sleep consistency');
    }

    // Generate improvements
    if (report.averages.protein && targets.protein) {
        const proteinPercent = (report.averages.protein / targets.protein) * 100;
        if (proteinPercent < 80) {
            report.improvements.push('Protein intake needs attention');
        }
    }
    if (report.averages.sleep && report.averages.sleep < 7) {
        report.improvements.push('Try to get more sleep');
    }

    return report;
}

/**
 * Generate monthly summary
 */
function generateMonthlySummary(dailyLogs, weightHistory, startDate, endDate) {
    const weeks = groupByWeek(dailyLogs);

    return {
        period: { start: startDate, end: endDate },
        totalDaysLogged: dailyLogs.length,
        weeklyTrends: weeks.map(week => ({
            weekNumber: week.weekNum,
            avgCompliance: avg(week.logs.map(l => l.food_compliance_percent).filter(Boolean)),
            workouts: week.logs.filter(l => l.workout_done).length
        })),
        overallProgress: {
            weightChange: calculateWeightChange(weightHistory),
            avgCompliance: avg(dailyLogs.map(l => l.food_compliance_percent).filter(Boolean)),
            totalWorkouts: dailyLogs.filter(l => l.workout_done).length
        }
    };
}

// Utility functions
function avg(arr) {
    if (!arr || arr.length === 0) return null;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10;
}

function countSkipReasons(logs) {
    const reasons = {};
    logs.filter(l => l.workout_skipped_reason).forEach(l => {
        reasons[l.workout_skipped_reason] = (reasons[l.workout_skipped_reason] || 0) + 1;
    });
    return reasons;
}

function calculateWeightChange(history) {
    if (!history || history.length < 2) return null;
    const start = history[history.length - 1].weight_kg;
    const end = history[0].weight_kg;
    return Math.round((end - start) * 10) / 10;
}

function groupByWeek(logs) {
    // Group logs by ISO week
    const weeks = {};
    logs.forEach(log => {
        const date = new Date(log.log_date);
        const weekNum = getISOWeek(date);
        if (!weeks[weekNum]) weeks[weekNum] = { weekNum, logs: [] };
        weeks[weekNum].logs.push(log);
    });
    return Object.values(weeks);
}

function getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

module.exports = {
    exportAllData,
    exportToJSON,
    importFromJSON,
    generateWeeklyReport,
    generateMonthlySummary
};
