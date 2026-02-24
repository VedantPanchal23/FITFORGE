/**
 * HolisticWorkoutPlanner.js
 * 
 * ORCHESTRATION ENGINE - sits above TrainingStyleEngine
 * 
 * This engine acts like a REAL COACH by:
 * - Analyzing user goals (not workout style preference)
 * - Composing balanced routines from all exercise types
 * - Adjusting based on time, equipment, energy, injuries
 * 
 * User inputs: Goal, Time, Equipment, Pain/Injuries
 * Output: Complete balanced session with warmup, strength, cardio, yoga, cooldown
 */

// Load all exercise databases
let yogaExercises = [];
let cardioPrograms = [];
let mobilityExercises = [];
let warmupExercises = [];
let strengthExercises = [];

try {
    yogaExercises = require('../../data/exercises/yoga.json');
    cardioPrograms = require('../../data/exercises/cardio.json');
    mobilityExercises = require('../../data/exercises/mobility.json');
    warmupExercises = require('../../data/exercises/warmups.json');
    strengthExercises = require('../../data/exercises/bodyweight_exercises.json');
} catch (e) {
    console.warn('Some exercise databases not loaded:', e.message);
}

// ===== GOAL CONFIGURATIONS =====
const GOAL_CONFIGURATIONS = {
    fat_loss: {
        name: 'Fat Loss',
        distribution: { strength: 0.40, cardio: 0.40, yoga: 0.10, mobility: 0.10 },
        intensity: 'high',
        restBetweenSets: 30,
        preferCircuits: true,
        cardioType: 'hiit',
        rationale: 'High intensity circuits with minimal rest maximize calorie burn and EPOC effect'
    },
    muscle_gain: {
        name: 'Muscle Gain',
        distribution: { strength: 0.70, cardio: 0.10, yoga: 0.10, mobility: 0.10 },
        intensity: 'moderate-high',
        restBetweenSets: 90,
        preferCircuits: false,
        cardioType: 'light',
        rationale: 'Focus on progressive strength training with adequate rest for muscle growth'
    },
    endurance: {
        name: 'Endurance',
        distribution: { strength: 0.25, cardio: 0.50, yoga: 0.10, mobility: 0.15 },
        intensity: 'moderate',
        restBetweenSets: 45,
        preferCircuits: true,
        cardioType: 'steady_state',
        rationale: 'Sustained cardio builds aerobic capacity while strength maintains muscle'
    },
    flexibility: {
        name: 'Flexibility',
        distribution: { strength: 0.10, cardio: 0.10, yoga: 0.60, mobility: 0.20 },
        intensity: 'low',
        restBetweenSets: 60,
        preferCircuits: false,
        cardioType: 'light',
        rationale: 'Yoga and mobility work opens up the body and improves range of motion'
    },
    posture: {
        name: 'Posture Correction',
        distribution: { strength: 0.35, cardio: 0.10, yoga: 0.30, mobility: 0.25 },
        intensity: 'low-moderate',
        restBetweenSets: 60,
        preferCircuits: false,
        cardioType: 'light',
        focusMuscles: ['upper_back', 'core', 'glutes', 'shoulders'],
        rationale: 'Strengthening postural muscles while improving flexibility in tight areas'
    },
    general_fitness: {
        name: 'General Fitness',
        distribution: { strength: 0.35, cardio: 0.30, yoga: 0.15, mobility: 0.20 },
        intensity: 'moderate',
        restBetweenSets: 60,
        preferCircuits: true,
        cardioType: 'mixed',
        rationale: 'Balanced approach covering all aspects of fitness for overall health'
    },
    athletic_performance: {
        name: 'Athletic Performance',
        distribution: { strength: 0.45, cardio: 0.30, yoga: 0.10, mobility: 0.15 },
        intensity: 'high',
        restBetweenSets: 60,
        preferCircuits: true,
        cardioType: 'hiit',
        rationale: 'Power and explosiveness training with sport-specific conditioning'
    }
};

