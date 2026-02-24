<p align="center">
  <h1 align="center">⚔️ FITFORGE</h1>
  <p align="center"><strong>Discipline is not a choice. It is the architecture.</strong></p>
  <p align="center">
    <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/Platform-Android_%7C_iOS-green?style=for-the-badge" alt="Platform" />
    <img src="https://img.shields.io/badge/Status-In_Development-red?style=for-the-badge" alt="Status" />
  </p>
</p>

---

## 🧠 What is FITFORGE?

FITFORGE is a **militaristic discipline-enforcement fitness system** — not a gentle fitness tracker. It is built on the principle that **execution is the only currency**, motivation is irrelevant, and the system **never adapts downward**.

The project contains two React Native (Expo) applications:

| App | Purpose |
|-----|---------|
| **`mobile/`** | The full-spectrum Personal Fitness Tracker (PFT) super app |
| **`FORGEBORN/`** | The discipline-first rewrite — obligation engine at its core |

---

## 🏗️ Architecture

```
PFT/
├── 📜 Doctrine & Specs
│   ├── FITFORGE_DISCIPLINE_MANIFESTO.md    # The 7 Laws
│   ├── DISCIPLINE_KERNEL_v0.1.md           # Core technical spec
│   ├── ACTION_LOCK_SYSTEM_v0.1.md          # UI lock mechanism
│   └── EXECUTION_PRESSURE_ESCALATION_v0.1.md
│
├── 📱 mobile/                # Full PFT Super App
│   └── src/
│       ├── core/
│       │   ├── engines/      # 20 computation engines
│       │   ├── models/       # 12 data models
│       │   ├── validators/   # 3 input validators
│       │   └── utils/
│       ├── data/             # Food, exercise & supplement databases
│       ├── database/         # SQLite persistence
│       ├── kernel/           # ActionLock, ObligationGuard
│       ├── screens/          # 30 screens
│       ├── services/         # 11 services
│       ├── components/       # Reusable UI components
│       ├── navigation/       # App routing
│       └── theme/            # Design system
│
├── ⚔️ FORGEBORN/             # Discipline-First Rewrite
│   └── src/
│       ├── store/            # Zustand + MMKV persistence
│       │   ├── obligationStore.js
│       │   └── commitmentStore.js
│       └── ui/
│           ├── screens/      # CreedScreen, MainScreen, LockScreen, CreateObligationScreen
│           └── theme/        # Colors, typography, spacing
│
└── 🧪 __tests__/            # Unit & integration tests
```

---

## ⚙️ Mobile App — Engine Layer

The PFT core contains **20 specialized engines** that power every calculation:

| Engine | Responsibility |
|--------|---------------|
| `BodyEngine` | Body composition & BMI calculations |
| `NutritionEngine` | Macro/calorie planning |
| `WorkoutEngine` | Exercise programming & volume tracking |
| `AdaptiveTDEE` | Adaptive Total Daily Energy Expenditure |
| `MicronutrientEngine` | Vitamin & mineral tracking |
| `PlateauEngine` | Plateau detection & breakthrough protocols |
| `MenstrualCycleEngine` | Cycle-aware training adjustments |
| `LifestyleEngine` | Sleep, stress & recovery factors |
| `LooksmaxingEngine` | Appearance optimization tracking |
| `LifeAdvisorEngine` | Holistic life recommendations |
| `InsightsEngine` | Data-driven progress insights |
| `AdaptationEngine` | Progressive overload management |
| `SupplementTimingEngine` | Supplement scheduling |
| `HolisticWorkoutPlanner` | Full-body program design |
| `TrainingStyleEngine` | Training methodology selection |
| `WorkoutGuidanceEngine` | Form & technique guidance |
| `MealScheduler` | Meal timing optimization |
| `IntakeAnalyzerEngine` | Nutritional intake analysis |
| `HealthConditionFilter` | Health-aware exercise filtering |
| `ContextModes` | Context-aware behavior switching |

---

## ⚔️ FORGEBORN — The Discipline Engine

FORGEBORN strips everything down to what matters: **obligations and execution**.

### The Flow
```
┌─────────────┐    ┌─────────────┐    ┌──────────────┐    ┌────────────┐
│  CREED      │───▶│  MAIN       │───▶│  CREATE      │───▶│  LOCK      │
│  SCREEN     │    │  SCREEN     │    │  OBLIGATION  │    │  SCREEN    │
│             │    │             │    │              │    │            │
│ Accept the  │    │ View        │    │ Schedule     │    │ EXECUTE    │
│ commitment  │    │ obligations │    │ workout/task │    │ or FAIL    │
│ (permanent) │    │ & debt      │    │              │    │ (no escape)│
└─────────────┘    └─────────────┘    └──────────────┘    └────────────┘
```

### Obligation Lifecycle
```
CREATED → BINDING (24h before) → BOUND (due) → EXECUTED ✅ | FAILED ❌
```

### The 7 Laws

1. **Execution is the only currency** — intentions hold zero value
2. **The schedule is sovereign** — no negotiation
3. **Missed work compounds** — debt is never forgiven
4. **Adaptation is upward only** — difficulty never decreases
5. **No negotiation during execution** — complete or log failure
6. **Rest is prescribed, not requested** — unscheduled rest = avoidance
7. **Streaks are irrelevant** — standards are permanent

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native 0.81 + Expo 54 |
| **State (FORGEBORN)** | Zustand + MMKV |
| **Database (Mobile)** | expo-sqlite |
| **Navigation** | React Navigation 7 |
| **Animations** | React Native Reanimated 4 |
| **Charts** | Victory Native, react-native-chart-kit |
| **Graphics** | @shopify/react-native-skia |
| **Fonts** | Inter, Space Grotesk (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android/iOS emulator or Expo Go

### Run the Mobile App
```bash
cd mobile
npm install
npx expo start
```

### Run FORGEBORN
```bash
cd FORGEBORN
npm install
npx expo start
```

---

## 📜 Foundational Documents

| Document | Description |
|----------|-------------|
| [Discipline Manifesto](FITFORGE_DISCIPLINE_MANIFESTO.md) | The behavioral architecture & 7 Laws |
| [Discipline Kernel v0.1](DISCIPLINE_KERNEL_v0.1.md) | User, Obligation, ExecutionLog, Consequence Engine specs |
| [Action Lock System v0.1](ACTION_LOCK_SYSTEM_v0.1.md) | UI lock mechanism — escape prevention & persistence |
| [Pressure Escalation v0.1](EXECUTION_PRESSURE_ESCALATION_v0.1.md) | Escalating pressure protocols for non-execution |

---

## 🧪 Testing

```bash
# From root
node __tests__/engines/         # Engine tests
node __tests__/integration/     # Integration tests
node mobile/core-validation.js  # Core validation
node mobile/test_validation.js  # Test validation
```

---

## 📄 License

This project is proprietary. All rights reserved.

---

<p align="center">
  <strong>There is no tomorrow. I do not lose. I execute.</strong>
</p>
