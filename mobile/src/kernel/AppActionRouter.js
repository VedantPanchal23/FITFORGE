/**
 * APP ACTION ROUTER - Discipline Kernel v0.1
 * 
 * Central routing layer that enforces ACTION LOCK on all user actions.
 * Every action in the app MUST pass through this router.
 * 
 * ENFORCEMENT:
 * - All actions checked against active lock state
 * - Only execution actions permitted while locked
 * - All other actions throw ActionLockedError
 */

const {
    assertUnlocked,
    isLocked,
    getLockStatus,
    isAllowedDuringLock,
    ActionLockedError,
    ALLOWED_DURING_LOCK
} = require('./ActionLock');

// Action categories
const ActionCategory = {
    NAVIGATION: 'NAVIGATION',
    SETTINGS: 'SETTINGS',
    PLANNING: 'PLANNING',
    HISTORY: 'HISTORY',
    SOCIAL: 'SOCIAL',
    ANALYTICS: 'ANALYTICS',
    EXECUTION: 'EXECUTION',
    SYSTEM: 'SYSTEM'
};

// Actions that are BLOCKED while locked
const BLOCKED_ACTIONS = {
    // Navigation
    'NAVIGATE_HOME': ActionCategory.NAVIGATION,
    'NAVIGATE_SETTINGS': ActionCategory.NAVIGATION,
    'NAVIGATE_HISTORY': ActionCategory.NAVIGATION,
    'NAVIGATE_ANALYTICS': ActionCategory.NAVIGATION,
    'NAVIGATE_SOCIAL': ActionCategory.NAVIGATION,
    'NAVIGATE_PROFILE': ActionCategory.NAVIGATION,
    'NAVIGATE_PLANNING': ActionCategory.NAVIGATION,
    'NAVIGATE_FOOD': ActionCategory.NAVIGATION,
    'NAVIGATE_HABITS': ActionCategory.NAVIGATION,
    'NAVIGATE_WORKOUTS': ActionCategory.NAVIGATION,

    // Settings
    'OPEN_SETTINGS': ActionCategory.SETTINGS,
    'MODIFY_SETTINGS': ActionCategory.SETTINGS,
    'CHANGE_PREFERENCES': ActionCategory.SETTINGS,
    'EDIT_PROFILE': ActionCategory.SETTINGS,

    // Planning
    'CREATE_OBLIGATION': ActionCategory.PLANNING,
    'SCHEDULE_WORKOUT': ActionCategory.PLANNING,
    'SCHEDULE_MEAL': ActionCategory.PLANNING,
    'SCHEDULE_HABIT': ActionCategory.PLANNING,
    'MODIFY_SCHEDULE': ActionCategory.PLANNING,
    'VIEW_FUTURE_PLANS': ActionCategory.PLANNING,

    // History
    'VIEW_HISTORY': ActionCategory.HISTORY,
    'VIEW_PAST_WORKOUTS': ActionCategory.HISTORY,
    'VIEW_STATISTICS': ActionCategory.HISTORY,
    'EXPORT_DATA': ActionCategory.HISTORY,

    // Social
    'SHARE_PROGRESS': ActionCategory.SOCIAL,
    'VIEW_LEADERBOARD': ActionCategory.SOCIAL,
    'MESSAGE_USERS': ActionCategory.SOCIAL,

    // Analytics
    'VIEW_ANALYTICS': ActionCategory.ANALYTICS,
    'VIEW_TRENDS': ActionCategory.ANALYTICS,
    'VIEW_REPORTS': ActionCategory.ANALYTICS
};

// Action log for tracking all attempts
const actionLog = [];

/**
 * Route and enforce an action
 * @param {string} userId - User ID
 * @param {string} action - Action name
 * @param {Object} payload - Action payload
 * @throws {ActionLockedError} - If locked and action not permitted
 * @returns {Object} - Result with action permission
 */
async function routeAction(userId, action, payload = {}) {
    const timestamp = Date.now();
    const actionUpper = action.toUpperCase();

    // Log all action attempts
    actionLog.push({
        userId,
        action: actionUpper,
        timestamp,
        payload: { ...payload }
    });

    // Check if this is an execution action (always allowed)
    if (isAllowedDuringLock(actionUpper)) {
        return {
            permitted: true,
            action: actionUpper,
            category: ActionCategory.EXECUTION
        };
    }

    // Check if user is locked
    const locked = await isLocked(userId);

    if (locked) {
        // Get lock details for error
        const lockStatus = await getLockStatus(userId);

        // Action is blocked - throw enforcement error
        const category = BLOCKED_ACTIONS[actionUpper] || 'UNKNOWN';

        actionLog[actionLog.length - 1].blocked = true;
        actionLog[actionLog.length - 1].category = category;

        throw new ActionLockedError(lockStatus.obligationId, actionUpper);
    }

    // Not locked - permit action
    return {
        permitted: true,
        action: actionUpper,
        category: BLOCKED_ACTIONS[actionUpper] || ActionCategory.SYSTEM
    };
}

/**
 * Check if action would be permitted (without throwing)
 * @param {string} userId - User ID
 * @param {string} action - Action name
 * @returns {Object} - Permission result
 */
async function checkActionPermission(userId, action) {
    const actionUpper = action.toUpperCase();

    // Execution actions always permitted
    if (isAllowedDuringLock(actionUpper)) {
        return { permitted: true, reason: 'EXECUTION_ACTION' };
    }

    // Check lock status
    const locked = await isLocked(userId);

    if (locked) {
        const lockStatus = await getLockStatus(userId);
        return {
            permitted: false,
            reason: 'LOCKED',
            obligationId: lockStatus.obligationId,
            unitsRemaining: lockStatus.unitsRemaining,
            timeRemaining: lockStatus.timeRemaining
        };
    }

    return { permitted: true, reason: 'UNLOCKED' };
}

/**
 * Get action log for a user
 */
function getActionLog(userId = null) {
    if (userId) {
        return actionLog.filter(entry => entry.userId === userId);
    }
    return [...actionLog];
}

/**
 * Get blocked action attempts
 */
function getBlockedAttempts(userId = null) {
    const logs = userId
        ? actionLog.filter(entry => entry.userId === userId)
        : actionLog;

    return logs.filter(entry => entry.blocked === true);
}

/**
 * Wrapper for navigation actions
 */
async function navigate(userId, screen) {
    return await routeAction(userId, `NAVIGATE_${screen.toUpperCase()}`);
}

/**
 * Wrapper for settings actions
 */
async function openSettings(userId) {
    return await routeAction(userId, 'OPEN_SETTINGS');
}

/**
 * Wrapper for planning actions
 */
async function accessPlanning(userId) {
    return await routeAction(userId, 'VIEW_FUTURE_PLANS');
}

/**
 * Wrapper for history actions
 */
async function viewHistory(userId) {
    return await routeAction(userId, 'VIEW_HISTORY');
}

/**
 * Get permitted actions during lock
 */
function getPermittedDuringLock() {
    return [...ALLOWED_DURING_LOCK];
}

/**
 * Get all blocked action names
 */
function getBlockedActionNames() {
    return Object.keys(BLOCKED_ACTIONS);
}

module.exports = {
    ActionCategory,
    routeAction,
    checkActionPermission,
    getActionLog,
    getBlockedAttempts,
    navigate,
    openSettings,
    accessPlanning,
    viewHistory,
    getPermittedDuringLock,
    getBlockedActionNames,
    ActionLockedError
};
