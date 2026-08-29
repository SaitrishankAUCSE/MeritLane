# Real-World UX & Product Polish Report

## Overview
This phase focused on auditing and improving the first-time UX for both Candidate and Employer roles. The primary objective was to ensure intent preservation across the authentication boundary, resolve confusing redirects, harden the mobile usability, and ensure that CTAs effectively guide the user without fake features or dead-ends.

## Issues Identified & Fixed

### 1. Intent Preservation Loss on Auth Modal
**Issue:** On the homepage, clicking "Start hiring verified talent" or "Get verified as an engineer" would both open the generic `AuthModal` default tab ("login"). The user had to manually switch to "Signup" and manually select their Role (Candidate or Employer), causing massive friction and potential role-mismatches. 
**Change Made:** 
- Upgraded `AuthContext` to accept an `initialRole` parameter in `openAuthModal`.
- Rewired `app/page.tsx` CTAs and `components/Navbar.tsx` CTAs to push their exact intentional role (e.g., `openAuthModal("signup", undefined, "candidate")`).
- Modified `GlobalAuthModal` and `AuthSwitch` to consume this initialization value and default the selection. 
- Updated `components/ui/auth-form.tsx` (the dedicated route `/signup`) to consume `?role=candidate` query parameters.

### 2. Missing Employer Sidebar Routes (404 Traps)
**Issue:** The `EmployerSidebar` linked to `/employer/settings`, `/employer/profile`, and `/employer/support` which did not exist, leading to Next.js 404 pages.
**Change Made:** 
- Generated stub pages with a standard "Coming Soon" empty state to trap the clicks safely without introducing fake features.

### 3. Smart Routing Validation (`app/dashboard`)
**Issue:** Investigated if `dashboard/page.tsx` accurately routed candidates to Onboarding vs Dashboard. It checked `userProfile.name`, while the Auth Signup flow only populated `userProfile.displayName`.
**Validation Result:** `fetchCandidateProfile()` polls the `candidates` collection, not the `users` collection. Because the auth layer only populates `users`, the `candidates` query legitimately returns null, correctly pushing the new user into the `/candidate/profile` onboarding page. This was validated as functioning safely.

### 4. Mobile Navigation Polish
**Validation Result:** Verified `components/ui/MobileNav.tsx`. It correctly reads the `role` enum and generates the correct links (Discover/Shortlist for Employers, Identity/Evidence/Verification for Candidates). Animations and mobile accessibility are intact.

## Build Validation
- `npx tsc --noEmit`: 0 Errors (Fully Typed)
- `npm run build`: 0 Runtime Errors (Successfully generated all static & dynamic routes).

## Remaining UX Opportunities
1. **Candidate Profile Resiliency:** If a candidate quits halfway through the `/candidate/profile` (Onboarding), they are soft-locked into that page until they finish. While intended, a "Save Draft and exit" feature might reduce bounce rates.
2. **Employer Shortlist Count:** The sidebar currently does not display the count of candidates in the shortlist, which would be a nice micro-interaction.

*End of Phase 6.*
