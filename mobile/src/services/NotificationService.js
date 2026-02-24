/**
 * Smart Notification Service
 * Local-only notifications with max 3-5 per day
 * Contextual timing based on user habits
 */

import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

// Notification types with priority
const NOTIFICATION_TYPES = {
    MEAL: { id: 'meal', priority: 3, maxPerDay: 1 },
    WORKOUT: { id: 'workout', priority: 2, maxPerDay: 1 },
    WATER: { id: 'water', priority: 4, maxPerDay: 2 },
    SKINCARE: { id: 'skincare', priority: 3, maxPerDay: 1 },
    SLEEP: { id: 'sleep', priority: 1, maxPerDay: 1 },
    CHECKIN: { id: 'checkin', priority: 1, maxPerDay: 1 }
};

// Request permissions
export async function requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

// Schedule a local notification
async function scheduleNotification({ title, body, trigger, identifier }) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger,
            identifier
        });
        return true;
    } catch (error) {
        console.log('Notification schedule error:', error);
        return false;
    }
}

// Cancel specific notification
export async function cancelNotification(identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Cancel all notifications
export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get scheduled notifications
export async function getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}

// ============================================================================
// SMART SCHEDULING
// ============================================================================

/**
 * Schedule daily reminders based on user preferences and mode
 */
export async function scheduleDailyReminders(profile, mode, preferences = {}) {
    // Clear existing reminders first
    await cancelAllNotifications();

    // Don't schedule if user is in sick/festival mode or notifications disabled
    if (mode === 'sick' || mode === 'festival') {
        return { scheduled: [] };
    }

    const scheduled = [];
    const now = new Date();

    // Meal reminder - around lunch time
    if (preferences.mealReminders !== false) {
        const mealTime = new Date(now);
        mealTime.setHours(12, 30, 0, 0);
        if (mealTime > now) {
            await scheduleNotification({
                title: 'Time for lunch! 🍽️',
                body: `Don't forget to hit your ${profile?.protein_target || 130}g protein target.`,
                trigger: { hour: 12, minute: 30, repeats: true },
                identifier: 'meal_reminder'
            });
            scheduled.push('meal');
        }
    }

    // Workout reminder - morning (only if not rest day)
    if (preferences.workoutReminders !== false && mode !== 'travel') {
        await scheduleNotification({
            title: 'Workout time! 💪',
            body: 'Your body is ready. Let\'s get moving.',
            trigger: { hour: 7, minute: 0, repeats: true },
            identifier: 'workout_reminder'
        });
        scheduled.push('workout');
    }

    // Water reminder - afternoon
    if (preferences.waterReminders !== false) {
        await scheduleNotification({
            title: 'Stay hydrated! 💧',
            body: 'Have you had enough water today? Aim for 8 glasses.',
            trigger: { hour: 15, minute: 0, repeats: true },
            identifier: 'water_reminder'
        });
        scheduled.push('water');
    }

    // Skincare reminder - evening
    if (preferences.skincareReminders !== false && mode !== 'travel') {
        await scheduleNotification({
            title: 'Evening skincare ✨',
            body: 'Time for your evening skincare routine.',
            trigger: { hour: 21, minute: 0, repeats: true },
            identifier: 'skincare_reminder'
        });
        scheduled.push('skincare');
    }

    // Sleep/Check-in reminder - night
    if (preferences.sleepReminders !== false) {
        await scheduleNotification({
            title: 'Wind down 🌙',
            body: 'Complete your daily check-in and prepare for rest.',
            trigger: { hour: 22, minute: 0, repeats: true },
            identifier: 'checkin_reminder'
        });
        scheduled.push('checkin');
    }

    return { scheduled };
}

/**
 * Schedule streak warning if user might lose streak tomorrow
 */
export async function scheduleStreakWarning(streakDays, domain) {
    if (streakDays >= 3) {
        await scheduleNotification({
            title: `Don't break your streak! 🔥`,
            body: `You're on a ${streakDays}-day ${domain} streak. Keep it going!`,
            trigger: { seconds: 60 * 60 * 18 }, // 18 hours from now
            identifier: `streak_warning_${domain}`
        });
    }
}

/**
 * Update notifications based on mode change
 */
export async function updateNotificationsForMode(mode, profile, preferences) {
    return await scheduleDailyReminders(profile, mode, preferences);
}

// ============================================================================
// PREFERENCES
// ============================================================================

export const DEFAULT_PREFERENCES = {
    mealReminders: true,
    workoutReminders: true,
    waterReminders: true,
    skincareReminders: true,
    sleepReminders: true,
    maxPerDay: 5
};

export function getNotificationDescription(type) {
    const descriptions = {
        meal: 'Lunch time protein reminder',
        workout: 'Morning workout motivation',
        water: 'Afternoon hydration check',
        skincare: 'Evening skincare routine',
        checkin: 'Nightly check-in & wind down'
    };
    return descriptions[type] || '';
}

export default {
    requestPermissions,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
    scheduleDailyReminders,
    scheduleStreakWarning,
    updateNotificationsForMode,
    DEFAULT_PREFERENCES,
    getNotificationDescription,
    NOTIFICATION_TYPES
};
