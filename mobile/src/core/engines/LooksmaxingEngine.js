/**
 * Looksmaxing Engine
 * Generates facial improvement, skincare, and grooming routines
 */

const { MEWING_PROTOCOLS, SKINCARE_ROUTINES, FACIAL_EXERCISE_TYPES } = require('../utils/constants');
const { createLooksmaxingPlan, createSkincareStep, createFacialExercise } = require('../models/LooksmaxingPlan');

/**
 * Get mewing protocol based on experience
 */
function getMewingProtocol(experienceWeeks) {
    if (experienceWeeks < 4) return MEWING_PROTOCOLS.beginner;
    if (experienceWeeks < 12) return MEWING_PROTOCOLS.intermediate;
    return MEWING_PROTOCOLS.advanced;
}

/**
 * Generate skincare routine based on skin type
 */
function generateSkincareRoutine(skinType, skinConcerns) {
    const baseRoutine = SKINCARE_ROUTINES[skinType] || SKINCARE_ROUTINES.normal;

    const morning = baseRoutine.morning.map(step =>
        createSkincareStep(step.step, step.type, step.duration_secs || 30, null)
    );

    const evening = baseRoutine.evening.map(step =>
        createSkincareStep(step.step, step.type, step.duration_secs || 30,
            step.frequency ? `Use ${step.frequency}` : null)
    );

    // Add concern-specific steps
    if (skinConcerns && skinConcerns.includes('dark_circles')) {
        evening.push(createSkincareStep('Eye Cream', 'caffeine/vitamin_k', 15, 'Pat gently, don\'t rub'));
    }

    if (skinConcerns && skinConcerns.includes('acne')) {
        // BHA already in oily routine, otherwise add spot treatment
        if (skinType !== 'oily') {
            evening.push(createSkincareStep('Spot Treatment', 'benzoyl_peroxide/salicylic', 10, 'On active spots only'));
        }
    }

    return { morning, evening };
}

/**
 * Generate facial exercises based on goals
 */
function generateFacialExercises(facialGoals, skinConcerns) {
    const exercises = [];

    // Default: include jawline exercises
    exercises.push(createFacialExercise('Chin Lifts', 'jawline', 15, 3, 'Tilt head back, push lower jaw forward'));
    exercises.push(createFacialExercise('Jaw Clench', 'jawline', 10, 5, 'Clench teeth, feel masseter engage'));

    if (facialGoals && facialGoals.includes('jawline')) {
        exercises.push(createFacialExercise('Neck Curl', 'jawline', 12, 0, 'Lie on bed, curl head up like a crunch'));
        exercises.push(createFacialExercise('Tongue Press', 'jawline', 10, 10, 'Press tongue hard against roof of mouth'));
    }

    if (facialGoals && facialGoals.includes('cheekbones')) {
        exercises.push(createFacialExercise('Fish Face', 'cheekbones', 10, 5, 'Suck cheeks in, hold'));
        exercises.push(createFacialExercise('Cheek Lift', 'cheekbones', 15, 3, 'Smile wide, push cheeks up with fingers'));
    }

    if (facialGoals && facialGoals.includes('under_eye') || (skinConcerns && skinConcerns.includes('dark_circles'))) {
        exercises.push(createFacialExercise('Eye Circles', 'eyes', 10, 0, 'Look in circles, each direction'));
        exercises.push(createFacialExercise('Brow Lifts', 'eyes', 15, 3, 'Raise eyebrows, hold at top'));
    }

    if (facialGoals && facialGoals.includes('symmetry')) {
        exercises.push(createFacialExercise('Unilateral Chewing', 'symmetry', 0, 300, 'Chew gum on weaker side for 5 min'));
    }

    return exercises;
}

/**
 * Generate grooming checklist
 */
function generateGroomingTasks(gender, concerns) {
    const tasks = [];

    // Universal
    tasks.push({ task: 'Trim nails', frequency: 'weekly' });
    tasks.push({ task: 'Clean ears', frequency: 'weekly' });

    if (gender === 'male') {
        tasks.push({ task: 'Maintain facial hair/shave', frequency: 'as_needed' });
        tasks.push({ task: 'Trim eyebrows if needed', frequency: 'weekly' });
        tasks.push({ task: 'Nose hair check', frequency: 'weekly' });
    } else {
        tasks.push({ task: 'Eyebrow maintenance', frequency: 'as_needed' });
    }

    return tasks;
}

