# EXECUTION PRESSURE ESCALATION v0.1

**Type:** Core System Specification  
**Classification:** Execution Enforcement Extension  
**Parents:** DISCIPLINE KERNEL v0.1, ACTION LOCK SYSTEM v0.1  
**Dependencies:** LockState, Obligation, ConsequenceEngine  

---

## 1. PRESSURE LEVEL MODEL

### 1.1 Definition
`PressureLevel` is a time-based escalation state that increases system restrictiveness as the execution window progresses.

### 1.2 Schema

```
PressureState {
  id:                   UUID        [IMMUTABLE]
  lock_id:              UUID        [IMMUTABLE]
  current_level:        Integer     [SYSTEM-CONTROLLED]
  escalated_at:         Timestamp   [SYSTEM-CONTROLLED]
  time_in_level:        Duration    [COMPUTED]
  prompt_count:         Integer     [APPEND-ONLY]
}
```

### 1.3 Pressure Level Definitions

| Level | Name | Activation Threshold |
|-------|------|---------------------|
| P0 | BASELINE | Lock activation (0% elapsed) |
| P1 | ELEVATED | 25% of window elapsed |
| P2 | HIGH | 50% of window elapsed |
| P3 | CRITICAL | 75% of window elapsed |
| P4 | TERMINAL | 90% of window elapsed |

### 1.4 Escalation Trigger Logic

```
ON lock.status == ACTIVE:
    INITIALIZE pressure_level = P0
    
    SCHEDULE escalation_check EVERY 60 seconds:
        elapsed_percent = (NOW() - lock.lock_start) / window_duration * 100
        
        IF elapsed_percent >= 90 AND current_level < P4:
            ESCALATE_TO(P4)
        ELSE IF elapsed_percent >= 75 AND current_level < P3:
            ESCALATE_TO(P3)
        ELSE IF elapsed_percent >= 50 AND current_level < P2:
            ESCALATE_TO(P2)
        ELSE IF elapsed_percent >= 25 AND current_level < P1:
            ESCALATE_TO(P1)
```

### 1.5 Escalation Action

```
FUNCTION ESCALATE_TO(new_level):
    SET pressure.current_level = new_level
    SET pressure.escalated_at = NOW()
    LOG PressureEscalation(lock_id, new_level, timestamp)
    APPLY pressure_effects(new_level)
    TRIGGER pressure_prompt(new_level)
```

---

## 2. PRESSURE EFFECTS

### 2.1 Effects Matrix

| Level | Interface Changes | Notification Frequency | Display Mode |
|-------|------------------|----------------------|--------------|
| P0 | Standard lock interface | None | Normal |
| P1 | Time displayed in bold | Every 10 minutes | Emphasized |
| P2 | Screen dim except action area | Every 5 minutes | Focused |
| P3 | Countdown becomes primary element | Every 2 minutes | Urgent |
| P4 | Full-screen countdown only | Continuous | Terminal |

### 2.2 Detailed Effects by Level

#### P0 — BASELINE
```
interface:
    time_display       = STANDARD
    action_area        = NORMAL
    background         = NORMAL
    notification_rate  = NONE
    prompt_tone        = NEUTRAL
```

#### P1 — ELEVATED
```
interface:
    time_display       = BOLD + LARGER
    action_area        = NORMAL
    background         = SLIGHTLY_DIMMED
    notification_rate  = 10_MINUTES
    prompt_tone        = DIRECTIVE

effects_applied:
    - Time remaining becomes prominent
    - First prompt cycle initiated
```

#### P2 — HIGH
```
interface:
    time_display       = LARGE + COLOR_SHIFT (neutral → warning)
    action_area        = HIGHLIGHTED
    background         = DIMMED
    notification_rate  = 5_MINUTES
    prompt_tone        = FIRM

effects_applied:
    - Non-action UI elements fade
    - Execution input area visually isolated
    - Idle detection sensitivity increased
```

#### P3 — CRITICAL
```
interface:
    time_display       = COUNTDOWN_PRIMARY
    action_area        = ONLY_VISIBLE_ELEMENT
    background         = NEAR_BLACK
    notification_rate  = 2_MINUTES
    prompt_tone        = SEVERE

effects_applied:
    - All decorative elements removed
    - Only countdown + execution input visible
    - Persistent vibration on idle > 30 seconds
```

#### P4 — TERMINAL
```
interface:
    time_display       = FULL_SCREEN_COUNTDOWN
    action_area        = MINIMAL_INPUT_OVERLAY
    background         = BLACK
    notification_rate  = CONTINUOUS
    prompt_tone        = FINAL

effects_applied:
    - Screen shows only: countdown + execute button
    - Continuous audio pulse (if device permits)
    - No other information displayed
    - Final state before automatic failure
```

