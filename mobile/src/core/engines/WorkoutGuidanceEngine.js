/**
 * Workout Guidance Engine
 * Provides pre/post workout nutrition, hydration, and recovery recommendations
 */

const PRE_WORKOUT_GUIDANCE = {
    timing: {
        meal: { minBefore: 60, maxBefore: 120 }, // 1-2 hours before
        snack: { minBefore: 30, maxBefore: 45 }   // 30-45 min before
    },
    nutrition: {
        focus: 'carbs_and_protein',
        carbsPerKg: 0.5, // g per kg bodyweight
        proteinGrams: 15,
        fatsAvoid: true, // Hard to digest
        fiberAvoid: true  // Can cause discomfort
    },
    examples: {
        veg: [
            'Banana + handful of almonds',
            'Oats with milk (30 mins digestion)',
            'Rice cakes + peanut butter',
            'Idli/Dosa (1-2 pieces)',
            'Poha with peanuts',
            'Upma (small bowl)',
            'Fruit smoothie'
        ],
        nonveg: [
            'Banana + boiled eggs (whites)',
            'Toast with scrambled eggs',
            'Greek yogurt + banana',
            'Chicken sandwich (light)',
            'Egg white omelette + toast'
        ]
    },
    hydration: {
        waterMl: 500, // 2 hours before
        avoidCoffeeIfLate: true,
        electrolytes: false // Not needed pre-workout usually
    },
    avoid: [
        'Heavy meals',
        'High fiber foods',
        'Spicy foods',
        'New foods you haven\'t tried',
        'Too much fat',
        'Carbonated drinks'
    ]
};

const POST_WORKOUT_GUIDANCE = {
    timing: {
        proteinWindow: 45, // minutes after workout
        mealWindow: 120    // full meal within 2 hours
    },
    nutrition: {
        proteinGrams: 25,
        carbsPerKg: 0.5,
        focus: 'protein_then_carbs'
    },
    examples: {
        immediate: [
            'Protein shake with water/milk',
            'Glass of milk + banana',
            'Paneer bhurji (quick)',
            'Greek yogurt with honey',
            'Chocolate milk (great recovery drink)',
            'Boiled eggs + fruit'
        ],
        fullMeal: {
            veg: [
                'Paneer + Rice + Dal',
                'Chole + Roti + Raita',
                'Rajma + Rice + Salad',
                'Tofu stir-fry + Rice',
                'Dahi + Paratha + Sabzi'
            ],
            nonveg: [
                'Chicken breast + Rice + Vegetables',
                'Fish curry + Rice',
                'Egg curry + Roti',
                'Chicken salad + Bread',
                'Grilled fish + Sweet potato'
            ]
        }
    },
    hydration: {
        waterMl: 500,
        electrolyteIf: 'sweated_heavily_or_over_60_mins',
        electrolyteSources: [
            'Coconut water',
            'Nimbu paani with salt',
            'Electral/ORS',
            'Banana (potassium)'
        ]
    },
    recovery: [
        'Get 7-8 hours sleep tonight',
        'Consider a cold shower to reduce inflammation',
        'Light stretching before bed',
        'Avoid alcohol for best recovery',
        'Don\'t skip next meal'
    ]
};

const WORKOUT_SPECIFIC_GUIDANCE = {
    gym: {
        pre: {
            focus: 'Carbs for energy, light protein',
            timing: '45-60 min before',
            caffeine: 'Optional - can improve performance'
        },
        post: {
            focus: 'Protein priority for muscle repair',
            timing: 'Within 30-45 min ideal',
            creatine: 'Good time to take if supplementing'
        }
    },
    cardio: {
        pre: {
            focus: 'Light carbs, avoid heavy food',
            timing: '30-45 min before',
            caffeine: 'Can help endurance'
        },
        post: {
            focus: 'Carbs to replenish, moderate protein',
            timing: 'Within 60 min',
            hydration: 'Critical - replace fluids lost'
        }
    },
    hiit: {
        pre: {
            focus: 'Quick carbs, minimal fat',
            timing: '30 min before (stay light)',
            caffeine: 'Can boost intensity'
        },
        post: {
            focus: 'Protein + carbs for recovery',
            timing: 'Within 30 min',
            note: 'EPOC (afterburn) - stay hydrated'
        }
    },
    yoga: {
        pre: {
            focus: 'Light or empty stomach preferred',
            timing: '2+ hours after meal, or light snack 1 hour before',
            avoid: 'Heavy foods'
        },
        post: {
            focus: 'Rehydrate, light meal if hungry',
            timing: 'No rush, eat when ready',
            note: 'Listen to body'
        }
    },
    mobility: {
        pre: {
            focus: 'No special requirements',
            timing: 'Can do fasted',
            note: 'Stay hydrated'
        },
        post: {
            focus: 'Normal meals fine',
            timing: 'Whenever',
            note: 'Good time for supplements'
        }
    }
};

