/**
 * UserMode Model
 * Supports different life modes that tune all modules
 */

const MODES = {
    normal: {
        name: 'Normal',
        description: 'Full plans active',
        adjustments: {
            workoutIntensity: 1.0,
            mealComplexity: 'full',
            routineLevel: 'full',
            notificationsEnabled: true
        }
    },
    travel: {
        name: 'Travel',
        description: 'Minimal workouts, flexible meals',
        adjustments: {
            workoutIntensity: 0.5,
            mealComplexity: 'simple',
            routineLevel: 'minimal',
            notificationsEnabled: true,
            skipSkincare: false,
            maintenanceCalories: true
        }
    },
    sick: {
        name: 'Sick',
        description: 'Rest focus, hydration priority',
        adjustments: {
            workoutIntensity: 0,
            mealComplexity: 'simple',
            routineLevel: 'rest',
            notificationsEnabled: false,
            skipWorkout: true,
            skipSkincare: true,
            hydrationPriority: true
        }
    },
    festival: {
        name: 'Festival',
        description: 'Relaxed tracking, maintenance mode',
        adjustments: {
            workoutIntensity: 0.6,
            mealComplexity: 'flexible',
            routineLevel: 'minimal',
            notificationsEnabled: false,
            maintenanceCalories: true,
            skipLogging: true
        }
    },
    exam: {
        name: 'Exam/Busy',
        description: 'Sleep priority, light routines',
        adjustments: {
            workoutIntensity: 0.4,
            mealComplexity: 'quick',
            routineLevel: 'minimal',
            notificationsEnabled: true,
            sleepPriority: true,
            focusPriority: true
        }
    }
};

const createUserMode = (data = {}) => {
    return {
        mode: data.mode || 'normal',
        activeSince: data.activeSince || new Date().toISOString(),
        autoExpiry: data.autoExpiry || null, // Date when mode should auto-revert to normal
        reason: data.reason || ''
    };
};

const getModeAdjustments = (modeName) => {
    return MODES[modeName]?.adjustments || MODES.normal.adjustments;
};

const getModeInfo = (modeName) => {
    return MODES[modeName] || MODES.normal;
};

const getAllModes = () => {
    return Object.entries(MODES).map(([key, value]) => ({
        id: key,
        ...value
    }));
};

// Check if mode should auto-expire
const shouldExpireMode = (userMode) => {
    if (!userMode.autoExpiry) return false;
    return new Date() > new Date(userMode.autoExpiry);
};

module.exports = {
    MODES,
    createUserMode,
    getModeAdjustments,
    getModeInfo,
    getAllModes,
    shouldExpireMode
};
