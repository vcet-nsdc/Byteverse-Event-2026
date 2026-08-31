# Internal Competition Rules & Scoring Engine Specifications

**CONFIDENTIALITY LEVEL:** ORGANIZER / PROCTOR / DEVELOPER INTERNAL ONLY  
**DO NOT DISTRIBUTE TO PARTICIPANTS**  
**Event:** ByteVerse 2026 (NSDC @ VCET, Vasai)  
**Last Updated:** 2026-08-31

---

## 1. Complete Scoring Mechanics & Formulas

### 1.1 Individual Score Calculation
Every participant accumulates a `rawScore` and an `aiScoreCap` for each round in which they participate.

$$\text{finalScore} = \min(\text{rawScore}, \text{aiScoreCap})$$

- **Initial State:** Every participant starts each round with $\text{aiScoreCap} = 100$.
- **AI EXPLAIN Penalty:** Using the Socratic concept tutor triggers $\text{aiScoreCap} \leftarrow \min(\text{aiScoreCap}, 75)$.
- **AI CODE Penalty:** Using the syntax/pattern advisor triggers $\text{aiScoreCap} \leftarrow \min(\text{aiScoreCap}, 50)$.
- **Permanence:** AI score penalties are **strictly permanent** for the active round. Submitting clean code *after* using AI does **NOT** restore the cap.

### 1.2 Round-by-Round Point Distributions
- **Round 1 (Logical Thinking - MCQ):** 10 questions per participant set (Set A / Set B). Each correct answer awards exactly **10 points**. Maximum raw score = **100 points**. Incorrect answers yield **0 points** (no negative marking).
- **Round 2 (AI Code Optimization):** Coding problems evaluated against test cases. Max score = **100 points**.
- **Rounds 3–5:** Evaluated via Judge0 test suites with weighted test cases. Max score per round = **100 points**.

### 1.3 Team Score Aggregation
Team scores are calculated dynamically whenever an individual score changes:

$$\text{teamScore} = \frac{\text{score}_{\text{member1}} + \text{score}_{\text{member2}}}{2}$$

**Missing Member Policies (Configured in Event Model):**
- `TREAT_AS_ZERO` *(Default)*: If only one team member submits or attends, the absent member receives 0 points, and the sum is divided by 2.
- `MARK_INCOMPLETE` / `TEAM_INELIGIBLE`: The entire team receives 0 points if both members have not submitted.
- `REQUIRE_BOTH`: Both members must have active submissions before any score is registered on the public leaderboard.

---

## 2. Anti-Cheat Protocols & Enforcement Rules

### 2.1 Trigger Conditions for Station Lockdown
A workstation is instantly locked and overlaid with the Proctor Unlock screen upon detecting:
1. **Window Blur / Tab Switch:** `document.hidden === true` or window loses focus for $\ge 50\text{ms}$.
2. **Fullscreen Exit:** Any departure from fullscreen mode after initial entry.
3. **Restricted Key Combinations:** F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+T, Ctrl+N, Ctrl+W, Ctrl+R, F5, PrintScreen, Alt+Tab.

### 2.2 Proctor Unlock Credentials
Proctors on the floor may unlock a restricted station using any of the following valid master PINs:
- Custom PIN defined in `ADMIN_PIN` environment variable
- Default Emergency Floor PINs: `123456`, `2026`, `admin2026`

### 2.3 Violation Logging & Disqualification Policy
- Every lock event creates an immutable entry in the `audit_logs` table and broadcasts an alert to `admin:alerts:{eventId}`.
- **Recommended Floor Action:**
  - *1st & 2nd Offense:* Proctor inspects screen, warns participant, unlocks with PIN.
  - *3rd Offense:* Official warning recorded by Lead Organizer.
  - *4th Offense or Intentional Bypass Attempt:* Admin triggers `POST /api/admin/teams/{id}/disqualify` to remove team from tournament.
