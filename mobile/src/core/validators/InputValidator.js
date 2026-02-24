/**
 * Input Validator
 * Validates all user inputs with type checking and range validation
 */

const { VALIDATION_RANGES, DIET_TYPES } = require('../utils/constants');

function validateRequired(value, fieldName) {
    if (value === null || value === undefined || value === '') {
        return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
}

function validateNumber(value, fieldName, min, max) {
    if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: `${fieldName} must be a number` };
    }
    if (min !== undefined && value < min) {
        return { valid: false, error: `${fieldName} must be at least ${min}` };
    }
    if (max !== undefined && value > max) {
        return { valid: false, error: `${fieldName} must be at most ${max}` };
    }
    return { valid: true };
}

function validateEnum(value, fieldName, allowedValues) {
    if (!allowedValues.includes(value)) {
        return { valid: false, error: `${fieldName} must be one of: ${allowedValues.join(', ')}` };
    }
    return { valid: true };
}

function validateArray(value, fieldName) {
    if (!Array.isArray(value)) {
        return { valid: false, error: `${fieldName} must be an array` };
    }
    return { valid: true };
}

function validateGender(gender) {
    return validateEnum(gender, 'Gender', ['male', 'female']);
}

function validateAge(age) {
    const { min, max } = VALIDATION_RANGES.age;
    return validateNumber(age, 'Age', min, max);
}

function validateHeight(heightCm) {
    const { min, max } = VALIDATION_RANGES.height_cm;
    return validateNumber(heightCm, 'Height', min, max);
}

function validateWeight(weightKg) {
    const { min, max } = VALIDATION_RANGES.weight_kg;
    return validateNumber(weightKg, 'Weight', min, max);
}

function validateGoalType(goalType) {
    return validateEnum(goalType, 'Goal type', ['fat_loss', 'muscle_gain', 'recomp', 'health']);
}

function validateDietType(dietType) {
    return validateEnum(dietType, 'Diet type', Object.keys(DIET_TYPES));
}

function validateExperienceLevel(level) {
    return validateEnum(level, 'Experience level', ['beginner', 'intermediate', 'advanced']);
}

function validateActivityLevel(level) {
    return validateEnum(level, 'Activity level', ['sedentary', 'light', 'moderate', 'active', 'very_active']);
}

function validateSkinType(type) {
    return validateEnum(type, 'Skin type', ['oily', 'dry', 'combination', 'normal']);
}

function validateProfileInput(input) {
    const errors = [];
    const validators = [
        () => validateRequired(input.gender, 'Gender'),
        () => validateGender(input.gender),
        () => validateRequired(input.age, 'Age'),
        () => validateAge(input.age),
        () => validateRequired(input.height_cm, 'Height'),
        () => validateHeight(input.height_cm),
        () => validateRequired(input.weight_kg, 'Weight'),
        () => validateWeight(input.weight_kg),
        () => validateRequired(input.goal_type, 'Goal type'),
        () => validateGoalType(input.goal_type),
        () => validateRequired(input.diet_type, 'Diet type'),
        () => validateDietType(input.diet_type),
        () => validateRequired(input.experience_level, 'Experience level'),
        () => validateExperienceLevel(input.experience_level)
    ];

    for (const validator of validators) {
        const result = validator();
        if (!result.valid) errors.push(result.error);
    }

    // Optional fields
    if (input.activity_level) {
        const r = validateActivityLevel(input.activity_level);
        if (!r.valid) errors.push(r.error);
    }
    if (input.skin_type) {
        const r = validateSkinType(input.skin_type);
        if (!r.valid) errors.push(r.error);
    }

    return { valid: errors.length === 0, errors };
}

module.exports = {
    validateRequired,
    validateNumber,
    validateEnum,
    validateArray,
    validateGender,
    validateAge,
    validateHeight,
    validateWeight,
    validateGoalType,
    validateDietType,
    validateExperienceLevel,
    validateActivityLevel,
    validateSkinType,
    validateProfileInput
};
