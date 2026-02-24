/**
 * Progress Tracking Service
 * Tracks goal progress, body measurements, and visual indicators
 */

/**
 * Calculate progress towards weight goal
 */
function calculateWeightProgress(profile) {
    if (!profile.target_weight_kg || !profile.weight_kg) {
        return { hasGoal: false };
    }

    const startWeight = profile.goal_start_weight || profile.weight_kg;
    const currentWeight = profile.weight_kg;
    const targetWeight = profile.target_weight_kg;

    const totalChange = Math.abs(targetWeight - startWeight);
    const currentChange = Math.abs(currentWeight - startWeight);

    // Handle direction (loss vs gain)
    const isLoss = targetWeight < startWeight;
    const movingCorrectDirection = isLoss
        ? currentWeight < startWeight
        : currentWeight > startWeight;

    let progressPercent;
    if (!movingCorrectDirection) {
        progressPercent = 0;
    } else {
        progressPercent = Math.min(100, Math.round((currentChange / totalChange) * 100));
    }

    const remaining = Math.abs(targetWeight - currentWeight);

    return {
        hasGoal: true,
        startWeight,
        currentWeight,
        targetWeight,
        isLoss,
        progressPercent,
        remaining: Math.round(remaining * 10) / 10,
        status: getProgressStatus(progressPercent)
    };
}

/**
 * Get progress status label
 */
function getProgressStatus(percent) {
    if (percent >= 100) return 'goal_reached';
    if (percent >= 75) return 'almost_there';
    if (percent >= 50) return 'halfway';
    if (percent >= 25) return 'making_progress';
    if (percent > 0) return 'just_started';
    return 'not_started';
}

/**
 * Calculate timeline progress
 */
function calculateTimelineProgress(profile) {
    if (!profile.goal_start_date || !profile.target_weeks) {
        return { hasTimeline: false };
    }

    const startDate = new Date(profile.goal_start_date);
    const now = new Date();
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + profile.target_weeks * 7);

    const totalDays = profile.target_weeks * 7;
    const elapsedDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, totalDays - elapsedDays);

    const timePercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    return {
        hasTimeline: true,
        startDate: startDate.toISOString().split('T')[0],
        targetDate: targetDate.toISOString().split('T')[0],
        elapsedDays,
        remainingDays,
        totalDays,
        timePercent,
        weeksRemaining: Math.ceil(remainingDays / 7),
        isOverdue: elapsedDays > totalDays
    };
}

/**
 * Body measurements tracking
 */
function createMeasurementEntry({
    date,
    waist_cm = null,
    hip_cm = null,
    chest_cm = null,
    arm_cm = null,
    thigh_cm = null,
    neck_cm = null
}) {
    return {
        log_date: date || new Date().toISOString().split('T')[0],
        waist_cm,
        hip_cm,
        chest_cm,
        arm_cm,
        thigh_cm,
        neck_cm,
        waist_hip_ratio: waist_cm && hip_cm ? Math.round((waist_cm / hip_cm) * 100) / 100 : null,
        created_at: new Date().toISOString()
    };
}

/**
 * Analyze body recomposition (weight stable but measurements changing)
 */
function detectBodyRecomp(weightHistory, measurementHistory) {
    if (weightHistory.length < 4 || measurementHistory.length < 2) {
        return { detectable: false };
    }

    const recentWeights = weightHistory.slice(0, 4).map(w => w.weight_kg);
    const avgWeight = recentWeights.reduce((a, b) => a + b, 0) / recentWeights.length;
    const weightVariance = Math.max(...recentWeights) - Math.min(...recentWeights);
    const weightStable = weightVariance < 1; // Less than 1kg variance

    const oldMeasurement = measurementHistory[measurementHistory.length - 1];
    const newMeasurement = measurementHistory[0];

    const waistChange = (newMeasurement.waist_cm || 0) - (oldMeasurement.waist_cm || 0);

    if (weightStable && waistChange < -1) {
        return {
            detectable: true,
            recomping: true,
            weightChange: 0,
            waistChange: Math.round(waistChange * 10) / 10,
            message: 'Great progress! Your weight is stable but waist is shrinking - this means fat loss with muscle gain!'
        };
    }

    return {
        detectable: true,
        recomping: false,
        weightChange: recentWeights[0] - recentWeights[recentWeights.length - 1]
    };
}

/**
 * Generate progress summary
 */
function generateProgressSummary(profile, weightHistory, measurementHistory = []) {
    const weightProgress = calculateWeightProgress(profile);
    const timelineProgress = calculateTimelineProgress(profile);
    const recomp = detectBodyRecomp(weightHistory, measurementHistory);

    const highlights = [];

    if (weightProgress.progressPercent >= 50) {
        highlights.push(`${weightProgress.progressPercent}% of the way to your goal!`);
    }
    if (weightProgress.progressPercent >= 100) {
        highlights.push('🎉 You\'ve reached your goal weight!');
    }
    if (recomp.recomping) {
        highlights.push('📉 Body recomposition detected - you\'re losing fat while building muscle!');
    }

    return {
        weight: weightProgress,
        timeline: timelineProgress,
        recomp,
        highlights,
        nextMilestone: getNextMilestone(weightProgress)
    };
}

/**
 * Get next milestone
 */
function getNextMilestone(progress) {
    if (!progress.hasGoal) return null;

    const milestones = [25, 50, 75, 100];
    const next = milestones.find(m => progress.progressPercent < m);

    if (!next) return { milestone: 100, message: 'Goal reached!' };

    const kgToMilestone = progress.isLoss
        ? progress.currentWeight - (progress.startWeight - (progress.startWeight - progress.targetWeight) * (next / 100))
        : (progress.startWeight + (progress.targetWeight - progress.startWeight) * (next / 100)) - progress.currentWeight;

    return {
        milestone: next,
        kgToGo: Math.round(Math.abs(kgToMilestone) * 10) / 10,
        message: `${Math.abs(kgToMilestone).toFixed(1)} kg to reach ${next}% milestone`
    };
}

/**
 * Photo reminder check
 */
function shouldTakeProgressPhoto(lastPhotoDate, intervalDays = 30) {
    if (!lastPhotoDate) return { shouldTake: true, reason: 'no_photos_yet' };

    const last = new Date(lastPhotoDate);
    const now = new Date();
    const daysSince = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    return {
        shouldTake: daysSince >= intervalDays,
        daysSince,
        reason: daysSince >= intervalDays ? 'time_for_update' : null
    };
}

module.exports = {
    calculateWeightProgress,
    calculateTimelineProgress,
    createMeasurementEntry,
    detectBodyRecomp,
    generateProgressSummary,
    getNextMilestone,
    shouldTakeProgressPhoto
};
