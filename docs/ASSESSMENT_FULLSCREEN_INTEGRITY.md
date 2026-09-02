# Assessment Fullscreen & Navigation Integrity

## 1. Overview
The Assessment Fullscreen and Navigation Integrity mechanism provides robust, client-side session monitoring backed by server-side authoritative enforcement.

## 2. Integrity Flow

### Assessment Start
1. Candidate views the Pre-Flight screen outlining real parameters:
   - 45-minute timed duration
   - 80% passing threshold
   - Monitored fullscreen requirement
   - 3-strike violation limit (results in 21-day integrity cooldown)
   - 14-day standard academic failure cooldown
2. Clicking **"Start Assessment"** invokes `document.documentElement.requestFullscreen()`.
3. If fullscreen is denied or unsupported, `FullscreenUnsupportedOverlay` is displayed with manual retry options.

### Monitored Events
- `document.fullscreenchange`: Detects when the user leaves fullscreen mode. An internal guard (`isRestoringFullscreenRef`) suppresses self-incrementing violations during app-initiated fullscreen restorations.
- `document.visibilitychange`: Detects tab switching or window minimization.
- `window.popstate` & `window.beforeunload`: Traps browser back navigation and tab closure.

### Violation Tracking
- **Violation 1 & 2**: Displays accessible `InfractionOverlay` dialog. An automated restoration attempt is scheduled after 3 seconds; if the browser requires an explicit user gesture, a "Return to Fullscreen" CTA is provided.
- **Violation 3**: Session is immediately terminated client-side, the timer stops, and a termination request is sent to `/api/terminate-assessment`.

### Authoritative Server Enforcement
- `/api/terminate-assessment` verifies the user's active session, writes the server timestamp to `failedAssessments[skill]` and `integrityTerminations[skill]`, deletes active session fields (`assessmentStartedAt`, `assessmentSkill`, `assessmentVariant`), and returns a 21-day retry ISO timestamp.
- `/api/start-assessment` inspects `integrityTerminations[skill]`. If present, it computes and validates against a **21-day window** (1,814,400,000 ms) instead of the standard 14 days, responding with HTTP 429 and the remaining cooldown days.

## 3. Telemetry (PostHog)
The following events are emitted:
- `assessment_fullscreen_entered`
- `assessment_fullscreen_violation` (includes count and violation type: `hidden_tab`, `back_button`, `exited_fullscreen`)
- `assessment_integrity_terminated`

No answers, source code, or private candidate information are captured in telemetry.
