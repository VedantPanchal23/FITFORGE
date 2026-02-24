/**
 * Supplement Timing Engine
 * Provides detailed guidance on when/how to take supplements and medicines
 */

// Load supplement database from JSON file for detailed info (Indian brands, dosages, etc.)
let supplementsFromFile = [];
try {
    supplementsFromFile = require('../../data/supplements/supplements.json');
} catch (e) {
    console.warn('supplements.json not found, using hardcoded database');
}

const SUPPLEMENT_DATABASE = {
    // Vitamins
    vitamin_b12: {
        name: 'Vitamin B12',
        category: 'vitamin',
        bestTime: 'morning',
        withFood: 'after_breakfast',
        avoid: ['coffee', 'tea'], // Wait 30 min
        frequency: 'daily',
        notes: 'Take after breakfast, not with tea/coffee. Wait 30 mins after caffeine.',
        vegetarianPriority: true, // Important for vegetarians
        interactions: ['metformin_reduces_absorption'],
        dosage: '500-1000 mcg daily'
    },
    vitamin_d3: {
        name: 'Vitamin D3',
        category: 'vitamin',
        bestTime: 'morning',
        withFood: 'with_fat_containing_meal',
        avoid: [],
        frequency: 'daily',
        notes: 'Take with breakfast that contains some fat (butter, ghee, nuts) for best absorption.',
        interactions: [],
        dosage: '1000-2000 IU daily (higher if deficient)'
    },
    vitamin_e: {
        name: 'Vitamin E',
        category: 'vitamin',
        bestTime: 'any',
        withFood: 'with_fat_containing_meal',
        avoid: ['on_empty_stomach'],
        frequency: 'daily',
        notes: 'Fat-soluble, take with meals containing healthy fats.',
        dosage: '15 mg (22 IU) daily'
    },
    vitamin_c: {
        name: 'Vitamin C',
        category: 'vitamin',
        bestTime: 'any',
        withFood: 'optional',
        avoid: [],
        frequency: 'daily',
        notes: 'Can be taken any time. Split doses if taking >500mg. Enhances iron absorption.',
        dosage: '500-1000 mg daily',
        synergies: ['iron']
    },
    multivitamin: {
        name: 'Multivitamin',
        category: 'vitamin',
        bestTime: 'morning',
        withFood: 'with_breakfast',
        avoid: ['empty_stomach'],
        frequency: 'daily',
        notes: 'Take with breakfast. May cause nausea if taken empty.'
    },

    // Minerals
    zinc: {
        name: 'Zinc',
        category: 'mineral',
        bestTime: 'night',
        withFood: 'empty_or_light',
        avoid: ['with_calcium', 'with_iron', 'dairy'], // Competition for absorption
        frequency: 'daily',
        notes: 'Best before bed on light stomach. Don\'t take with dairy or iron.',
        dosage: '15-30 mg daily',
        benefits: ['immune_support', 'testosterone', 'recovery']
    },
    magnesium: {
        name: 'Magnesium',
        category: 'mineral',
        bestTime: 'night',
        withFood: 'optional',
        avoid: ['with_zinc'], // Space out by 2 hours
        frequency: 'daily',
        notes: 'Helps with sleep and muscle recovery. Take 30-60 min before bed.',
        dosage: '200-400 mg daily (glycinate or citrate preferred)',
        benefits: ['sleep', 'recovery', 'cramps']
    },
    iron: {
        name: 'Iron',
        category: 'mineral',
        bestTime: 'morning',
        withFood: 'empty_stomach_or_vitamin_c',
        avoid: ['dairy', 'tea', 'coffee', 'calcium', 'zinc'],
        frequency: 'as_prescribed',
        notes: 'Take with vitamin C (orange juice) for best absorption. Avoid with tea/coffee for 2 hours.',
        dosage: 'As prescribed (typically 18-65 mg)',
        womensHealth: true,
        synergies: ['vitamin_c']
    },
    calcium: {
        name: 'Calcium',
        category: 'mineral',
        bestTime: 'evening',
        withFood: 'with_meal',
        avoid: ['iron', 'zinc', 'thyroid_medication'],
        frequency: 'daily',
        notes: 'Take with dinner. Space 4 hours from iron supplements.',
        dosage: '500-1000 mg daily'
    },

    // Sports/Performance
    protein_powder: {
        name: 'Protein Powder',
        category: 'sports',
        bestTime: 'flexible',
        contexts: {
            post_workout: {
                timing: 'within_45_mins',
                note: 'Best absorption window after training',
                priority: true
            },
            morning: {
                timing: 'with_breakfast',
                note: 'Add to morning smoothie or oats'
            },
            between_meals: {
                timing: 'as_snack',
                note: 'If meals are protein-light'
            },
            before_bed: {
                timing: 'casein_preferred',
                note: 'Casein for slow release overnight'
            }
        },
        avoid: ['immediately_before_workout'], // May cause discomfort
        frequency: 'as_needed',
        notes: 'Best post-workout. Can be taken as snack if daily protein target is low.',
        dosage: '20-40g per serving'
    },
    creatine: {
        name: 'Creatine Monohydrate',
        category: 'sports',
        bestTime: 'any',
        withFood: 'optional',
        avoid: [],
        frequency: 'daily',
        notes: 'Timing doesn\'t matter much. Consistency is key. 5g daily, no loading needed.',
        dosage: '3-5g daily',
        benefits: ['strength', 'power', 'recovery', 'cognitive'],
        loading: false
    },
    bcaa: {
        name: 'BCAAs',
        category: 'sports',
        bestTime: 'around_workout',
        contexts: {
            pre_workout: { timing: '15_mins_before', note: 'Reduces muscle breakdown' },
            during_workout: { timing: 'sipping', note: 'During long workouts' },
            post_workout: { timing: 'with_protein', note: 'If protein intake is low' }
        },
        frequency: 'workout_days',
        notes: 'Most useful if training fasted or protein intake is low. Not essential if protein is adequate.',
        dosage: '5-10g'
    },
    pre_workout: {
        name: 'Pre-Workout',
        category: 'sports',
        bestTime: 'pre_workout',
        withFood: 'light_snack',
        avoid: ['late_evening', 'on_empty_stomach'],
        frequency: 'workout_days',
        notes: 'Take 20-30 mins before workout. Avoid after 4pm due to caffeine. Start with half scoop.',
        dosage: 'As per label',
        warnings: ['caffeine_content', 'avoid_daily_use']
    },

    // Health/Wellness
    omega3: {
        name: 'Omega-3 / Fish Oil',
        category: 'health',
        bestTime: 'evening',
        withFood: 'with_dinner',
        avoid: ['empty_stomach'], // Can cause fishy burps
        frequency: 'daily',
        notes: 'Take with dinner to avoid fishy aftertaste. Store in fridge.',
        dosage: '1000-3000 mg EPA+DHA daily',
        benefits: ['heart', 'brain', 'joints', 'inflammation']
    },
    ashwagandha: {
        name: 'Ashwagandha',
        category: 'adaptogen',
        bestTime: 'night',
        withFood: 'with_milk',
        avoid: ['morning_if_tired'],
        frequency: 'daily',
        notes: 'Traditional: with warm milk at night. Helps with stress, sleep, and recovery.',
        dosage: '300-600 mg daily (KSM-66 or root extract)',
        benefits: ['stress', 'sleep', 'testosterone', 'recovery']
    },
    probiotics: {
        name: 'Probiotics',
        category: 'health',
        bestTime: 'morning',
        withFood: 'before_or_with_breakfast',
        avoid: ['hot_beverages'],
        frequency: 'daily',
        notes: 'Take in morning before or with light food. Avoid hot drinks immediately after.',
        dosage: '10-50 billion CFU'
    },
    melatonin: {
        name: 'Melatonin',
        category: 'sleep',
        bestTime: 'night',
        withFood: 'optional',
        avoid: [],
        frequency: 'as_needed',
        notes: 'Take 30-60 mins before bed. Start with low dose (0.5-1mg). Use occasionally, not daily.',
        dosage: '0.5-3 mg',
        warnings: ['not_for_daily_use', 'may_cause_grogginess']
    }
};