### 2.3 Progressive Removal Schedule

| Removed at Level | Element |
|------------------|---------|
| P1 | Historical context |
| P2 | Obligation details beyond units |
| P3 | All UI except time + input |
| P4 | Everything except countdown + confirm |

---

## 3. TIME COMPRESSION LOGIC

### 3.1 Time Reframing Rules

```
AT pressure_level:
    P0: DISPLAY "Time remaining: [HH:MM:SS]"
    P1: DISPLAY "Time remaining: [HH:MM:SS]"
    P2: DISPLAY "[MM:SS] remaining"
    P3: DISPLAY "[MM:SS] until failure logged"
    P4: DISPLAY "[SS] seconds"
```

### 3.2 Psychological Cost Escalation

| Level | Time Messaging |
|-------|---------------|
| P0 | Neutral time display |
| P1 | "Time is expiring" |
| P2 | "Delay reduces margin" |
| P3 | "Failure imminent" |
| P4 | Countdown only, no words |

### 3.3 Delay Cost Communication

```
AT P2+:
    IF units_completed == 0:
        DISPLAY: "No execution logged. [TIME] until failure."
        
AT P3+:
    IF units_completed == 0:
        DISPLAY: "Zero execution. Failure in [TIME]."
        
AT P4:
    DISPLAY: "[SECONDS]"
    (No additional text. Countdown only.)
```

### 3.4 Early Execution Implicit Advantage

```
IF execution_completed WHERE pressure_level <= P1:
    SET execution.timing = EARLY
    LOG execution_timing = OPTIMAL
    
IF execution_completed WHERE pressure_level == P2:
    SET execution.timing = STANDARD
    
IF execution_completed WHERE pressure_level >= P3:
    SET execution.timing = DELAYED
    LOG execution_timing = SUBOPTIMAL
```

---

## 4. EXECUTION PROMPTING

### 4.1 Prompt Schema

```
Prompt {
  id:               UUID        [IMMUTABLE]
  lock_id:          UUID        [IMMUTABLE]
  pressure_level:   Integer     [IMMUTABLE]
  content:          String      [IMMUTABLE]
  delivered_at:     Timestamp   [IMMUTABLE]
  type:             Enum        [IMMUTABLE]
}
```

### 4.2 Prompt Type Enum

```
NOTIFICATION      — External notification
SCREEN_UPDATE     — In-app display change
HAPTIC            — Vibration pattern
AUDIO             — Sound signal
```

### 4.3 Prompt Content by Level

#### P0 Prompts
```
NONE — System waits silently
```

#### P1 Prompts
```
"Obligation pending."
"Execute when ready."
"[UNITS] required."
```

#### P2 Prompts
```
"Window half expired."
"Execute now."
"[TIME] remaining. [UNITS] required."
```

#### P3 Prompts
```
"Failure in [TIME]."
"Execute immediately."
"Non-execution will be logged."
```

#### P4 Prompts
```
"[SECONDS]"
(Countdown only. No text prompts. Audio/haptic pulse.)
```

### 4.4 Prompt Escalation Rules

```
prompt_directiveness[P0] = 0   (silent)
prompt_directiveness[P1] = 1   (informational)
prompt_directiveness[P2] = 2   (directive)
prompt_directiveness[P3] = 3   (imperative)
prompt_directiveness[P4] = 4   (terminal)

AS pressure_level increases:
    prompt.frequency     INCREASES
    prompt.length        DECREASES
    prompt.options       REMOVED
    prompt.explanation   REMOVED
```

### 4.5 Prohibited Prompt Content

```
NEVER_INCLUDE:
    - "You can do this"
    - "Almost there"
    - "Keep going"
    - "Great job so far"
    - "Don't give up"
    - "You've got this"
    - "Remember why you started"
    - ANY motivational phrase
    - ANY emotional support
    - ANY acknowledgment of difficulty
```

---

## 5. PRESSURE FAILURE MULTIPLIERS

### 5.1 Late Execution Logging

```
ON execution_complete:
    SET execution.pressure_at_completion = pressure.current_level
    
    IF pressure_level >= P3:
        LOG execution_quality = DELAYED
        (No penalty, but recorded for pattern analysis)
```

### 5.2 Failure Multiplier Matrix

| Failure at Level | Debt Multiplier | Consequence Modifier |
|------------------|-----------------|---------------------|
| P0-P1 | 1.0x | Standard |
| P2 | 1.0x | Standard |
| P3 | 1.25x | Elevated |
| P4 | 1.5x | Severe |

### 5.3 Multiplier Application

```
ON failure WHERE pressure_level = P:
    base_debt = user.failure_count
    
    IF P >= P4:
        total_debt = base_debt * 1.5
    ELSE IF P >= P3:
        total_debt = base_debt * 1.25
    ELSE:
        total_debt = base_debt * 1.0
    
    ADD total_debt TO user.debt_units
```

