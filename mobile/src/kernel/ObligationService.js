/**
 * OBLIGATION SERVICE - Discipline Kernel v0.1
 * 
 * Service layer for obligation management with ENFORCED binding rules.
 * All operations pass through ObligationGuard before execution.
 * 
 * LOCK INTEGRATION:
 * - Lock is created automatically when obligation enters BOUND state
 * - Lock is resolved when execution completes
 */

const {
    ObligationStatus,
    BindingViolationError,
    NegotiationAttemptError,
    guardReschedule,
    guardDelete,
    guardModify,
    resolveStatus,
    calculateBindingTime,
    createEnforcedObligation
} = require('./ObligationGuard');

const {
    createLock,
    resolveLock,
    updateLockProgress,
    ActionLockedError
} = require('./ActionLock');

// In-memory store (replace with database in production)
const obligations = new Map();
const negotiationLog = [];

// Track previous status for transition detection
const previousStatus = new Map();

/**
 * Generate UUID
 */
function generateId() {
    return 'obl_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Create a new obligation
 * @param {string} userId - User ID
 * @param {string} type - Obligation type
 * @param {number} unitsRequired - Units required to complete
 * @param {number} scheduledAt - Scheduled timestamp
 * @returns {Object} - Created obligation
 */
function createObligation(userId, type, unitsRequired, scheduledAt) {
    const obligation = {
        id: generateId(),
        userId,
        type,
        unitsRequired,
        unitsCompleted: 0,
        scheduledAt,
        bindingTime: calculateBindingTime(scheduledAt),
        createdAt: Date.now(),
        status: ObligationStatus.CREATED
    };

    obligations.set(obligation.id, obligation);
    return { ...obligation };
}

/**
 * Handle status transition - triggers lock on BOUND
 * @param {Object} obligation - The obligation
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 */
async function handleStatusTransition(obligation, oldStatus, newStatus) {
    // Trigger lock when entering BOUND state
    if (newStatus === ObligationStatus.BOUND && oldStatus !== ObligationStatus.BOUND) {
        await createLock(obligation);
    }
}

/**
 * Get obligation by ID (with status resolution)
 * @param {string} obligationId - Obligation ID
 * @returns {Object|null} - Obligation or null
 */
async function getObligation(obligationId) {
    const obligation = obligations.get(obligationId);
    if (!obligation) return null;

    // Store old status
    const oldStatus = obligation.status;

    // Auto-resolve status based on current time
    const resolvedStatus = resolveStatus(obligation);
    if (resolvedStatus !== obligation.status) {
        obligation.status = resolvedStatus;
        // Trigger lock if entering BOUND
        await handleStatusTransition(obligation, oldStatus, resolvedStatus);
    }

    return { ...obligation };
}

/**
 * RESCHEDULE OBLIGATION - ENFORCED
 * 
 * @param {string} obligationId - Obligation ID
 * @param {number} newScheduledAt - New scheduled timestamp
 * @throws {BindingViolationError} - If obligation is in BINDING or BOUND state
 */
function rescheduleObligation(obligationId, newScheduledAt) {
    const obligation = obligations.get(obligationId);
    if (!obligation) {
        throw new Error(`Obligation not found: ${obligationId}`);
    }

    // Update status before checking
    obligation.status = resolveStatus(obligation);

    // ENFORCEMENT: Check if reschedule is permitted
    guardReschedule(obligation);

    // If we reach here, reschedule is permitted
    obligation.scheduledAt = newScheduledAt;
    obligation.bindingTime = calculateBindingTime(newScheduledAt);

    return { ...obligation };
}

/**
 * DELETE OBLIGATION - ENFORCED
 * 
 * @param {string} obligationId - Obligation ID
 * @throws {BindingViolationError} - If obligation is in BINDING or BOUND state
 */
function deleteObligation(obligationId) {
    const obligation = obligations.get(obligationId);
    if (!obligation) {
        throw new Error(`Obligation not found: ${obligationId}`);
    }

    // Update status before checking
    obligation.status = resolveStatus(obligation);

    // ENFORCEMENT: Check if deletion is permitted
    guardDelete(obligation);

    // If we reach here, deletion is permitted
    obligations.delete(obligationId);

    return { deleted: true, obligationId };
}

/**
 * MODIFY OBLIGATION - ENFORCED
 * 
 * @param {string} obligationId - Obligation ID
 * @param {Object} updates - Fields to update
 * @throws {BindingViolationError} - If obligation is in BINDING or BOUND state
 */
function modifyObligation(obligationId, updates) {
    const obligation = obligations.get(obligationId);
    if (!obligation) {
        throw new Error(`Obligation not found: ${obligationId}`);
    }

    // Update status before checking
    obligation.status = resolveStatus(obligation);

    // ENFORCEMENT: Check each field modification
    for (const field of Object.keys(updates)) {
        // Prevent modification of immutable fields
        if (['id', 'userId', 'createdAt'].includes(field)) {
            throw new Error(`Cannot modify immutable field: ${field}`);
        }
        guardModify(obligation, field);
    }

    // If we reach here, modifications are permitted
    Object.assign(obligation, updates);
    obligation.bindingTime = calculateBindingTime(obligation.scheduledAt);

    return { ...obligation };
}

/**
 * LOG EXECUTION - Always permitted
 * Also updates lock progress and resolves on completion
 * 
 * @param {string} obligationId - Obligation ID
 * @param {number} units - Units completed
 */
async function logExecution(obligationId, units) {
    const obligation = obligations.get(obligationId);
    if (!obligation) {
        throw new Error(`Obligation not found: ${obligationId}`);
    }

    obligation.unitsCompleted += units;

    // Update lock progress
    await updateLockProgress(obligation.userId, obligation.unitsCompleted);

    // Check if completed
    if (obligation.unitsCompleted >= obligation.unitsRequired) {
        obligation.status = ObligationStatus.EXECUTED;
        // Resolve the lock - user is now free
        await resolveLock(obligation.userId);
    }

    return { ...obligation };
}

/**
 * FORCE FAILURE - System only
 * 
 * @param {string} obligationId - Obligation ID
 */
function markFailed(obligationId) {
    const obligation = obligations.get(obligationId);
    if (!obligation) {
        throw new Error(`Obligation not found: ${obligationId}`);
    }

    obligation.status = ObligationStatus.FAILED;

    return { ...obligation };
}

/**
 * Log a negotiation attempt (for tracking avoidance behavior)
 */
function logNegotiationAttempt(obligationId, attemptType, error) {
    negotiationLog.push({
        obligationId,
        attemptType,
        timestamp: Date.now(),
        error: error.message
    });
}

/**
 * Get all negotiation attempts for a user
 */
function getNegotiationLog() {
    return [...negotiationLog];
}

/**
 * Get user's pending obligations
 */
function getPendingObligations(userId) {
    const pending = [];
    for (const obligation of obligations.values()) {
        if (obligation.userId === userId &&
            ![ObligationStatus.EXECUTED, ObligationStatus.FAILED].includes(obligation.status)) {
            obligation.status = resolveStatus(obligation);
            pending.push({ ...obligation });
        }
    }
    return pending;
}

module.exports = {
    createObligation,
    getObligation,
    rescheduleObligation,
    deleteObligation,
    modifyObligation,
    logExecution,
    markFailed,
    logNegotiationAttempt,
    getNegotiationLog,
    getPendingObligations,
    ObligationStatus,
    BindingViolationError
};
