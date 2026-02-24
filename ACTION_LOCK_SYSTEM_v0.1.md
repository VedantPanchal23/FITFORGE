# ACTION LOCK SYSTEM v0.1

**Type:** Core System Specification  
**Classification:** Execution Enforcement Extension  
**Parent:** DISCIPLINE KERNEL v0.1  
**Dependencies:** Obligation Model, Execution Log, Consequence Engine  

---

## 1. LOCK STATE DEFINITION

### 1.1 Definition
`LOCKED` is a system state in which the user interface is restricted to execution-related inputs only until the bound obligation is resolved.

### 1.2 Lock Schema

```
LockState {
  id:                   UUID        [IMMUTABLE]
  user_id:              UUID        [IMMUTABLE]
  obligation_id:        UUID        [IMMUTABLE]
  lock_start:           Timestamp   [IMMUTABLE]
  lock_end:             Timestamp   [SYSTEM-CONTROLLED]
  status:               Enum        [SYSTEM-CONTROLLED]
  escape_attempts:      Integer     [APPEND-ONLY]
  resolution:           Enum        [IMMUTABLE AFTER SET]
}
```

### 1.3 Lock Status Enum
```
INACTIVE    — No active lock
ACTIVE      — Lock engaged, awaiting resolution
RESOLVED    — Lock ended via execution
EXPIRED     — Lock ended via window close (failure)
```

### 1.4 Resolution Enum
```
EXECUTED    — User completed obligation
FAILED      — Window expired without execution
PENDING     — Not yet resolved
```

---

## 2. DISABLED FUNCTIONS DURING LOCK

### 2.1 Navigation Restrictions

| Function | Status |
|----------|--------|
| Access other screens | DISABLED |
| Access settings | DISABLED |
| Access history | DISABLED |
| Access analytics | DISABLED |
| Access social features | DISABLED |
| Access profile | DISABLED |
| Modify future obligations | DISABLED |
| Create new obligations | DISABLED |
| View past performance | DISABLED |

### 2.2 Allowed Inputs During Lock

| Input | Status |
|-------|--------|
| Log execution units | ALLOWED |
| Confirm completion | ALLOWED |
| View current obligation details | ALLOWED |
| View remaining time | ALLOWED |

### 2.3 Visible Outputs During Lock

```
DISPLAYED:
    - Current obligation type
    - Units required
    - Units completed (counter)
    - Time remaining in window
    - Confirm execution button
    
NOT_DISPLAYED:
    - Progress statistics
    - Historical data
    - Motivational content
    - Tips or suggestions
    - Alternative options
```

---

## 3. LOCK TRIGGERS

### 3.1 Primary Trigger

```
ON obligation.status CHANGE TO BOUND:
    CREATE LockState(
        user_id = obligation.user_id,
        obligation_id = obligation.id,
        lock_start = NOW(),
        status = ACTIVE,
        escape_attempts = 0,
        resolution = PENDING
    )
    APPLY interface_restrictions()
```

### 3.2 Trigger Conditions

| Condition | Lock Triggered |
|-----------|----------------|
| `obligation.status == BOUND` | YES |
| `obligation.status == BINDING` | NO |
| `obligation.status == CREATED` | NO |
| `user.debt_units > 0` AND debt obligation scheduled | YES |
| Multiple obligations bound simultaneously | SEQUENTIAL LOCK |

### 3.3 Sequential Lock Handling

```
IF count(bound_obligations) > 1:
    ORDER BY scheduled_at ASC
    LOCK on first obligation
    ON resolution: LOCK on next obligation
    REPEAT until all resolved
```

---

## 4. LOCK BEHAVIOR

### 4.1 Interface State

```
DURING lock.status == ACTIVE:
    navigation_enabled      = false
    back_button_enabled     = false
    home_button_override    = true
    app_switching_tracked   = true
    screen_elements         = EXECUTION_ONLY
```

### 4.2 User View During Lock

```
┌─────────────────────────────────────┐
│                                     │
│         [OBLIGATION TYPE]           │
│                                     │
│     REQUIRED: [X] units             │
│     COMPLETED: [Y] units            │
│                                     │
│     TIME REMAINING: [HH:MM:SS]      │
│                                     │
│     [LOG EXECUTION]                 │
│                                     │
│     [CONFIRM COMPLETION]            │
│                                     │
└─────────────────────────────────────┘
```

### 4.3 User Prohibitions During Lock