### 5.4 Pattern Tracking

```
IF consecutive_failures WHERE pressure_at_failure >= P3:
    SET user.chronic_delay_flag = true
    
IF chronic_delay_flag == true:
    APPLY restriction_level += 1
    APPLY future_window_reduction = 0.9 (windows become 10% shorter)
```

### 5.5 Window Compression for Chronic Delay

```
IF user.chronic_delay_flag == true:
    new_window_duration = standard_window * 0.9
    
IF chronic_delay_count >= 3:
    new_window_duration = standard_window * 0.8
    
MINIMUM_WINDOW = 2 hours (cannot compress below this)
```

---

## 6. INTEGRATION WITH ACTION LOCK

### 6.1 EPE Initialization

```
ON lock.status CHANGE TO ACTIVE:
    CREATE PressureState(
        lock_id = lock.id,
        current_level = P0,
        escalated_at = NOW(),
        prompt_count = 0
    )
    START escalation_timer()
```

### 6.2 EPE During Lock

```
WHILE lock.status == ACTIVE:
    RUN escalation_check() EVERY 60 seconds
    RUN prompt_scheduler() based on pressure_level
    RUN interface_updater() on pressure_change
```

### 6.3 EPE Reset Conditions

```
ON lock.status CHANGE TO RESOLVED:
    STOP escalation_timer()
    SET pressure.current_level = INACTIVE
    LOG final_pressure_level
    ARCHIVE pressure_state
    
ON lock.status CHANGE TO EXPIRED:
    STOP escalation_timer()
    LOG failure_pressure_level = pressure.current_level
    APPLY failure_multiplier(pressure.current_level)
    ARCHIVE pressure_state
```

### 6.4 EPE Resolution Logging

```
ON execution_complete:
    LOG ExecutionPressureRecord(
        lock_id,
        final_pressure_level,
        time_to_execute,
        prompt_count_received,
        timing_classification
    )
```

### 6.5 State Dependency

```
EPE requires: lock.status == ACTIVE
EPE terminates: lock.status != ACTIVE

IF lock == null:
    EPE cannot exist
    
EPE is child process of Action Lock
EPE cannot operate independently
```

---

## 7. SYSTEM CONSTANTS

```
PRESSURE_CHECK_INTERVAL_SECONDS     = 60
P1_THRESHOLD_PERCENT                = 25
P2_THRESHOLD_PERCENT                = 50
P3_THRESHOLD_PERCENT                = 75
P4_THRESHOLD_PERCENT                = 90

P1_NOTIFICATION_INTERVAL_MINUTES    = 10
P2_NOTIFICATION_INTERVAL_MINUTES    = 5
P3_NOTIFICATION_INTERVAL_MINUTES    = 2
P4_NOTIFICATION_MODE                = CONTINUOUS

P3_FAILURE_MULTIPLIER               = 1.25
P4_FAILURE_MULTIPLIER               = 1.5

CHRONIC_DELAY_THRESHOLD             = 3
WINDOW_COMPRESSION_FACTOR           = 0.9
MINIMUM_WINDOW_HOURS                = 2
```

---

## 8. PRESSURE LOG

### 8.1 Schema

```
PressureLog {
  id:                   UUID        [IMMUTABLE]
  lock_id:              UUID        [IMMUTABLE]
  event_type:           Enum        [IMMUTABLE]
  pressure_level:       Integer     [IMMUTABLE]
  timestamp:            Timestamp   [IMMUTABLE]
  elapsed_percent:      Float       [IMMUTABLE]
}
```

### 8.2 Event Types

```
PRESSURE_INITIALIZED
PRESSURE_ESCALATED
PROMPT_DELIVERED
EXECUTION_UNDER_PRESSURE
FAILURE_UNDER_PRESSURE
PRESSURE_RESOLVED
```

### 8.3 Log Properties

```
APPEND_ONLY     = true
DELETABLE       = false
EDITABLE        = false
RETENTION       = PERMANENT
```

---

## 9. BEHAVIORAL SUMMARY

```
As time passes during a locked execution window:

0%   → P0: Silent. Waiting.
25%  → P1: Time emphasized. Prompts begin.
50%  → P2: Interface narrows. Prompts increase.
75%  → P3: Countdown dominates. Failure warnings.
90%  → P4: Nothing but seconds. Execute or fail.
100% → FAILURE LOGGED. Multiplier applied.

The system does not:
    - Offer alternatives
    - Provide comfort
    - Explain itself
    - Negotiate
    - Slow down
    - Reset

The system only:
    - Tightens
    - Removes
    - Counts down
    - Logs
```

---

*End of Specification*
