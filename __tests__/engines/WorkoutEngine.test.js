/**
 * Workout Engine Tests
 */

const {
    getWorkoutTypeForDay,
    getMuscleGroupsForType,
    filterByDifficulty,
    filterByInjuries,
    generateWorkoutPlan,
    getProgressionSuggestion
} = require('../../src/core/engines/WorkoutEngine');

const { WORKOUT_SPLITS } = require('../../src/core/utils/constants');

describe('Workout Split Configuration', () => {
    test('beginner has 3 workout days', () => {
        expect(WORKOUT_SPLITS.beginner.daysPerWeek).toBe(3);
        expect(WORKOUT_SPLITS.beginner.structure).toBe('full_body');
    });

    test('intermediate has 4 workout days', () => {
        expect(WORKOUT_SPLITS.intermediate.daysPerWeek).toBe(4);
    });

    test('advanced has 6 workout days', () => {
        expect(WORKOUT_SPLITS.advanced.daysPerWeek).toBe(6);
    });

    test('all splits have at least 1 rest day', () => {
        expect(WORKOUT_SPLITS.beginner.restDays).toBeGreaterThanOrEqual(1);
        expect(WORKOUT_SPLITS.intermediate.restDays).toBeGreaterThanOrEqual(1);
        expect(WORKOUT_SPLITS.advanced.restDays).toBeGreaterThanOrEqual(1);
    });
});

describe('Workout Type Assignment', () => {
    test('beginner gets full body workouts', () => {
        const monday = getWorkoutTypeForDay('beginner', 0);
        expect(monday).toBe('full_body');
    });

    test('beginner gets rest days', () => {
        const pattern = WORKOUT_SPLITS.beginner.pattern;
        const restDays = pattern.filter(d => d === 'rest').length;
        expect(restDays).toBe(4);
    });

    test('advanced follows push/pull/legs', () => {
        const monday = getWorkoutTypeForDay('advanced', 0);
        const tuesday = getWorkoutTypeForDay('advanced', 1);
        const wednesday = getWorkoutTypeForDay('advanced', 2);

        expect(monday).toBe('push');
        expect(tuesday).toBe('pull');
        expect(wednesday).toBe('legs');
    });
});

describe('Muscle Group Mapping', () => {
    test('push targets chest, shoulders, triceps', () => {
        const muscles = getMuscleGroupsForType('push');
        expect(muscles).toContain('chest');
        expect(muscles).toContain('shoulders');
        expect(muscles).toContain('triceps');
    });

    test('pull targets back and biceps', () => {
        const muscles = getMuscleGroupsForType('pull');
        expect(muscles).toContain('lats');
        expect(muscles).toContain('biceps');
    });

    test('legs targets lower body', () => {
        const muscles = getMuscleGroupsForType('legs');
        expect(muscles).toContain('quads');
        expect(muscles).toContain('hamstrings');
        expect(muscles).toContain('glutes');
    });

    test('rest returns empty array', () => {
        const muscles = getMuscleGroupsForType('rest');
        expect(muscles).toEqual([]);
    });
});

describe('Difficulty Filtering', () => {
    const mockExercises = [
        { name: 'Push-up', difficulty: 3 },
        { name: 'Diamond Push-up', difficulty: 5 },
        { name: 'One-Arm Push-up', difficulty: 9 }
    ];

    test('beginner filters out advanced exercises', () => {
        const filtered = filterByDifficulty(mockExercises, 'beginner');
        expect(filtered.length).toBe(1); // Only difficulty 3 passes (max 4 for beginner)
        expect(filtered.some(e => e.difficulty > 4)).toBe(false);
    });

    test('intermediate includes medium difficulty', () => {
        const filtered = filterByDifficulty(mockExercises, 'intermediate');
        expect(filtered.length).toBe(2);
        expect(filtered.some(e => e.difficulty === 5)).toBe(true);
    });

    test('advanced includes all exercises', () => {
        const filtered = filterByDifficulty(mockExercises, 'advanced');
        expect(filtered.length).toBe(3);
    });
});

describe('Injury Filtering', () => {
    const mockExercises = [
        { name: 'Push-up', contraindications: ['wrist_injury', 'shoulder_injury'] },
        { name: 'Squat', contraindications: ['knee_injury'] },
        { name: 'Plank', contraindications: [] }
    ];

    test('removes exercises contraindicated for injury', () => {
        const filtered = filterByInjuries(mockExercises, ['wrist_injury']);
        expect(filtered.length).toBe(2);
        expect(filtered.some(e => e.name === 'Push-up')).toBe(false);
    });

    test('keeps all exercises with no injuries', () => {
        const filtered = filterByInjuries(mockExercises, []);
        expect(filtered.length).toBe(3);
    });

    test('handles multiple injuries', () => {
        const filtered = filterByInjuries(mockExercises, ['wrist_injury', 'knee_injury']);
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('Plank');
    });
});

describe('Workout Plan Generation', () => {
    const testProfile = {
        gender: 'male',
        experience_level: 'beginner',
        goal_type: 'muscle_gain',
        injuries: []
    };

    test('generates workout for non-rest day', () => {
        const plan = generateWorkoutPlan(testProfile, '2024-01-15', 0); // Monday

        expect(plan).toBeDefined();
        expect(plan.is_rest_day).toBe(0);
        expect(plan.workout.exercises.length).toBeGreaterThan(0);
    });

    test('generates rest day correctly', () => {
        const plan = generateWorkoutPlan(testProfile, '2024-01-16', 1); // Tuesday (rest for beginner)

        expect(plan.is_rest_day).toBe(1);
        expect(plan.workout_type).toBe('rest');
    });

    test('workout has warmup and cooldown', () => {
        const plan = generateWorkoutPlan(testProfile, '2024-01-15', 0);

        if (!plan.is_rest_day) {
            expect(plan.workout.warmup).toBeDefined();
            expect(plan.workout.cooldown).toBeDefined();
        }
    });

    test('workout has explanation', () => {
        const plan = generateWorkoutPlan(testProfile, '2024-01-15', 0);
        expect(plan.explanation).toBeDefined();
    });

    test('respects injury constraints', () => {
        const injuredProfile = {
            ...testProfile,
            injuries: ['wrist_injury']
        };

        const plan = generateWorkoutPlan(injuredProfile, '2024-01-15', 0);

        if (!plan.is_rest_day) {
            const hasContraindicated = plan.workout.exercises.some(ex =>
                ex.contraindications?.includes('wrist_injury')
            );
            expect(hasContraindicated).toBe(false);
        }
    });
});
