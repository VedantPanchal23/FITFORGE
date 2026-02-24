/**
 * DISCIPLINE KERNEL - Runtime Test Suite
 * 
 * Demonstrates enforcement at runtime:
 * - FAILING SCENARIO: Attempting to reschedule a BINDING obligation
 * - PASSING SCENARIO: Rescheduling a CREATED obligation (before binding)
 */

const {
    createObligation,
    getObligation,
    rescheduleObligation,
    deleteObligation,
    modifyObligation,
    logExecution,
    ObligationStatus,
    BindingViolationError
} = require('./ObligationService');

// Test utilities
function log(message) {
    console.log(`[KERNEL TEST] ${message}`);
}

function logSuccess(message) {
    console.log(`[✓ PASS] ${message}`);
}

function logFailure(message) {
    console.log(`[✗ FAIL] ${message}`);
}

function logEnforcement(message) {
    console.log(`[⛔ ENFORCEMENT] ${message}`);
}

/**
 * TEST 1: PASSING SCENARIO
 * Reschedule a CREATED obligation (before binding window)
 */
function testRescheduleCreated() {
    log('');
    log('=== TEST 1: RESCHEDULE CREATED OBLIGATION ===');
    log('Scenario: User creates obligation, then reschedules BEFORE binding window');

    // Create obligation scheduled 48 hours from now (outside 24h binding window)
    const futureTime = Date.now() + (48 * 60 * 60 * 1000);
    const obligation = createObligation('user_001', 'WORKOUT', 1, futureTime);

    log(`Created obligation: ${obligation.id}`);
    log(`Status: ${obligation.status}`);
    log(`Scheduled: ${new Date(obligation.scheduledAt).toISOString()}`);
    log(`Binding at: ${new Date(obligation.bindingTime).toISOString()}`);

    // Attempt reschedule
    const newTime = Date.now() + (72 * 60 * 60 * 1000);
    try {
        const updated = rescheduleObligation(obligation.id, newTime);
        logSuccess(`Reschedule PERMITTED - New time: ${new Date(updated.scheduledAt).toISOString()}`);
        return true;
    } catch (error) {
        logFailure(`Unexpected error: ${error.message}`);
        return false;
    }
}

/**
 * TEST 2: FAILING SCENARIO
 * Attempt to reschedule a BINDING obligation
 */
function testRescheduleBinding() {
    log('');
    log('=== TEST 2: RESCHEDULE BINDING OBLIGATION ===');
    log('Scenario: User tries to reschedule when obligation is in BINDING state');

    // Create obligation scheduled 12 hours from now (inside 24h binding window)
    const soonTime = Date.now() + (12 * 60 * 60 * 1000);
    const obligation = createObligation('user_001', 'WORKOUT', 1, soonTime);

    // Get obligation to trigger status resolution
    const resolved = getObligation(obligation.id);

    log(`Created obligation: ${resolved.id}`);
    log(`Status: ${resolved.status}`);
    log(`Scheduled: ${new Date(resolved.scheduledAt).toISOString()}`);
    log(`Current time is AFTER binding time - obligation should be BINDING`);

    // Attempt reschedule - THIS SHOULD FAIL
    const newTime = Date.now() + (72 * 60 * 60 * 1000);
    try {
        rescheduleObligation(obligation.id, newTime);
        logFailure('Reschedule was permitted when it should have been blocked!');
        return false;
    } catch (error) {
        if (error instanceof BindingViolationError) {
            logEnforcement('RESCHEDULE BLOCKED');
            logEnforcement(`Error: ${error.message}`);
            logEnforcement(`Obligation ID: ${error.obligationId}`);
            logEnforcement(`Attempted Operation: ${error.attemptedOperation}`);
            logEnforcement(`Current Status: ${error.currentStatus}`);
            logSuccess('Binding enforcement working correctly');
            return true;
        } else {
            logFailure(`Wrong error type: ${error.message}`);
            return false;
        }
    }
}

/**
 * TEST 3: FAILING SCENARIO
 * Attempt to delete a BINDING obligation
 */
