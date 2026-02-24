# FitForge Super App

A comprehensive **offline-first personal life optimization system** built with React Native & Expo.

---

## ✨ Features

### 🧠 Core Intelligence
- **LifeAdvisorEngine** - Cross-domain decision making with priority conflict resolution
- **InsightsEngine** - Pattern-based insights (no AI required)
- **Life Score** - Unified daily score across all domains

### 📊 5 Life Domains
| Domain | Features |
|--------|----------|
| **Body** | BMI/BMR/TDEE, workouts, measurements, posture |
| **Food** | Macros, meal plans, budget mode, water tracking |
| **Looks** | Skincare routines, facial exercises, grooming |
| **Health** | Sleep, energy, stress, mood tracking |
| **Routine** | Habits, discipline score, focus time |

### 🎯 Premium Features
- **Mode System** - Normal, Travel, Sick, Exam, Festival modes
- **Daily Check-In** - End-of-day 6-step guided flow
- **Weekly/Monthly Review** - Progress charts & insights
- **Habit Heatmaps** - GitHub-style contribution graphs
- **Body Measurements** - Track 6 measurement types with charts
- **Smart Notifications** - Mode-aware reminders (max 5/day)

### 🔒 Security & Data
- **App Lock** - PIN + Biometric authentication
- **SQLite** - Robust local database for logs
- **Backup/Restore** - JSON export/import
- **100% Offline** - No cloud dependency

---

## 🛠 Tech Stack

- **React Native** + Expo SDK 52
- **SQLite** (expo-sqlite)
- **Victory Native** - Charts
- **React Native Reanimated** - Animations
- **AsyncStorage** - Settings persistence

---

## 📦 Installation

```bash
# Clone and install
cd mobile
npm install

# Start development
npx expo start

# Build APK
eas build -p android --profile preview
```

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── core/
│   │   ├── engines/       # LifeAdvisor, Insights
│   │   └── models/        # Data models
│   ├── screens/           # All app screens
│   ├── components/        # Reusable components
│   ├── services/          # PFTBridge, Database, Notifications
│   ├── navigation/        # AppNavigator
│   ├── theme/             # Dark/Light themes
│   └── utils/             # Animations, helpers
├── e2e-test.js            # 30-day simulation tests
└── App.js                 # Entry point
```

---

## 🧪 Testing

```bash
# Run core validation
node core-validation.js

# Run E2E tests (30-day simulation)
node e2e-test.js
```

---

## 📱 Navigation

### Bottom Tabs
| Tab | Screen |
|-----|--------|
| Command | HomeScreen (Life Command Center) |
| Food | FoodScreen |
| Body | BodyScreen |
| Health | HealthScreen |
| Profile | ProfileScreen |

### Stack Screens
- Looks, Routine, GoalManager
- DailyCheckIn, WeeklyReview, MonthlyReview
- BodyMeasurements, HabitHeatmaps
- Backup, Settings

---

## 🎨 Design System

- **Theme**: Midnight Glass (dark) / Light mode
- **Colors**: Primary (#6366F1), Success (#10B981), Error (#EF4444)
- **Icons**: Feather icons
- **Animations**: Reanimated spring/timing configs

---

## 📄 License

MIT

---

Built with ❤️ for personal optimization
