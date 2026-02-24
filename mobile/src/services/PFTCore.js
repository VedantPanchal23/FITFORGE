/**
 * PFT Core Service
 * Bridge between mobile app and PFT core logic
 * Provides plan generation and calculations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// BODY CALCULATIONS (from BodyEngine)
// ============================================================================

const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
};

const CALORIE_LIMITS = {
    minMale: 1500,
    minFemale: 1200,
    maxDeficit: 500,
    maxSurplus: 300
};

export const calculateBMR = (profile) => {
    const { gender, weight_kg, height_cm, age } = profile;
    if (gender === 'male') {
        return Math.round(88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age));
    }
    return Math.round(447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age));
};

export const calculateTDEE = (profile) => {
    const bmr = calculateBMR(profile);
    const multiplier = ACTIVITY_MULTIPLIERS[profile.activity_level] || 1.55;
    return Math.round(bmr * multiplier);
};

export const calculateBMI = (weight_kg, height_cm) => {
    const height_m = height_cm / 100;
    return Math.round((weight_kg / (height_m * height_m)) * 10) / 10;
};

export const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#F59E0B' };
    if (bmi < 25) return { category: 'Normal', color: '#10B981' };
    if (bmi < 30) return { category: 'Overweight', color: '#F59E0B' };
    return { category: 'Obese', color: '#EF4444' };
};

// ============================================================================
// MACRO CALCULATIONS (from NutritionEngine)
// ============================================================================

const MACRO_RATIOS = {
    fat_loss: { protein: 2.2, carbs: 2.5, fats: 0.8 },
    muscle_gain: { protein: 2.0, carbs: 4.5, fats: 1.0 },
    recomp: { protein: 2.2, carbs: 3.0, fats: 0.9 },
    health: { protein: 1.8, carbs: 3.5, fats: 1.0 }
};

export const calculateMacros = (profile) => {
    const tdee = calculateTDEE(profile);
    const { goal_type, weight_kg, gender } = profile;
    const ratios = MACRO_RATIOS[goal_type] || MACRO_RATIOS.health;

    let targetCalories = tdee;
    if (goal_type === 'fat_loss') {
        targetCalories = Math.max(tdee - 500, gender === 'male' ? CALORIE_LIMITS.minMale : CALORIE_LIMITS.minFemale);
    } else if (goal_type === 'muscle_gain') {
        targetCalories = tdee + 300;
    }

    const protein = Math.round(weight_kg * ratios.protein);
    const fats = Math.round(weight_kg * ratios.fats);
    const proteinCals = protein * 4;
    const fatsCals = fats * 9;
    const carbsCals = targetCalories - proteinCals - fatsCals;
    const carbs = Math.round(carbsCals / 4);

    return {
        calories: targetCalories,
        protein,
        carbs,
        fats,
        fiber: Math.round(targetCalories / 1000 * 14)
    };
};

// ============================================================================
// MEAL PLAN GENERATION
// ============================================================================

const INDIAN_MEALS = {
    breakfast: [
        { name: 'Oats with Milk & Banana', protein: 15, carbs: 45, fats: 8, calories: 312 },
        { name: 'Poha with Peanuts', protein: 10, carbs: 40, fats: 10, calories: 290 },
        { name: 'Moong Dal Cheela', protein: 18, carbs: 25, fats: 8, calories: 244 },
        { name: 'Idli with Sambar', protein: 12, carbs: 35, fats: 5, calories: 233 },
        { name: 'Paneer Paratha', protein: 20, carbs: 35, fats: 15, calories: 355 },
        { name: 'Upma with Vegetables', protein: 8, carbs: 35, fats: 8, calories: 244 }
    ],
    lunch: [
        { name: 'Dal + Rice + Sabzi', protein: 20, carbs: 60, fats: 10, calories: 410 },
        { name: 'Rajma Chawal', protein: 22, carbs: 55, fats: 8, calories: 382 },
        { name: 'Chicken Curry + Rice', protein: 35, carbs: 45, fats: 15, calories: 455 },
        { name: 'Chole + 2 Roti', protein: 18, carbs: 50, fats: 12, calories: 380 },
        { name: 'Fish Curry + Rice', protein: 32, carbs: 45, fats: 12, calories: 416 },
        { name: 'Paneer Bhurji + 2 Roti', protein: 25, carbs: 40, fats: 18, calories: 422 }
    ],
    dinner: [
        { name: 'Grilled Chicken + Salad', protein: 40, carbs: 15, fats: 10, calories: 310 },
        { name: 'Dal Khichdi', protein: 18, carbs: 45, fats: 10, calories: 342 },
        { name: 'Egg Bhurji + 2 Roti', protein: 22, carbs: 35, fats: 18, calories: 390 },
        { name: 'Vegetable Pulao', protein: 12, carbs: 55, fats: 12, calories: 376 },
        { name: 'Paneer Tikka + Roti', protein: 28, carbs: 30, fats: 16, calories: 376 },
        { name: 'Mixed Dal + Rice', protein: 18, carbs: 50, fats: 8, calories: 344 }
    ],
    snack: [
        { name: 'Greek Yogurt + Almonds', protein: 15, carbs: 12, fats: 10, calories: 198 },
        { name: 'Protein Shake', protein: 25, carbs: 8, fats: 3, calories: 159 },
        { name: 'Sprouts Chaat', protein: 12, carbs: 20, fats: 5, calories: 173 },
        { name: 'Roasted Chana', protein: 10, carbs: 25, fats: 4, calories: 176 },
        { name: 'Fruit + Peanut Butter', protein: 8, carbs: 25, fats: 12, calories: 236 }
    ]
};

export const generateMealPlan = (profile) => {
    const macros = calculateMacros(profile);
    const { diet_type } = profile;

    const filterByDiet = (meals) => {
        if (diet_type === 'veg' || diet_type === 'jain') {
            return meals.filter(m => !m.name.toLowerCase().includes('chicken') && !m.name.toLowerCase().includes('fish') && !m.name.toLowerCase().includes('egg'));
        }
        if (diet_type === 'veg_egg') {
            return meals.filter(m => !m.name.toLowerCase().includes('chicken') && !m.name.toLowerCase().includes('fish'));
        }
        return meals;
    };

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const breakfast = pickRandom(filterByDiet(INDIAN_MEALS.breakfast));
    const lunch = pickRandom(filterByDiet(INDIAN_MEALS.lunch));
    const dinner = pickRandom(filterByDiet(INDIAN_MEALS.dinner));
    const snack = pickRandom(filterByDiet(INDIAN_MEALS.snack));

    return {
        target: macros,
        meals: [
            { type: 'Breakfast', time: '8:00 AM', ...breakfast },
            { type: 'Lunch', time: '1:00 PM', ...lunch },
            { type: 'Snack', time: '4:30 PM', ...snack },
            { type: 'Dinner', time: '8:00 PM', ...dinner }
        ],
        totals: {
            calories: breakfast.calories + lunch.calories + dinner.calories + snack.calories,
            protein: breakfast.protein + lunch.protein + dinner.protein + snack.protein,
            carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs,
            fats: breakfast.fats + lunch.fats + dinner.fats + snack.fats
        }
    };
};

// ============================================================================
// WORKOUT GENERATION
// ============================================================================

const WORKOUT_SPLITS = {
    beginner: {
        pattern: ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Rest']
    },
    intermediate: {
        pattern: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest']
    },
    advanced: {
        pattern: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest']
    }
};

const EXERCISES = {
    push: [
        { name: 'Bench Press', sets: 4, reps: '8-10', muscle: 'Chest' },
        { name: 'Overhead Press', sets: 3, reps: '8-10', muscle: 'Shoulders' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', muscle: 'Upper Chest' },
        { name: 'Lateral Raises', sets: 3, reps: '12-15', muscle: 'Shoulders' },
        { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', muscle: 'Triceps' }
    ],
    pull: [
        { name: 'Barbell Rows', sets: 4, reps: '8-10', muscle: 'Back' },
        { name: 'Lat Pulldowns', sets: 3, reps: '10-12', muscle: 'Lats' },
        { name: 'Face Pulls', sets: 3, reps: '15-20', muscle: 'Rear Delts' },
        { name: 'Barbell Curls', sets: 3, reps: '10-12', muscle: 'Biceps' },
        { name: 'Hammer Curls', sets: 3, reps: '12-15', muscle: 'Biceps' }
    ],
    legs: [
        { name: 'Squats', sets: 4, reps: '8-10', muscle: 'Quads' },
        { name: 'Romanian Deadlifts', sets: 3, reps: '10-12', muscle: 'Hamstrings' },
        { name: 'Leg Press', sets: 3, reps: '12-15', muscle: 'Quads' },
        { name: 'Leg Curls', sets: 3, reps: '12-15', muscle: 'Hamstrings' },
        { name: 'Calf Raises', sets: 4, reps: '15-20', muscle: 'Calves' }
    ],
    full_body: [
        { name: 'Squats', sets: 3, reps: '10', muscle: 'Legs' },
        { name: 'Bench Press', sets: 3, reps: '10', muscle: 'Chest' },
        { name: 'Barbell Rows', sets: 3, reps: '10', muscle: 'Back' },
        { name: 'Overhead Press', sets: 3, reps: '10', muscle: 'Shoulders' },
        { name: 'Planks', sets: 3, reps: '30s', muscle: 'Core' }
    ],
    upper: [
        { name: 'Bench Press', sets: 3, reps: '8-10', muscle: 'Chest' },
        { name: 'Barbell Rows', sets: 3, reps: '8-10', muscle: 'Back' },
        { name: 'Overhead Press', sets: 3, reps: '10', muscle: 'Shoulders' },
        { name: 'Lat Pulldowns', sets: 3, reps: '10-12', muscle: 'Lats' },
        { name: 'Bicep Curls', sets: 2, reps: '12', muscle: 'Biceps' },
        { name: 'Tricep Dips', sets: 2, reps: '12', muscle: 'Triceps' }
    ],
    lower: [
        { name: 'Squats', sets: 4, reps: '8-10', muscle: 'Quads' },
        { name: 'Romanian Deadlifts', sets: 3, reps: '10-12', muscle: 'Hamstrings' },
        { name: 'Leg Press', sets: 3, reps: '12', muscle: 'Quads' },
        { name: 'Lunges', sets: 3, reps: '10 each', muscle: 'Legs' },
        { name: 'Calf Raises', sets: 4, reps: '15', muscle: 'Calves' }
    ]
};

export const generateWorkoutPlan = (profile, dayOfWeek = new Date().getDay()) => {
    const { experience_level, injuries = [] } = profile;
    const split = WORKOUT_SPLITS[experience_level] || WORKOUT_SPLITS.beginner;
    const dayType = split.pattern[dayOfWeek].toLowerCase().replace(' ', '_');

    if (dayType === 'rest') {
        return { isRestDay: true, message: 'Rest Day - Focus on recovery' };
    }

    let exercises = EXERCISES[dayType] || EXERCISES.full_body;

    // Filter out exercises based on injuries
    if (injuries.includes('shoulder_injury')) {
        exercises = exercises.filter(e => !e.muscle.toLowerCase().includes('shoulder') && !e.name.toLowerCase().includes('overhead'));
    }
    if (injuries.includes('knee_injury')) {
        exercises = exercises.filter(e => !e.name.toLowerCase().includes('squat') && !e.name.toLowerCase().includes('lunge'));
    }
    if (injuries.includes('back_injury')) {
        exercises = exercises.filter(e => !e.name.toLowerCase().includes('deadlift') && !e.name.toLowerCase().includes('row'));
    }

    return {
        isRestDay: false,
        name: split.pattern[dayOfWeek],
        duration: '45-60 min',
        exercises: exercises.map(e => ({ ...e, completed: false }))
    };
};

// ============================================================================
// SKINCARE ROUTINE
// ============================================================================

export const generateSkincareRoutine = (profile) => {
    const { looksmaxing } = profile;
    const skinType = looksmaxing?.skin_type || 'normal';
    const concerns = looksmaxing?.skin_concerns || [];

    const morning = [
        { step: 1, name: 'Gentle Cleanser', product: skinType === 'oily' ? 'Foaming gel' : 'Cream cleanser', done: false },
        { step: 2, name: 'Toner', product: concerns.includes('acne') ? 'Salicylic acid' : 'Hydrating toner', done: false },
        { step: 3, name: 'Serum', product: concerns.includes('dark_circles') ? 'Vitamin C' : 'Niacinamide', done: false },
        { step: 4, name: 'Moisturizer', product: skinType === 'oily' ? 'Oil-free gel' : 'Hydrating cream', done: false },
        { step: 5, name: 'Sunscreen', product: 'SPF 50+ PA++++', done: false }
    ];

    const evening = [
        { step: 1, name: 'Oil Cleanser', product: 'DHC or similar', done: false },
        { step: 2, name: 'Water Cleanser', product: 'Gentle formula', done: false },
        { step: 3, name: 'Treatment', product: concerns.includes('acne') ? 'Benzoyl Peroxide' : 'Retinol', done: false },
        { step: 4, name: 'Night Cream', product: 'Rich moisturizer', done: false }
    ];

    return { morning, evening };
};

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const KEYS = {
    PROFILE: '@fitforge_profile',
    DAILY_LOGS: '@fitforge_logs',
    WEIGHT_HISTORY: '@fitforge_weights',
    HABITS: '@fitforge_habits',
    MEAL_PLAN: '@fitforge_meals',
    WORKOUT_LOG: '@fitforge_workouts'
};

export const getProfile = async () => {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
};

export const saveProfile = async (profile) => {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getDailyLog = async (date) => {
    const logs = await AsyncStorage.getItem(KEYS.DAILY_LOGS);
    const parsed = logs ? JSON.parse(logs) : {};
    return parsed[date] || null;
};

export const saveDailyLog = async (date, log) => {
    const logs = await AsyncStorage.getItem(KEYS.DAILY_LOGS);
    const parsed = logs ? JSON.parse(logs) : {};
    parsed[date] = log;
    await AsyncStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(parsed));
};

export const getWeightHistory = async () => {
    const data = await AsyncStorage.getItem(KEYS.WEIGHT_HISTORY);
    return data ? JSON.parse(data) : [];
};

export const addWeightEntry = async (weight) => {
    const history = await getWeightHistory();
    const today = new Date().toISOString().split('T')[0];
    history.unshift({ date: today, weight });
    await AsyncStorage.setItem(KEYS.WEIGHT_HISTORY, JSON.stringify(history.slice(0, 365)));
};

export const getHabits = async () => {
    const data = await AsyncStorage.getItem(KEYS.HABITS);
    return data ? JSON.parse(data) : {};
};

export const updateHabit = async (habitId, completed) => {
    const habits = await getHabits();
    const today = new Date().toISOString().split('T')[0];

    if (!habits[habitId]) {
        habits[habitId] = { streak: 0, lastDate: null, total: 0 };
    }

    const habit = habits[habitId];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (completed && habit.lastDate !== today) {
        habit.streak = habit.lastDate === yesterdayStr ? habit.streak + 1 : 1;
        habit.lastDate = today;
        habit.total++;
    }

    await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
    return habit;
};

// ============================================================================
// EXPORT ALL DATA
// ============================================================================

export const exportAllData = async () => {
    const profile = await getProfile();
    const logs = await AsyncStorage.getItem(KEYS.DAILY_LOGS);
    const weights = await getWeightHistory();
    const habits = await getHabits();

    return {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        profile,
        dailyLogs: logs ? JSON.parse(logs) : {},
        weightHistory: weights,
        habits
    };
};

export const importData = async (data) => {
    if (data.profile) await saveProfile(data.profile);
    if (data.dailyLogs) await AsyncStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(data.dailyLogs));
    if (data.weightHistory) await AsyncStorage.setItem(KEYS.WEIGHT_HISTORY, JSON.stringify(data.weightHistory));
    if (data.habits) await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(data.habits));
};

export const clearAllData = async () => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
};