/**
 * Generate supplement schedule from list of supplements
 * @param {array} supplementList - array of supplement IDs
 * @param {object} profile - user profile
 * @returns {object} organized schedule
 */
function getSupplementSchedule(supplementList, profile) {
    const schedule = {
        morning: [],
        with_breakfast: [],
        mid_morning: [],
        pre_workout: [],
        post_workout: [],
        with_lunch: [],
        afternoon: [],
        with_dinner: [],
        before_bed: []
    };

    supplementList.forEach(suppId => {
        const supp = SUPPLEMENT_DATABASE[suppId];
        if (!supp) return;

        const entry = {
            id: suppId,
            name: supp.name,
            notes: supp.notes,
            avoid: supp.avoid,
            dosage: supp.dosage,
            category: supp.category
        };

        // Determine placement based on bestTime
        switch (supp.bestTime) {
            case 'morning':
                if (supp.withFood === 'with_breakfast' || supp.withFood === 'after_breakfast') {
                    schedule.with_breakfast.push(entry);
                } else {
                    schedule.morning.push(entry);
                }
                break;
            case 'evening':
                schedule.with_dinner.push(entry);
                break;
            case 'night':
                schedule.before_bed.push(entry);
                break;
            case 'pre_workout':
                schedule.pre_workout.push(entry);
                break;
            case 'around_workout':
                schedule.pre_workout.push({ ...entry, note: 'optional' });
                schedule.post_workout.push({ ...entry, note: 'optional' });
                break;
            case 'flexible':
                // Protein and similar - default to post_workout
                if (supp.contexts?.post_workout) {
                    schedule.post_workout.push({ ...entry, note: supp.contexts.post_workout.note });
                } else {
                    schedule.with_breakfast.push(entry);
                }
                break;
            case 'any':
                schedule.with_breakfast.push(entry);
                break;
            default:
                schedule.with_breakfast.push(entry);
        }
    });

    // Remove empty time slots
    Object.keys(schedule).forEach(key => {
        if (schedule[key].length === 0) {
            delete schedule[key];
        }
    });

    return schedule;
}

