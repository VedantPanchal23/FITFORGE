/**
 * Profile Model
 * Data model for user profile with validation and defaults
 */

const { VALIDATION_RANGES, DIET_TYPES } = require('../utils/constants');

/**
 * Default profile values
 */
const DEFAULT_PROFILE = {
    // Demographics
    gender: null,
    age: null,
    height_cm: null,
    weight_kg: null,

    // Unit preferences (NEW - V3)
    weight_unit: 'kg',        // 'kg' | 'lbs'
    height_unit: 'cm',        // 'cm' | 'ft'

    // Body composition
    body_fat_percent: null,
    muscle_mass_estimate: 'average',

    // Goals
    goal_type: 'health',
    target_weight_kg: null,
    target_weeks: null,
    goal_start_date: null,
    goal_start_weight: null,  // NEW - Track starting weight for progress
    goal_history: [],         // NEW - V3: Array of past goals [{type, start, end, result}]

    // Diet
    diet_type: 'nonveg',
    food_exclusions: [],
    supplements: [],
    favorite_foods: [],       // NEW - For meal prioritization

    // Allergies vs Intolerances (NEW - V3)
    food_allergies: [],       // FATAL - completely block these foods
    food_intolerances: [],    // WARN - allow with warning

    // Health conditions
    health_conditions: [],

    // Lifestyle
    sleep_hours_avg: 7,
    stress_level: 'medium',
    digestion_quality: 'average',
    energy_level: 'medium',
    activity_level: 'sedentary',
    job_type: 'desk_job_office',
    daily_steps: 0,

    // Fasting/Religious (NEW - V3)
    fasting_mode: 'none',     // 'none', 'intermittent_16_8', 'intermittent_18_6', 'ramadan', 'ekadashi'
    fasting_eating_window: null, // e.g., { start: '12:00', end: '20:00' }

    // Female-specific
    tracks_menstrual_cycle: false,
    cycle_length: 28,
    last_period_date: null,

    // Workout
    experience_level: 'beginner',
    injuries: [],
    equipment: [],
    preferred_workout_duration: 45,

    // Looksmaxing
    skin_type: 'normal',
    skin_concerns: [],
    hair_concerns: [],
    facial_goals: [],

    // Photos
    face_photo_path: null,
    body_photo_path: null,

    // Mode flags
    travel_mode: false,

    // Medications (NEW - V3)
    medications: [],          // [{name, timing, affects_fasting}]
    medication_notes: null,

    // Calculated (set by engines)
    bmr: null,
    tdee: null,
    target_calories: null,
    protein_grams: null,
    carbs_grams: null,
    fats_grams: null,
    flex_calories_remaining: 500,

    // Timezone (NEW - V3)
    timezone: 'Asia/Kolkata'
};

/**
 * Create a new profile with validation
 * 
 * @param {Object} data - Profile data
 * @returns {Object} Validated profile object
 */
function createProfile(data) {
    const profile = { ...DEFAULT_PROFILE, ...data };

    // Ensure arrays are arrays
    if (typeof profile.food_exclusions === 'string') {
        profile.food_exclusions = JSON.parse(profile.food_exclusions || '[]');
    }
    if (typeof profile.injuries === 'string') {
        profile.injuries = JSON.parse(profile.injuries || '[]');
    }
    if (typeof profile.skin_concerns === 'string') {
        profile.skin_concerns = JSON.parse(profile.skin_concerns || '[]');
    }
    if (typeof profile.hair_concerns === 'string') {
        profile.hair_concerns = JSON.parse(profile.hair_concerns || '[]');
    }
    if (typeof profile.facial_goals === 'string') {
        profile.facial_goals = JSON.parse(profile.facial_goals || '[]');
    }

    return profile;
}