function testDeleteBinding() {
    log('');
    log('=== TEST 3: DELETE BINDING OBLIGATION ===');
    log('Scenario: User tries to delete when obligation is in BINDING state');

    // Create obligation scheduled 6 hours from now (inside binding window)
    const soonTime = Date.now() + (6 * 60 * 60 * 1000);
    const obligation = createObligation('user_001', 'MEAL', 1, soonTime);

    log(`Created obligation: ${obligation.id}`);
    log(`Attempting DELETE...`);

    try {
        deleteObligation(obligation.id);
        logFailure('Delete was permitted when it should have been blocked!');
        return false;
    } catch (error) {
        if (error instanceof BindingViolationError) {
            logEnforcement('DELETE BLOCKED');
            logEnforcement(`Error: ${error.message}`);
            logSuccess('Deletion enforcement working correctly');
            return true;
        } else {
            logFailure(`Wrong error type: ${error.message}`);
            return false;
        }
    }
}

/**
 * TEST 4: FAILING SCENARIO
 * Attempt to modify a BINDING obligation
 */
function testModifyBinding() {
    log('');
    log('=== TEST 4: MODIFY BINDING OBLIGATION ===');
    log('Scenario: User tries to reduce required units when obligation is BINDING');

    // Create obligation scheduled 3 hours from now
    const soonTime = Date.now() + (3 * 60 * 60 * 1000);
    const obligation = createObligation('user_001', 'HABIT', 5, soonTime);

    log(`Created obligation: ${obligation.id}`);
    log(`Units required: ${obligation.unitsRequired}`);
    log(`Attempting to reduce to 1 unit...`);

    try {
        modifyObligation(obligation.id, { unitsRequired: 1 });
        logFailure('Modification was permitted when it should have been blocked!');
        return false;
    } catch (error) {
        if (error instanceof BindingViolationError) {
            logEnforcement('MODIFY BLOCKED');
            logEnforcement(`Error: ${error.message}`);
            logSuccess('Modification enforcement working correctly');
            return true;
        } else {
            logFailure(`Wrong error type: ${error.message}`);
            return false;
        }
    }
}

/**
 * TEST 5: PASSING SCENARIO
 * Delete a CREATED obligation (before binding)
 */
function testDeleteCreated() {
    log('');
    log('=== TEST 5: DELETE CREATED OBLIGATION ===');
    log('Scenario: User deletes obligation BEFORE binding window');

    // Create obligation scheduled 72 hours from now
    const futureTime = Date.now() + (72 * 60 * 60 * 1000);
    const obligation = createObligation('user_001', 'WORKOUT', 1, futureTime);

    log(`Created obligation: ${obligation.id}`);
    log(`Status: ${obligation.status}`);

    try {
        const result = deleteObligation(obligation.id);
        logSuccess(`Deletion PERMITTED - Obligation ${result.obligationId} removed`);
        return true;
    } catch (error) {
        logFailure(`Unexpected error: ${error.message}`);
        return false;
    }
}

/**
 * Run all tests
 */
function runEnforcementTests() {
    log('');
    log('╔══════════════════════════════════════════════════════════════╗');
    log('║       DISCIPLINE KERNEL v0.1 - ENFORCEMENT TEST SUITE        ║');
    log('╚══════════════════════════════════════════════════════════════╝');

    const results = [];

    results.push({ name: 'Reschedule CREATED (should pass)', passed: testRescheduleCreated() });
    results.push({ name: 'Reschedule BINDING (should block)', passed: testRescheduleBinding() });
    results.push({ name: 'Delete BINDING (should block)', passed: testDeleteBinding() });
    results.push({ name: 'Modify BINDING (should block)', passed: testModifyBinding() });
    results.push({ name: 'Delete CREATED (should pass)', passed: testDeleteCreated() });

    log('');
    log('╔══════════════════════════════════════════════════════════════╗');
    log('║                        TEST RESULTS                          ║');
    log('╚══════════════════════════════════════════════════════════════╝');

    let passed = 0;
    let failed = 0;

    for (const result of results) {
        if (result.passed) {
            logSuccess(result.name);
            passed++;
        } else {
            logFailure(result.name);
            failed++;
        }
    }

    log('');
    log(`TOTAL: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        log('');
        log('✓ ALL ENFORCEMENT CHECKS OPERATIONAL');
        log('  - Reschedule blocked on BINDING obligations');
        log('  - Delete blocked on BINDING obligations');
        log('  - Modify blocked on BINDING obligations');
        log('  - Operations permitted on CREATED obligations');
    }

    return failed === 0;
}

// Export for use
module.exports = { runEnforcementTests };

// Run if executed directly
if (require.main === module) {
    runEnforcementTests();
}
