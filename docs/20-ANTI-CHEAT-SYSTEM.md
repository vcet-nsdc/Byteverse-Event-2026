# 20 — Anti-Cheat System

**Purpose:** Document browser and server-side anti-cheat mechanisms  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/components/participant/AntiCheatShield.tsx`, `src/app/api/audit/violation/route.ts`  
**Visibility:** INTERNAL

---

## Client-Side Enforcement

The `AntiCheatShield` component (465 lines) implements:

### 1. Tab Switch Detection
- Listens to `visibilitychange` event
- If `document.hidden` is true → instant lock

### 2. Window Blur Detection
- Listens to `blur` event on `window`
- 50ms debounce (to avoid false triggers from Monaco Editor focus)
- Checks `document.hidden || !document.hasFocus()`
- Ignores blur if active element is IFRAME

### 3. Fullscreen Exit Detection
- Monitors `fullscreenchange` events (all browser prefixes)
- 100ms polling interval as backup
- Only triggers after fullscreen has been established at least once

### 4. Keyboard Trapping
Blocks the following when active:

| Category | Keys Blocked |
|----------|-------------|
| Screenshot | PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5 |
| Refresh | Ctrl+R, F5 |
| Tab/Window | Ctrl+T, Ctrl+N, Ctrl+W, Ctrl+Q |
| Dev Tools | F12, Ctrl+Shift+I/J/C, Ctrl+U |
| Fullscreen Exit | Escape, F11 |
| Browser Actions | Ctrl+P/S/O/H/J |
| Navigation | Alt+Arrow keys |

### 5. Context Menu Block
- Right-click disabled via `contextmenu` event prevention

### 6. Clipboard Wipe
- On PrintScreen detection, clipboard is overwritten with warning text

### 7. BeforeUnload Warning
- Browser shows "Competition in progress!" dialog on page leave attempt

## Lock Modal

When a violation is detected:
1. Screen overlaid with lock modal (z-index 9999)
2. Only number keys, Backspace, Delete, Enter allowed
3. Violation count displayed
4. Proctor must enter PIN to unlock

## Proctor PIN Unlock

- **Valid PINs:** `ADMIN_PIN` env var, `"123456"`, `"2026"`, `"admin2026"`
- **4-second grace period** after unlock (prevents immediate re-trigger)
- Re-enters fullscreen automatically on unlock
- PIN verified via `PUT /api/audit/violation`

## Server-Side Enforcement

### Violation Logging
- Every violation → `POST /api/audit/violation`
- Creates `AuditLog` entry with: userId, action, teamId, reason, count, timestamp
- Publishes to Redis `admin:alerts:{eventId}` channel

### Data Recorded Per Violation

```json
{
  "userId": "...",
  "participantName": "...",
  "participantEmail": "...",
  "teamName": "...",
  "roundId": "...",
  "reason": "Tab switch or browser minimization detected",
  "violationCount": 3,
  "timestamp": "2026-08-31T12:00:00Z"
}
```

## Known Limitations

| Limitation | Risk |
|-----------|------|
| Client-side only enforcement | Can be bypassed with browser dev tools (if accessible) |
| In-memory violation count | Resets on page refresh (but logged server-side) |
| No VM/remote desktop detection | Screen sharing undetectable |
| Fullscreen can't be forced | Browser requires user gesture |
| PIN is hardcoded | Known to anyone reading the source code |

## Anti-Cheat Activation

The shield is active when `isActive={!isRoundFinished}`:
- **Active** during WAITING and ACTIVE phases
- **Active** during break/ended screens (still prevents tab switching)
- **Inactive** when round hasn't started (pre-readiness gate)

## Implementation Files

| File | Purpose |
|------|---------|
| `src/components/participant/AntiCheatShield.tsx` | Client-side enforcement (465 lines) |
| `src/app/api/audit/violation/route.ts` | Server-side logging + PIN verification |
| `src/lib/redis.ts` | Pub/sub for admin alerts |
