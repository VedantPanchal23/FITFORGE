/**
 * FORGEBORN — COMMITMENT STORE
 * 
 * Manages the user's permanent commitment state.
 * Once committed, there is no going back.
 * 
 * Uses MMKV for persistence that survives everything.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage adapter (will switch to MMKV in bare workflow)
const storage = createJSONStorage(() => AsyncStorage);

export const useCommitmentStore = create(
    persist(
        (set, get) => ({
            // State
            hasCommitted: false,
            commitmentTimestamp: null,
            creedAccepted: false,

            // Actions
            commit: () => {
                const timestamp = Date.now();
                set({
                    hasCommitted: true,
                    commitmentTimestamp: timestamp,
                    creedAccepted: true,
                });
                console.log('[FORGEBORN] Commitment sealed:', new Date(timestamp).toISOString());
            },

            // Query
            getCommitmentDate: () => {
                const state = get();
                return state.commitmentTimestamp
                    ? new Date(state.commitmentTimestamp)
                    : null;
            },

            getDaysSinceCommitment: () => {
                const state = get();
                if (!state.commitmentTimestamp) return 0;

                const now = Date.now();
                const diff = now - state.commitmentTimestamp;
                return Math.floor(diff / (24 * 60 * 60 * 1000));
            },

            // DEV ONLY - Remove in production
            __devReset: () => {
                set({
                    hasCommitted: false,
                    commitmentTimestamp: null,
                    creedAccepted: false,
                });
                console.log('[FORGEBORN] DEV: Commitment reset');
            },
        }),
        {
            name: 'forgeborn-commitment',
            storage,
        }
    )
);

export default useCommitmentStore;
