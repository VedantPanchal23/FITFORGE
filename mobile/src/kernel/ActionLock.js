/**
 * ACTION LOCK SYSTEM v0.1 - Runtime Implementation
 * 
 * Creates execution-only lock state when obligations become BOUND.
 * Lock persists across app lifecycle until execution completes.
 * 
 * ENFORCEMENT:
 * - All navigation blocked while locked
 * - All settings access blocked while locked
 * - All modification attempts blocked while locked
 * - Only execution input permitted
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default ||
    // Fallback for Node.js testing
    (() => {
        const store = {};
        return {
            getItem: async (key) => store[key] || null,
            setItem: async (key, value) => { store[key] = value; },
            removeItem: async (key) => { delete store[key]; },
            getAllKeys: async () => Object.keys(store)
        };
    })();

// Lock Status Constants
const LockStatus = {
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
    RESOLVED: 'RESOLVED',
    EXPIRED: 'EXPIRED'
};

// Resolution types
const Resolution = {
    PENDING: 'PENDING',
    EXECUTED: 'EXECUTED',
    FAILED: 'FAILED'
};

// Storage key prefix
const LOCK_STORAGE_KEY = 'DISCIPLINE_KERNEL_LOCK_';

/**
 * Custom error for action lock violations
 */
class ActionLockedError extends Error {
    constructor(obligationId, attemptedAction) {
        super(
            `EXECUTION REQUIRED: Cannot ${attemptedAction}. Obligation [${obligationId}] unresolved. Complete execution to unlock.`
        );
        this.name = 'ActionLockedError';
        this.obligationId = obligationId;
        this.attemptedAction = attemptedAction;
        this.timestamp = Date.now();
    }
}

/**
 * Custom error for escape attempts
 */
class EscapeAttemptError extends Error {
    constructor(obligationId, escapeType) {
        super(
            `ESCAPE BLOCKED: ${escapeType} attempt logged. Obligation [${obligationId}] still active.`
        );
        this.name = 'EscapeAttemptError';
        this.obligationId = obligationId;
        this.escapeType = escapeType;
        this.timestamp = Date.now();
    }
}

// In-memory lock cache (synced with persistent storage)
const activeLocks = new Map();
const escapeAttempts = new Map();

/**
 * Generate lock ID
 */
