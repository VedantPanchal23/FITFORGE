/**
 * FORGEBORN — USER PROFILE STORE
 * 
 * Stores all user data collected from onboarding.
 * This data drives the workout engine and nutrition engine.
 * 
 * Persisted permanently — user fills this ONCE, then the system owns them.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);

// Goals
export const FitnessGoal = {
  FULL_BODY: 'FULL_BODY',
  CALISTHENICS: 'CALISTHENICS',
  UPPER_BODY: 'UPPER_BODY',
  LOWER_BODY: 'LOWER_BODY',
  BACK_FOCUSED: 'BACK_FOCUSED',
  ARM_FOCUSED: 'ARM_FOCUSED',
  CORE_ABS: 'CORE_ABS',
  WEIGHT_LOSS: 'WEIGHT_LOSS',
  MUSCLE_GAIN: 'MUSCLE_GAIN',
  STRENGTH: 'STRENGTH',
};

// Experience
export const ExperienceLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  BEAST: 'BEAST',
};

// Gender
export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

// Diet preference
export const DietPreference = {
  NO_PREFERENCE: 'NO_PREFERENCE',
  VEGETARIAN: 'VEGETARIAN',
  NON_VEG: 'NON_VEG',
  VEGAN: 'VEGAN',
  KETO: 'KETO',
};

// Cardio types
export const CardioType = {
  RUNNING: 'RUNNING',
  CYCLING: 'CYCLING',
  SWIMMING: 'SWIMMING',
  JUMP_ROPE: 'JUMP_ROPE',
  WALKING: 'WALKING',
  HIIT: 'HIIT',
};

// Injury areas
export const InjuryArea = {
  NONE: 'NONE',
  SHOULDER: 'SHOULDER',
  KNEE: 'KNEE',
  LOWER_BACK: 'LOWER_BACK',
  WRIST: 'WRIST',
  ANKLE: 'ANKLE',
};

export const useUserStore = create(
  persist(
    (set, get) => ({
      // Profile state
      hasCompletedOnboarding: false,
      profile: {
        // Basic info
        name: '',
        gender: null,
        age: null,
        weight: null,      // in kg
        height: null,      // in cm

        // Fitness goals
        fitnessGoal: [],             // ARRAY — multi-select
        experienceLevel: null,
        trainingDaysPerWeek: 5,

        // Preferences
        wantsCardio: false,
        cardioTypes: [],              // ARRAY — multi-select
        wantsYoga: false,
        injuries: [InjuryArea.NONE],

        // Nutrition
        dietPreference: null,
        mealsPerDay: 4,
      },

      // Actions
      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      completeOnboarding: () => {
        const { profile } = get();
        console.log('[FORGEBORN] Onboarding complete:', profile.name);
        set({ hasCompletedOnboarding: true });
      },

      // Computed values
      getBMI: () => {
        const { profile } = get();
        if (!profile.weight || !profile.height) return null;
        const heightM = profile.height / 100;
        return Math.round((profile.weight / (heightM * heightM)) * 10) / 10;
      },

      // DEV ONLY
      __devReset: () => {
        set({
          hasCompletedOnboarding: false,
          profile: {
            name: '',
            gender: null,
            age: null,
            weight: null,
            height: null,
            fitnessGoal: [],
            experienceLevel: null,
            trainingDaysPerWeek: 5,
            wantsCardio: false,
            cardioTypes: [],
            wantsYoga: false,
            injuries: [InjuryArea.NONE],
            dietPreference: null,
            mealsPerDay: 4,
          },
        });
      },
    }),
    {
      name: 'forgeborn-user',
      storage,
    }
  )
);

export default useUserStore;
