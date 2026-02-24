# DISCIPLINE KERNEL v0.1

**Type:** Core System Specification  
**Classification:** Technical Architecture  
**Dependencies:** None  

---

## 1. IDENTITY STATE

### 1.1 Definition
A `User` is an execution entity bound to the system upon registration.

### 1.2 Schema

```
User {
  id:                 UUID        [IMMUTABLE]
  created_at:         Timestamp   [IMMUTABLE]
  commitment_date:    Timestamp   [IMMUTABLE]
  failure_count:      Integer     [APPEND-ONLY]
  debt_units:         Integer     [SYSTEM-CONTROLLED]
  restriction_level:  Integer     [SYSTEM-CONTROLLED]
  status:             Enum        [SYSTEM-CONTROLLED]
}
```

### 1.3 Immutable Attributes
| Attribute | Reason |
|-----------|--------|
| `id` | Identity cannot be recreated |
| `created_at` | History cannot be erased |
| `commitment_date` | Starting point is permanent record |

### 1.4 Non-Editable Post-Creation
| Attribute | Lock Condition |
|-----------|----------------|
| `failure_count` | Cannot decrease. Append-only. |
| `debt_units` | Cannot be manually reduced. System-controlled only. |
| `restriction_level` | Cannot be user-modified. |

### 1.5 Status Enum
```
ACTIVE      — Normal operation
RESTRICTED  — Reduced system access
SUSPENDED   — Execution privileges revoked pending debt payment
```

---

## 2. OBLIGATION MODEL

### 2.1 Definition
An `Obligation` is a scheduled unit of required execution.

### 2.2 Schema

```
Obligation {
  id:               UUID        [IMMUTABLE]
  user_id:          UUID        [IMMUTABLE]
  created_at:       Timestamp   [IMMUTABLE]
  scheduled_at:     Timestamp   [IMMUTABLE AFTER BINDING]
  binding_time:     Timestamp   [SYSTEM-SET]
  type:             String      [IMMUTABLE]
  units_required:   Integer     [IMMUTABLE]
  status:           Enum        [SYSTEM-CONTROLLED]
}
```

### 2.3 Obligation Lifecycle

```
CREATED → BINDING → BOUND → EXECUTED | FAILED
```

| State | Description |
|-------|-------------|
| `CREATED` | Obligation exists, not yet binding |
| `BINDING` | 24 hours before scheduled_at |
| `BOUND` | scheduled_at reached. Execution window open. |
| `EXECUTED` | Units completed within window |
| `FAILED` | Window closed without execution |

### 2.4 Binding Rules

1. Obligation becomes `BINDING` at `scheduled_at - 24h`
2. Once `BINDING`, obligation cannot be:
   - Deleted
   - Rescheduled
   - Modified
3. Obligation becomes `BOUND` at `scheduled_at`
4. Execution window: `scheduled_at` to `scheduled_at + execution_window`
5. Window close triggers automatic status resolution

### 2.5 Non-Negotiability Enforcement

```
IF obligation.status == BINDING OR obligation.status == BOUND:
    REJECT all modification requests
    REJECT all deletion requests
    REJECT all reschedule requests
    LOG attempted_negotiation(user_id, obligation_id, timestamp)
```

---

## 3. EXECUTION LOG

### 3.1 Definition
An `ExecutionLog` is an immutable record of completed or failed obligations.

### 3.2 Schema

```
ExecutionLog {
  id:               UUID        [IMMUTABLE]
  user_id:          UUID        [IMMUTABLE]
  obligation_id:    UUID        [IMMUTABLE]
  timestamp:        Timestamp   [IMMUTABLE]
  result:           Enum        [IMMUTABLE]
  units_completed:  Integer     [IMMUTABLE]
  units_required:   Integer     [IMMUTABLE]
}
```

### 3.3 Result Enum
```
EXECUTED    — Obligation fulfilled
FAILED      — Obligation not fulfilled
```

### 3.4 What Counts as Execution

| Condition | Result |
|-----------|--------|
| `units_completed >= units_required` within window | `EXECUTED` |
| All other cases | `FAILED` |

### 3.5 What Does NOT Count as Execution

| Action | Status |
|--------|--------|
| Partial completion | `FAILED` |
| Completion after window | `FAILED` |
| Intent to complete | Not logged |
| Attempted completion | Not logged |
| Rescheduled obligation | Not logged until resolved |

### 3.6 Log Properties

```
APPEND_ONLY     = true
DELETABLE       = false
EDITABLE        = false
OVERWRITABLE    = false
```

### 3.7 Failure Permanence

```
FOR ALL logs WHERE result == FAILED:
    modification  = PROHIBITED
    deletion      = PROHIBITED
    hiding        = PROHIBITED
    expiration    = NONE
```

---

## 4. FAILURE DEFINITION

### 4.1 Single Sentence Definition

**Failure is the non-execution of a bound obligation within its designated window.**

### 4.2 Clarifications

| Is Failure | Is NOT Failure |
|------------|----------------|
| Not starting | Poor quality |
| Not completing required units | Slow completion |
| Missing the window | Low performance |
| Zero execution | Difficult execution |

### 4.3 Failure Detection

```
ON obligation.window_close:
    IF obligation.units_completed < obligation.units_required:
        SET obligation.status = FAILED
        INSERT ExecutionLog(result=FAILED)
        INCREMENT user.failure_count
        TRIGGER consequence_engine(user_id, failure_count)
```

