/**
 * PFT Constants
 * Central source of truth for all magic numbers and configuration values
 */

// =============================================================================
// BODY CALCULATIONS
// =============================================================================

/**
 * Activity level multipliers for TDEE calculation
 * Based on Harris-Benedict activity factors
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Little or no exercise, desk job
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Heavy exercise 6-7 days/week
  very_active: 1.9     // Very heavy exercise, physical job
};

/**
 * Safety limits for calorie adjustments
 */
const CALORIE_LIMITS = {
  minMale: 1500,           // Never go below this for males
  minFemale: 1200,         // Never go below this for females
  maxDeficit: 500,         // Maximum daily deficit
  maxSurplus: 300,         // Maximum daily surplus for lean gains
  maxSurplusAggressive: 500 // For hard gainers only
};

/**
 * Safe weight change rates (kg per week)
 */
const WEIGHT_CHANGE_LIMITS = {
  male: {
    maxLoss: 0.75,
    maxGain: 0.35
  },
  female: {
    maxLoss: 0.5,
    maxGain: 0.25
  }
};

// =============================================================================
// NUTRITION
// =============================================================================

/**
 * Macro ratios per goal (grams per kg of body weight)
 */
const MACRO_RATIOS = {
  fat_loss: {
    protein: { min: 2.0, max: 2.2 },
    carbs: { min: 2.0, max: 3.0 },
    fats: { min: 0.8, max: 1.0 }
  },
  muscle_gain: {
    protein: { min: 1.8, max: 2.0 },
    carbs: { min: 4.0, max: 5.0 },
    fats: { min: 1.0, max: 1.2 }
  },
  recomp: {
    protein: { min: 2.0, max: 2.2 },
    carbs: { min: 2.5, max: 3.5 },
    fats: { min: 0.9, max: 1.0 }
  },
  health: {
    protein: { min: 1.6, max: 1.8 },
    carbs: { min: 3.0, max: 4.0 },
    fats: { min: 0.9, max: 1.1 }
  }
};

/**
 * Caloric values per gram
 */
const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
  fiber: 2,
  alcohol: 7
};

/**
 * Jain dietary restrictions (HARD RULES - NEVER override)
 */
const JAIN_FORBIDDEN_FOODS = [
  // Root vegetables (underground)
  'potato', 'onion', 'garlic', 'ginger', 'turmeric_root',
  'carrot', 'radish', 'beetroot', 'sweet_potato', 'turnip',
  'yam', 'tapioca', 'colocasia', 'elephant_foot_yam',

  // Underground nuts/legumes
  'peanut', 'groundnut',

  // Other restrictions
  'mushroom',  // Grows in unclean places

  // Fermented items (some restrictions)
  // Note: Not all fermented items are forbidden, handled separately
];

/**
 * Jain timing restrictions
 */
const JAIN_TIMING_RULES = {
  noFoodAfterSunset: true,
  noStaleFood: true,
  noOvernightFood: true,
  filterWater: true
};

/**
 * Diet type definitions
 */
const DIET_TYPES = {
  veg: {
    allowsMeat: false,
    allowsFish: false,
    allowsEggs: false,
    allowsDairy: true,
    jainRules: false
  },
  nonveg: {
    allowsMeat: true,
    allowsFish: true,
    allowsEggs: true,
    allowsDairy: true,
    jainRules: false
  },
  veg_egg: {
    allowsMeat: false,
    allowsFish: false,
    allowsEggs: true,
    allowsDairy: true,
    jainRules: false
  },
  jain: {
    allowsMeat: false,
    allowsFish: false,
    allowsEggs: false,
    allowsDairy: true,
    jainRules: true
  }
};

/**
 * Meal timing recommendations
 */
const MEAL_TIMING = {
  breakfast: { idealHour: 8, windowStart: 6, windowEnd: 10 },
  lunch: { idealHour: 13, windowStart: 12, windowEnd: 14 },
  snack: { idealHour: 16, windowStart: 15, windowEnd: 17 },
  dinner: { idealHour: 19, windowStart: 18, windowEnd: 21 },
  preworkout: { minutesBefore: 60 },
  postworkout: { minutesAfter: 30 }
};