function generateLockId() {
    return 'lock_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Create a new action lock for a BOUND obligation
 * @param {Object} obligation - The bound obligation
 * @returns {Object} - Created lock state
 */
async function createLock(obligation) {
    if (!obligation || !obligation.id) {
        throw new Error('Invalid obligation: missing ID');
    }

    // Check if lock already exists for this obligation
    const existingLock = await getLockByObligation(obligation.id);
    if (existingLock && existingLock.status === LockStatus.ACTIVE) {
        return existingLock;
    }

    const lock = {
        id: generateLockId(),
        obligationId: obligation.id,
        userId: obligation.userId,
        lockStart: Date.now(),
        lockEnd: null,
        status: LockStatus.ACTIVE,
        resolution: Resolution.PENDING,
        escapeAttempts: 0,
        unitsRequired: obligation.unitsRequired,
        unitsCompleted: obligation.unitsCompleted || 0,
        windowEnd: obligation.scheduledAt + (24 * 60 * 60 * 1000) // 24h window
    };

    // Store in memory
    activeLocks.set(lock.userId, lock);

    // Persist to storage
    await persistLock(lock);

    return lock;
}

/**
 * Persist lock to storage (survives app restart)
 */
async function persistLock(lock) {
    try {
        const key = LOCK_STORAGE_KEY + lock.userId;
        await AsyncStorage.setItem(key, JSON.stringify(lock));
    } catch (error) {
        console.error('Failed to persist lock:', error);
    }
}

/**
 * Load lock from persistent storage
 */
async function loadPersistedLock(userId) {
    try {
        const key = LOCK_STORAGE_KEY + userId;
        const data = await AsyncStorage.getItem(key);
        if (data) {
            const lock = JSON.parse(data);
            // Restore to memory cache
            if (lock.status === LockStatus.ACTIVE) {
                activeLocks.set(userId, lock);
            }
            return lock;
        }
    } catch (error) {
        console.error('Failed to load persisted lock:', error);
    }
    return null;
}

/**
 * Get active lock for a user
 * @param {string} userId - User ID
 * @returns {Object|null} - Active lock or null
 */
async function getActiveLock(userId) {
    // Check memory first
    let lock = activeLocks.get(userId);

    // If not in memory, check persistent storage
    if (!lock) {
        lock = await loadPersistedLock(userId);
    }

    // Validate lock is still active
    if (lock && lock.status === LockStatus.ACTIVE) {
        // Check if window has expired
        if (Date.now() > lock.windowEnd) {
            lock.status = LockStatus.EXPIRED;
            lock.resolution = Resolution.FAILED;
            lock.lockEnd = Date.now();
            await persistLock(lock);
            return lock; // Return expired lock for consequence handling
        }
        return lock;
    }

    return null;
}

/**
 * Get lock by obligation ID
 */
async function getLockByObligation(obligationId) {
    for (const lock of activeLocks.values()) {
        if (lock.obligationId === obligationId) {
            return lock;
        }
    }
    // Would also check persistent storage in production
    return null;
}

/**
 * ENFORCEMENT: Assert user is unlocked before allowing action
 * @param {string} userId - User ID
 * @param {string} action - Name of attempted action
 * @throws {ActionLockedError} - If user is locked
 */
async function assertUnlocked(userId, action) {
    const lock = await getActiveLock(userId);

    if (lock && lock.status === LockStatus.ACTIVE) {
        // Log escape attempt
        logEscapeAttempt(lock, action);

        // Throw enforcement error
        throw new ActionLockedError(lock.obligationId, action);
    }
}

/**
 * Log an escape attempt
 */
function logEscapeAttempt(lock, attemptType) {
    lock.escapeAttempts++;

    const attempts = escapeAttempts.get(lock.id) || [];
    attempts.push({
        type: attemptType,
        timestamp: Date.now()
    });
    escapeAttempts.set(lock.id, attempts);

    // Persist updated lock
    persistLock(lock);
}

/**
 * Get escape attempts for a lock
 */
function getEscapeAttempts(lockId) {
    return escapeAttempts.get(lockId) || [];
}

/**
 * Update lock with execution progress
 * @param {string} userId - User ID
 * @param {number} unitsCompleted - Total units now completed
 * @returns {Object} - Updated lock state
 */
async function updateLockProgress(userId, unitsCompleted) {
    const lock = await getActiveLock(userId);

    if (!lock || lock.status !== LockStatus.ACTIVE) {
        return null;
    }

    lock.unitsCompleted = unitsCompleted;

    // Check if execution complete
    if (unitsCompleted >= lock.unitsRequired) {
        lock.status = LockStatus.RESOLVED;
        lock.resolution = Resolution.EXECUTED;
        lock.lockEnd = Date.now();

        // Remove from active locks
        activeLocks.delete(userId);
    }

    await persistLock(lock);
    return lock;
}

/**
 * Resolve lock (execution complete)
 * @param {string} userId - User ID
 */
async function resolveLock(userId) {
    const lock = await getActiveLock(userId);

    if (lock) {
        lock.status = LockStatus.RESOLVED;
        lock.resolution = Resolution.EXECUTED;
        lock.lockEnd = Date.now();

        activeLocks.delete(userId);
        await persistLock(lock);

        return lock;
    }

    return null;
}

/**
 * Force expire a lock (window ended without execution)
 * @param {string} userId - User ID
 */
async function expireLock(userId) {
    const lock = await getActiveLock(userId);

    if (lock) {
        lock.status = LockStatus.EXPIRED;
        lock.resolution = Resolution.FAILED;
        lock.lockEnd = Date.now();

        activeLocks.delete(userId);
        await persistLock(lock);

        return lock;
    }

    return null;
}

/**
 * Check if user is currently locked
 * @param {string} userId - User ID
 * @returns {boolean} - True if locked
 */
async function isLocked(userId) {
    const lock = await getActiveLock(userId);
    return lock && lock.status === LockStatus.ACTIVE;
}

/**
 * Get lock status for display
 * @param {string} userId - User ID
 * @returns {Object} - Lock display info
 */
async function getLockStatus(userId) {
    const lock = await getActiveLock(userId);

    if (!lock || lock.status !== LockStatus.ACTIVE) {
        return { locked: false };
    }

    const remaining = lock.windowEnd - Date.now();

    return {
        locked: true,
        obligationId: lock.obligationId,
        unitsRequired: lock.unitsRequired,
        unitsCompleted: lock.unitsCompleted,
        unitsRemaining: lock.unitsRequired - lock.unitsCompleted,
        timeRemaining: remaining > 0 ? remaining : 0,
        escapeAttempts: lock.escapeAttempts
    };
}

/**
 * Allowed actions during lock (execution only)
 */
const ALLOWED_DURING_LOCK = [
    'LOG_EXECUTION',
    'CONFIRM_COMPLETION',
    'VIEW_CURRENT_OBLIGATION',
    'VIEW_TIME_REMAINING'
];

/**
 * Check if action is allowed during lock
 */
function isAllowedDuringLock(action) {
    return ALLOWED_DURING_LOCK.includes(action.toUpperCase());
}

/**
 * Enforce action - throws if locked and action not allowed
 */
async function enforceAction(userId, action) {
    if (isAllowedDuringLock(action)) {
        return true; // Always allow execution actions
    }

    await assertUnlocked(userId, action);
    return true;
}

module.exports = {
    LockStatus,
    Resolution,
    ActionLockedError,
    EscapeAttemptError,
    createLock,
    getActiveLock,
    getLockByObligation,
    assertUnlocked,
    updateLockProgress,
    resolveLock,
    expireLock,
    isLocked,
    getLockStatus,
    getEscapeAttempts,
    isAllowedDuringLock,
    enforceAction,
    ALLOWED_DURING_LOCK
};
