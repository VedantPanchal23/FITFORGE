/**
 * DecisionExplanation Model
 * Standardized "WHY" explanations for every recommendation
 */

const createDecisionExplanation = (data = {}) => {
    return {
        // What triggered this decision
        reason: data.reason || '',

        // Supporting data
        data: data.data || {},

        // The rule that was applied
        rule: data.rule || '',

        // What action was taken
        action: data.action || '',

        // Priority level (1-6, matching priority system)
        priority: data.priority || 5,

        // Domain affected
        domain: data.domain || 'general',

        // Human-readable explanation
        humanExplanation: data.humanExplanation || '',

        // Timestamp
        timestamp: data.timestamp || new Date().toISOString()
    };
};

// Pre-defined explanation templates
const EXPLANATION_TEMPLATES = {
    low_sleep: {
        rule: 'sleep_hours < 6',
        action: 'Workout intensity reduced 30%',
        humanExplanation: 'Your sleep was below 6 hours. To protect recovery and prevent injury, today\'s workout intensity has been reduced.'
    },
    high_stress: {
        rule: 'stress_level >= 8',
        action: 'Lighter routine suggested',
        humanExplanation: 'Your stress level is high. Heavy training can worsen this. A lighter routine will help recovery.'
    },
    low_water: {
        rule: 'water_glasses < 4 by 6PM',
        action: 'Hydration reminders increased',
        humanExplanation: 'You\'re behind on water intake. Extra reminders have been added to help you catch up.'
    },
    fasting_mode: {
        rule: 'fasting_mode = true',
        action: 'Protein timing shifted',
        humanExplanation: 'Since you\'re fasting, protein has been concentrated in your eating window for muscle preservation.'
    },
    low_mood: {
        rule: 'mood < 4 for 2 days',
        action: 'Routine lightened',
        humanExplanation: 'Your mood has been low. Today focuses on restorative activities rather than demanding tasks.'
    },
    sick_mode: {
        rule: 'mode = sick',
        action: 'Rest day activated',
        humanExplanation: 'Recovery is your priority. All demanding activities have been paused until you feel better.'
    },
    high_screen_time: {
        rule: 'screen_time > 5h',
        action: 'Sleep hygiene tasks added',
        humanExplanation: 'High screen time can disrupt sleep. Blue light blocking and wind-down activities have been added.'
    },
    missed_skin_routine: {
        rule: 'morning_routine_done = false && time > 12:00',
        action: 'Skincare priority increased',
        humanExplanation: 'You missed your morning skincare. A reminder has been added to complete evening routine.'
    }
};

// Generate explanation from template
const fromTemplate = (templateKey, customData = {}) => {
    const template = EXPLANATION_TEMPLATES[templateKey];
    if (!template) return null;

    return createDecisionExplanation({
        reason: templateKey.replace(/_/g, ' '),
        rule: template.rule,
        action: template.action,
        humanExplanation: template.humanExplanation,
        data: customData,
        ...customData
    });
};

module.exports = {
    createDecisionExplanation,
    EXPLANATION_TEMPLATES,
    fromTemplate
};
