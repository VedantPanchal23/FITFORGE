/**
 * ACTION LOCK SYSTEM - Runtime Test Suite
 * 
 * Demonstrates:
 * - FAILING SCENARIO: Actions blocked while obligation is BOUND
 * - PASSING SCENARIO: Actions restored after execution completes
 */

const {
    createObligation,
    getObligation,
    logExecution,
    ObligationStatus
} = require('./ObligationService');

const {
    getActiveLock,
    getLockStatus,
    isLocked,
    ActionLockedError
} = require('./ActionLock');

const {
    routeAction,
    navigate,
    openSettings,
    accessPlanning
} = require('./AppActionRouter');

// Test utilities
function log(msg) { console.log(`[TEST] ${msg}`); }
function pass(msg) { console.log(`[PASS] ${msg}`); }
function fail(msg) { console.log(`[FAIL] ${msg}`); }
function block(msg) { console.log(`[BLOCKED] ${msg}`); }

/**
 * FAILING SCENARIO
 * User has BOUND obligation, tries to navigate/access settings/plan
 * All actions MUST throw ActionLockedError
 */
async function testFailingScenario() {
    log('');
    log('========================================');
    log('  FAILING SCENARIO: ACTIONS WHILE LOCKED');
    log('========================================');

    const userId = 'test_user_fail';

    // Create obligation scheduled NOW (immediately BOUND)
    const now = Date.now();
    const obligation = createObligation(userId, 'WORKOUT', 3, now);
    log(`Created obligation: ${obligation.id}`);
    log(`Type: ${obligation.type}, Units: ${obligation.unitsRequired}`);

    // Get obligation to trigger status resolution and lock creation
    const resolved = await getObligation(obligation.id);
    log(`Status after resolution: ${resolved.status}`);

    // Verify lock is active
    const lockActive = await isLocked(userId);
    log(`Lock active: ${lockActive}`);

    if (!lockActive) {
        fail('Lock should be active for BOUND obligation!');
        return false;
    }

    const lockStatus = await getLockStatus(userId);
    log(`Lock status: ${JSON.stringify(lockStatus)}`);

    let allBlocked = true;

    // Test 1: Navigation attempt
    log('');
    log('--- Attempt: NAVIGATE_HOME ---');
    try {
        await navigate(userId, 'HOME');
        fail('Navigation should have been blocked!');
        allBlocked = false;
    } catch (e) {
        if (e instanceof ActionLockedError) {
            block(`${e.name}: ${e.attemptedAction}`);
            block(`Message: ${e.message.substring(0, 80)}...`);
            pass('Navigation blocked correctly');
        } else {
            fail(`Wrong error type: ${e.name}`);
            allBlocked = false;
        }
    }

    // Test 2: Settings attempt
    log('');
    log('--- Attempt: OPEN_SETTINGS ---');
    try {
        await openSettings(userId);
        fail('Settings should have been blocked!');
        allBlocked = false;
    } catch (e) {
        if (e instanceof ActionLockedError) {
            block(`${e.name}: ${e.attemptedAction}`);
            pass('Settings blocked correctly');
        } else {
            fail(`Wrong error type: ${e.name}`);
            allBlocked = false;
        }
    }

    // Test 3: Planning attempt
    log('');
    log('--- Attempt: VIEW_FUTURE_PLANS ---');
    try {
        await accessPlanning(userId);
        fail('Planning should have been blocked!');
        allBlocked = false;
    } catch (e) {
        if (e instanceof ActionLockedError) {
            block(`${e.name}: ${e.attemptedAction}`);
            pass('Planning blocked correctly');
        } else {
            fail(`Wrong error type: ${e.name}`);
            allBlocked = false;
        }
    }

    // Test 4: History attempt
    log('');
    log('--- Attempt: VIEW_HISTORY ---');
    try {
        await routeAction(userId, 'VIEW_HISTORY');
        fail('History should have been blocked!');
        allBlocked = false;
    } catch (e) {
        if (e instanceof ActionLockedError) {
            block(`${e.name}: ${e.attemptedAction}`);
            pass('History blocked correctly');
        } else {
            fail(`Wrong error type: ${e.name}`);
            allBlocked = false;
        }
    }

    return allBlocked;
}

