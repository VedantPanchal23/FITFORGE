/**
 * Meal Scheduler Engine
 * Handles rescheduling meals and cascading time adjustments
 */

/**
 * Reschedule a meal to a new time
 * @param {object} mealPlan - current plan
 * @param {string} mealType - which meal to move
 * @param {string} newTime - new time in "HH:MM" format
 * @returns {object} updated plan with adjusted subsequent meals
 */
function rescheduleMeal(mealPlan, mealType, newTime) {
    const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];
    const mealIndex = mealOrder.indexOf(mealType);

    if (mealIndex === -1) return mealPlan;

    const updatedMeals = { ...mealPlan.meals };

    // Update the target meal's time
    if (updatedMeals[mealType]?.primary) {
        updatedMeals[mealType].primary.time = newTime;
    } else if (updatedMeals[mealType]) {
        // Handle old format meals without primary/alternatives structure
        updatedMeals[mealType].time = newTime;
    }

    // Cascade adjustments to subsequent meals
    const newTimeMinutes = parseTimeToMinutes(newTime);
    const minGap = 120; // 2 hours minimum between meals

    for (let i = mealIndex + 1; i < mealOrder.length; i++) {
        const nextMeal = mealOrder[i];
        const meal = updatedMeals[nextMeal];
        if (!meal) continue;

        const currentTime = meal.primary?.time || meal.time;
        if (!currentTime) continue;

        const currentMinutes = parseTimeToMinutes(currentTime);
        const previousMeal = updatedMeals[mealOrder[i - 1]];
        const previousMealTime = i === mealIndex + 1
            ? newTimeMinutes
            : parseTimeToMinutes(previousMeal?.primary?.time || previousMeal?.time || '12:00');

        if (currentMinutes < previousMealTime + minGap) {
            const adjustedTime = minutesToTime(previousMealTime + minGap);
            if (meal.primary) {
                updatedMeals[nextMeal].primary.time = adjustedTime;
            } else {
                updatedMeals[nextMeal].time = adjustedTime;
            }
        }
    }

    return {
        ...mealPlan,
        meals: updatedMeals,
        rescheduled: { mealType, newTime, timestamp: new Date().toISOString() }
    };
}

/**
 * Get rescheduling suggestions when user is busy
 * @param {object} mealPlan - current meal plan
 * @param {string} busyFrom - start of busy period "HH:MM"
 * @param {string} busyTo - end of busy period "HH:MM"
 * @returns {array} suggestions for meals that conflict with busy period
 */
function suggestReschedule(mealPlan, busyFrom, busyTo) {
    const suggestions = [];
    const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];

    mealOrder.forEach(mealType => {
        const meal = mealPlan.meals[mealType];
        const mealTime = meal?.primary?.time || meal?.time;
        if (!mealTime) return;

        const mealMinutes = parseTimeToMinutes(mealTime);
        const busyFromMinutes = parseTimeToMinutes(busyFrom);
        const busyToMinutes = parseTimeToMinutes(busyTo);

        if (mealMinutes >= busyFromMinutes && mealMinutes <= busyToMinutes) {
            // Suggest moving before or after busy period
            suggestions.push({
                mealType,
                currentTime: mealTime,
                suggestedBefore: minutesToTime(Math.max(0, busyFromMinutes - 30)),
                suggestedAfter: minutesToTime(Math.min(1410, busyToMinutes + 30)), // Cap at 23:30
                reason: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} conflicts with your busy period`
            });
        }
    });

    return suggestions;
}

/**
 * Validate that proposed time doesn't conflict with other meals
 * @param {object} mealPlan - current plan
 * @param {string} mealType - meal to check
 * @param {string} proposedTime - proposed new time
 * @returns {object} { valid: boolean, message: string }
 */
function validateMealTime(mealPlan, mealType, proposedTime) {
    const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];
    const mealIndex = mealOrder.indexOf(mealType);
    const proposedMinutes = parseTimeToMinutes(proposedTime);
    const minGap = 90; // 1.5 hours minimum

    // Check preceding meal
    if (mealIndex > 0) {
        const prevMeal = mealPlan.meals[mealOrder[mealIndex - 1]];
        const prevTime = prevMeal?.primary?.time || prevMeal?.time;
        if (prevTime) {
            const prevMinutes = parseTimeToMinutes(prevTime);
            if (proposedMinutes < prevMinutes + minGap) {
                return {
                    valid: false,
                    message: `Too close to ${mealOrder[mealIndex - 1]}. Allow at least 1.5 hours between meals.`
                };
            }
        }
    }

    // Check following meal
    if (mealIndex < mealOrder.length - 1) {
        const nextMeal = mealPlan.meals[mealOrder[mealIndex + 1]];
        const nextTime = nextMeal?.primary?.time || nextMeal?.time;
        if (nextTime) {
            const nextMinutes = parseTimeToMinutes(nextTime);
            if (proposedMinutes > nextMinutes - minGap) {
                return {
                    valid: false,
                    message: `Too close to ${mealOrder[mealIndex + 1]}. Allow at least 1.5 hours between meals.`,
                    suggestion: minutesToTime(nextMinutes - minGap)
                };
            }
        }
    }

    return { valid: true, message: 'Time is valid' };
}

/**
 * Get default meal times based on profile
 * @param {object} profile - user profile
 * @returns {object} default times for each meal type
 */
function getDefaultMealTimes(profile) {
    const wakeTime = profile.wake_time || '06:00';
    const wakeMinutes = parseTimeToMinutes(wakeTime);

    return {
        breakfast: minutesToTime(wakeMinutes + 60),  // 1 hour after wake
        lunch: minutesToTime(wakeMinutes + 360),     // 6 hours after wake
        snack: minutesToTime(wakeMinutes + 480),     // 8 hours after wake
        dinner: minutesToTime(wakeMinutes + 720)     // 12 hours after wake
    };
}

// Helper functions
function parseTimeToMinutes(time) {
    if (!time || typeof time !== 'string') return 720; // Default to noon
    const parts = time.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
}

function minutesToTime(minutes) {
    const clamped = Math.max(0, Math.min(1439, minutes)); // Clamp to valid day range
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

module.exports = {
    rescheduleMeal,
    suggestReschedule,
    validateMealTime,
    getDefaultMealTimes,
    parseTimeToMinutes,
    minutesToTime
};
