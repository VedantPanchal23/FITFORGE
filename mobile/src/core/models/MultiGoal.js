/**
 * MultiGoal Model
 * Supports multiple simultaneous goals across different domains
 */

const DOMAINS = ['body', 'food', 'looks', 'health', 'routine'];

const GOAL_TYPES = {
    body: ['weight_gain', 'weight_loss', 'muscle_gain', 'fat_loss', 'height_optimization', 'posture', 'strength'],
    food: ['calorie_target', 'protein_target', 'budget_meals', 'clean_eating'],
    looks: ['clear_skin', 'hair_health', 'grooming_consistency'],
    health: ['sleep_target', 'hydration', 'stress_reduction', 'mental_wellness'],
    routine: ['morning_routine', 'discipline_streak', 'focus_hours', 'no_junk_streak']
};

const createGoal = (data = {}) => {
    return {
        id: data.id || `goal_${Date.now()}`,
        domain: data.domain || 'body',
        type: data.type || 'weight_gain',

        // Target
        target: data.target || null, // e.g., 8 (kg), 30 (days)
        unit: data.unit || null, // 'kg', 'days', 'hours', etc.

        // Timeline
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        deadline: data.deadline || null,

        // Progress
        currentValue: data.currentValue || 0,
        progress: data.progress || 0, // percentage 0-100

        // Status
        status: data.status || 'active', // 'active' | 'completed' | 'paused'

        // Metadata
        notes: data.notes || '',
        createdAt: data.createdAt || new Date().toISOString()
    };
};

const createMultiGoal = (data = {}) => {
    return {
        goals: data.goals || [],
        activeCount: data.goals?.filter(g => g.status === 'active').length || 0
    };
};

const validateGoal = (goal) => {
    const errors = [];

    if (!DOMAINS.includes(goal.domain)) {
        errors.push(`Domain must be one of: ${DOMAINS.join(', ')}`);
    }

    if (!GOAL_TYPES[goal.domain]?.includes(goal.type)) {
        errors.push(`Invalid goal type for domain ${goal.domain}`);
    }

    if (goal.deadline && new Date(goal.deadline) < new Date()) {
        errors.push('Deadline cannot be in the past');
    }

    return { valid: errors.length === 0, errors };
};

// Calculate overall goal progress
const calculateGoalProgress = (goal, currentValue) => {
    if (!goal.target || goal.target === 0) return 0;

    const progress = (currentValue / goal.target) * 100;
    return Math.min(100, Math.round(progress));
};

// Get active goals by domain
const getGoalsByDomain = (multiGoal, domain) => {
    return multiGoal.goals.filter(g => g.domain === domain && g.status === 'active');
};

// Check if any goals need attention (behind schedule)
const getGoalsNeedingAttention = (multiGoal) => {
    const today = new Date();

    return multiGoal.goals.filter(goal => {
        if (goal.status !== 'active' || !goal.deadline) return false;

        const deadline = new Date(goal.deadline);
        const start = new Date(goal.startDate);
        const totalDays = (deadline - start) / (1000 * 60 * 60 * 24);
        const daysElapsed = (today - start) / (1000 * 60 * 60 * 24);

        const expectedProgress = (daysElapsed / totalDays) * 100;

        // Behind by more than 10%
        return goal.progress < expectedProgress - 10;
    });
};

module.exports = {
    DOMAINS,
    GOAL_TYPES,
    createGoal,
    createMultiGoal,
    validateGoal,
    calculateGoalProgress,
    getGoalsByDomain,
    getGoalsNeedingAttention
};