/**
 * Get pre-workout guidance for a user
 * @param {object} profile - user profile
 * @param {string} workoutTime - planned workout time "HH:MM"
 * @param {string} workoutStyle - type of workout
 * @returns {object} pre-workout recommendations
 */
function getPreWorkoutGuidance(profile, workoutTime, workoutStyle = 'gym') {
    const diet = profile.diet_type === 'nonveg' ? 'nonveg' : 'veg';
    const bodyweight = profile.current_weight || 70;
    const specificGuidance = WORKOUT_SPECIFIC_GUIDANCE[workoutStyle] || WORKOUT_SPECIFIC_GUIDANCE.gym;

    // Calculate optimal eating window
    const workoutMinutes = parseTime(workoutTime);
    const idealMealTime = formatTime(workoutMinutes - 90); // 1.5 hours before
    const latestMealTime = formatTime(workoutMinutes - 60);
    const snackTime = formatTime(workoutMinutes - 30);

    return {
        whatToEat: PRE_WORKOUT_GUIDANCE.examples[diet],
        carbsNeeded: Math.round(bodyweight * PRE_WORKOUT_GUIDANCE.nutrition.carbsPerKg),
        proteinNeeded: PRE_WORKOUT_GUIDANCE.nutrition.proteinGrams,
        when: {
            idealMealTime,
            latestMealTime,
            quickSnackTime: snackTime
        },
        instructions: [
            `Eat ${specificGuidance.pre.timing}`,
            `Focus: ${specificGuidance.pre.focus}`,
            `Drink ${PRE_WORKOUT_GUIDANCE.hydration.waterMl}ml water 2 hours before`
        ],
        avoid: PRE_WORKOUT_GUIDANCE.avoid,
        tips: [
            'If eating less than 30 min before, keep it very light - just a banana',
            specificGuidance.pre.caffeine ? `Caffeine: ${specificGuidance.pre.caffeine}` : null,
            'Don\'t try new foods on workout day'
        ].filter(Boolean),
        workoutSpecific: specificGuidance.pre
    };
}

/**
 * Get post-workout guidance
 * @param {object} profile - user profile
 * @param {string} workoutType - type of workout completed
 * @param {number} duration - workout duration in minutes
 * @param {number} intensity - 0-1 intensity level
 * @returns {object} post-workout recommendations
 */
function getPostWorkoutGuidance(profile, workoutType = 'gym', duration = 45, intensity = 0.7) {
    const diet = profile.diet_type === 'nonveg' ? 'nonveg' : 'veg';
    const bodyweight = profile.current_weight || 70;
    const specificGuidance = WORKOUT_SPECIFIC_GUIDANCE[workoutType] || WORKOUT_SPECIFIC_GUIDANCE.gym;

    const needsElectrolytes = duration > 60 || intensity > 0.8;
    const isHighIntensity = intensity > 0.75;

    return {
        proteinPriority: {
            amount: `${POST_WORKOUT_GUIDANCE.nutrition.proteinGrams}g`,
            window: `${POST_WORKOUT_GUIDANCE.timing.proteinWindow} minutes`,
            message: `Consume ${POST_WORKOUT_GUIDANCE.nutrition.proteinGrams}g protein within ${POST_WORKOUT_GUIDANCE.timing.proteinWindow} minutes`
        },
        immediateOptions: POST_WORKOUT_GUIDANCE.examples.immediate,
        fullMeal: {
            timeWindow: `${POST_WORKOUT_GUIDANCE.timing.mealWindow / 60} hours`,
            options: POST_WORKOUT_GUIDANCE.examples.fullMeal[diet]
        },
        hydration: {
            water: `${POST_WORKOUT_GUIDANCE.hydration.waterMl}ml`,
            needsElectrolytes,
            electrolyteSources: needsElectrolytes ? POST_WORKOUT_GUIDANCE.hydration.electrolyteSources : []
        },
        recoveryTips: POST_WORKOUT_GUIDANCE.recovery.slice(0, isHighIntensity ? 4 : 2),
        instructions: [
            specificGuidance.post.focus,
            `Timing: ${specificGuidance.post.timing}`,
            needsElectrolytes ? 'Consider electrolytes due to workout intensity/duration' : 'Stay hydrated'
        ],
        workoutSpecific: specificGuidance.post,
        personalizedNote: generatePersonalizedNote(profile, workoutType, duration)
    };
}