// ===== TIME ALLOCATION TEMPLATES =====
const TIME_TEMPLATES = {
    15: { warmup: 2, main: 11, cooldown: 2 },
    30: { warmup: 4, main: 22, cooldown: 4 },
    45: { warmup: 5, main: 35, cooldown: 5 },
    60: { warmup: 6, main: 48, cooldown: 6 },
    90: { warmup: 8, main: 74, cooldown: 8 }
};

// ===== EQUIPMENT EXERCISE FILTERS =====
const EQUIPMENT_FILTERS = {
    none: (ex) => !ex.requires || ex.requires === 'none' || ex.beginner_friendly,
    dumbbells: (ex) => !ex.requires || ex.requires === 'none' || ex.requires === 'dumbbells',
    gym: (ex) => true // All exercises available
};

// ===== ENERGY LEVEL ADJUSTMENTS =====
const ENERGY_ADJUSTMENTS = {
    low: {
        intensityMultiplier: 0.6,
        cardioReduction: 0.5,
        yogaIncrease: 1.5,
        note: 'Lower intensity focus on recovery and mobility'
    },
    moderate: {
        intensityMultiplier: 0.85,
        cardioReduction: 1.0,
        yogaIncrease: 1.0,
        note: 'Standard intensity workout'
    },
    high: {
        intensityMultiplier: 1.0,
        cardioReduction: 1.0,
        yogaIncrease: 1.0,
        note: 'Full intensity as planned'
    }
};

/**
 * Main function: Generate a holistic workout based on user profile and context
 */
function generateHolisticWorkout(profile, dayContext = {}) {
    const {
        goal = 'general_fitness',
        timeAvailable = 45,
        equipment = 'none',
        injuries = [],
        energyLevel = 'moderate',
        recoveryStatus = 'good'
    } = dayContext;

    // Get goal configuration
    const goalConfig = GOAL_CONFIGURATIONS[goal] || GOAL_CONFIGURATIONS.general_fitness;

    // Get time template (snap to nearest)
    const timeKey = Object.keys(TIME_TEMPLATES)
        .map(Number)
        .reduce((prev, curr) => Math.abs(curr - timeAvailable) < Math.abs(prev - timeAvailable) ? curr : prev);
    const timeTemplate = TIME_TEMPLATES[timeKey];

    // Get energy adjustments
    const energyAdjust = ENERGY_ADJUSTMENTS[energyLevel] || ENERGY_ADJUSTMENTS.moderate;

    // Calculate adjusted distribution based on energy
    let distribution = { ...goalConfig.distribution };
    if (energyLevel === 'low') {
        distribution.cardio *= energyAdjust.cardioReduction;
        distribution.yoga *= energyAdjust.yogaIncrease;
        // Normalize
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);
        Object.keys(distribution).forEach(k => distribution[k] /= total);
    }

    // Calculate time for each segment
    const mainTime = timeTemplate.main;
    const segmentTimes = {
        strength: Math.round(mainTime * distribution.strength),
        cardio: Math.round(mainTime * distribution.cardio),
        yoga: Math.round(mainTime * distribution.yoga),
        mobility: Math.round(mainTime * distribution.mobility)
    };

    // Build each segment
    const workout = {
        date: new Date().toISOString().split('T')[0],
        goal: goalConfig.name,
        totalDuration: timeAvailable,
        energyLevel,
        equipment,

        warmup: buildWarmupSegment(timeTemplate.warmup, profile, injuries),
        strength: buildStrengthSegment(segmentTimes.strength, profile, goalConfig, equipment, injuries),
        cardio: buildCardioSegment(segmentTimes.cardio, profile, goalConfig, equipment, energyLevel),
        yoga: buildYogaSegment(segmentTimes.yoga, profile, goalConfig, injuries),
        cooldown: buildCooldownSegment(timeTemplate.cooldown, profile, injuries),

        distribution: segmentTimes,
        rationale: buildRationale(goalConfig, energyLevel, timeAvailable, equipment),
        tips: generateWorkoutTips(goal, energyLevel, recoveryStatus)
    };

    return workout;
}

/**
 * Build warmup segment from warmups.json
 */
