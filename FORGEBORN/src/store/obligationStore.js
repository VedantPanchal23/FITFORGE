/**
 * FORGEBORN — OBLIGATION STORE
 * 
 * The heart of the Discipline Engine.
 * Manages obligations, their states, and the LOCK.
 * 
 * RULES:
 * - Once scheduled, obligations become BINDING 24h before
 * - Once BOUND (due), the system LOCKS
 * - Lock only releases on EXECUTION or FAILURE
 * - Failure creates DEBT
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);

// Obligation Status
export const ObligationStatus = {
    CREATED: 'CREATED',     // Scheduled, can be modified
    BINDING: 'BINDING',     // Within 24h, cannot modify
    BOUND: 'BOUND',         // Due NOW, system is LOCKED
    EXECUTED: 'EXECUTED',   // Completed successfully
    FAILED: 'FAILED',       // Window expired without execution
};

// Obligation Types
export const ObligationType = {
    WORKOUT: 'WORKOUT',
    HABIT: 'HABIT',
    TASK: 'TASK',
    CUSTOM: 'CUSTOM',
};

// Generate ID
const generateId = () => 'obl_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const useObligationStore = create(
    persist(
        (set, get) => ({
            // State
            obligations: [],
            activeLock: null,
            debtUnits: 0,
            failureCount: 0,
            executionLog: [],

            // Create obligation
            createObligation: (type, name, unitsRequired, scheduledAt) => {
                const obligation = {
                    id: generateId(),
                    type,
                    name,
                    unitsRequired,
                    unitsCompleted: 0,
                    scheduledAt,
                    createdAt: Date.now(),
                    status: ObligationStatus.CREATED,
                    windowDuration: 24 * 60 * 60 * 1000, // 24h execution window
                };

                set((state) => ({
                    obligations: [...state.obligations, obligation],
                }));

                console.log('[FORGEBORN] Obligation created:', obligation.name);
                return obligation;
            },

            // Resolve status based on current time
            resolveObligationStatus: (obligation) => {
                const now = Date.now();
                const bindingTime = obligation.scheduledAt - (24 * 60 * 60 * 1000);
                const windowEnd = obligation.scheduledAt + obligation.windowDuration;

                // Already terminal
                if (obligation.status === ObligationStatus.EXECUTED ||
                    obligation.status === ObligationStatus.FAILED) {
                    return obligation.status;
                }

                // Past window end = FAILED
                if (now > windowEnd) {
                    return ObligationStatus.FAILED;
                }

                // Past scheduled time = BOUND
                if (now >= obligation.scheduledAt) {
                    return ObligationStatus.BOUND;
                }

                // Within 24h = BINDING
                if (now >= bindingTime) {
                    return ObligationStatus.BINDING;
                }

                return ObligationStatus.CREATED;
            },

            // Update all obligation statuses and check for locks
            tick: () => {
                const state = get();
                let needsLock = null;
                let hasFailure = false;

                const updatedObligations = state.obligations.map((obl) => {
                    const newStatus = state.resolveObligationStatus(obl);

                    // Check if we need to fail this obligation
                    if (newStatus === ObligationStatus.FAILED && obl.status !== ObligationStatus.FAILED) {
                        hasFailure = true;
                        return { ...obl, status: ObligationStatus.FAILED };
                    }

                    // Check if this obligation needs a lock
                    if (newStatus === ObligationStatus.BOUND && obl.status !== ObligationStatus.EXECUTED) {
                        needsLock = obl;
                    }

                    if (newStatus !== obl.status) {
                        return { ...obl, status: newStatus };
                    }

                    return obl;
                });

                // Apply updates
                set((state) => {
                    const updates = { obligations: updatedObligations };

                    // Create lock if needed
                    if (needsLock && !state.activeLock) {
                        updates.activeLock = {
                            obligationId: needsLock.id,
                            lockedAt: Date.now(),
                            escapeAttempts: 0,
                        };
                        console.log('[FORGEBORN] LOCK ACTIVATED:', needsLock.name);
                    }

                    // Handle failure
                    if (hasFailure) {
                        updates.failureCount = state.failureCount + 1;
                        updates.debtUnits = state.debtUnits + state.failureCount;
                        console.log('[FORGEBORN] FAILURE LOGGED. Debt:', updates.debtUnits);
                    }

                    return updates;
                });
            },

            // Get current locked obligation
            getLockedObligation: () => {
                const state = get();
                if (!state.activeLock) return null;
                return state.obligations.find(o => o.id === state.activeLock.obligationId);
            },

            // Log execution progress
            logExecution: (obligationId, units) => {
                set((state) => {
                    const obligations = state.obligations.map((obl) => {
                        if (obl.id !== obligationId) return obl;

                        const newCompleted = obl.unitsCompleted + units;
                        const isComplete = newCompleted >= obl.unitsRequired;

                        console.log(`[FORGEBORN] Execution logged: ${newCompleted}/${obl.unitsRequired}`);

                        return {
                            ...obl,
                            unitsCompleted: newCompleted,
                            status: isComplete ? ObligationStatus.EXECUTED : obl.status,
                        };
                    });

                    // Check if we should release lock
                    const updatedObl = obligations.find(o => o.id === obligationId);
                    let activeLock = state.activeLock;

                    if (updatedObl && updatedObl.status === ObligationStatus.EXECUTED) {
                        console.log('[FORGEBORN] LOCK RELEASED. Execution complete.');
                        activeLock = null;

                        // Log to execution history
                        state.executionLog.push({
                            obligationId,
                            completedAt: Date.now(),
                            unitsCompleted: updatedObl.unitsCompleted,
                        });
                    }

                    return { obligations, activeLock };
                });
            },

            // Log escape attempt
            logEscapeAttempt: () => {
                set((state) => {
                    if (!state.activeLock) return state;

                    console.log('[FORGEBORN] ESCAPE ATTEMPT LOGGED');
                    return {
                        activeLock: {
                            ...state.activeLock,
                            escapeAttempts: state.activeLock.escapeAttempts + 1,
                        },
                    };
                });
            },

            // Check if system is locked
            isLocked: () => {
                return get().activeLock !== null;
            },

            // Get pending obligations (not executed, not failed)
            getPendingObligations: () => {
                const state = get();
                return state.obligations.filter(
                    o => o.status !== ObligationStatus.EXECUTED && o.status !== ObligationStatus.FAILED
                );
            },

            // Get next obligation
            getNextObligation: () => {
                const pending = get().getPendingObligations();
                if (pending.length === 0) return null;

                return pending.sort((a, b) => a.scheduledAt - b.scheduledAt)[0];
            },

            // Delete obligation (only if CREATED status)
            deleteObligation: (obligationId) => {
                const state = get();
                const obl = state.obligations.find(o => o.id === obligationId);

                if (!obl) return false;
                if (obl.status !== ObligationStatus.CREATED) {
                    console.log('[FORGEBORN] CANNOT DELETE: Obligation is locked');
                    return false;
                }

                set((state) => ({
                    obligations: state.obligations.filter(o => o.id !== obligationId),
                }));

                return true;
            },

            // DEV ONLY
            __devClearAll: () => {
                set({
                    obligations: [],
                    activeLock: null,
                    debtUnits: 0,
                    failureCount: 0,
                    executionLog: [],
                });
                console.log('[FORGEBORN] DEV: All data cleared');
            },
        }),
        {
            name: 'forgeborn-obligations',
            storage,
        }
    )
);

export default useObligationStore;