// =============================================================================
// WORKOUT
// =============================================================================

/**
 * Weekly split configurations by experience level
 */
const WORKOUT_SPLITS = {
  beginner: {
    daysPerWeek: 3,
    structure: 'full_body',
    restDays: 4,
    pattern: ['full_body', 'rest', 'full_body', 'rest', 'full_body', 'rest', 'rest']
  },
  intermediate: {
    daysPerWeek: 4,
    structure: 'upper_lower',
    restDays: 3,
    pattern: ['upper', 'lower', 'rest', 'upper', 'lower', 'rest', 'rest']
  },
  advanced: {
    daysPerWeek: 6,
    structure: 'push_pull_legs',
    restDays: 1,
    pattern: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'rest']
  }
};

/**
 * Rep ranges by training goal
 */
const REP_RANGES = {
  strength: { min: 3, max: 6 },
  hypertrophy: { min: 8, max: 12 },
  endurance: { min: 15, max: 25 },
  power: { min: 1, max: 3 }
};

/**
 * Rest periods between sets (seconds)
 */
const REST_PERIODS = {
  strength: { min: 180, max: 300 },
  hypertrophy: { min: 60, max: 90 },
  endurance: { min: 30, max: 60 }
};

/**
 * Progressive overload methods (in order of preference for bodyweight)
 */
const PROGRESSIVE_OVERLOAD_METHODS = [
  'increase_reps',       // Stay within rep range, add reps
  'decrease_rest',       // Reduce rest time
  'add_pause',           // Add pauses at peak contraction
  'slow_tempo',          // 3-1-3 tempo
  'harder_variation',    // Progress to harder exercise
  'add_sets',            // Increase volume
  'add_isometric_hold'   // Hold at hardest position
];

/**
 * Muscle group recovery times (hours)
 */
const RECOVERY_TIMES = {
  small: 24,   // Biceps, triceps, calves, forearms
  medium: 48,  // Shoulders, abs, traps
  large: 72    // Chest, back, quads, hamstrings, glutes
};

// =============================================================================
// LOOKSMAXING
// =============================================================================

/**
 * Mewing protocol by level
 */
const MEWING_PROTOCOLS = {
  beginner: {
    durationMins: 5,
    frequency: 'morning_evening',
    sessionsPerDay: 2,
    cues: [
      'Rest entire tongue on palate',
      'Teeth lightly together or slightly apart',
      'Lips sealed, breathe through nose',
      'Focus on back third of tongue pressing up'
    ],
    warnings: [
      'Do not clench teeth',
      'Stop if you feel pain in jaw or teeth',
      'Maintain relaxed jaw muscles'
    ]
  },
  intermediate: {
    durationMins: 'continuous',
    frequency: 'all_waking_hours',
    sessionsPerDay: 0, // Continuous
    cues: [
      'Hard mewing 5 min sessions',
      'Conscious swallow technique',
      'Chin tucks throughout day'
    ],
    additions: ['chewing_exercises', 'jaw_strengthening']
  },
  advanced: {
    durationMins: 'continuous',
    frequency: 'all_waking_hours',
    sessionsPerDay: 0,
    cues: [
      'Maintain while sleeping (tape if needed)',
      'Hard mewing with resistance',
      'Perfect tongue posture during speech'
    ],
    additions: ['falim_gum', 'mastic_gum', 'sleep_taping']
  }
};

/**
 * Skincare routine steps by skin type
 */