function buildWarmupSegment(durationMins, profile, injuries = []) {
    const filtered = warmupExercises.filter(ex => !hasInjuryConflict(ex, injuries));
    const dynamicWarmups = filtered.filter(ex => ex.type === 'dynamic' || ex.type === 'dynamic_cardio');
    const activationWarmups = filtered.filter(ex => ex.type === 'activation');

    const exercises = [];
    const targetCount = Math.min(Math.ceil(durationMins / 1.5), 5);

    // Add 2-3 dynamic warmups
    const shuffledDynamic = shuffleArray([...dynamicWarmups]);
    exercises.push(...shuffledDynamic.slice(0, Math.ceil(targetCount * 0.6)));

    // Add 1-2 activation warmups
    const shuffledActivation = shuffleArray([...activationWarmups]);
    exercises.push(...shuffledActivation.slice(0, Math.floor(targetCount * 0.4)));

    return {
        duration_mins: durationMins,
        exercises: exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            reps: ex.reps || null,
            duration_secs: ex.duration_secs || null,
            instructions: ex.instructions
        }))
    };
}

/**
 * Build strength segment from bodyweight_exercises.json
 */
function buildStrengthSegment(durationMins, profile, goalConfig, equipment, injuries = []) {
    if (durationMins < 3) {
        return { duration_mins: durationMins, exercises: [], note: 'Skipped due to time constraints' };
    }

    const equipFilter = EQUIPMENT_FILTERS[equipment] || EQUIPMENT_FILTERS.none;
    const filtered = strengthExercises.filter(ex =>
        equipFilter(ex) &&
        !hasInjuryConflict(ex, injuries) &&
        ex.category !== 'warmup' &&
        ex.category !== 'mobility'
    );

    // Group by muscle category
    const pushExercises = filtered.filter(ex => ex.category === 'push');
    const pullExercises = filtered.filter(ex => ex.category === 'pull');
    const legExercises = filtered.filter(ex => ex.category === 'legs');
    const coreExercises = filtered.filter(ex => ex.category === 'core');

    const exercises = [];
    const setsPerExercise = goalConfig.preferCircuits ? 2 : 3;
    const exerciseTimeEstimate = (setsPerExercise * 45 + goalConfig.restBetweenSets * (setsPerExercise - 1)) / 60; // mins per exercise
    const targetExercises = Math.floor(durationMins / exerciseTimeEstimate);

    // Balanced selection
    const selectCount = Math.max(1, Math.floor(targetExercises / 4));

    if (pushExercises.length > 0) exercises.push(...shuffleArray([...pushExercises]).slice(0, selectCount));
    if (pullExercises.length > 0) exercises.push(...shuffleArray([...pullExercises]).slice(0, selectCount));
    if (legExercises.length > 0) exercises.push(...shuffleArray([...legExercises]).slice(0, selectCount));
    if (coreExercises.length > 0) exercises.push(...shuffleArray([...coreExercises]).slice(0, selectCount));

    return {
        duration_mins: durationMins,
        format: goalConfig.preferCircuits ? 'circuit' : 'straight_sets',
        rest_between_sets: goalConfig.restBetweenSets,
        exercises: exercises.slice(0, targetExercises).map(ex => ({
            id: ex.id,
            name: ex.name,
            category: ex.category,
            sets: setsPerExercise,
            reps: ex.reps_range ? `${ex.reps_range.min}-${ex.reps_range.max}` : '10-12',
            rest_secs: goalConfig.restBetweenSets,
            difficulty: ex.difficulty,
            cues: ex.cues || []
        }))
    };
}

/**
 * Build cardio segment from cardio.json
 */
