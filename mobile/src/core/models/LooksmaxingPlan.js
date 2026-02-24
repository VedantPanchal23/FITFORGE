/**
 * LooksmaxingPlan Model
 * Data model for daily looksmaxing routines
 */

const DEFAULT_LOOKSMAXING_PLAN = {
    plan_date: null,
    skincare_am: [],
    skincare_pm: [],
    facial_exercises: [],
    mewing_protocol: null,
    grooming_tasks: [],
    lifestyle_tips: [],
    explanation: null
};

function createSkincareStep(step, product, duration_secs, notes) {
    return { step, product, duration_secs: duration_secs || 30, notes: notes || null };
}

function createFacialExercise(name, target_area, reps, hold_secs, notes) {
    return { name, target_area, reps: reps || 10, hold_secs: hold_secs || 5, notes: notes || null };
}

function createLooksmaxingPlan(data) {
    return {
        ...DEFAULT_LOOKSMAXING_PLAN,
        ...data,
        plan_date: data.plan_date || new Date().toISOString().split('T')[0]
    };
}

function serializeLooksmaxingPlan(plan) {
    return {
        plan_date: plan.plan_date,
        skincare_am: JSON.stringify(plan.skincare_am),
        skincare_pm: JSON.stringify(plan.skincare_pm),
        facial_exercises: JSON.stringify(plan.facial_exercises),
        mewing_protocol: JSON.stringify(plan.mewing_protocol),
        grooming_tasks: JSON.stringify(plan.grooming_tasks),
        lifestyle_tips: JSON.stringify(plan.lifestyle_tips),
        explanation: plan.explanation
    };
}

function deserializeLooksmaxingPlan(row) {
    if (!row) return null;
    return {
        ...row,
        skincare_am: JSON.parse(row.skincare_am || '[]'),
        skincare_pm: JSON.parse(row.skincare_pm || '[]'),
        facial_exercises: JSON.parse(row.facial_exercises || '[]'),
        mewing_protocol: JSON.parse(row.mewing_protocol || 'null'),
        grooming_tasks: JSON.parse(row.grooming_tasks || '[]'),
        lifestyle_tips: JSON.parse(row.lifestyle_tips || '[]')
    };
}

module.exports = {
    DEFAULT_LOOKSMAXING_PLAN,
    createSkincareStep,
    createFacialExercise,
    createLooksmaxingPlan,
    serializeLooksmaxingPlan,
    deserializeLooksmaxingPlan
};
