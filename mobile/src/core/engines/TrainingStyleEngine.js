/**
 * Training Style Engine
 * Supports multiple workout modalities and training approaches
 */

const TRAINING_STYLES = {
    gym: {
        name: 'Gym Workout',
        icon: 'barbell',
        description: 'Full gym session with weights or machines',
        defaultDuration: 60,
        structure: ['warmup', 'main', 'cooldown'],
        requiresEquipment: true,
        intensityRange: { min: 0.6, max: 1.0 }
    },
    home: {
        name: 'Home Workout',
        icon: 'home',
        description: 'Effective workout with minimal equipment',
        defaultDuration: 45,
        structure: ['warmup', 'main', 'cooldown'],
        requiresEquipment: false,
        intensityRange: { min: 0.5, max: 0.9 },
        equipment: ['bodyweight', 'dumbbells', 'resistance_bands']
    },
    yoga: {
        name: 'Yoga Session',
        icon: 'heart',
        description: 'Flexibility, balance, and mindfulness',
        defaultDuration: 45,
        structure: ['warmup', 'asanas', 'savasana'],
        category: 'yoga',
        requiresEquipment: false,
        intensityRange: { min: 0.3, max: 0.6 }
    },
    cardio: {
        name: 'Cardio Session',
        icon: 'activity',
        description: 'Heart-pumping cardiovascular workout',
        defaultDuration: 30,
        structure: ['warmup', 'cardio', 'cooldown'],
        category: 'cardio',
        options: ['running', 'cycling', 'swimming', 'jump_rope', 'elliptical'],
        intensityRange: { min: 0.5, max: 0.95 }
    },
    hiit: {
        name: 'HIIT Session',
        icon: 'zap',
        description: 'High-intensity interval training',
        defaultDuration: 25,
        structure: ['warmup', 'intervals', 'cooldown'],
        category: 'hiit',
        intensityRange: { min: 0.7, max: 1.0 },
        restIntervals: true
    },
    calisthenics: {
        name: 'Calisthenics',
        icon: 'user',
        description: 'Bodyweight strength and skill training',
        defaultDuration: 50,
        structure: ['warmup', 'skill_work', 'strength', 'cooldown'],
        category: 'calisthenics',
        requiresEquipment: false,
        progressions: true,
        intensityRange: { min: 0.5, max: 0.95 }
    },
    mobility: {
        name: 'Mobility Session',
        icon: 'move',
        description: 'Joint health, flexibility, and movement quality',
        defaultDuration: 30,
        structure: ['dynamic_mobility', 'stretching', 'foam_rolling'],
        category: 'mobility',
        requiresEquipment: false,
        isRecovery: true,
        intensityRange: { min: 0.2, max: 0.4 }
    },
    swimming: {
        name: 'Swimming',
        icon: 'droplet',
        description: 'Full-body low-impact cardio in the pool',
        defaultDuration: 45,
        structure: ['warmup_laps', 'main_sets', 'cooldown_laps'],
        category: 'swimming',
        requiresEquipment: true,
        equipment: ['pool'],
        intensityRange: { min: 0.4, max: 0.85 }
    },
    rest: {
        name: 'Rest Day',
        icon: 'moon',
        description: 'Active recovery or complete rest',
        defaultDuration: 0,
        structure: ['light_walk', 'stretching'],
        optional: true,
        isRestDay: true,
        suggestions: [
            '10-15 min light walk',
            'Gentle stretching',
            'Foam rolling',
            'Complete rest if needed'
        ]
    }
};

/**
 * Get available training style options based on experience level
 * @param {string} experienceLevel - beginner, intermediate, advanced
 * @returns {array} available style IDs
 */
function getTrainingStyleOptions(experienceLevel) {
    const allStyles = Object.keys(TRAINING_STYLES);

    // Filter based on experience
    if (experienceLevel === 'beginner') {
        // Limit options for beginners - exclude advanced styles
        return allStyles.filter(s =>
            ['gym', 'home', 'yoga', 'cardio', 'mobility', 'rest'].includes(s)
        );
    }

    if (experienceLevel === 'intermediate') {
        // Most styles available
        return allStyles.filter(s => s !== 'swimming'); // Swimming typically needs specific skill
    }

    // Advanced - all styles
    return allStyles;
}

/**
 * Get details for a specific training style
 * @param {string} styleId - style identifier
 * @returns {object} style configuration
 */
function getStyleDetails(styleId) {
    return TRAINING_STYLES[styleId] || TRAINING_STYLES.gym;
}

/**
 * Get recommended training styles based on profile and goals
 * @param {object} profile - user profile
 * @returns {array} recommended styles with reasons
 */