/**
 * Generate lifestyle tips for looksmaxing
 */
function generateLifestyleTips(profile) {
    const tips = [];

    // Sleep position
    tips.push('Sleep on back to prevent facial asymmetry and reduce wrinkles.');

    // Posture impact
    tips.push('Forward head posture weakens jawline. Practice chin tucks throughout day.');

    // Hydration for skin
    tips.push('Drink minimum 2.5L water daily for skin hydration.');

    // Diet for skin
    tips.push('Reduce sugar and processed foods to minimize breakouts.');
    tips.push('Include omega-3 rich foods (walnuts, flaxseeds) for skin health.');

    // Sun protection
    tips.push('Apply sunscreen daily - UV damage is the #1 cause of skin aging.');

    // Stress impact
    if (profile.stress_level === 'high') {
        tips.push('High stress elevates cortisol which accelerates skin aging and causes breakouts.');
    }

    // Dark circles specific
    if (profile.skin_concerns && profile.skin_concerns.includes('dark_circles')) {
        tips.push('Dark circles: Prioritize 8+ hours sleep, check iron levels, cold compress in AM.');
    }

    return tips;
}

/**
 * Generate complete looksmaxing plan for a day
 */
function generateLooksmaxingPlan(profile, date, experienceWeeks = 0) {
    const { skin_type, skin_concerns, facial_goals, gender } = profile;

    const skincare = generateSkincareRoutine(skin_type || 'normal', skin_concerns);
    const facialExercises = generateFacialExercises(facial_goals, skin_concerns);
    const mewingProtocol = getMewingProtocol(experienceWeeks);
    const groomingTasks = generateGroomingTasks(gender, []);
    const lifestyleTips = generateLifestyleTips(profile);

    const explanation = generateExplanation(profile);

    return createLooksmaxingPlan({
        plan_date: date || new Date().toISOString().split('T')[0],
        skincare_am: skincare.morning,
        skincare_pm: skincare.evening,
        facial_exercises: facialExercises,
        mewing_protocol: mewingProtocol,
        grooming_tasks: groomingTasks,
        lifestyle_tips: lifestyleTips,
        explanation
    });
}

/**
 * Generate explanation for looksmaxing plan
 */
function generateExplanation(profile) {
    const parts = [];

    if (profile.skin_type) {
        parts.push(`Skincare routine for ${profile.skin_type} skin.`);
    }

    if (profile.facial_goals && profile.facial_goals.length > 0) {
        parts.push(`Facial exercises targeting: ${profile.facial_goals.join(', ')}.`);
    }

    parts.push('Mewing protocol included for jawline and facial structure improvement.');
    parts.push('Results require consistency over months.');

    return parts.join(' ');
}

/**
 * Get dark circles specific protocol
 */
function getDarkCirclesProtocol() {
    return {
        immediate: [
            'Cold spoon/compress for 5 min each morning',
            'Caffeine eye cream morning and night',
            'Concealer for immediate coverage'
        ],
        longTerm: [
            'Prioritize 8+ hours sleep consistently',
            'Get iron and vitamin D levels checked',
            'Reduce salt intake (causes water retention)',
            'Elevate head slightly while sleeping',
            'Eye massage to improve lymphatic drainage'
        ],
        nutrition: [
            'Vitamin K: leafy greens',
            'Vitamin C: citrus, bell peppers',
            'Iron: spinach, legumes, fortified foods'
        ]
    };
}

/**
 * Get jawline enhancement protocol
 */
function getJawlineProtocol(experienceLevel) {
    return {
        mewing: getMewingProtocol(experienceLevel === 'beginner' ? 0 : 8),
        exercises: [
            { name: 'Chin tucks', reps: 15, frequency: '3x daily' },
            { name: 'Jaw clenches', reps: 10, holdSecs: 5, frequency: '2x daily' },
            { name: 'Neck curls', reps: 12, frequency: 'daily' }
        ],
        chewing: 'Use mastic/falim gum 15-30 min daily for masseter development',
        leanness: 'Jawline visibility requires low body fat. Prioritize fat loss if >15% (male) or >22% (female).',
        posture: 'Forward head posture recesses jawline. Maintain ears over shoulders.'
    };
}

module.exports = {
    getMewingProtocol,
    generateSkincareRoutine,
    generateFacialExercises,
    generateGroomingTasks,
    generateLifestyleTips,
    generateLooksmaxingPlan,
    getDarkCirclesProtocol,
    getJawlineProtocol
};