const SKINCARE_ROUTINES = {
  oily: {
    morning: [
      { step: 'Cleanser', type: 'gel/foam', duration_secs: 60 },
      { step: 'Toner', type: 'hydrating/niacinamide', optional: true },
      { step: 'Serum', type: 'niacinamide/vitamin_c', duration_secs: 30 },
      { step: 'Moisturizer', type: 'lightweight/gel', duration_secs: 30 },
      { step: 'Sunscreen', type: 'matte/gel', spf: 30, required: true }
    ],
    evening: [
      { step: 'Oil Cleanser', type: 'cleansing_oil/balm', duration_secs: 60 },
      { step: 'Water Cleanser', type: 'gel/foam', duration_secs: 60 },
      { step: 'Exfoliant', type: 'bha/salicylic', frequency: 'every_2_days' },
      { step: 'Serum', type: 'retinol/niacinamide', duration_secs: 30 },
      { step: 'Moisturizer', type: 'lightweight', duration_secs: 30 }
    ]
  },
  dry: {
    morning: [
      { step: 'Cleanser', type: 'cream/milk', duration_secs: 60 },
      { step: 'Toner', type: 'hydrating', optional: false },
      { step: 'Serum', type: 'hyaluronic_acid', duration_secs: 30 },
      { step: 'Moisturizer', type: 'rich/cream', duration_secs: 30 },
      { step: 'Sunscreen', type: 'moisturizing', spf: 30, required: true }
    ],
    evening: [
      { step: 'Cleanser', type: 'cream/oil', duration_secs: 60 },
      { step: 'Toner', type: 'hydrating', duration_secs: 30 },
      { step: 'Serum', type: 'ceramides/peptides', duration_secs: 30 },
      { step: 'Face Oil', type: 'rosehip/argan', optional: true },
      { step: 'Night Cream', type: 'rich/occlusive', duration_secs: 30 }
    ]
  },
  combination: {
    morning: [
      { step: 'Cleanser', type: 'gentle_gel', duration_secs: 60 },
      { step: 'Toner', type: 'balancing', optional: true },
      { step: 'Serum', type: 'niacinamide', duration_secs: 30 },
      { step: 'Moisturizer', type: 'lightweight', duration_secs: 30 },
      { step: 'Sunscreen', type: 'universal', spf: 30, required: true }
    ],
    evening: [
      { step: 'Cleanser', type: 'gentle_gel', duration_secs: 60 },
      { step: 'Exfoliant', type: 'aha_bha', frequency: 'every_3_days' },
      { step: 'Serum', type: 'targeted', duration_secs: 30 },
      { step: 'Moisturizer', type: 'balanced', duration_secs: 30 }
    ]
  },
  normal: {
    morning: [
      { step: 'Cleanser', type: 'gentle', duration_secs: 60 },
      { step: 'Serum', type: 'antioxidant', duration_secs: 30 },
      { step: 'Moisturizer', type: 'light_to_medium', duration_secs: 30 },
      { step: 'Sunscreen', type: 'any', spf: 30, required: true }
    ],
    evening: [
      { step: 'Cleanser', type: 'gentle', duration_secs: 60 },
      { step: 'Serum', type: 'retinol/peptides', duration_secs: 30 },
      { step: 'Moisturizer', type: 'nourishing', duration_secs: 30 }
    ]
  }
};

/**
 * Facial exercise categories
 */
const FACIAL_EXERCISE_TYPES = {
  jawline: ['chin_lifts', 'jaw_clenches', 'neck_curls', 'tongue_press'],
  cheekbones: ['cheek_lifts', 'fish_face', 'cheek_puff'],
  eyes: ['eye_circles', 'brow_lifts', 'eye_squeeze'],
  forehead: ['forehead_smooth', 'eyebrow_raise'],
  lips: ['lip_pull', 'smile_stretch']
};

// =============================================================================
// ADAPTATION ENGINE
// =============================================================================

/**
 * Adaptation priority order (higher = more important)
 */
const ADAPTATION_PRIORITIES = {
  recovery: 5,
  health: 4,
  performance: 3,
  aesthetics: 2,
  looksmaxing: 1
};

/**
 * Adjustment limits per cycle
 */
const ADJUSTMENT_LIMITS = {
  caloriesPerDay: 50,      // Max +/- per day
  caloriesPerWeek: 200,    // Max +/- per week
  volumeReductionMax: 0.3, // Max 30% volume reduction
  minProtein: 1.4,         // Never go below 1.4g/kg
  minRestDays: 2           // Always at least 2 rest days/week
};

