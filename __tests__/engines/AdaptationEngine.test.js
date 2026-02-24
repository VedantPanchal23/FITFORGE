/**
 * Adaptation Engine Tests
 */

const {
    analyzeLogPatterns,
    detectWeightStall,
    detectFatiguePattern,
    detectComplianceIssues,
    generateAdjustments,
    generateAdaptationReport
} = require('../../src/core/engines/AdaptationEngine');

describe('Weight Stall Detection', () => {
    test('detects weight stall on fat loss', () => {
        const weights = [75.1, 75.0, 75.1, 75.0, 75.1]; // Stable
        const result = detectWeightStall(weights, 'fat_loss');

        expect(result.stalled).toBe(true);
        expect(result.direction).toBe('need_more_deficit');
    });

    test('detects weight stall on muscle gain', () => {
        const weights = [70.0, 70.1, 70.0, 70.1, 70.0]; // Stable
        const result = detectWeightStall(weights, 'muscle_gain');

        expect(result.stalled).toBe(true);
        expect(result.direction).toBe('need_more_surplus');
    });

    test('no stall when losing weight on cut', () => {
        const weights = [74.0, 74.5, 75.0, 75.5, 76.0]; // Losing (reverse order - most recent first)
        const result = detectWeightStall(weights, 'fat_loss');

        expect(result.stalled).toBe(false);
    });

    test('returns not stalled with insufficient data', () => {
        const weights = [75.0, 75.1];
        const result = detectWeightStall(weights, 'fat_loss');

        expect(result.stalled).toBe(false);
    });
});

describe('Fatigue Pattern Detection', () => {
    test('detects low energy pattern', () => {
        const patterns = {
            avgEnergy: 2.5, // Below threshold of 3
            avgSleep: 7,
            recoveryStatuses: [{ status: 'good' }, { status: 'good' }]
        };

        const result = detectFatiguePattern(patterns);
        expect(result.fatigued).toBe(true);
        expect(result.issues).toContain('low_energy');
    });

    test('detects sleep debt', () => {
        const patterns = {
            avgEnergy: 4,
            avgSleep: 5.5, // Below 6
            recoveryStatuses: []
        };

        const result = detectFatiguePattern(patterns);
        expect(result.fatigued).toBe(true);
        expect(result.issues).toContain('sleep_debt');
    });

    test('detects poor recovery pattern', () => {
        const patterns = {
            avgEnergy: 4,
            avgSleep: 7,
            recoveryStatuses: [
                { status: 'poor' },
                { status: 'poor' },
                { status: 'poor' },
                { status: 'good' }
            ]
        };

        const result = detectFatiguePattern(patterns);
        expect(result.fatigued).toBe(true);
        expect(result.issues).toContain('poor_recovery');
    });

    test('no fatigue with good metrics', () => {
        const patterns = {
            avgEnergy: 4,
            avgSleep: 7.5,
            recoveryStatuses: [{ status: 'good' }, { status: 'excellent' }]
        };

        const result = detectFatiguePattern(patterns);
        expect(result.fatigued).toBe(false);
    });
});

describe('Compliance Issue Detection', () => {
    test('detects low protein compliance', () => {
        const patterns = {
            avgProteinCompliance: 70, // Below 80%
            avgFoodCompliance: 90,
            consecutiveSkips: 0
        };

        const issues = detectComplianceIssues(patterns);
        expect(issues.some(i => i.type === 'low_protein')).toBe(true);
    });

    test('detects consecutive workout skips', () => {
        const patterns = {
            avgProteinCompliance: 90,
            avgFoodCompliance: 85,
            consecutiveSkips: 3 // >= 2
        };

        const issues = detectComplianceIssues(patterns);
        expect(issues.some(i => i.type === 'workout_skips')).toBe(true);
    });

    test('detects low food compliance', () => {
        const patterns = {
            avgProteinCompliance: 85,
            avgFoodCompliance: 60, // Below 70%
            consecutiveSkips: 0
        };

        const issues = detectComplianceIssues(patterns);
        expect(issues.some(i => i.type === 'low_food_compliance')).toBe(true);
    });

    test('no issues with good compliance', () => {
        const patterns = {
            avgProteinCompliance: 90,
            avgFoodCompliance: 85,
            consecutiveSkips: 0
        };

        const issues = detectComplianceIssues(patterns);
        expect(issues.length).toBe(0);
    });
});

describe('Adjustment Generation', () => {
    const baseProfile = {
        gender: 'male',
        goal_type: 'fat_loss'
    };

    test('generates calorie reduction for weight stall on cut', () => {
        const patterns = {
            weights: [75.0, 75.1, 75.0, 75.1],
            avgEnergy: 4,
            avgSleep: 7,
            avgProteinCompliance: 90,
            avgFoodCompliance: 85,
            consecutiveSkips: 0,
            recoveryStatuses: []
        };

        const adjustments = generateAdjustments(baseProfile, patterns, 'fat_loss');
        const calorieAdj = adjustments.find(a => a.type === 'calories');

        expect(calorieAdj).toBeDefined();
        expect(calorieAdj.change).toBeLessThan(0);
    });

    test('prioritizes recovery over aesthetics', () => {
        const patterns = {
            weights: [75.0, 75.1, 75.0, 75.1], // Stall
            avgEnergy: 2, // Fatigue
            avgSleep: 5, // Sleep debt
            avgProteinCompliance: 90,
            avgFoodCompliance: 85,
            consecutiveSkips: 0,
            recoveryStatuses: [{ status: 'poor' }, { status: 'poor' }, { status: 'poor' }]
        };

        const adjustments = generateAdjustments(baseProfile, patterns, 'fat_loss');

        // Recovery adjustments should come first (higher priority)
        expect(adjustments[0].priority).toBeGreaterThan(adjustments[adjustments.length - 1].priority);
    });
});

describe('Adaptation Report', () => {
    const testProfile = {
        gender: 'male',
        goal_type: 'muscle_gain'
    };

    test('returns no data message for empty logs', () => {
        const report = generateAdaptationReport(testProfile, []);
        expect(report.hasData).toBe(false);
        expect(report.message).toBeDefined();
    });

    test('generates report with sufficient data', () => {
        const logs = [
            { food_compliance_percent: 90, protein_completion_percent: 85, energy_level: 4, sleep_hours: 7, workout_done: 1 },
            { food_compliance_percent: 85, protein_completion_percent: 80, energy_level: 4, sleep_hours: 7.5, workout_done: 1 },
            { food_compliance_percent: 88, protein_completion_percent: 88, energy_level: 3, sleep_hours: 6.5, workout_done: 1 }
        ];

        const report = generateAdaptationReport(testProfile, logs);

        expect(report.hasData).toBe(true);
        expect(report.patterns).toBeDefined();
        expect(report.adjustments).toBeDefined();
        expect(report.summary).toBeDefined();
    });
});