function buildCardioSegment(durationMins, profile, goalConfig, equipment, energyLevel) {
    if (durationMins < 3) {
        return { duration_mins: durationMins, exercises: [], note: 'Skipped due to time constraints' };
    }

    // Filter by type and duration
    let preferredType = goalConfig.cardioType;
    if (energyLevel === 'low') {
        preferredType = 'walking'; // Override to low intensity
    }

    // Find matching cardio programs
    let matchingPrograms = cardioPrograms.filter(prog => {
        if (preferredType === 'mixed') return true;
        if (preferredType === 'hiit') return prog.type === 'hiit';
        if (preferredType === 'steady_state') return ['walking', 'cycling', 'elliptical', 'rowing'].includes(prog.type);
        if (preferredType === 'light') return ['walking', 'dancing'].includes(prog.type);
        return prog.type === preferredType;
    });

    // Filter by equipment
    if (equipment === 'none') {
        matchingPrograms = matchingPrograms.filter(prog =>
            !['cycling', 'elliptical', 'rowing', 'swimming'].includes(prog.type)
        );
    }

    // Filter by duration - prefer programs that fit the time
    matchingPrograms = matchingPrograms.filter(prog =>
        prog.duration_mins <= durationMins + 5 // Allow 5 min flexibility
    );

    if (matchingPrograms.length === 0) {
        // Fallback to basic cardio
        return {
            duration_mins: durationMins,
            type: 'basic',
            description: 'Light cardio - jog in place, jumping jacks, or brisk walk',
            intensity: energyLevel === 'low' ? 'low' : 'moderate'
        };
    }

    // Pick one program
    const selected = shuffleArray([...matchingPrograms])[0];

    return {
        duration_mins: durationMins,
        program: {
            id: selected.id,
            name: selected.name,
            type: selected.type,
            intensity: selected.intensity,
            structure: selected.structure || selected.exercises,
            calories_per_min: selected.calories_per_min
        }
    };
}

/**
 * Build yoga segment from yoga.json
 */
function buildYogaSegment(durationMins, profile, goalConfig, injuries = []) {
    if (durationMins < 3) {
        return { duration_mins: durationMins, poses: [], note: 'Skipped due to time constraints' };
    }

    const filtered = yogaExercises.filter(pose =>
        !hasInjuryConflict(pose, injuries) &&
        pose.category !== 'breathing' && // Breathing handled in cooldown
        pose.category !== 'flow' // Flows are longer sequences
    );

    // Calculate poses based on time (avg 1-2 mins per pose including transitions)
    const posesNeeded = Math.min(Math.floor(durationMins / 1.5), 8);

    // Select balanced poses
    const standingPoses = filtered.filter(p => p.category === 'standing');
    const seatedPoses = filtered.filter(p => p.category === 'seated');
    const hipOpeners = filtered.filter(p => p.category === 'hip_opener');
    const backbends = filtered.filter(p => p.category === 'backbend');
    const balancePoses = filtered.filter(p => p.category === 'balance');

    const poses = [];

    // Add variety of poses
    if (standingPoses.length > 0) poses.push(...shuffleArray([...standingPoses]).slice(0, 2));
    if (seatedPoses.length > 0) poses.push(...shuffleArray([...seatedPoses]).slice(0, 2));
    if (hipOpeners.length > 0) poses.push(...shuffleArray([...hipOpeners]).slice(0, 1));
    if (backbends.length > 0 && goalConfig.name !== 'Posture Correction') {
        poses.push(...shuffleArray([...backbends]).slice(0, 1));
    }
    if (balancePoses.length > 0) poses.push(...shuffleArray([...balancePoses]).slice(0, 1));

    return {
        duration_mins: durationMins,
        poses: poses.slice(0, posesNeeded).map(pose => ({
            id: pose.id,
            sanskrit_name: pose.sanskrit_name,
            english_name: pose.english_name,
            hold_seconds: pose.hold_seconds || 30,
            sides: pose.category === 'standing' || pose.category === 'balance',
            benefits: pose.benefits?.slice(0, 2) || []
        }))
    };
}

/**
 * Build cooldown segment from mobility.json + yoga breathing
 */
