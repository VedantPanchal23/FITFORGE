/**
 * Habit Tracking Service
 * Manages habit streaks and achievements
 */

/**
 * Default habits to track
 */
const DEFAULT_HABITS = [
    { id: 'water_8', name: '8 Glasses Water', check: (log) => log.water_liters >= 2 },
    { id: 'protein_target', name: 'Hit Protein Target', check: (log) => log.protein_completion_percent >= 90 },
    { id: 'workout', name: 'Workout Done', check: (log) => log.workout_done === 1 },
    { id: 'sleep_7h', name: '7+ Hours Sleep', check: (log) => log.sleep_hours >= 7 },
    { id: 'skincare', name: 'Skincare Routine', check: (log) => log.skincare_am_done === 1 && log.skincare_pm_done === 1 },
    { id: 'no_junk', name: 'No Junk Food', check: (log) => !log.notes?.toLowerCase().includes('junk') },
    { id: 'mewing_5min', name: '5+ Min Mewing', check: (log) => log.mewing_mins >= 5 }
];

/**
 * Create default habit streaks
 */
function createDefaultStreaks() {
    return DEFAULT_HABITS.map(habit => ({
        habit_name: habit.id,
        current_streak: 0,
        longest_streak: 0,
        last_completed_date: null,
        total_completions: 0
    }));
}

/**
 * Update habit streak for a day
 */
function updateStreak(currentStreak, log, habitCheck, logDate) {
    const completed = habitCheck(log);
    const lastDate = currentStreak.last_completed_date;

    if (completed) {
        // Check if consecutive (yesterday or same day)
        const yesterday = new Date(logDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const isConsecutive = lastDate === yesterdayStr || lastDate === logDate;

        const newStreak = {
            ...currentStreak,
            current_streak: isConsecutive ? currentStreak.current_streak + 1 : 1,
            last_completed_date: logDate,
            total_completions: currentStreak.total_completions + (lastDate !== logDate ? 1 : 0)
        };

        newStreak.longest_streak = Math.max(newStreak.longest_streak, newStreak.current_streak);

        return newStreak;
    } else {
        // Streak broken
        return {
            ...currentStreak,
            current_streak: 0
        };
    }
}

/**
 * Process all habits for a daily log
 */
function processHabitsForDay(streaks, log, logDate) {
    return streaks.map(streak => {
        const habitDef = DEFAULT_HABITS.find(h => h.id === streak.habit_name);
        if (!habitDef) return streak;

        return updateStreak(streak, log, habitDef.check, logDate);
    });
}

/**
 * Get streak summary for display
 */
function getStreakSummary(streaks) {
    const active = streaks.filter(s => s.current_streak > 0);
    const best = [...streaks].sort((a, b) => b.longest_streak - a.longest_streak)[0];

    return {
        totalActiveStreaks: active.length,
        activeStreaks: active.map(s => ({
            habit: s.habit_name,
            days: s.current_streak,
            isPersonalBest: s.current_streak === s.longest_streak && s.current_streak > 1
        })),
        longestEver: best ? { habit: best.habit_name, days: best.longest_streak } : null,
        encouragement: generateEncouragement(active, streaks)
    };
}

/**
 * Generate encouraging message
 */
function generateEncouragement(active, all) {
    if (active.length === 0) {
        return "Let's start fresh today! Every journey begins with a single step.";
    }

    const longestActive = [...active].sort((a, b) => b.current_streak - a.current_streak)[0];

    if (longestActive.current_streak >= 30) {
        return `Incredible! ${longestActive.current_streak} days on ${longestActive.habit_name}! You've built a real habit.`;
    }
    if (longestActive.current_streak >= 21) {
        return `${longestActive.current_streak} days! They say 21 days makes a habit. You're there!`;
    }
    if (longestActive.current_streak >= 7) {
        return `One full week of ${longestActive.habit_name}! Keep building momentum.`;
    }
    if (longestActive.current_streak >= 3) {
        return `${longestActive.current_streak} days in a row! You're on a roll.`;
    }

    return `${active.length} active streak${active.length > 1 ? 's' : ''}. Every day counts!`;
}

/**
 * Check for achievements/milestones
 */
function checkAchievements(streaks) {
    const achievements = [];

    for (const streak of streaks) {
        const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365];

        for (const milestone of milestones) {
            if (streak.current_streak === milestone) {
                achievements.push({
                    habit: streak.habit_name,
                    milestone,
                    message: getMilestoneMessage(streak.habit_name, milestone)
                });
            }
        }
    }

    return achievements;
}

/**
 * Get milestone-specific message
 */
function getMilestoneMessage(habit, days) {
    const messages = {
        3: `3 days of ${habit}! Great start!`,
        7: `1 week streak! ${habit} is becoming routine.`,
        14: `2 weeks! ${habit} is sticking.`,
        21: `21 days! ${habit} is now a habit!`,
        30: `1 MONTH! ${habit} mastery unlocked!`,
        60: `2 months of ${habit}! Incredible dedication!`,
        90: `90 days! ${habit} is part of who you are now.`,
        180: `Half a year of ${habit}! Legendary!`,
        365: `365 DAYS! One full year of ${habit}! 🏆`
    };

    return messages[days] || `${days} days of ${habit}!`;
}

/**
 * Get habits list with definitions
 */
function getHabitDefinitions() {
    return DEFAULT_HABITS.map(h => ({
        id: h.id,
        name: h.name
    }));
}

module.exports = {
    DEFAULT_HABITS,
    createDefaultStreaks,
    updateStreak,
    processHabitsForDay,
    getStreakSummary,
    checkAchievements,
    getHabitDefinitions
};