/**
 * Trigger thresholds for adaptations
 */
const ADAPTATION_TRIGGERS = {
  // Weight stall detection
  weightStallDays: 7,
  weightStallThreshold: 0.2,  // kg - less than this change = stall

  // Fatigue detection
  lowEnergyThreshold: 3,      // Energy level 1-5, below this is concerning
  lowEnergyConsecutiveDays: 3,

  // Compliance thresholds
  lowProteinCompliance: 80,   // Below 80% triggers adjustment
  lowWorkoutCompliance: 2,    // Consecutive skips

  // Recovery indicators
  highSorenessLevel: 4,       // 1-5 scale
  poorSleepQuality: 2         // 1-5 scale
};

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Input validation ranges
 */
const VALIDATION_RANGES = {
  age: { min: 18, max: 100 },
  height_cm: { min: 100, max: 250 },
  weight_kg: { min: 30, max: 300 },
  body_fat_percent: { min: 3, max: 60 },
  target_weeks: { min: 4, max: 104 },  // 1 month to 2 years
  sleep_hours: { min: 3, max: 14 }
};

/**
 * Warning thresholds for goals
 */
const GOAL_WARNINGS = {
  aggressiveFatLoss: {
    weeklyLossKg: 1.0,  // More than this triggers warning
    message: 'This rate of weight loss may be unsustainable and unhealthy.'
  },
  lowBodyFat: {
    male: 6,
    female: 14,
    message: 'Targeting body fat this low may have health consequences.'
  },
  underweight: {
    maleBMI: 18.5,
    femaleBMI: 18.5,
    message: 'This target weight would put you in the underweight category.'
  }
};

// =============================================================================
// FEMALE CYCLE (NEW)
// =============================================================================

/**
 * Female menstrual cycle phases with TDEE adjustments
 */
const FEMALE_CYCLE_PHASES = {
  menstrual: {
    dayRange: [1, 5],
    tdeeAdjust: 0,
    cravingsNormal: true,
    notes: 'Lower energy is normal, lighter workouts OK'
  },
  follicular: {
    dayRange: [6, 14],
    tdeeAdjust: 0,
    cravingsNormal: false,
    notes: 'Best phase for intense training and PRs'
  },
  ovulation: {
    dayRange: [14, 16],
    tdeeAdjust: 50,
    cravingsNormal: false,
    notes: 'Peak performance, slightly higher metabolism'
  },
  luteal: {
    dayRange: [17, 28],
    tdeeAdjust: 100,
    cravingsNormal: true,
    waterRetention: true,
    notes: 'Higher hunger and cravings are NORMAL, water retention expected'
  }
};

// =============================================================================
// HEALTH CONDITIONS & INTOLERANCES (NEW)
// =============================================================================

/**
 * Common health conditions that affect nutrition/exercise
 */
const HEALTH_CONDITIONS = {
  lactose_intolerance: {
    avoid: ['milk_full', 'milk_toned', 'milk_skimmed', 'cheese_processed', 'ice_cream'],
    alternatives: ['lactose_free_milk', 'curd', 'greek_yogurt', 'paneer', 'almond_milk', 'soy_milk'],
    notes: 'Fermented dairy (curd, yogurt) often tolerated'
  },
  gluten_intolerance: {
    avoid: ['roti_wheat', 'bread_white', 'bread_brown', 'pasta', 'oats', 'daliya'],
    alternatives: ['rice_white', 'rice_brown', 'millet_bajra_roti', 'millet_jowar_roti', 'millet_ragi_roti', 'quinoa'],
    notes: 'All wheat, barley, rye products must be avoided'
  },
  diabetes_type2: {
    avoid_high_gi: true,
    prefer: ['brown_rice', 'oats', 'dal_chana', 'vegetables', 'proteins'],
    notes: 'Focus on low GI foods, avoid sugar spikes'
  },
  pcos: {
    notes: 'Lower carb, higher protein beneficial. Strength training recommended.',
    carb_reduction: 0.2
  },
  thyroid_hypothyroid: {
    notes: 'Metabolism may be 10-15% lower than calculated. Adjust TDEE down.',
    tdee_adjustment: -0.12
  },
  ibs: {
    avoid: ['high_fiber_raw', 'legumes_excess', 'dairy_excess'],
    notes: 'Individual trigger foods vary. Keep food diary.'
  }
};

