/**
 * OBLIGATION GUARD - Discipline Kernel v0.1
 * 
 * Runtime enforcement module that prevents modification of bound obligations.
 * This module implements the non-negotiability enforcement from the kernel spec.
 * 
 * ENFORCED RULES:
 * - Obligations in BINDING or BOUND state cannot be rescheduled
 * - Obligations in BINDING or BOUND state cannot be deleted
 * - Obligations in BINDING or BOUND state cannot be modified
 */

// Obligation Status Constants
const ObligationStatus = {
    CREATED: 'CREATED',
    BINDING: 'BINDING',
    BOUND: 'BOUND',
    EXECUTED: 'EXECUTED',
    FAILED: 'FAILED'
};

// Locked states where modifications are prohibited
const LOCKED_STATES = [ObligationStatus.BINDING, ObligationStatus.BOUND];

/**
 * Custom error for binding violations
 */
class BindingViolationError extends Error {
    constructor(obligationId, attemptedOperation, currentStatus) {
        super(
            `ENFORCEMENT VIOLATION: Cannot ${attemptedOperation} obligation [${obligationId}] in ${currentStatus} state. Obligation is locked.`
        );
        this.name = 'BindingViolationError';
        this.obligationId = obligationId;
        this.attemptedOperation = attemptedOperation;
        this.currentStatus = currentStatus;
    }
}

/**
 * Custom error for negotiation attempts
 */
class NegotiationAttemptError extends Error {
    constructor(obligationId, attemptType) {
        super(
            `NEGOTIATION REJECTED: Attempt to ${attemptType} obligation [${obligationId}] logged. No negotiation permitted.`
        );
        this.name = 'NegotiationAttemptError';
        this.obligationId = obligationId;
        this.attemptType = attemptType;
        this.timestamp = Date.now();
    }
}

/**
 * Check if an obligation is in a locked state
 * @param {string} status - Current obligation status
 * @returns {boolean} - True if locked
 */
function isLocked(status) {
    return LOCKED_STATES.includes(status);
}

/**
 * Guard function: Validates if reschedule is permitted
 * @param {Object} obligation - The obligation object
 * @throws {BindingViolationError} - If obligation is locked
 */
function guardReschedule(obligation) {
    if (!obligation || !obligation.id) {
        throw new Error('Invalid obligation: missing required fields');
    }

    if (isLocked(obligation.status)) {
        throw new BindingViolationError(
            obligation.id,
            'RESCHEDULE',
            obligation.status
        );
    }
}

/**
 * Guard function: Validates if deletion is permitted
 * @param {Object} obligation - The obligation object
 * @throws {BindingViolationError} - If obligation is locked
 */
function guardDelete(obligation) {
    if (!obligation || !obligation.id) {
        throw new Error('Invalid obligation: missing required fields');
    }

    if (isLocked(obligation.status)) {
        throw new BindingViolationError(
            obligation.id,
            'DELETE',
            obligation.status
        );
    }
}

/**
 * Guard function: Validates if modification is permitted
 * @param {Object} obligation - The obligation object
 * @param {string} fieldName - Name of field being modified
 * @throws {BindingViolationError} - If obligation is locked
 */
function guardModify(obligation, fieldName = 'unknown') {
    if (!obligation || !obligation.id) {
        throw new Error('Invalid obligation: missing required fields');
    }

    if (isLocked(obligation.status)) {
        throw new BindingViolationError(
            obligation.id,
            `MODIFY:${fieldName}`,
            obligation.status
        );
    }
}

/**
 * Combined guard: Run all enforcement checks
 * @param {Object} obligation - The obligation object
 * @param {string} operation - The operation being attempted
 * @throws {BindingViolationError} - If any check fails
 */
function enforceBinding(obligation, operation) {
    switch (operation.toUpperCase()) {
        case 'RESCHEDULE':
            guardReschedule(obligation);
            break;
        case 'DELETE':
            guardDelete(obligation);
            break;
        case 'MODIFY':
            guardModify(obligation);
            break;
        default:
            // For unknown operations on locked obligations, reject
            if (isLocked(obligation.status)) {
                throw new BindingViolationError(
                    obligation.id,
                    operation,
                    obligation.status
                );
            }
    }
}

/**
 * Calculate binding time (24 hours before scheduled time)
 * @param {number} scheduledAt - Scheduled timestamp in ms
 * @returns {number} - Binding timestamp in ms
 */
function calculateBindingTime(scheduledAt) {
    const BINDING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
    return scheduledAt - BINDING_WINDOW_MS;
}

/**
 * Determine current obligation status based on time
 * @param {Object} obligation - The obligation object
 * @returns {string} - Current status
 */
function resolveStatus(obligation) {
    const now = Date.now();
    const bindingTime = calculateBindingTime(obligation.scheduledAt);

    // Already terminal states
    if (obligation.status === ObligationStatus.EXECUTED ||
        obligation.status === ObligationStatus.FAILED) {
        return obligation.status;
    }

    // Check BOUND first - if past scheduled time, it's BOUND
    if (now >= obligation.scheduledAt) {
        return ObligationStatus.BOUND;
    }

    // Check if should transition to BINDING (within 24h of scheduled)
    if (now >= bindingTime) {
        return ObligationStatus.BINDING;
    }

    return obligation.status;
}

/**
 * Create a proxy wrapper that enforces binding rules on obligation objects
 * @param {Object} obligation - The obligation object to wrap
 * @returns {Proxy} - Protected obligation object
 */
function createEnforcedObligation(obligation) {
    return new Proxy(obligation, {
        set(target, property, value) {
            // Always allow status updates from system
            if (property === 'status' || property === 'unitsCompleted') {
                target[property] = value;
                return true;
            }

            // Check if locked before allowing any other modification
            const currentStatus = resolveStatus(target);
            if (isLocked(currentStatus)) {
                throw new BindingViolationError(
                    target.id,
                    `SET:${property}`,
                    currentStatus
                );
            }

            target[property] = value;
            return true;
        },

        deleteProperty(target, property) {
            throw new BindingViolationError(
                target.id,
                `DELETE_PROPERTY:${property}`,
                resolveStatus(target)
            );
        }
    });
}

module.exports = {
    ObligationStatus,
    LOCKED_STATES,
    BindingViolationError,
    NegotiationAttemptError,
    isLocked,
    guardReschedule,
    guardDelete,
    guardModify,
    enforceBinding,
    calculateBindingTime,
    resolveStatus,
    createEnforcedObligation
};