function buildCooldownSegment(durationMins, profile, injuries = []) {
    const stretches = mobilityExercises.filter(ex =>
        ex.type === 'static' &&
        !hasInjuryConflict(ex, injuries)
    );

    const breathingExercises = yogaExercises.filter(ex => ex.category === 'breathing');
    const restingPoses = yogaExercises.filter(ex => ex.category === 'resting');

    const exercises = [];

    // Add 3-5 static stretches
    const stretchCount = Math.min(Math.ceil(durationMins / 1.5), 5);
    exercises.push(...shuffleArray([...stretches]).slice(0, stretchCount));

    // Add 1 breathing exercise if time
    if (durationMins >= 4 && breathingExercises.length > 0) {
        exercises.push(shuffleArray([...breathingExercises])[0]);
    }

    // End with rest pose
    if (restingPoses.length > 0) {
        exercises.push(restingPoses.find(p => p.id === 'savasana') || restingPoses[0]);
    }

    return {
        duration_mins: durationMins,
        exercises: exercises.map(ex => ({
            id: ex.id,
            name: ex.name || ex.english_name,
            duration_secs: ex.duration_secs || ex.hold_seconds || 30,
            target_muscles: ex.target_muscles || ex.body_focus,
            sides: ex.sides || false
        }))
    };
}

/**
 * Build rationale explaining why this workout was designed this way
 */
function buildRationale(goalConfig, energyLevel, timeAvailable, equipment) {
    let rationale = goalConfig.rationale;

    if (energyLevel === 'low') {
        rationale += ' Today\'s session has been adjusted for lower energy with reduced cardio and more recovery work.';
    }

    if (timeAvailable <= 20) {
        rationale += ' With limited time, we\'ve focused on the highest-impact exercises.';
    }

    if (equipment === 'none') {
        rationale += ' All exercises are bodyweight-based for home training.';
    }

    return rationale;
}

/**
 * Generate contextual tips
 */
function generateWorkoutTips(goal, energyLevel, recoveryStatus) {
    const tips = [];

    if (goal === 'fat_loss') {
        tips.push('Minimize rest between exercises to keep heart rate elevated');
        tips.push('Stay hydrated - drink water between circuits');
    } else if (goal === 'muscle_gain') {
        tips.push('Focus on form and controlled movements');
        tips.push('Eat protein within 2 hours after training');
    } else if (goal === 'flexibility') {
        tips.push('Breathe deeply into each stretch');
        tips.push('Never stretch to the point of pain');
    }

    if (energyLevel === 'low') {
        tips.push('Listen to your body - it\'s okay to reduce intensity');
        tips.push('Focus on mobility and recovery today');
    }

    if (recoveryStatus === 'sore') {
        tips.push('Prioritize the yoga and mobility portions');
        tips.push('Active recovery promotes blood flow for healing');
    }

    return tips;
}

/**
 * Check if exercise conflicts with injuries
 */
function hasInjuryConflict(exercise, injuries = []) {
    if (!injuries || injuries.length === 0) return false;

    const contraindications = exercise.contraindications || [];
    return injuries.some(injury =>
        contraindications.some(contra =>
            contra.toLowerCase().includes(injury.toLowerCase()) ||
            injury.toLowerCase().includes(contra.toLowerCase())
        )
    );
}

/**
 * Shuffle array utility
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Get available goal options for UI
 */
function getAvailableGoals() {
    return Object.entries(GOAL_CONFIGURATIONS).map(([key, config]) => ({
        id: key,
        name: config.name,
        description: config.rationale
    }));
}

/**
 * Get time options for UI
 */
function getTimeOptions() {
    return [
        { value: 15, label: '15 min - Quick Workout' },
        { value: 30, label: '30 min - Standard' },
        { value: 45, label: '45 min - Full Session' },
        { value: 60, label: '60 min - Complete Workout' },
        { value: 90, label: '90 min - Extended Session' }
    ];
}

/**
 * Get equipment options for UI
 */
function getEquipmentOptions() {
    return [
        { value: 'none', label: 'No Equipment (Bodyweight only)' },
        { value: 'dumbbells', label: 'Dumbbells at Home' },
        { value: 'gym', label: 'Full Gym Access' }
    ];
}

module.exports = {
    generateHolisticWorkout,
    getAvailableGoals,
    getTimeOptions,
    getEquipmentOptions,
    GOAL_CONFIGURATIONS,
    TIME_TEMPLATES
};