// =============================================================================
// PLATEAU & ADAPTATION (NEW)
// =============================================================================

/**
 * Plateau detection and response
 */
const PLATEAU_THRESHOLDS = {
  daysToDetect: 14,       // Weight stable for 14 days = plateau
  actionRequired: 21,     // 21 days = must intervene
  refeedTrigger: 28,      // 28 days = suggest refeed/diet break
  maxConsecutiveDeficit: 12 // weeks - then suggest diet break
};

/**
 * Refeed and diet break protocols
 */
const REFEED_PROTOCOLS = {
  refeed_day: {
    calorie_increase: 500,
    carb_focus: true,
    frequency: 'weekly_if_plateau',
    notes: 'One day at maintenance, high carb'
  },
  diet_break: {
    duration_days: 7,
    calories: 'maintenance',
    frequency: 'every_12_weeks',
    notes: 'Full week at maintenance to reset hormones'
  }
};

/**
 * Compliance levels and responses
 */
const COMPLIANCE_THRESHOLDS = {
  excellent: { min: 90, action: 'maintain_plan' },
  good: { min: 75, action: 'maintain_plan' },
  acceptable: { min: 60, action: 'simplify_plan' },
  struggling: { min: 40, action: 'major_simplification' },
  failing: { min: 0, action: 'restart_onboarding' }
};

/**
 * Deload week configuration
 */
const DELOAD_CONFIG = {
  frequency_weeks: 4,     // Every 4 weeks for beginners, 6 for advanced
  volume_reduction: 0.5,  // 50% volume
  intensity_reduction: 0.1, // 10% intensity
  duration_days: 7
};

// =============================================================================
// TRAVEL MODE (NEW)
// =============================================================================

const TRAVEL_MODE = {
  simplified_meals: true,
  bodyweight_only: true,
  volume_reduction: 0.7,
  flexible_timing: true,
  notes: 'Maintenance calories, basic protein target only'
};

// =============================================================================
// EQUIPMENT OPTIONS (NEW)
// =============================================================================

const EQUIPMENT_TYPES = {
  none: { name: 'No Equipment', exercises: 'bodyweight_only' },
  resistance_bands: { name: 'Resistance Bands', adds: ['band_exercises'] },
  pull_up_bar: { name: 'Pull-up Bar', adds: ['pull_ups', 'chin_ups', 'hanging_exercises'] },
  dumbbells: { name: 'Dumbbells', adds: ['dumbbell_exercises'] },
  kettlebell: { name: 'Kettlebell', adds: ['kettlebell_exercises'] },
  yoga_mat: { name: 'Yoga Mat', adds: ['floor_exercises', 'yoga'] }
};

// =============================================================================
// CHEAT MEAL / FLEX CALORIES (NEW)
// =============================================================================

const FLEX_CALORIES_CONFIG = {
  weekly_flex: 500,       // Extra calories per week to allocate freely
  max_single_day: 300,    // Max flex calories in one day
  rebalance_next_day: true,
  notes: 'Better to plan treats than feel guilty'
};

// =============================================================================
// FASTING MODES (NEW - V3)
// =============================================================================

