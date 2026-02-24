-- PFT Database Schema (SQLite)
-- Single user, offline-first design
-- Updated with production audit fixes

-- Profile table (single user)
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  
  -- Demographics
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  height_cm REAL NOT NULL CHECK (height_cm >= 100 AND height_cm <= 250),
  weight_kg REAL NOT NULL CHECK (weight_kg >= 30 AND weight_kg <= 300),
  
  -- Body Composition (optional)
  body_fat_percent REAL CHECK (body_fat_percent >= 3 AND body_fat_percent <= 60),
  muscle_mass_estimate TEXT CHECK (muscle_mass_estimate IN ('low', 'average', 'high')),
  
  -- Goals
  goal_type TEXT NOT NULL CHECK (goal_type IN ('fat_loss', 'muscle_gain', 'recomp', 'health')),
  target_weight_kg REAL CHECK (target_weight_kg >= 30 AND target_weight_kg <= 300),
  target_weeks INTEGER CHECK (target_weeks >= 4 AND target_weeks <= 104),
  goal_start_date TEXT,  -- NEW: YYYY-MM-DD
  
  -- Diet Preferences
  diet_type TEXT NOT NULL CHECK (diet_type IN ('veg', 'nonveg', 'veg_egg', 'jain')),
  food_exclusions TEXT DEFAULT '[]',  -- JSON array
  supplements TEXT DEFAULT '[]',       -- NEW: JSON array ['whey', 'creatine', 'multivitamin']
  
  -- Health Conditions (NEW)
  health_conditions TEXT DEFAULT '[]', -- JSON: ['lactose_intolerance', 'gluten_intolerance', 'diabetes_type2', 'pcos', 'thyroid_hypothyroid', 'ibs']
  
  -- Lifestyle Assessment
  sleep_hours_avg REAL CHECK (sleep_hours_avg >= 3 AND sleep_hours_avg <= 14),
  stress_level TEXT CHECK (stress_level IN ('low', 'medium', 'high')),
  digestion_quality TEXT CHECK (digestion_quality IN ('poor', 'average', 'good')),
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  activity_level TEXT DEFAULT 'sedentary' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  job_type TEXT DEFAULT 'desk_job_office',
  daily_steps INTEGER DEFAULT 0,
  
  -- Female-Specific (NEW)
  tracks_menstrual_cycle INTEGER DEFAULT 0 CHECK (tracks_menstrual_cycle IN (0, 1)),
  cycle_length INTEGER DEFAULT 28,
  last_period_date TEXT,  -- YYYY-MM-DD
  
  -- Workout Constraints
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  injuries TEXT DEFAULT '[]',      -- JSON array
  equipment TEXT DEFAULT '[]',     -- NEW: JSON ['resistance_bands', 'pull_up_bar', 'dumbbells']
  preferred_workout_duration INTEGER DEFAULT 45,  -- NEW: minutes
  
  -- Looksmaxing Assessment
  skin_type TEXT CHECK (skin_type IN ('oily', 'dry', 'combination', 'normal')),
  skin_concerns TEXT DEFAULT '[]',
  hair_concerns TEXT DEFAULT '[]',
  facial_goals TEXT DEFAULT '[]',
  
  -- Photo Paths
  face_photo_path TEXT,
  body_photo_path TEXT,
  
  -- Mode Flags (NEW)
  travel_mode INTEGER DEFAULT 0 CHECK (travel_mode IN (0, 1)),
  
  -- Calculated Values
  bmr REAL,
  tdee REAL,
  target_calories REAL,
  protein_grams REAL,
  carbs_grams REAL,
  fats_grams REAL,
  flex_calories_remaining INTEGER DEFAULT 500,  -- NEW: Weekly flex
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Daily Logs table (enhanced)
CREATE TABLE IF NOT EXISTS daily_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_date TEXT NOT NULL UNIQUE,
  
  -- Food Compliance
  food_compliance_percent INTEGER CHECK (food_compliance_percent >= 0 AND food_compliance_percent <= 100),
  protein_completion_percent INTEGER CHECK (protein_completion_percent >= 0 AND protein_completion_percent <= 100),
  water_liters REAL CHECK (water_liters >= 0 AND water_liters <= 10),
  
  -- Actual Intake (NEW - for logging)
  actual_calories INTEGER,
  actual_protein INTEGER,
  actual_carbs INTEGER,
  actual_fats INTEGER,
  
  -- Workout Compliance
  workout_done INTEGER DEFAULT 0 CHECK (workout_done IN (0, 1)),
  workout_difficulty TEXT CHECK (workout_difficulty IN ('easy', 'moderate', 'hard', 'too_hard', 'skipped')),
  workout_skipped_reason TEXT,  -- NEW: 'no_time', 'fatigue', 'sick', 'injury', 'motivation', 'forgot'
  
  -- Physical Status
  sleep_hours REAL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  soreness_level INTEGER CHECK (soreness_level >= 0 AND soreness_level <= 5),
  soreness_areas TEXT DEFAULT '[]',  -- NEW: JSON ['legs', 'back', 'shoulders']
  
  -- Mental Status
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  stress_source TEXT,  -- NEW: 'work', 'family', 'health', 'financial', 'relationship', 'none'
  motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 5),
  
  -- Digestion (NEW)
  appetite_level TEXT CHECK (appetite_level IN ('low', 'normal', 'high', 'excessive')),
  digestion_quality TEXT CHECK (digestion_quality IN ('poor', 'normal', 'good')),
  bloating INTEGER DEFAULT 0 CHECK (bloating IN (0, 1)),
  acidity INTEGER DEFAULT 0 CHECK (acidity IN (0, 1)),
  
  -- Female Cycle (NEW)
  cycle_day INTEGER,
  
  -- Measurements
  weight_kg REAL CHECK (weight_kg >= 30 AND weight_kg <= 300),
  
  -- Looksmaxing Compliance
  skincare_am_done INTEGER DEFAULT 0 CHECK (skincare_am_done IN (0, 1)),
  skincare_pm_done INTEGER DEFAULT 0 CHECK (skincare_pm_done IN (0, 1)),
  facial_exercises_done INTEGER DEFAULT 0 CHECK (facial_exercises_done IN (0, 1)),
  mewing_mins INTEGER DEFAULT 0 CHECK (mewing_mins >= 0),
  
  -- Mode
  travel_mode INTEGER DEFAULT 0 CHECK (travel_mode IN (0, 1)),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now'))
);