---

## 5. CONSEQUENCE ENGINE

### 5.1 Trigger Condition

```
ON ExecutionLog.insert WHERE result == FAILED:
    EXECUTE consequence_protocol(user_id)
```

### 5.2 Consequence Matrix

| Failure Count | Consequence |
|---------------|-------------|
| 1 | `+1 debt_unit` |
| 2 | `+2 debt_units`, `restriction_level = 1` |
| 3 | `+3 debt_units`, `restriction_level = 2` |
| 4 | `+4 debt_units`, `restriction_level = 3` |
| 5+ | `+N debt_units`, `restriction_level = MAX`, `status = SUSPENDED` |

### 5.3 Debt Unit Definition

```
1 debt_unit = 1 additional mandatory obligation
```

### 5.4 Debt Properties

```
debt.forgiveness    = DISABLED
debt.expiration     = NONE
debt.reduction      = EXECUTION_ONLY
debt.negotiation    = PROHIBITED
```

### 5.5 Debt Resolution

```
FOR EACH executed_obligation WHERE debt_units > 0:
    IF obligation.is_debt_repayment == true:
        DECREMENT user.debt_units BY 1
```

### 5.6 Reset Protocol

```
RESET_AVAILABLE = false
FRESH_START     = PROHIBITED
HISTORY_CLEAR   = PROHIBITED
FAILURE_ERASURE = PROHIBITED
```

### 5.7 Messaging Protocol

```
ON failure:
    DISPLAY: "Obligation failed. +{N} debt units. Restriction level: {L}"
    
PROHIBITED_MESSAGES:
    - "It's okay"
    - "Try again"
    - "Don't worry"
    - "Everyone fails"
    - "Tomorrow is a new day"
    - ANY message containing encouragement
    - ANY message containing sympathy
    - ANY message containing motivation
```

---

## 6. RESTRICTION SYSTEM

### 6.1 Definition
Restrictions are system-enforced limitations on user capabilities triggered by failure.

### 6.2 Restriction Levels

| Level | Restrictions Applied |
|-------|---------------------|
| 0 | None (default state) |
| 1 | Progress visibility reduced to current day only |
| 2 | Level 1 + Historical data hidden |
| 3 | Level 2 + Social features disabled |
| 4 | Level 3 + Analytics disabled |
| MAX | All non-essential features disabled. Execution input only. |

### 6.3 Activation Rules

```
ON user.failure_count >= 2:
    SET user.restriction_level = MIN(failure_count - 1, MAX_LEVEL)
    APPLY restrictions[user.restriction_level]
```

### 6.4 Restriction Properties

```
user_removable      = false
time_based_decay    = false
payment_bypass      = false
appeal_system       = false
```

### 6.5 Lifting Conditions

```
FOR restriction_level > 0:
    REQUIRED: consecutive_executions >= (restriction_level * 3)
    ON condition_met:
        DECREMENT user.restriction_level BY 1
        IF user.restriction_level > 0:
            REPEAT requirement
```

### 6.6 Restriction Calculation

```
consecutive_executions_required = restriction_level * 3

EXAMPLE:
    restriction_level = 3
    required_consecutive_executions = 9
    
    After 9 consecutive executions: restriction_level = 2
    After 6 more consecutive executions: restriction_level = 1
    After 3 more consecutive executions: restriction_level = 0
```

### 6.7 Restriction Reset on Failure

```
ON new_failure WHERE restriction_lifting_in_progress:
    RESET consecutive_execution_count = 0
    RECALCULATE restriction_level based on total failure_count
```

---

## 7. SYSTEM CONSTANTS

```
EXECUTION_WINDOW_HOURS      = 24
BINDING_WINDOW_HOURS        = 24
MAX_RESTRICTION_LEVEL       = 5
DEBT_MULTIPLIER             = 1
FORGIVENESS_ENABLED         = false
RESET_ENABLED               = false
MOTIVATION_ENABLED          = false
NEGOTIATION_ENABLED         = false
PARTIAL_CREDIT_ENABLED      = false
```

---

## 8. PROHIBITED OPERATIONS

| Operation | Status |
|-----------|--------|
| User.delete() | PROHIBITED |
| User.reset_failures() | PROHIBITED |
| User.reduce_debt() | PROHIBITED |
| User.clear_history() | PROHIBITED |
| Obligation.reschedule() after binding | PROHIBITED |
| Obligation.delete() after binding | PROHIBITED |
| Obligation.modify() after binding | PROHIBITED |
| ExecutionLog.delete() | PROHIBITED |
| ExecutionLog.update() | PROHIBITED |
| Restriction.remove() by user | PROHIBITED |
| Debt.forgive() | PROHIBITED |

---

## 9. KERNEL INTERFACE

### 9.1 Allowed Inputs

```
user.register()
obligation.create()
obligation.execute(units_completed)
```

### 9.2 Allowed Queries

```
user.get_status()
user.get_debt()
user.get_restriction_level()
user.get_pending_obligations()
user.get_execution_history()
```

### 9.3 System-Only Operations

```
obligation.bind()
obligation.resolve()
user.increment_failure()
user.add_debt()
user.apply_restriction()
user.lift_restriction()
consequence.trigger()
```

---

*End of Specification*
