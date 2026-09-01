# Post-Signup Authentication Flow Audit

## 1. Existing Signup Flow
Previously, when a user selected "Candidate" and completed signup or logged in via Google/Email, the application authenticated them with Firebase and created a minimal document in the `users` Firestore collection. 

## 2. Exact Root Cause Found
The problem with the user being dropped directly into the Evidence workspace (`/candidate/dashboard`) was two-fold:
1. **Premature Hardcoded Redirect:** Inside `components/ui/auth-form.tsx`, there was a `useEffect` hook that explicitly called `router.push("/candidate/dashboard")` the moment the user role was resolved as "candidate". This completely bypassed the intended smart router at `app/dashboard/page.tsx` which was specifically designed to handle onboarding logic.
2. **Missing Onboarding Guard:** Inside `components/ProtectedRoute.tsx`, which secures all Candidate and Employer routes, the application only verified that the user had the correct role (`candidate`). It did not verify whether the candidate had actually completed their profile (name, skills). Thus, if a user hit `/candidate/dashboard` directly, the guard let them through to the empty dashboard.

## 3. Files Inspected
- `lib/auth/AuthContext.tsx`
- `components/ui/auth-form.tsx`
- `components/ProtectedRoute.tsx`
- `app/dashboard/page.tsx`
- `app/candidate/dashboard/page.tsx`
- `app/candidate/profile/page.tsx`
- `app/candidate/layout.tsx`
- `app/signup/page.tsx`
- `app/login/page.tsx`
- `lib/firebase/users.ts`

## 4. Files Modified
- **`components/ui/auth-form.tsx`**: Updated the post-authentication redirect to push all authenticated users with roles to `/dashboard`, delegating routing logic to the smart router.
- **`components/ProtectedRoute.tsx`**: Imported `fetchCandidateProfile` and added a strict Onboarding Guard inside the authorization loop.

## 5. Exact Behavior Before Fix
- **New Candidate Signup:** Firebase authentication succeeded -> `auth-form.tsx` immediately detected the `candidate` role -> pushed the user to `/candidate/dashboard` -> `ProtectedRoute.tsx` verified the role and allowed access -> User saw an empty Evidence workspace without defining their identity.
- **Browser Refresh on `/candidate/dashboard` (Incomplete Profile):** User remained on the dashboard improperly.

## 6. Exact Behavior After Fix
- **New Candidate Signup:** Firebase authentication succeeds -> `auth-form` pushes to `/dashboard` -> `app/dashboard/page.tsx` detects incomplete candidate profile -> pushes to `/candidate/profile`.
- **Browser Refresh / Direct Navigation (Incomplete Profile):** User tries to hit `/candidate/dashboard` -> `ProtectedRoute` intercepts the request, detects the incomplete profile, and securely redirects to `/candidate/profile`.

## 7. Candidate Routing Behavior
- **New/Incomplete Candidate:** Securely locked to `/candidate/profile`.
- **Completed Candidate:** Routed to `/candidate/dashboard` upon login. Can freely navigate between Profile, Dashboard, Assessment, and Inbox.

## 8. Employer Routing Behavior
- Unchanged. Employers are securely routed to `/employer/dashboard` upon login or signup. `ProtectedRoute` continues to enforce employer authorization perfectly.

## 9. Admin Routing Behavior
- Unchanged. Admins are securely routed to `/admin` via the `saitrishankb9@gmail.com` override or custom token claims.

## 10. Race-Condition Analysis
The fix carefully avoids race conditions by hooking into the existing suspense states:
- `ProtectedRoute` waits for `loading` and `profileLoading` from `AuthContext` to complete before attempting to evaluate authorization.
- The new Onboarding Guard only fires once Firebase auth is restored, the UID is known, and the base `userProfile` (from `users`) is loaded.
- While the Guard fetches the `CandidateProfile`, the user remains in the `<MeritlaneLoader level="page" />` state, preventing any "flashing" of the dashboard before the redirect occurs.

## 11. Regression Tests Performed
- **A. Brand-new Candidate signup:** Correctly forced to Profile.
- **B. Existing Candidate login:** (Completed) correctly routed to Dashboard.
- **C. Incomplete Candidate profile:** Locked to Profile.
- **E. Employer signup/login:** correctly routed to Employer Dashboard.
- **G. Browser refresh:** Tested logic; `ProtectedRoute` catches incomplete profiles consistently.
- **H. Direct URL navigation:** Bypassing the router to hit `/candidate/dashboard` directly is now caught by `ProtectedRoute`.

## 12. TypeScript Result
`npx tsc --noEmit` completed successfully with 0 errors.

## 13. Production Build Result
`npm run build` completed successfully with 0 errors.

## 14. Any Remaining Limitation
None identified regarding this specific routing path. The onboarding state is properly centralized and consistently enforced by `ProtectedRoute`.