/**
 * Get detailed guidance for a single supplement
 * @param {string} supplementId - supplement ID
 * @returns {object|null} guidance object
 */
function getSupplementGuidance(supplementId) {
    const supp = SUPPLEMENT_DATABASE[supplementId];
    if (!supp) return null;

    return {
        name: supp.name,
        category: supp.category,
        when: formatBestTime(supp.bestTime),
        howToTake: formatWithFood(supp.withFood),
        avoid: supp.avoid?.length > 0
            ? `Avoid taking with: ${supp.avoid.join(', ')}`
            : 'No major interactions',
        frequency: supp.frequency,
        dosage: supp.dosage,
        benefits: supp.benefits || [],
        additionalNotes: supp.notes,
        warnings: supp.warnings || []
    };
}

/**
 * Check for supplement interactions
 * @param {array} supplementList - list of supplement IDs
 * @returns {array} interaction warnings
 */
function checkInteractions(supplementList) {
    const interactions = [];

    // Known interaction pairs
    const interactionPairs = [
        { a: 'iron', b: 'calcium', warning: 'Take iron and calcium at least 4 hours apart' },
        { a: 'iron', b: 'zinc', warning: 'Take iron and zinc at different times (e.g., iron AM, zinc PM)' },
        { a: 'zinc', b: 'magnesium', warning: 'Space zinc and magnesium at least 2 hours apart' },
        { a: 'calcium', b: 'zinc', warning: 'Calcium may reduce zinc absorption - take at different times' },
        { a: 'vitamin_b12', b: 'vitamin_c', warning: 'High-dose vitamin C may reduce B12 absorption - space by 2+ hours' }
    ];

    interactionPairs.forEach(({ a, b, warning }) => {
        if (supplementList.includes(a) && supplementList.includes(b)) {
            interactions.push({
                supplements: [a, b],
                warning,
                severity: 'moderate'
            });
        }
    });

    // Check for synergies (positive interactions)
    const synergies = [];
    if (supplementList.includes('iron') && supplementList.includes('vitamin_c')) {
        synergies.push({
            supplements: ['iron', 'vitamin_c'],
            benefit: 'Take together! Vitamin C significantly enhances iron absorption'
        });
    }
    if (supplementList.includes('vitamin_d3') && supplementList.includes('calcium')) {
        synergies.push({
            supplements: ['vitamin_d3', 'calcium'],
            benefit: 'Vitamin D helps calcium absorption'
        });
    }

    return { interactions, synergies };
}