-- Food Log table (NEW - actual food eaten)
CREATE TABLE IF NOT EXISTS food_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_date TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  
  -- Food Details
  food_id TEXT,
  food_name TEXT NOT NULL,
  quantity_grams REAL,
  quantity_unit TEXT,  -- 'grams', 'piece', 'katori', 'cup', etc
  
  -- Calculated Nutrition
  calories REAL,
  protein REAL,
  carbs REAL,
  fats REAL,
  
  -- Source
  source TEXT DEFAULT 'logged' CHECK (source IN ('planned', 'logged', 'estimated', 'restaurant')),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_food_log_date ON food_log(log_date);

-- Workout Log table (NEW - actual workout done)
CREATE TABLE IF NOT EXISTS workout_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_date TEXT NOT NULL,
  
  -- Exercise Details
  exercise_id TEXT,
  exercise_name TEXT NOT NULL,
  sets_planned INTEGER,
  sets_done INTEGER,
  reps_per_set TEXT,  -- JSON: [12, 10, 8]
  rest_seconds INTEGER,
  
  -- Performance
  difficulty_felt INTEGER CHECK (difficulty_felt >= 1 AND difficulty_felt <= 5),
  notes TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_workout_log_date ON workout_log(log_date);

-- Habit Streaks table (NEW)
CREATE TABLE IF NOT EXISTS habit_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_name TEXT NOT NULL UNIQUE,  -- 'water', 'protein', 'workout', 'skincare', 'sleep_7h'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date TEXT,
  total_completions INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Weekly Summaries table (NEW)
CREATE TABLE IF NOT EXISTS weekly_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start_date TEXT NOT NULL UNIQUE,  -- YYYY-MM-DD (Monday)
  week_end_date TEXT NOT NULL,
  
  -- Averages
  avg_calories REAL,
  avg_protein REAL,
  avg_compliance REAL,
  avg_sleep REAL,
  avg_energy REAL,
  
  -- Counts
  workout_days INTEGER,
  rest_days INTEGER,
  logged_days INTEGER,
  
  -- Weight
  start_weight REAL,
  end_weight REAL,
  weight_change REAL,
  
  -- Notes
  highlights TEXT,  -- JSON: ['Hit protein 7 days!', 'Best sleep week']
  areas_to_improve TEXT,  -- JSON
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_weekly_summaries_date ON weekly_summaries(week_start_date);

-- Meal Plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_date TEXT NOT NULL,
  
  meals TEXT NOT NULL,  -- JSON
  
  total_calories REAL NOT NULL,
  total_protein REAL NOT NULL,
  total_carbs REAL NOT NULL,
  total_fats REAL NOT NULL,
  total_fiber REAL,
  
  explanation TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Workout Plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_date TEXT NOT NULL,
  
  workout TEXT NOT NULL,  -- JSON
  muscle_groups TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  estimated_duration_mins INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'hard')),
  is_rest_day INTEGER DEFAULT 0 CHECK (is_rest_day IN (0, 1)),
  is_deload INTEGER DEFAULT 0 CHECK (is_deload IN (0, 1)),  -- NEW
  
  explanation TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Looksmaxing Plans table
CREATE TABLE IF NOT EXISTS looksmaxing_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_date TEXT NOT NULL,
  
  skincare_am TEXT,
  skincare_pm TEXT,
  facial_exercises TEXT,
  mewing_protocol TEXT,
  grooming_tasks TEXT,
  lifestyle_tips TEXT,
  
  product_reminders TEXT,  -- NEW: JSON with product links/names
  
  explanation TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Progress Photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_date TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('face_front', 'face_side', 'body_front', 'body_side', 'body_back')),
  file_path TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Weight History table
CREATE TABLE IF NOT EXISTS weight_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_date TEXT NOT NULL UNIQUE,
  weight_kg REAL NOT NULL,
  moving_avg_7day REAL,  -- NEW: 7-day moving average
  created_at TEXT DEFAULT (datetime('now'))
);

-- Adaptation History table
CREATE TABLE IF NOT EXISTS adaptation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  adaptation_date TEXT NOT NULL,
  
  adjustment_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  
  trigger_reason TEXT NOT NULL,
  explanation TEXT,
  
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date ON meal_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_workout_plans_date ON workout_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_looksmaxing_plans_date ON looksmaxing_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_weight_history_date ON weight_history(log_date);
CREATE INDEX IF NOT EXISTS idx_progress_photos_date ON progress_photos(photo_date);