/**
 * Validate profile data
 * 
 * @param {Object} profile - Profile to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateProfile(profile) {
    const errors = [];

    // Required fields
    if (!profile.gender || !['male', 'female'].includes(profile.gender)) {
        errors.push('Gender must be "male" or "female"');
    }

    if (!profile.age || profile.age < VALIDATION_RANGES.age.min || profile.age > VALIDATION_RANGES.age.max) {
        errors.push(`Age must be between ${VALIDATION_RANGES.age.min} and ${VALIDATION_RANGES.age.max}`);
    }

    if (!profile.height_cm || profile.height_cm < VALIDATION_RANGES.height_cm.min || profile.height_cm > VALIDATION_RANGES.height_cm.max) {
        errors.push(`Height must be between ${VALIDATION_RANGES.height_cm.min} and ${VALIDATION_RANGES.height_cm.max} cm`);
    }

    if (!profile.weight_kg || profile.weight_kg < VALIDATION_RANGES.weight_kg.min || profile.weight_kg > VALIDATION_RANGES.weight_kg.max) {
        errors.push(`Weight must be between ${VALIDATION_RANGES.weight_kg.min} and ${VALIDATION_RANGES.weight_kg.max} kg`);
    }

    // Goal type validation
    const validGoalTypes = ['fat_loss', 'muscle_gain', 'recomp', 'health'];
    if (!profile.goal_type || !validGoalTypes.includes(profile.goal_type)) {
        errors.push(`Goal type must be one of: ${validGoalTypes.join(', ')}`);
    }

    // Diet type validation
    const validDietTypes = Object.keys(DIET_TYPES);
    if (!profile.diet_type || !validDietTypes.includes(profile.diet_type)) {
        errors.push(`Diet type must be one of: ${validDietTypes.join(', ')}`);
    }

    // Experience level validation
    const validExperienceLevels = ['beginner', 'intermediate', 'advanced'];
    if (!profile.experience_level || !validExperienceLevels.includes(profile.experience_level)) {
        errors.push(`Experience level must be one of: ${validExperienceLevels.join(', ')}`);
    }

    // Activity level validation
    const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    if (profile.activity_level && !validActivityLevels.includes(profile.activity_level)) {
        errors.push(`Activity level must be one of: ${validActivityLevels.join(', ')}`);
    }

    // Optional field validation
    if (profile.body_fat_percent !== null) {
        if (profile.body_fat_percent < VALIDATION_RANGES.body_fat_percent.min ||
            profile.body_fat_percent > VALIDATION_RANGES.body_fat_percent.max) {
            errors.push(`Body fat must be between ${VALIDATION_RANGES.body_fat_percent.min}% and ${VALIDATION_RANGES.body_fat_percent.max}%`);
        }
    }

    if (profile.target_weeks !== null) {
        if (profile.target_weeks < VALIDATION_RANGES.target_weeks.min ||
            profile.target_weeks > VALIDATION_RANGES.target_weeks.max) {
            errors.push(`Target timeline must be between ${VALIDATION_RANGES.target_weeks.min} and ${VALIDATION_RANGES.target_weeks.max} weeks`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Get required fields that are missing
 * 
 * @param {Object} profile - Profile to check
 * @returns {string[]} List of missing required fields
 */
function getMissingRequiredFields(profile) {
    const required = ['gender', 'age', 'height_cm', 'weight_kg', 'goal_type', 'diet_type', 'experience_level'];
    return required.filter(field => profile[field] === null || profile[field] === undefined);
}

/**
 * Check if profile is complete enough for plan generation
 * 
 * @param {Object} profile - Profile to check
 * @returns {Object} { complete: boolean, missing: string[] }
 */
function isProfileComplete(profile) {
    const missing = getMissingRequiredFields(profile);
    return {
        complete: missing.length === 0,
        missing
    };
}

/**
 * Serialize profile for database storage
 * 
 * @param {Object} profile - Profile object
 * @returns {Object} Profile with arrays serialized to JSON strings
 */
function serializeProfile(profile) {
    return {
        ...profile,
        food_exclusions: JSON.stringify(profile.food_exclusions || []),
        injuries: JSON.stringify(profile.injuries || []),
        skin_concerns: JSON.stringify(profile.skin_concerns || []),
        hair_concerns: JSON.stringify(profile.hair_concerns || []),
        facial_goals: JSON.stringify(profile.facial_goals || [])
    };
}

/**
 * Deserialize profile from database
 * 
 * @param {Object} row - Database row
 * @returns {Object} Profile with arrays parsed
 */
function deserializeProfile(row) {
    if (!row) return null;

    return {
        ...row,
        food_exclusions: JSON.parse(row.food_exclusions || '[]'),
        injuries: JSON.parse(row.injuries || '[]'),
        skin_concerns: JSON.parse(row.skin_concerns || '[]'),
        hair_concerns: JSON.parse(row.hair_concerns || '[]'),
        facial_goals: JSON.parse(row.facial_goals || '[]')
    };
}

/**
 * Get a summary of the profile for display
 * 
 * @param {Object} profile - Profile object
 * @returns {Object} Summary object
 */
function getProfileSummary(profile) {
    return {
        demographics: {
            gender: profile.gender,
            age: profile.age,
            height: `${profile.height_cm} cm`,
            weight: `${profile.weight_kg} kg`
        },
        goals: {
            type: profile.goal_type,
            target: profile.target_weight_kg ? `${profile.target_weight_kg} kg` : 'Not set',
            timeline: profile.target_weeks ? `${profile.target_weeks} weeks` : 'Not set'
        },
        diet: {
            type: profile.diet_type,
            exclusions: profile.food_exclusions
        },
        fitness: {
            level: profile.experience_level,
            activity: profile.activity_level,
            injuries: profile.injuries
        },
        targets: profile.target_calories ? {
            calories: `${profile.target_calories} kcal`,
            protein: `${profile.protein_grams}g`,
            carbs: `${profile.carbs_grams}g`,
            fats: `${profile.fats_grams}g`
        } : null
    };
}

module.exports = {
    DEFAULT_PROFILE,
    createProfile,
    validateProfile,
    getMissingRequiredFields,
    isProfileComplete,
    serializeProfile,
    deserializeProfile,
    getProfileSummary
};
