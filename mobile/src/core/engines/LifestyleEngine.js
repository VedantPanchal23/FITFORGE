/**
 * Lifestyle Engine
 * Generates lifestyle recommendations based on profile and goals
 */

/**
 * Generate sleep recommendations
 */
function getSleepRecommendations(profile) {
    const recommendations = [];
    const { age, goal_type, sleep_hours_avg, stress_level } = profile;

    // Base sleep hours by age
    let targetHours = age < 18 ? 9 : age < 25 ? 8 : age < 65 ? 7.5 : 7;

    // Adjust for goal
    if (goal_type === 'muscle_gain') {
        targetHours += 0.5;
        recommendations.push('Sleep is when muscle recovery happens. Prioritize 8+ hours.');
    }

    if (stress_level === 'high') {
        recommendations.push('High stress increases cortisol. Aim for 30 min wind-down before bed.');
    }

    // Specific tips
    recommendations.push('Maintain consistent sleep/wake times, even on weekends.');
    recommendations.push('Avoid screens 1 hour before bed.');
    recommendations.push('Keep bedroom cool (18-20°C) and dark.');

    if (sleep_hours_avg && sleep_hours_avg < 6) {
        recommendations.push('PRIORITY: Your sleep is critically low. This will impair recovery and progress.');
    }

    return {
        targetHours,
        recommendations,
        priority: sleep_hours_avg && sleep_hours_avg < 6 ? 'critical' : 'normal'
    };
}

/**
 * Generate stress management recommendations
 */
function getStressRecommendations(profile) {
    const { stress_level, goal_type } = profile;
    const recommendations = [];

    if (stress_level === 'high') {
        recommendations.push('Practice 5-minute deep breathing exercises morning and evening.');
        recommendations.push('Take short walks after meals to reduce cortisol.');
        recommendations.push('Consider limiting caffeine to before noon.');

        if (goal_type === 'fat_loss') {
            recommendations.push('High stress elevates cortisol which can promote fat storage. Stress management is crucial for your goal.');
        }
    } else {
        recommendations.push('Maintain current stress levels with regular physical activity.');
    }

    recommendations.push('Practice gratitude: note 3 positive things each evening.');

    return {
        level: stress_level,
        recommendations
    };
}

/**
 * Generate digestion recommendations
 */
function getDigestionRecommendations(profile) {
    const { digestion_quality, diet_type } = profile;
    const recommendations = [];

    if (digestion_quality === 'poor') {
        recommendations.push('Chew food thoroughly - aim for 20-30 chews per bite.');
        recommendations.push('Avoid drinking large amounts of water during meals.');
        recommendations.push('Include probiotic foods like curd/yogurt daily.');
        recommendations.push('Space meals 3-4 hours apart.');

        if (diet_type === 'nonveg') {
            recommendations.push('Ensure meat is well-cooked and have with digestive spices.');
        }
    }

    recommendations.push('Stay hydrated between meals, not during.');
    recommendations.push('Include fiber-rich foods but increase gradually.');

    return {
        quality: digestion_quality,
        recommendations
    };
}

/**
 * Generate hair health recommendations
 */
function getHairHealthRecommendations(profile) {
    const { hair_concerns, protein_grams, weight_kg } = profile;
    const recommendations = [];

    if (!hair_concerns || hair_concerns.length === 0) {
        recommendations.push('Maintain protein intake for healthy hair.');
        return { recommendations };
    }

    if (hair_concerns.includes('thinning')) {
        recommendations.push('Ensure adequate protein (1.6g/kg minimum) - hair is protein.');
        recommendations.push('Include biotin-rich foods: eggs, nuts, seeds, legumes.');
        recommendations.push('Check iron levels - deficiency causes hair loss.');
        recommendations.push('Scalp massage 5 min daily to improve blood flow.');
    }

    if (hair_concerns.includes('dandruff')) {
        recommendations.push('Apply coconut oil 30 min before washing.');
        recommendations.push('Avoid hot water on scalp.');
        recommendations.push('Include zinc-rich foods: pumpkin seeds, legumes.');
    }

    if (hair_concerns.includes('dryness')) {
        recommendations.push('Increase omega-3 intake: walnuts, flaxseeds.');
        recommendations.push('Stay well hydrated - minimum 2.5L water daily.');
    }

    // Check protein adequacy
    if (protein_grams && weight_kg) {
        const proteinPerKg = protein_grams / weight_kg;
        if (proteinPerKg < 1.6) {
            recommendations.push('IMPORTANT: Your protein intake may be too low for optimal hair health.');
        }
    }

    return {
        concerns: hair_concerns,
        recommendations
    };
}

/**
 * Generate posture recommendations
 */
function getPostureRecommendations(profile) {
    const recommendations = [];

    recommendations.push('Chin tucks: 10 reps, 3x daily. Retract chin creating double chin, hold 5 sec.');
    recommendations.push('Wall angels: Stand against wall, slide arms up and down. 10 reps daily.');
    recommendations.push('Set hourly reminders to check posture if desk-bound.');
    recommendations.push('Sleep on back or side, avoid stomach sleeping.');

    if (profile.experience_level !== 'advanced') {
        recommendations.push('Strengthen upper back with doorframe rows to counteract forward shoulders.');
    }

    return { recommendations };
}

/**
 * Generate hydration recommendations
 */
function getHydrationRecommendations(profile) {
    const { weight_kg, activity_level } = profile;

    // Base: 30-35ml per kg
    let mlPerKg = 33;
    if (activity_level === 'active' || activity_level === 'very_active') {
        mlPerKg = 40;
    }

    const dailyMl = Math.round(weight_kg * mlPerKg);
    const liters = Math.round(dailyMl / 100) / 10;

    return {
        targetLiters: liters,
        recommendations: [
            `Aim for ${liters} liters daily.`,
            'Drink a glass of water upon waking.',
            'Keep water bottle visible as a reminder.',
            'Increase by 500ml on workout days.',
            'Urine should be light yellow - not clear, not dark.'
        ]
    };
}

/**
 * Generate all lifestyle recommendations
 */
function generateLifestyleRecommendations(profile) {
    return {
        sleep: getSleepRecommendations(profile),
        stress: getStressRecommendations(profile),
        digestion: getDigestionRecommendations(profile),
        hair: getHairHealthRecommendations(profile),
        posture: getPostureRecommendations(profile),
        hydration: getHydrationRecommendations(profile),

        // Daily habits
        dailyHabits: [
            'Morning sunlight exposure within 30 min of waking.',
            'Regular meal timing each day.',
            'Movement break every hour if sedentary.',
            'Evening gratitude practice.'
        ]
    };
}

/**
 * Get priority recommendations based on profile issues
 */
function getPriorityRecommendations(profile) {
    const priorities = [];

    if (profile.sleep_hours_avg && profile.sleep_hours_avg < 6) {
        priorities.push({ area: 'sleep', message: 'Sleep is critically low - this impacts all goals.' });
    }

    if (profile.stress_level === 'high') {
        priorities.push({ area: 'stress', message: 'High stress affects hormone balance and recovery.' });
    }

    if (profile.digestion_quality === 'poor') {
        priorities.push({ area: 'digestion', message: 'Poor digestion limits nutrient absorption.' });
    }

    return priorities;
}

module.exports = {
    getSleepRecommendations,
    getStressRecommendations,
    getDigestionRecommendations,
    getHairHealthRecommendations,
    getPostureRecommendations,
    getHydrationRecommendations,
    generateLifestyleRecommendations,
    getPriorityRecommendations
};