| Action | System Response |
|--------|-----------------|
| Navigate away | BLOCKED |
| Access menu | BLOCKED |
| Modify obligation | BLOCKED |
| Request reschedule | BLOCKED |
| Contact support | BLOCKED |
| View other data | BLOCKED |
| Minimize intent | TRACKED as escape_attempt |

### 4.4 System Presentation Behavior

```
PRESENTATION_MODE = PERSISTENT

IF user_idle_seconds > 60:
    DISPLAY: "Obligation pending. [UNITS] remaining."
    
IF user_idle_seconds > 300:
    DISPLAY: "Execution required. Time: [REMAINING]"
    TRIGGER: notification_pulse()
    
IF user_idle_seconds > 600:
    DISPLAY: "Non-execution will be logged as failure."
    INCREMENT: pressure_level
```

---

## 5. EXIT CONDITIONS

### 5.1 Valid Exit: Execution Complete

```
ON units_completed >= units_required:
    SET obligation.status = EXECUTED
    SET lock.status = RESOLVED
    SET lock.resolution = EXECUTED
    SET lock.lock_end = NOW()
    INSERT ExecutionLog(result=EXECUTED)
    RELEASE interface_restrictions()
```

### 5.2 Valid Exit: Window Expiration

```
ON current_time >= obligation.window_end:
    IF units_completed < units_required:
        SET obligation.status = FAILED
        SET lock.status = EXPIRED
        SET lock.resolution = FAILED
        SET lock.lock_end = NOW()
        INSERT ExecutionLog(result=FAILED)
        TRIGGER consequence_engine(user_id)
        RELEASE interface_restrictions()
```

### 5.3 Invalid Exit Attempts

| Attempt | Result |
|---------|--------|
| Force close app | Lock persists on reopen |
| Uninstall app | Failure logged at window end |
| Wait out the lock | Failure logged at window end |
| Device restart | Lock resumes on app open |

### 5.4 Exit Condition Priority

```
PRIORITY_ORDER:
    1. Execution completion
    2. Window expiration
    
NO OTHER EXIT CONDITIONS EXIST.
```

---

## 6. ESCAPE PREVENTION

### 6.1 App Close Handling

```
ON app.close_event:
    IF lock.status == ACTIVE:
        SET lock.last_escape_attempt = NOW()
        INCREMENT lock.escape_attempts
        LOG EscapeAttempt(type=APP_CLOSE, timestamp=NOW())
        
ON app.open_event:
    IF lock.status == ACTIVE:
        RESTORE lock_interface()
        DISPLAY: "Obligation unresolved. Resume execution."
```

### 6.2 App Backgrounding Handling

```
ON app.background_event:
    IF lock.status == ACTIVE:
        START background_timer()
        
        IF background_duration > 30 seconds:
            INCREMENT lock.escape_attempts
            LOG EscapeAttempt(type=BACKGROUNDED, duration=background_duration)
            TRIGGER persistent_notification()
        
ON app.foreground_event:
    IF lock.status == ACTIVE:
        RESTORE lock_interface()
        IF escape_attempt_logged:
            DISPLAY: "Avoidance logged. Execute obligation."
```

### 6.3 Device Reboot Handling

```
ON device.boot_complete:
    QUERY pending_locks WHERE status == ACTIVE
    
    IF pending_lock EXISTS:
        IF current_time < obligation.window_end:
            TRIGGER persistent_notification()
            SET notification.priority = CRITICAL
            SET notification.dismissable = false
        ELSE:
            TRIGGER window_expiration_handler()
```

### 6.4 Intentional Avoidance Detection

```
AVOIDANCE_SIGNALS:
    - escape_attempts >= 3 in single lock session
    - background_duration_total > 50% of remaining window
    - app opened but no execution input for > 10 minutes
    - repeated app close/open cycles

ON avoidance_detected:
    SET user.avoidance_flag = true
    LOG AvoidanceEvent(lock_id, signals_detected)
    
    IF obligation eventually fails:
        APPLY additional_debt_multiplier = 1.5
```

### 6.5 Persistent Notification Protocol

```
DURING lock.status == ACTIVE AND app.state != FOREGROUND:
    
    NOTIFICATION:
        priority         = MAXIMUM
        dismissable      = false
        sound            = ENABLED
        vibration        = ENABLED
        content          = "Obligation pending. [TIME] remaining."
        action_required  = OPEN_APP
        
    REPEAT_INTERVAL = 5 minutes
```

---

## 7. FAILURE UNDER LOCK

### 7.1 Passive Failure (Window Expiration)