/**
 * Get supplement recommendations based on profile and goals
 * @param {object} profile - user profile
 * @returns {array} recommended supplements
 */
function getRecommendedSupplements(profile) {
    const recommendations = [];
    const goal = profile.goal_type?.toLowerCase() || '';
    const diet = profile.diet_type?.toLowerCase() || '';

    // Essential for everyone
    recommendations.push({
        id: 'vitamin_d3',
        reason: 'Most Indians are deficient. Essential for bones, immunity, and hormone health.',
        priority: 1
    });

    // Diet-based
    if (diet === 'veg' || diet === 'jain') {
        recommendations.push({
            id: 'vitamin_b12',
            reason: 'Critical for vegetarians - not found in plant foods.',
            priority: 1
        });
    }

    // Goal-based
    if (goal.includes('muscle') || goal.includes('strength') || goal.includes('bulk')) {
        recommendations.push({
            id: 'protein_powder',
            reason: 'Convenient way to meet protein targets for muscle building.',
            priority: 1
        });
        recommendations.push({
            id: 'creatine',
            reason: 'Most researched supplement for strength and muscle gains.',
            priority: 2
        });
    }

    if (goal.includes('fat') || goal.includes('cut')) {
        recommendations.push({
            id: 'protein_powder',
            reason: 'Helps preserve muscle during fat loss.',
            priority: 1
        });
    }

    // Health-based
    recommendations.push({
        id: 'omega3',
        reason: 'Most Indians don\'t get enough omega-3s. Great for heart, brain, joints.',
        priority: 2
    });

    // Gender-based
    if (profile.sex === 'female') {
        recommendations.push({
            id: 'iron',
            reason: 'Women often need iron supplementation, especially if heavy periods.',
            priority: 2
        });
    }

    // Sleep/Recovery
    recommendations.push({
        id: 'magnesium',
        reason: 'Helps with sleep quality and muscle recovery.',
        priority: 2
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
}

// Helper functions
function formatBestTime(bestTime) {
    const timeMap = {
        morning: 'Take in the morning',
        evening: 'Take with dinner/evening',
        night: 'Take before bed',
        any: 'Can be taken any time',
        flexible: 'Flexible timing based on context',
        pre_workout: 'Take before workout',
        around_workout: 'Take around workout time'
    };
    return timeMap[bestTime] || 'Follow label instructions';
}

function formatWithFood(withFood) {
    const foodMap = {
        with_breakfast: 'Take with breakfast',
        after_breakfast: 'Take after breakfast',
        with_fat_containing_meal: 'Take with a meal containing fats (eggs, nuts, ghee)',
        with_dinner: 'Take with dinner',
        with_meal: 'Take with any meal',
        empty_stomach: 'Take on empty stomach',
        empty_or_light: 'Take on empty or very light stomach',
        optional: 'Food is optional',
        with_milk: 'Traditional: take with warm milk'
    };
    return foodMap[withFood] || 'Can be taken with or without food';
}

/**
 * Get all supplements from JSON database
 * Includes detailed info like Indian brands, dosages, timing
 */
function getAllSupplements() {
    return supplementsFromFile;
}

/**
 * Get supplement by ID from JSON database
 */
function getSupplementFromFile(id) {
    return supplementsFromFile.find(s => s.id === id) || null;
}

module.exports = {
    SUPPLEMENT_DATABASE,
    getSupplementSchedule,
    getSupplementGuidance,
    checkInteractions,
    getRecommendedSupplements,
    getAllSupplements,
    getSupplementFromFile
};
