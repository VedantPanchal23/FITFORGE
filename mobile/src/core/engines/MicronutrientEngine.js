/**
 * Micronutrient Engine
 * Tracks and analyzes micronutrient intake and deficiencies
 */

/**
 * Daily recommended intake (DRI) by gender
 */
const DRI = {
    male: {
        iron_mg: 8,
        calcium_mg: 1000,
        zinc_mg: 11,
        magnesium_mg: 400,
        vitamin_a_mcg: 900,
        vitamin_c_mg: 90,
        vitamin_d_mcg: 15,
        vitamin_b12_mcg: 2.4,
        folate_mcg: 400,
        vitamin_e_mg: 15,
        omega3_mg: 1600,
        fiber_g: 38
    },
    female: {
        iron_mg: 18,  // Higher for menstruating women
        calcium_mg: 1000,
        zinc_mg: 8,
        magnesium_mg: 310,
        vitamin_a_mcg: 700,
        vitamin_c_mg: 75,
        vitamin_d_mcg: 15,
        vitamin_b12_mcg: 2.4,
        folate_mcg: 400,
        vitamin_e_mg: 15,
        omega3_mg: 1100,
        fiber_g: 25
    }
};

/**
 * Symptoms linked to deficiencies
 */
const DEFICIENCY_SYMPTOMS = {
    iron_mg: {
        mild: ['fatigue', 'weakness'],
        moderate: ['pale_skin', 'brittle_nails', 'hair_loss'],
        severe: ['dizziness', 'cold_hands_feet', 'headaches']
    },
    calcium_mg: {
        mild: ['muscle_cramps'],
        moderate: ['weak_nails', 'tooth_problems'],
        severe: ['bone_pain', 'fractures']
    },
    zinc_mg: {
        mild: ['slow_healing'],
        moderate: ['hair_loss', 'acne', 'loss_of_taste'],
        severe: ['immune_weakness', 'skin_lesions']
    },
    magnesium_mg: {
        mild: ['muscle_twitches', 'leg_cramps'],
        moderate: ['fatigue', 'weakness', 'anxiety'],
        severe: ['numbness', 'heart_rhythm_issues']
    },
    vitamin_d_mcg: {
        mild: ['fatigue'],
        moderate: ['bone_pain', 'muscle_weakness', 'mood_changes'],
        severe: ['frequent_illness', 'depression']
    },
    omega3_mg: {
        mild: ['dry_skin'],
        moderate: ['dry_eyes', 'joint_pain', 'poor_concentration'],
        severe: ['depression', 'inflammation']
    },
    fiber_g: {
        mild: ['occasional_constipation'],
        moderate: ['digestive_issues', 'blood_sugar_spikes'],
        severe: ['chronic_constipation', 'gut_health_issues']
    }
};

/**
 * Health areas affected by each micronutrient
 */
const HEALTH_AREAS = {
    hair_health: ['iron_mg', 'zinc_mg', 'omega3_mg', 'vitamin_d_mcg', 'folate_mcg'],
    skin_health: ['zinc_mg', 'vitamin_c_mg', 'vitamin_a_mcg', 'omega3_mg', 'vitamin_e_mg'],
    digestion: ['fiber_g', 'magnesium_mg'],
    energy: ['iron_mg', 'vitamin_b12_mcg', 'magnesium_mg', 'vitamin_d_mcg'],
    immunity: ['vitamin_c_mg', 'vitamin_d_mcg', 'zinc_mg'],
    bone_health: ['calcium_mg', 'vitamin_d_mcg', 'magnesium_mg'],
    mental_health: ['omega3_mg', 'vitamin_d_mcg', 'magnesium_mg', 'folate_mcg']
};

/**
 * Calculate micronutrient totals from foods consumed
 */
function calculateMicronutrientIntake(foods) {
    const totals = {};

    foods.forEach(food => {
        const nutrition = food.nutrition || food;
        for (const [key, value] of Object.entries(nutrition)) {
            if (key.includes('_mg') || key.includes('_mcg') || key === 'fiber') {
                const normalizedKey = key === 'fiber' ? 'fiber_g' : key;
                totals[normalizedKey] = (totals[normalizedKey] || 0) + (value || 0);
            }
        }
    });

    return totals;
}

/**
 * Analyze micronutrient status against DRI
 */
function analyzeMicronutrientStatus(intake, gender) {
    const dri = DRI[gender] || DRI.male;
    const analysis = {};

    for (const [nutrient, requirement] of Object.entries(dri)) {
        const consumed = intake[nutrient] || 0;
        const percent = Math.round((consumed / requirement) * 100);

        let status;
        if (percent >= 100) status = 'adequate';
        else if (percent >= 75) status = 'borderline';
        else if (percent >= 50) status = 'low';
        else status = 'deficient';

        analysis[nutrient] = {
            consumed: Math.round(consumed * 10) / 10,
            required: requirement,
            percent,
            status,
            gap: Math.max(0, requirement - consumed)
        };
    }

    return analysis;
}

/**
 * Get deficiency warnings based on intake patterns
 */