/**
 * Get complete workout day nutrition timeline
 * @param {object} profile - user profile
 * @param {string} workoutTime - "HH:MM" workout time
 * @param {string} workoutStyle - workout type
 * @returns {object} timeline of nutrition events
 */
function getWorkoutDayTimeline(profile, workoutTime, workoutStyle = 'gym') {
    const workoutMinutes = parseTime(workoutTime);
    const estDuration = 60; // Assume 60 min workout
    const postWorkoutMinutes = workoutMinutes + estDuration;

    const preGuidance = getPreWorkoutGuidance(profile, workoutTime, workoutStyle);
    const postGuidance = getPostWorkoutGuidance(profile, workoutStyle, estDuration);

    return {
        timeline: [
            {
                time: formatTime(workoutMinutes - 120),
                event: 'Pre-workout meal window opens',
                action: 'Eat a balanced meal with carbs and protein',
                icon: 'utensils'
            },
            {
                time: formatTime(workoutMinutes - 90),
                event: 'Ideal pre-workout meal time',
                action: 'Have your pre-workout meal now',
                icon: 'clock'
            },
            {
                time: formatTime(workoutMinutes - 30),
                event: 'Pre-workout hydration',
                action: 'Drink 200-300ml water',
                icon: 'droplet'
            },
            {
                time: workoutTime,
                event: 'Workout begins',
                action: 'Stay hydrated during workout',
                icon: 'activity',
                isWorkout: true
            },
            {
                time: formatTime(postWorkoutMinutes),
                event: 'Workout complete',
                action: 'Start recovery process',
                icon: 'check',
                isWorkout: true
            },
            {
                time: formatTime(postWorkoutMinutes + 15),
                event: 'Immediate post-workout',
                action: 'Protein shake or quick protein source + water',
                icon: 'zap'
            },
            {
                time: formatTime(postWorkoutMinutes + 60),
                event: 'Post-workout meal',
                action: 'Full balanced meal',
                icon: 'utensils'
            }
        ],
        preWorkout: preGuidance,
        postWorkout: postGuidance
    };
}

/**
 * Generate personalized note based on profile
 */
function generatePersonalizedNote(profile, workoutType, duration) {
    const notes = [];

    if (profile.goal_type?.includes('muscle') || profile.goal_type?.includes('bulk')) {
        notes.push('Extra protein today helps muscle recovery and growth');
    }

    if (profile.goal_type?.includes('fat') || profile.goal_type?.includes('cut')) {
        notes.push('Keep post-workout meal balanced - recovery is still important during a cut');
    }

    if (duration > 60) {
        notes.push('Long workout - prioritize hydration and carb replenishment');
    }

    if (workoutType === 'hiit') {
        notes.push('HIIT burns calories for hours after - stay nourished');
    }

    return notes.length > 0 ? notes[0] : 'Great workout! Fuel your recovery properly.';
}

// Helper functions
function parseTime(timeStr) {
    if (!timeStr) return 600; // Default to 10:00
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 10) * 60 + (m || 0);
}

function formatTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

module.exports = {
    PRE_WORKOUT_GUIDANCE,
    POST_WORKOUT_GUIDANCE,
    WORKOUT_SPECIFIC_GUIDANCE,
    getPreWorkoutGuidance,
    getPostWorkoutGuidance,
    getWorkoutDayTimeline
};
