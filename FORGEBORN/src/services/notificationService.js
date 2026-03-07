/**
 * FORGEBORN — NOTIFICATION SERVICE
 * 
 * Push notification scheduling for:
 * - Daily workout reminders
 * - Habit reminders
 * - Streak protection alerts
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ─── Configure Notifications ─────────────────────────────────────────────────

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// ─── Permission ──────────────────────────────────────────────────────────────

export const requestPermissions = async () => {
    if (!Device.isDevice) {
        // Simulator — skip
        return false;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'FORGEBORN',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#C8FF00',
        });
    }

    return true;
};

// ─── Schedule Daily Workout Reminder ─────────────────────────────────────────

export const scheduleWorkoutReminder = async (hour = 7, minute = 0) => {
    // Cancel existing workout reminders
    await cancelNotificationsByTag('workout_reminder');

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'TIME TO FORGE',
            body: 'Your workout is waiting. No excuses.',
            data: { tag: 'workout_reminder' },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });
};

// ─── Schedule Habit Reminder ─────────────────────────────────────────────────

export const scheduleHabitReminder = async (hour = 21, minute = 0) => {
    await cancelNotificationsByTag('habit_reminder');

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'DISCIPLINE CHECK',
            body: 'Have you completed all your habits today?',
            data: { tag: 'habit_reminder' },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });
};

// ─── Schedule Streak Protection Alert ────────────────────────────────────────

export const scheduleStreakAlert = async (hour = 20, minute = 0) => {
    await cancelNotificationsByTag('streak_alert');

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'STREAK AT RISK',
            body: 'You haven\'t worked out today. Protect your streak.',
            data: { tag: 'streak_alert' },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });
};

// ─── Cancel By Tag ───────────────────────────────────────────────────────────

const cancelNotificationsByTag = async (tag) => {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of all) {
        if (notif.content?.data?.tag === tag) {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
    }
};

// ─── Cancel All ──────────────────────────────────────────────────────────────

export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

// ─── Init (call on app start) ────────────────────────────────────────────────

export const initNotifications = async () => {
    const granted = await requestPermissions();
    if (!granted) return false;

    // Schedule default reminders
    await scheduleWorkoutReminder(7, 0);     // 7 AM
    await scheduleHabitReminder(21, 0);       // 9 PM
    await scheduleStreakAlert(20, 0);          // 8 PM

    return true;
};