function getDeficiencyWarnings(analysis, dietType) {
    const warnings = [];

    // Check each nutrient
    for (const [nutrient, data] of Object.entries(analysis)) {
        if (data.status === 'deficient') {
            warnings.push({
                nutrient,
                severity: 'high',
                message: `${formatNutrientName(nutrient)} is severely low (${data.percent}% of requirement)`,
                symptoms: DEFICIENCY_SYMPTOMS[nutrient]?.moderate || []
            });
        } else if (data.status === 'low') {
            warnings.push({
                nutrient,
                severity: 'medium',
                message: `${formatNutrientName(nutrient)} is below target (${data.percent}%)`,
                symptoms: DEFICIENCY_SYMPTOMS[nutrient]?.mild || []
            });
        }
    }

    // Diet-specific warnings
    if (dietType === 'veg' || dietType === 'jain') {
        if (!analysis.vitamin_b12_mcg || analysis.vitamin_b12_mcg.status !== 'adequate') {
            warnings.push({
                nutrient: 'vitamin_b12_mcg',
                severity: 'high',
                message: 'Vitamin B12 is difficult to get from vegetarian sources. Consider supplementation.',
                dietSpecific: true
            });
        }
    }

    if (dietType === 'jain') {
        warnings.push({
            nutrient: 'general',
            severity: 'info',
            message: 'Without root vegetables, focus on leafy greens, nuts, and dairy for micronutrients.',
            dietSpecific: true
        });
    }

    return warnings.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2, info: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

/**
 * Get recommendations to fix deficiencies
 */
function getDeficiencyRecommendations(analysis, dietType, availableFoods) {
    const recommendations = [];

    for (const [nutrient, data] of Object.entries(analysis)) {
        if (data.status === 'deficient' || data.status === 'low') {
            const nutrientKey = nutrient.replace('_mg', '').replace('_mcg', '').replace('_g', '');

            // Find foods rich in this nutrient that match diet
            const richFoods = availableFoods
                .filter(f => {
                    const value = f.per_100g?.[nutrient] || 0;
                    return value > data.required * 0.2; // At least 20% DRI per 100g
                })
                .slice(0, 3)
                .map(f => f.name);

            recommendations.push({
                nutrient,
                gap: data.gap,
                foods: richFoods,
                suggestion: richFoods.length > 0
                    ? `Include more: ${richFoods.join(', ')}`
                    : `Consider ${formatNutrientName(nutrient)} supplementation`
            });
        }
    }

    return recommendations;
}

/**
 * Analyze with respect to health goals
 */
function analyzeForHealthArea(analysis, healthArea) {
    const relevantNutrients = HEALTH_AREAS[healthArea] || [];

    const areaAnalysis = {
        area: healthArea,
        nutrients: {},
        overallStatus: 'good',
        concerns: [],
        recommendations: []
    };

    let worstStatus = 'adequate';

    relevantNutrients.forEach(nutrient => {
        if (analysis[nutrient]) {
            areaAnalysis.nutrients[nutrient] = analysis[nutrient];

            if (analysis[nutrient].status === 'deficient') {
                worstStatus = 'deficient';
                areaAnalysis.concerns.push(`Low ${formatNutrientName(nutrient)}`);
            } else if (analysis[nutrient].status === 'low' && worstStatus !== 'deficient') {
                worstStatus = 'low';
                areaAnalysis.concerns.push(`Borderline ${formatNutrientName(nutrient)}`);
            }
        }
    });

    if (worstStatus === 'deficient') {
        areaAnalysis.overallStatus = 'poor';
        areaAnalysis.recommendations.push(`Priority: Address ${healthArea} through targeted nutrition`);
    } else if (worstStatus === 'low') {
        areaAnalysis.overallStatus = 'moderate';
        areaAnalysis.recommendations.push(`Improvement needed for optimal ${healthArea}`);
    }

    return areaAnalysis;
}

/**
 * Generate micronutrient report
 */
function generateMicronutrientReport(intake, gender, dietType, concerns = []) {
    const analysis = analyzeMicronutrientStatus(intake, gender);
    const warnings = getDeficiencyWarnings(analysis, dietType);

    const report = {
        date: new Date().toISOString().split('T')[0],
        summary: {
            adequate: 0,
            borderline: 0,
            low: 0,
            deficient: 0
        },
        details: analysis,
        warnings,
        healthAreas: {}
    };

    // Count statuses
    for (const data of Object.values(analysis)) {
        report.summary[data.status]++;
    }

    // Analyze for relevant health areas
    if (concerns.includes('hair') || concerns.includes('hair_loss')) {
        report.healthAreas.hair = analyzeForHealthArea(analysis, 'hair_health');
    }
    if (concerns.includes('skin') || concerns.includes('acne')) {
        report.healthAreas.skin = analyzeForHealthArea(analysis, 'skin_health');
    }
    if (concerns.includes('energy') || concerns.includes('fatigue')) {
        report.healthAreas.energy = analyzeForHealthArea(analysis, 'energy');
    }
    if (concerns.includes('digestion')) {
        report.healthAreas.digestion = analyzeForHealthArea(analysis, 'digestion');
    }

    // Overall score
    const total = Object.keys(analysis).length;
    const adequatePercent = (report.summary.adequate / total) * 100;
    report.overallScore = Math.round(adequatePercent);

    return report;
}

/**
 * Format nutrient name for display
 */
function formatNutrientName(nutrient) {
    return nutrient
        .replace('_mg', '')
        .replace('_mcg', '')
        .replace('_g', '')
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

module.exports = {
    DRI,
    DEFICIENCY_SYMPTOMS,
    HEALTH_AREAS,
    calculateMicronutrientIntake,
    analyzeMicronutrientStatus,
    getDeficiencyWarnings,
    getDeficiencyRecommendations,
    analyzeForHealthArea,
    generateMicronutrientReport,
    formatNutrientName
};
