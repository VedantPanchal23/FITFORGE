/**
 * SQLite Database Service
 * Robust persistence for multi-year log data
 * Replaces AsyncStorage for logs while keeping it for simple settings
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'fitforge.db';
let db = null;
let isInitializing = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initDatabase() {
    // Prevent multiple simultaneous initializations
    if (isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return db !== null;
    }

    // Already initialized
    if (db !== null) {
        return true;
    }

    isInitializing = true;
    try {
        db = await SQLite.openDatabaseAsync(DATABASE_NAME);
        await createTables();
        console.log('SQLite database initialized');
        return true;
    } catch (error) {
        console.error('Database init error:', error);
        return false;
    } finally {
        isInitializing = false;
    }
}

// Helper to ensure DB is ready before operations
async function ensureDb() {
    if (db === null) {
        await initDatabase();
    }
    if (db === null) {
        throw new Error('Database not available');
    }
    return db;
}


async function createTables() {
    // Health Logs table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS health_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            sleep_hours REAL,
            sleep_quality TEXT,
            energy_level INTEGER,
            stress_level INTEGER,
            mood INTEGER,
            water_glasses INTEGER,
            screen_time_hours REAL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Looks Logs table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS looks_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            morning_routine_done INTEGER DEFAULT 0,
            evening_routine_done INTEGER DEFAULT 0,
            facial_exercises_done INTEGER DEFAULT 0,
            hair_routine_done INTEGER DEFAULT 0,
            grooming_tasks TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Routine Logs table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS routine_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            wake_time TEXT,
            sleep_time TEXT,
            focus_hours REAL,
            habits TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Daily Logs table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            calories INTEGER,
            protein REAL,
            carbs REAL,
            fats REAL,
            workout_done INTEGER DEFAULT 0,
            workout_type TEXT,
            water_glasses INTEGER,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Weight History table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS weight_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            weight_kg REAL NOT NULL,
            body_fat_percent REAL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Goals table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS goals (
            id TEXT PRIMARY KEY,
            domain TEXT NOT NULL,
            type TEXT NOT NULL,
            target REAL,
            unit TEXT,
            deadline TEXT,
            start_date TEXT,
            current_value REAL,
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Food Logs table (for tracking actual food eaten)
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS food_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            meal_type TEXT NOT NULL,
            food_id TEXT,
            food_name TEXT NOT NULL,
            quantity_grams REAL NOT NULL,
            calories REAL,
            protein REAL,
            carbs REAL,
            fats REAL,
            source TEXT DEFAULT 'manual',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Create indexes for faster queries
    await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_health_logs_date ON health_logs(date);
        CREATE INDEX IF NOT EXISTS idx_looks_logs_date ON looks_logs(date);
        CREATE INDEX IF NOT EXISTS idx_routine_logs_date ON routine_logs(date);
        CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
        CREATE INDEX IF NOT EXISTS idx_weight_history_date ON weight_history(date);
        CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
    `);
}

// ============================================================================
// HEALTH LOGS CRUD
// ============================================================================

export async function saveHealthLog(date, data) {
    const database = await ensureDb();
    const existing = await getHealthLog(date);

    if (existing) {
        await database.runAsync(`
            UPDATE health_logs SET
                sleep_hours = ?,
                sleep_quality = ?,
                energy_level = ?,
                stress_level = ?,
                mood = ?,
                water_glasses = ?,
                screen_time_hours = ?,
                notes = ?
            WHERE date = ?
        `, [
            data.sleep_hours,
            data.sleep_quality,
            data.energy_level,
            data.stress_level,
            data.mood,
            data.water_glasses,
            data.screen_time_hours,
            data.notes,
            date
        ]);
    } else {
        await database.runAsync(`
            INSERT INTO health_logs (date, sleep_hours, sleep_quality, energy_level, stress_level, mood, water_glasses, screen_time_hours, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            date,
            data.sleep_hours,
            data.sleep_quality,
            data.energy_level,
            data.stress_level,
            data.mood,
            data.water_glasses,
            data.screen_time_hours,
            data.notes
        ]);
    }

    return { ...data, date };
}

export async function getHealthLog(date) {
    const database = await ensureDb();
    const result = await database.getFirstAsync('SELECT * FROM health_logs WHERE date = ?', [date]);
    return result;
}

export async function getHealthLogs(days = 7) {
    const database = await ensureDb();
    const results = await database.getAllAsync(`
        SELECT * FROM health_logs 
        ORDER BY date DESC 
        LIMIT ?
    `, [days]);
    return results;
}

export async function getHealthLogRange(startDate, endDate) {
    const database = await ensureDb();
    const results = await database.getAllAsync(`
        SELECT * FROM health_logs 
        WHERE date >= ? AND date <= ?
        ORDER BY date ASC
    `, [startDate, endDate]);
    return results;
}

// ============================================================================
// LOOKS LOGS CRUD
// ============================================================================

export async function saveLooksLog(date, data) {
    const database = await ensureDb();
    const existing = await getLooksLog(date);

    const groomingJson = JSON.stringify(data.grooming_tasks || []);

    if (existing) {
        await database.runAsync(`
            UPDATE looks_logs SET
                morning_routine_done = ?,
                evening_routine_done = ?,
                facial_exercises_done = ?,
                hair_routine_done = ?,
                grooming_tasks = ?,
                notes = ?
            WHERE date = ?
        `, [
            data.morning_routine_done ? 1 : 0,
            data.evening_routine_done ? 1 : 0,
            data.facial_exercises_done ? 1 : 0,
            data.hair_routine_done ? 1 : 0,
            groomingJson,
            data.notes,
            date
        ]);
    } else {
        await database.runAsync(`
            INSERT INTO looks_logs (date, morning_routine_done, evening_routine_done, facial_exercises_done, hair_routine_done, grooming_tasks, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            date,
            data.morning_routine_done ? 1 : 0,
            data.evening_routine_done ? 1 : 0,
            data.facial_exercises_done ? 1 : 0,
            data.hair_routine_done ? 1 : 0,
            groomingJson,
            data.notes
        ]);
    }

    return { ...data, date };
}

export async function getLooksLog(date) {
    const database = await ensureDb();
    const result = await database.getFirstAsync('SELECT * FROM looks_logs WHERE date = ?', [date]);
    if (result && result.grooming_tasks) {
        result.grooming_tasks = JSON.parse(result.grooming_tasks);
    }
    // Convert integers back to booleans
    if (result) {
        result.morning_routine_done = !!result.morning_routine_done;
        result.evening_routine_done = !!result.evening_routine_done;
        result.facial_exercises_done = !!result.facial_exercises_done;
        result.hair_routine_done = !!result.hair_routine_done;
    }
    return result;
}

export async function getLooksLogs(days = 7) {
    const database = await ensureDb();
    const results = await database.getAllAsync(`
        SELECT * FROM looks_logs 
        ORDER BY date DESC 
        LIMIT ?
    `, [days]);

    return results.map(r => ({
        ...r,
        grooming_tasks: r.grooming_tasks ? JSON.parse(r.grooming_tasks) : [],
        morning_routine_done: !!r.morning_routine_done,
        evening_routine_done: !!r.evening_routine_done,
        facial_exercises_done: !!r.facial_exercises_done,
        hair_routine_done: !!r.hair_routine_done
    }));
}

// ============================================================================
// ROUTINE LOGS CRUD
// ============================================================================

export async function saveRoutineLog(date, data) {
    const database = await ensureDb();
    const existing = await getRoutineLog(date);
    const habitsJson = JSON.stringify(data.habits || []);

    if (existing) {
        await database.runAsync(`
            UPDATE routine_logs SET
                wake_time = ?,
                sleep_time = ?,
                focus_hours = ?,
                habits = ?,
                notes = ?
            WHERE date = ?
        `, [data.wake_time, data.sleep_time, data.focus_hours, habitsJson, data.notes, date]);
    } else {
        await database.runAsync(`
            INSERT INTO routine_logs (date, wake_time, sleep_time, focus_hours, habits, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [date, data.wake_time, data.sleep_time, data.focus_hours, habitsJson, data.notes]);
    }

    return { ...data, date };
}

export async function getRoutineLog(date) {
    const database = await ensureDb();
    const result = await database.getFirstAsync('SELECT * FROM routine_logs WHERE date = ?', [date]);
    if (result && result.habits) {
        result.habits = JSON.parse(result.habits);
    }
    return result;
}

export async function getRoutineLogs(days = 7) {
    const database = await ensureDb();
    const results = await database.getAllAsync(`
        SELECT * FROM routine_logs 
        ORDER BY date DESC 
        LIMIT ?
    `, [days]);

    return results.map(r => ({
        ...r,
        habits: r.habits ? JSON.parse(r.habits) : []
    }));
}

// ============================================================================
// DAILY LOGS CRUD
// ============================================================================

export async function saveDailyLog(data) {
    const database = await ensureDb();
    const date = data.date;
    const existing = await getDailyLog(date);

    if (existing) {
        await database.runAsync(`
            UPDATE daily_logs SET
                calories = ?,
                protein = ?,
                carbs = ?,
                fats = ?,
                workout_done = ?,
                workout_type = ?,
                water_glasses = ?,
                notes = ?
            WHERE date = ?
        `, [
            data.calories,
            data.protein,
            data.carbs,
            data.fats,
            data.workout_done ? 1 : 0,
            data.workout_type,
            data.water_glasses,
            data.notes,
            date
        ]);
    } else {
        await database.runAsync(`
            INSERT INTO daily_logs (date, calories, protein, carbs, fats, workout_done, workout_type, water_glasses, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            date,
            data.calories,
            data.protein,
            data.carbs,
            data.fats,
            data.workout_done ? 1 : 0,
            data.workout_type,
            data.water_glasses,
            data.notes
        ]);
    }

    return { ...data, date };
}

export async function getDailyLog(date) {
    const database = await ensureDb();
    const result = await database.getFirstAsync('SELECT * FROM daily_logs WHERE date = ?', [date]);
    if (result) {
        result.workout_done = !!result.workout_done;
    }
    return result;
}

export async function getDailyLogs() {
    const database = await ensureDb();
    const results = await database.getAllAsync('SELECT * FROM daily_logs ORDER BY date DESC');
    return results.reduce((acc, log) => {
        log.workout_done = !!log.workout_done;
        acc[log.date] = log;
        return acc;
    }, {});
}

// ============================================================================
// WEIGHT HISTORY
// ============================================================================

export async function addWeight(date, weightKg, bodyFatPercent = null) {
    const database = await ensureDb();
    await database.runAsync(`
        INSERT INTO weight_history (date, weight_kg, body_fat_percent)
        VALUES (?, ?, ?)
    `, [date, weightKg, bodyFatPercent]);
}

export async function getWeightHistory(limit = 30) {
    const database = await ensureDb();
    return await database.getAllAsync(`
        SELECT * FROM weight_history 
        ORDER BY date DESC 
        LIMIT ?
    `, [limit]);
}

// ============================================================================
// GOALS
// ============================================================================

export async function saveGoal(goal) {
    const database = await ensureDb();
    await database.runAsync(`
        INSERT OR REPLACE INTO goals (id, domain, type, target, unit, deadline, start_date, current_value, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        goal.id,
        goal.domain,
        goal.type,
        goal.target,
        goal.unit,
        goal.deadline,
        goal.start_date || new Date().toISOString().split('T')[0],
        goal.current_value || 0,
        goal.status || 'active'
    ]);
    return goal;
}

export async function getGoals(status = 'active') {
    const database = await ensureDb();
    return await database.getAllAsync('SELECT * FROM goals WHERE status = ?', [status]);
}

export async function deleteGoal(goalId) {
    const database = await ensureDb();
    await database.runAsync('DELETE FROM goals WHERE id = ?', [goalId]);
}

// ============================================================================
// FOOD LOGS CRUD
// ============================================================================

export async function saveFoodLog(date, mealType, food) {
    const database = await ensureDb();
    await database.runAsync(`
        INSERT INTO food_logs (date, meal_type, food_id, food_name, quantity_grams, calories, protein, carbs, fats, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        date,
        mealType,
        food.id || null,
        food.name,
        food.quantity_grams || 100,
        food.calories || 0,
        food.protein || 0,
        food.carbs || 0,
        food.fats || 0,
        food.source || 'manual'
    ]);
    return { ...food, date, meal_type: mealType };
}

export async function getFoodLogs(date) {
    const database = await ensureDb();
    return await database.getAllAsync(
        'SELECT * FROM food_logs WHERE date = ? ORDER BY created_at ASC',
        [date]
    );
}

export async function getFoodLogsByMeal(date, mealType) {
    const database = await ensureDb();
    return await database.getAllAsync(
        'SELECT * FROM food_logs WHERE date = ? AND meal_type = ? ORDER BY created_at ASC',
        [date, mealType]
    );
}

export async function deleteFoodLog(id) {
    const database = await ensureDb();
    await database.runAsync('DELETE FROM food_logs WHERE id = ?', [id]);
}

export async function getDailyFoodSummary(date) {
    const database = await ensureDb();
    const result = await database.getFirstAsync(`
        SELECT 
            SUM(calories) as total_calories,
            SUM(protein) as total_protein,
            SUM(carbs) as total_carbs,
            SUM(fats) as total_fats,
            COUNT(*) as total_items
        FROM food_logs 
        WHERE date = ?
    `, [date]);
    return result || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0, total_items: 0 };
}

export async function getFoodLogsRange(startDate, endDate) {
    const database = await ensureDb();
    return await database.getAllAsync(
        'SELECT * FROM food_logs WHERE date >= ? AND date <= ? ORDER BY date, created_at ASC',
        [startDate, endDate]
    );
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export async function getAverageSleep(days = 7) {
    const database = await ensureDb();
    const result = await database.getFirstAsync(`
        SELECT AVG(sleep_hours) as avg_sleep 
        FROM health_logs 
        WHERE date >= date('now', '-${days} days')
    `);
    return result?.avg_sleep || 0;
}

export async function getWorkoutCount(days = 7) {
    const database = await ensureDb();
    const result = await database.getFirstAsync(`
        SELECT COUNT(*) as workout_count 
        FROM daily_logs 
        WHERE date >= date('now', '-${days} days') AND workout_done = 1
    `);
    return result?.workout_count || 0;
}

export async function getSkincareConsistency(days = 7) {
    const database = await ensureDb();
    const result = await database.getFirstAsync(`
        SELECT 
            AVG(CASE WHEN morning_routine_done = 1 AND evening_routine_done = 1 THEN 100 ELSE 0 END) as consistency
        FROM looks_logs 
        WHERE date >= date('now', '-${days} days')
    `);
    return result?.consistency || 0;
}

// ============================================================================
// BACKUP & EXPORT
// ============================================================================

export async function exportAllData() {
    const database = await ensureDb();
    const healthLogs = await database.getAllAsync('SELECT * FROM health_logs');
    const looksLogs = await database.getAllAsync('SELECT * FROM looks_logs');
    const routineLogs = await database.getAllAsync('SELECT * FROM routine_logs');
    const dailyLogs = await database.getAllAsync('SELECT * FROM daily_logs');
    const weightHistory = await database.getAllAsync('SELECT * FROM weight_history');
    const goals = await database.getAllAsync('SELECT * FROM goals');
    const foodLogs = await database.getAllAsync('SELECT * FROM food_logs');

    return {
        version: 1,
        exported_at: new Date().toISOString(),
        data: {
            health_logs: healthLogs,
            looks_logs: looksLogs,
            routine_logs: routineLogs,
            daily_logs: dailyLogs,
            weight_history: weightHistory,
            goals: goals,
            food_logs: foodLogs
        }
    };
}

export async function importData(backup) {
    const database = await ensureDb();
    if (backup.version !== 1) {
        throw new Error('Unsupported backup version');
    }

    const { data } = backup;

    // Clear existing data
    await database.execAsync('DELETE FROM health_logs');
    await database.execAsync('DELETE FROM looks_logs');
    await database.execAsync('DELETE FROM routine_logs');
    await database.execAsync('DELETE FROM daily_logs');
    await database.execAsync('DELETE FROM weight_history');
    await database.execAsync('DELETE FROM goals');
    await database.execAsync('DELETE FROM food_logs');

    // Import health logs
    for (const log of data.health_logs || []) {
        await saveHealthLog(log.date, log);
    }

    // Import looks logs
    for (const log of data.looks_logs || []) {
        await saveLooksLog(log.date, log);
    }

    // Import routine logs
    for (const log of data.routine_logs || []) {
        await saveRoutineLog(log.date, log);
    }

    // Import daily logs
    for (const log of data.daily_logs || []) {
        await saveDailyLog(log);
    }

    // Import weight history
    for (const w of data.weight_history || []) {
        await addWeight(w.date, w.weight_kg, w.body_fat_percent);
    }

    // Import goals
    for (const goal of data.goals || []) {
        await saveGoal(goal);
    }

    return true;
}

// ============================================================================
// CLEANUP
// ============================================================================

export async function deleteOldLogs(olderThanDays = 365) {
    const database = await ensureDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoff = cutoffDate.toISOString().split('T')[0];

    await database.runAsync('DELETE FROM health_logs WHERE date < ?', [cutoff]);
    await database.runAsync('DELETE FROM looks_logs WHERE date < ?', [cutoff]);
    await database.runAsync('DELETE FROM routine_logs WHERE date < ?', [cutoff]);
    await database.runAsync('DELETE FROM daily_logs WHERE date < ?', [cutoff]);
    await database.runAsync('DELETE FROM food_logs WHERE date < ?', [cutoff]);
}

export default {
    initDatabase,
    // Health
    saveHealthLog,
    getHealthLog,
    getHealthLogs,
    getHealthLogRange,
    // Looks
    saveLooksLog,
    getLooksLog,
    getLooksLogs,
    // Routine
    saveRoutineLog,
    getRoutineLog,
    getRoutineLogs,
    // Daily
    saveDailyLog,
    getDailyLog,
    getDailyLogs,
    // Weight
    addWeight,
    getWeightHistory,
    // Goals
    saveGoal,
    getGoals,
    deleteGoal,
    // Food Logs
    saveFoodLog,
    getFoodLogs,
    getFoodLogsByMeal,
    deleteFoodLog,
    getDailyFoodSummary,
    getFoodLogsRange,
    // Analytics
    getAverageSleep,
    getWorkoutCount,
    getSkincareConsistency,
    // Backup
    exportAllData,
    importData,
    deleteOldLogs
};