```
ON window_expiration WHERE units_completed < units_required:
    SET obligation.status = FAILED
    INSERT ExecutionLog(
        result = FAILED,
        units_completed = actual_completed,
        units_required = required
    )
    TRIGGER consequence_engine(user_id)
```

### 7.2 Active Refusal Detection

```
ACTIVE_REFUSAL_INDICATORS:
    - App open for > 50% of window with zero execution
    - Escape attempts > 5
    - Avoidance flag = true

IF active_refusal_detected:
    SET failure.type = ACTIVE_REFUSAL
    APPLY debt_multiplier = 2.0
```

### 7.3 Debt Compounding Under Lock

| Failure Type | Debt Calculation |
|--------------|------------------|
| Standard failure | `+failure_count debt_units` |
| Failure with avoidance | `+(failure_count * 1.5) debt_units` |
| Active refusal | `+(failure_count * 2.0) debt_units` |

### 7.4 Escape Attempt Consequences

```
FOR EACH lock_session:
    IF escape_attempts > 0:
        LOG escape_behavior(user_id, count)
        
    IF escape_attempts >= 5:
        INCREMENT user.restriction_level BY 1
        (independent of failure state)
```

---

## 8. LOCK PERSISTENCE

### 8.1 Persistence Rules

```
lock.persists_through:
    - App close           = YES
    - App uninstall       = YES (failure logged at window end)
    - Device restart      = YES
    - Network loss        = YES
    - Battery death       = YES (failure logged at window end if unresolved)
    - User request        = IGNORED
```

### 8.2 Lock Recovery

```
ON app.launch:
    QUERY LockState WHERE user_id = current_user AND status = ACTIVE
    
    IF active_lock EXISTS:
        IF current_time < obligation.window_end:
            RESTORE lock_interface()
            RESUME lock_session()
        ELSE:
            EXECUTE window_expiration_handler()
```

### 8.3 Offline Handling

```
IF network.status == OFFLINE:
    LOCK continues locally
    EXECUTION can be logged locally
    ON network.restore:
        SYNC execution_log to server
        SYNC escape_attempts to server
```

---

## 9. SYSTEM CONSTANTS

```
LOCK_ACTIVATION_DELAY_SECONDS       = 0
IDLE_WARNING_1_SECONDS              = 60
IDLE_WARNING_2_SECONDS              = 300
IDLE_WARNING_3_SECONDS              = 600
BACKGROUND_TOLERANCE_SECONDS        = 30
NOTIFICATION_REPEAT_MINUTES         = 5
ESCAPE_THRESHOLD_FOR_RESTRICTION    = 5
AVOIDANCE_DEBT_MULTIPLIER           = 1.5
ACTIVE_REFUSAL_DEBT_MULTIPLIER      = 2.0
```

---

## 10. INTERFACE REQUIREMENTS

### 10.1 Lock Screen Mandates

```
MUST_DISPLAY:
    - Obligation type
    - Units required
    - Units completed
    - Time remaining
    - Execution input
    - Confirm button

MUST_NOT_DISPLAY:
    - Navigation elements
    - Back button
    - Menu access
    - Motivational text
    - Encouragement
    - Tips
    - Alternatives
```

### 10.2 Lock Messaging Protocol

```
ALLOWED_MESSAGES:
    - "Obligation pending."
    - "Execute to unlock."
    - "[X] units remaining."
    - "[TIME] until failure."
    - "Avoidance logged."
    - "Non-execution will be recorded."

PROHIBITED_MESSAGES:
    - "You can do it"
    - "Almost there"
    - "Great progress"
    - "Take your time"
    - ANY encouragement
    - ANY sympathy
```

---

## 11. LOCK LOG

### 11.1 Schema

```
LockLog {
  id:                   UUID        [IMMUTABLE]
  lock_id:              UUID        [IMMUTABLE]
  event_type:           Enum        [IMMUTABLE]
  timestamp:            Timestamp   [IMMUTABLE]
  metadata:             JSON        [IMMUTABLE]
}
```

### 11.2 Event Types

```
LOCK_ACTIVATED
LOCK_RESOLVED
LOCK_EXPIRED
ESCAPE_ATTEMPT
AVOIDANCE_DETECTED
ACTIVE_REFUSAL_DETECTED
EXECUTION_LOGGED
IDLE_WARNING_TRIGGERED
```

### 11.3 Log Properties

```
APPEND_ONLY     = true
DELETABLE       = false
EDITABLE        = false
USER_VISIBLE    = false (system use only)
```

---

*End of Specification*
