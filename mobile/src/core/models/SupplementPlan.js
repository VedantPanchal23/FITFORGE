/**
 * SupplementPlan Model
 * Data model for daily supplement schedule
 */

const DEFAULT_SUPPLEMENT_PLAN = {
    plan_date: null,
    supplements: [],
    schedule: {
        morning: [],
        with_breakfast: [],
        mid_morning: [],
        pre_workout: [],
        post_workout: [],
        with_lunch: [],
        afternoon: [],
        with_dinner: [],
        before_bed: []
    },
    reminders: [],
    interactions: [],
    synergies: [],
    recommendations: []
};

/**
 * Create a supplement plan from data
 * @param {object} data - partial supplement plan data
 * @returns {object} complete supplement plan
 */
function createSupplementPlan(data) {
    const plan = { ...DEFAULT_SUPPLEMENT_PLAN, ...data };

    // Ensure schedule has all time slots
    plan.schedule = {
        ...DEFAULT_SUPPLEMENT_PLAN.schedule,
        ...(data.schedule || {})
    };

    // Remove empty schedule slots for cleaner output
    Object.keys(plan.schedule).forEach(key => {
        if (!plan.schedule[key] || plan.schedule[key].length === 0) {
            delete plan.schedule[key];
        }
    });

    return plan;
}

/**
 * Add a supplement to the plan
 * @param {object} plan - existing plan
 * @param {object} supplement - supplement to add
 * @param {string} timeSlot - when to take it
 * @returns {object} updated plan
 */
function addSupplementToPlan(plan, supplement, timeSlot) {
    const updatedPlan = { ...plan };

    if (!updatedPlan.schedule[timeSlot]) {
        updatedPlan.schedule[timeSlot] = [];
    }

    // Check if already exists
    const exists = updatedPlan.schedule[timeSlot].some(s => s.id === supplement.id);
    if (!exists) {
        updatedPlan.schedule[timeSlot].push(supplement);
        updatedPlan.supplements.push(supplement.id);
    }

    return updatedPlan;
}

/**
 * Remove a supplement from the plan
 * @param {object} plan - existing plan
 * @param {string} supplementId - supplement ID to remove
 * @returns {object} updated plan
 */
function removeSupplementFromPlan(plan, supplementId) {
    const updatedPlan = { ...plan };

    // Remove from all time slots
    Object.keys(updatedPlan.schedule).forEach(timeSlot => {
        updatedPlan.schedule[timeSlot] = updatedPlan.schedule[timeSlot].filter(
            s => s.id !== supplementId
        );
        if (updatedPlan.schedule[timeSlot].length === 0) {
            delete updatedPlan.schedule[timeSlot];
        }
    });

    // Remove from supplements array
    updatedPlan.supplements = updatedPlan.supplements.filter(id => id !== supplementId);

    return updatedPlan;
}

/**
 * Get flattened list of all supplements for the day
 * @param {object} plan - supplement plan
 * @returns {array} all supplements
 */
function getAllSupplementsFromPlan(plan) {
    const all = [];
    Object.entries(plan.schedule).forEach(([time, supplements]) => {
        supplements.forEach(supp => {
            all.push({ ...supp, timeSlot: time });
        });
    });
    return all;
}

/**
 * Generate reminder times from schedule
 * @param {object} plan - supplement plan
 * @param {object} mealTimes - { breakfast: "HH:MM", lunch: "HH:MM", dinner: "HH:MM" }
 * @returns {array} reminder objects with times
 */
function generateSupplementReminders(plan, mealTimes = {}) {
    const reminders = [];
    const defaultTimes = {
        morning: '07:00',
        with_breakfast: mealTimes.breakfast || '08:00',
        mid_morning: '10:30',
        pre_workout: '16:30',
        post_workout: '18:00',
        with_lunch: mealTimes.lunch || '13:00',
        afternoon: '15:00',
        with_dinner: mealTimes.dinner || '20:00',
        before_bed: '22:00'
    };

    Object.entries(plan.schedule).forEach(([timeSlot, supplements]) => {
        if (supplements.length > 0) {
            reminders.push({
                time: defaultTimes[timeSlot] || '12:00',
                timeSlot,
                supplements: supplements.map(s => s.name),
                message: `Time to take: ${supplements.map(s => s.name).join(', ')}`
            });
        }
    });

    return reminders.sort((a, b) => a.time.localeCompare(b.time));
}

module.exports = {
    DEFAULT_SUPPLEMENT_PLAN,
    createSupplementPlan,
    addSupplementToPlan,
    removeSupplementFromPlan,
    getAllSupplementsFromPlan,
    generateSupplementReminders
};