function getRecommendedStyles(profile) {
    const recommendations = [];
    const goal = profile.goal_type?.toLowerCase() || '';
    const level = profile.experience_level || 'intermediate';

    // Goal-based recommendations
    if (goal.includes('muscle') || goal.includes('bulk') || goal.includes('strength')) {
        recommendations.push({
            style: 'gym',
            reason: 'Best for building muscle and strength',
            priority: 1
        });
        if (level !== 'beginner') {
            recommendations.push({
                style: 'calisthenics',
                reason: 'Bodyweight alternative for muscle building',
                priority: 2
            });
        }
    }

    if (goal.includes('fat') || goal.includes('weight_loss') || goal.includes('cut')) {
        recommendations.push({
            style: 'hiit',
            reason: 'Maximum calorie burn in minimum time',
            priority: 1
        });
        recommendations.push({
            style: 'cardio',
            reason: 'Sustainable fat burning',
            priority: 2
        });
    }

    if (goal.includes('fitness') || goal.includes('health') || goal.includes('maintain')) {
        recommendations.push({
            style: 'gym',
            reason: 'Balanced strength and conditioning',
            priority: 1
        });
        recommendations.push({
            style: 'yoga',
            reason: 'Flexibility and stress relief',
            priority: 2
        });
    }

    // Always recommend mobility for everyone
    recommendations.push({
        style: 'mobility',
        reason: 'Essential for injury prevention and recovery',
        priority: 3
    });

    // Add home if no gym access mentioned
    if (profile.gym_access === false) {
        recommendations.unshift({
            style: 'home',
            reason: 'Effective workout without gym equipment',
            priority: 1
        });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate weekly training style schedule
 * @param {object} profile - user profile
 * @param {number} workoutDays - days per week (3-6)
 * @returns {array} weekly schedule with styles
 */
function generateWeeklyStyleSchedule(profile, workoutDays = 4) {
    const goal = profile.goal_type?.toLowerCase() || '';
    const level = profile.experience_level || 'intermediate';
    const schedule = [];

    // Templates based on workout frequency
    const templates = {
        3: ['gym', 'rest', 'cardio', 'rest', 'gym', 'rest', 'mobility'],
        4: ['gym', 'cardio', 'rest', 'gym', 'rest', 'gym', 'mobility'],
        5: ['gym', 'cardio', 'gym', 'rest', 'gym', 'cardio', 'mobility'],
        6: ['gym', 'cardio', 'gym', 'hiit', 'gym', 'cardio', 'rest']
    };

    // Adjust for goals
    let baseTemplate = templates[workoutDays] || templates[4];

    if (goal.includes('muscle') || goal.includes('strength')) {
        // More gym days, fewer cardio
        baseTemplate = baseTemplate.map(s => s === 'cardio' ? 'gym' : s);
    }

    if (goal.includes('fat') || goal.includes('weight_loss')) {
        // More cardio and HIIT
        baseTemplate = baseTemplate.map((s, i) => {
            if (s === 'gym' && i > 2) return 'hiit';
            return s;
        });
    }

    // Assign to days
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    baseTemplate.forEach((style, i) => {
        schedule.push({
            day: dayNames[i],
            dayIndex: i,
            style,
            ...getStyleDetails(style)
        });
    });

    return schedule;
}

/**
 * Check if a style is suitable for current conditions
 * @param {string} styleId - style to check
 * @param {object} conditions - { hasGym, hasPool, timeAvailable, energyLevel }
 * @returns {object} { suitable: boolean, reason: string }
 */
function checkStyleSuitability(styleId, conditions) {
    const style = getStyleDetails(styleId);

    if (style.requiresEquipment) {
        if (styleId === 'gym' && !conditions.hasGym) {
            return { suitable: false, reason: 'Gym access required', alternative: 'home' };
        }
        if (styleId === 'swimming' && !conditions.hasPool) {
            return { suitable: false, reason: 'Pool access required', alternative: 'cardio' };
        }
    }

    if (conditions.timeAvailable && conditions.timeAvailable < style.defaultDuration) {
        // Suggest shorter alternative
        if (conditions.timeAvailable >= 25) {
            return { suitable: false, reason: 'Time limited', alternative: 'hiit' };
        }
        return { suitable: false, reason: 'Not enough time', alternative: 'mobility' };
    }

    if (conditions.energyLevel && conditions.energyLevel < 0.4) {
        // Low energy - suggest recovery
        if (!style.isRecovery && !style.isRestDay) {
            return { suitable: false, reason: 'Energy too low for intense workout', alternative: 'mobility' };
        }
    }

    return { suitable: true, reason: 'Good to go!' };
}

module.exports = {
    TRAINING_STYLES,
    getTrainingStyleOptions,
    getStyleDetails,
    getRecommendedStyles,
    generateWeeklyStyleSchedule,
    checkStyleSuitability
};