const FASTING_MODES = {
  none: {
    name: 'No Fasting',
    eating_window: null,
    meal_count: 3
  },
  intermittent_16_8: {
    name: 'Intermittent 16:8',
    fasting_hours: 16,
    eating_window: { start: '12:00', end: '20:00' },
    meal_count: 2,
    notes: 'Skip breakfast, eat lunch and dinner'
  },
  intermittent_18_6: {
    name: 'Intermittent 18:6',
    fasting_hours: 18,
    eating_window: { start: '14:00', end: '20:00' },
    meal_count: 2,
    notes: 'Late lunch and early dinner'
  },
  ramadan: {
    name: 'Ramadan Fast',
    eating_window: { start: 'sunset', end: 'sunrise' },
    meal_count: 2,
    notes: 'Suhoor before dawn, Iftar after sunset. Adjust workout timing.',
    hydration_priority: true,
    workout_timing: 'before_iftar'
  },
  ekadashi: {
    name: 'Ekadashi Fast',
    eating_window: null,
    full_fast: true,
    frequency: 'twice_monthly',
    notes: 'Hindu fasting day - grains avoided or full water fast'
  },
  navratri: {
    name: 'Navratri Fast',
    duration_days: 9,
    allowed: ['fruits', 'milk', 'curd', 'potatoes', 'sabudana'],
    restricted: ['grains', 'onion', 'garlic', 'meat'],
    notes: 'Special Navratri foods allowed'
  }
};

// =============================================================================
// UNIT CONVERSIONS (NEW - V3)
// =============================================================================

const UNIT_CONVERSIONS = {
  kg_to_lbs: 2.20462,
  lbs_to_kg: 0.453592,
  cm_to_inches: 0.393701,
  inches_to_cm: 2.54,
  cm_to_feet_inches: (cm) => {
    const totalInches = cm * 0.393701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  },
  feet_inches_to_cm: (feet, inches) => {
    return (feet * 12 + inches) * 2.54;
  }
};

// =============================================================================
// SPECIAL OCCASIONS (NEW - V3)
// =============================================================================

const SPECIAL_OCCASIONS = {
  diwali: {
    name: 'Diwali',
    typical_excess_calories: 1000,
    duration_days: 5,
    advice: 'Enjoy mindfully. One meal of sweets is fine. Protein with sweets helps.'
  },
  holi: {
    name: 'Holi',
    typical_excess_calories: 500,
    advice: 'Drink plenty of water. Avoid fried snacks if possible.'
  },
  eid: {
    name: 'Eid',
    typical_excess_calories: 800,
    advice: 'Balance rich food with salads. Small portions of everything.'
  },
  christmas: {
    name: 'Christmas',
    typical_excess_calories: 700,
    advice: 'Enjoy the celebration. Resume normal eating next day.'
  },
  wedding: {
    name: 'Wedding/Party',
    typical_excess_calories: 1200,
    advice: 'Focus on protein first. Drink water between courses.'
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Body calculations
  ACTIVITY_MULTIPLIERS,
  CALORIE_LIMITS,
  WEIGHT_CHANGE_LIMITS,

  // Nutrition
  MACRO_RATIOS,
  CALORIES_PER_GRAM,
  JAIN_FORBIDDEN_FOODS,
  JAIN_TIMING_RULES,
  DIET_TYPES,
  MEAL_TIMING,

  // Workout
  WORKOUT_SPLITS,
  REP_RANGES,
  REST_PERIODS,
  PROGRESSIVE_OVERLOAD_METHODS,
  RECOVERY_TIMES,

  // Looksmaxing
  MEWING_PROTOCOLS,
  SKINCARE_ROUTINES,
  FACIAL_EXERCISE_TYPES,

  // Adaptation
  ADAPTATION_PRIORITIES,
  ADJUSTMENT_LIMITS,
  ADAPTATION_TRIGGERS,

  // Validation
  VALIDATION_RANGES,
  GOAL_WARNINGS,

  // Female cycle
  FEMALE_CYCLE_PHASES,

  // Health conditions
  HEALTH_CONDITIONS,

  // Plateau handling
  PLATEAU_THRESHOLDS,
  REFEED_PROTOCOLS,
  COMPLIANCE_THRESHOLDS,
  DELOAD_CONFIG,

  // Travel & Equipment
  TRAVEL_MODE,
  EQUIPMENT_TYPES,

  // Flex calories
  FLEX_CALORIES_CONFIG,

  // V3 - Fasting
  FASTING_MODES,

  // V3 - Unit conversions
  UNIT_CONVERSIONS,

  // V3 - Special occasions
  SPECIAL_OCCASIONS
};