/**
 * PASSING SCENARIO
 * User completes execution, lock resolves, actions restored
 */
async function testPassingScenario() {
    log('');
    log('========================================');
    log('  PASSING SCENARIO: UNLOCK VIA EXECUTION');
    log('========================================');

    const userId = 'test_user_pass';

    // Create obligation
    const now = Date.now();
    const obligation = createObligation(userId, 'WORKOUT', 2, now);
    log(`Created obligation: ${obligation.id}`);
    log(`Units required: ${obligation.unitsRequired}`);

    // Trigger BOUND status and lock
    await getObligation(obligation.id);

    // Verify locked
    let locked = await isLocked(userId);
    log(`Locked after BOUND: ${locked}`);

    if (!locked) {
        fail('Should be locked!');
        return false;
    }

    // Try action - should fail
    log('');
    log('--- Before execution: trying navigation ---');
    try {
        await navigate(userId, 'SETTINGS');
        fail('Should be blocked before execution!');
        return false;
    } catch (e) {
        block('Navigation blocked (expected)');
    }

    // LOG EXECUTION - partial
    log('');
    log('--- Logging 1 unit of execution ---');
    await logExecution(obligation.id, 1);
    const partial = await getObligation(obligation.id);
    log(`Units completed: ${partial.unitsCompleted}/${partial.unitsRequired}`);

    // Still locked
    locked = await isLocked(userId);
    log(`Still locked: ${locked}`);

    // Try action - should still fail
    log('');
    log('--- After partial: trying navigation ---');
    try {
        await navigate(userId, 'HOME');
        fail('Should still be blocked!');
        return false;
    } catch (e) {
        block('Navigation still blocked (expected)');
    }

    // LOG EXECUTION - complete
    log('');
    log('--- Logging final unit of execution ---');
    await logExecution(obligation.id, 1);
    const complete = await getObligation(obligation.id);
    log(`Units completed: ${complete.unitsCompleted}/${complete.unitsRequired}`);
    log(`Status: ${complete.status}`);

    // Should be unlocked now
    locked = await isLocked(userId);
    log(`Locked after completion: ${locked}`);

    if (locked) {
        fail('Should be unlocked after completion!');
        return false;
    }

    // Try actions - should now succeed
    log('');
    log('--- After execution: trying navigation ---');
    try {
        const result = await navigate(userId, 'HOME');
        pass(`Navigation PERMITTED: ${result.action}`);
    } catch (e) {
        fail(`Should be permitted: ${e.message}`);
        return false;
    }

    log('');
    log('--- After execution: trying settings ---');
    try {
        const result = await openSettings(userId);
        pass(`Settings PERMITTED: ${result.action}`);
    } catch (e) {
        fail(`Should be permitted: ${e.message}`);
        return false;
    }

    return true;
}

/**
 * Run all tests
 */
async function runActionLockTests() {
    log('');
    log('##################################################');
    log('  ACTION LOCK SYSTEM v0.1 - ENFORCEMENT TESTS');
    log('##################################################');

    const failResult = await testFailingScenario();
    const passResult = await testPassingScenario();

    log('');
    log('##################################################');
    log('  RESULTS');
    log('##################################################');

    if (failResult) {
        pass('FAILING SCENARIO: All actions blocked while locked');
    } else {
        fail('FAILING SCENARIO: Some actions were not blocked');
    }

    if (passResult) {
        pass('PASSING SCENARIO: Lock resolved after execution');
    } else {
        fail('PASSING SCENARIO: Lock did not resolve properly');
    }

    log('');
    if (failResult && passResult) {
        log('ALL TESTS PASSED - ACTION LOCK ENFORCEMENT OPERATIONAL');
    } else {
        log('TESTS FAILED - ENFORCEMENT INCOMPLETE');
    }

    return failResult && passResult;
}

module.exports = { runActionLockTests };

// Run if executed directly
if (require.main === module) {
    runActionLockTests().then(result => {
        process.exit(result ? 0 : 1);
    });
}
