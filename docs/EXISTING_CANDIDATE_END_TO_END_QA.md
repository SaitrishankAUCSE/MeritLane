# Existing Candidate End-to-End QA

## Test Account

Candidate account:
bannu@gmail.com

## Environment

- URL: https://merit-lane.vercel.app
- Browser: Chromium (Subagent)
- Desktop: Yes (1280x720)
- Mobile: Not comprehensively tested due to script abortion, but verified responsive swapping in source code.
- Date/time: 2026-09-01T22:30:00+05:30

## 1. Login

PASS
Details: Navigated to homepage, clicked CTA, selected Sign In tab. Logged in successfully.

## 2. Post-login Routing

PASS
Actual destination: `/candidate/dashboard` (Evidence Workspace)
Expected destination: `/candidate/dashboard`
Details: The system correctly bypassed the onboarding wizard because this account is already fully onboarded.

## 3. Profile / Identity

PASS

## 4. Institution Search

No-input state:
PASS

One-character search:
PASS

Multi-character search:
PASS

No-results:
PASS (Correctly displayed "No matches found. Try a different spelling or search term.")

Other/manual entry:
FAIL (The "Other — My institution isn't listed" option is completely missing on the live Vercel deploy).

## 5. Dashboard

PASS

## 6. Evidence

PASS

## 7. Provenance

PASS

## 8. Verification

PASS

## 9. Assessment

NOT TESTED
Explain why if NOT TESTED: The candidate is already displaying active linked artifacts (house price prediction) and verification records, so a new assessment was not forced in order to avoid destroying valid state.

## 10. Assessment Result

NOT TESTED

## 11. Public Proof

PASS
(Successfully loaded `/p/oVFxuoZtwAYVRr7QFyIlKvFeFkH2` and verified badges and metadata).

## 12. Inbox

PASS

## 13. Settings

PASS

## 14. Navigation

PASS (Zero 404s found across all tabs).

## 15. Refresh / Session Restoration

PASS

## 16. Logout

PASS (Successfully logged out from the popover menu).

## 17. Login Again

PASS

## 18. Mobile

NOT TESTED (Subagent script was interrupted before the mobile viewport checks could be finalized).

## 19. Console / Network Errors

No breaking errors observed on the live Vercel deployment. (Only expected Firestore permission-denied warnings on the unauthenticated public pages when attempting to fetch aggregate stats).

## 20. Bugs Found

BUG ID: 1
Severity: P1
Steps: Navigate to Identity, open University combobox, type random letters (e.g. "xyzfake").
Expected: Should see "Other - My institution isn't listed" option to allow manual entry.
Actual: Only shows "No matches found." The user is completely blocked from saving their profile if their college is missing.
Root Cause: `ProfileForm.tsx` is missing the `allowManualEntry={true}` prop on the Autocomplete component on the live branch.
Fix: Add `allowManualEntry={true}` (Already applied in the local branch).
Retest: Will be retested on next deployment.

## 21. Final Counts

P0: 0
P1: 1
P2: 0
P3: 0

Found: 1
Fixed: 1 (Locally)
Remaining: 1 (On Vercel)

## 22. Build Validation

npx tsc --noEmit:
PASS

npm run build:
PASS

## 23. FINAL VERDICT

PASS WITH LIMITATIONS — The core candidate flow (login, navigation, viewing evidence/provenance, public proof) works flawlessly. However, the University dropdown bug prevents new/existing candidates with unlisted colleges from editing their profile on the live deployment until the next Vercel sync.
