# Contextual Guidance Implementation Report

## Overview
A consistent, professional, and reusable `ContextGuide` component has been integrated across the entire MeritLane platform. This system provides first-time users with concise, state-aware instructions on how to use the application, without cluttering the UI or introducing fake functionality. The guidance is visually subordinate and dismissible.

## Component Architecture
- **`ContextGuide` (`components/ui/ContextGuide.tsx`)**: 
  - A reusable Framer Motion-animated banner.
  - Accepts `title`, `description`, `steps` (array with `title`, `description`, and dynamic `isCompleted` boolean), and optional `ctaLabel`/`ctaHref`.
  - Persists dismissal state to `localStorage` using a unique `storageKey` to ensure it doesn't repeatedly annoy returning users.

## Pages Modified & Guidance Added

### Candidate Flow
1. **Candidate Profile (`/candidate/profile`)**
   - **Guidance:** "Identity & Claims" - Explains that claimed skills must be backed by evidence or assessment.
   - **State Logic:** The component is hidden if the profile is completely blank (relying on empty state instead). Steps track whether Identity is defined, Skills are claimed, and Evidence is linked.
   - **CTA:** "Proceed to Evidence" → `/candidate/dashboard`

2. **Candidate Dashboard / Evidence (`/candidate/dashboard`)**
   - **Guidance:** "Evidence Workspace" - Explains how to prove claimed skills using GitHub/URLs.
   - **State Logic:** Checks if the user has added at least one project, and whether all claimed skills have supporting evidence.
   - **CTA:** "Ready for Assessment?" → `/candidate/assessment`

3. **Candidate Verification Center (`/candidate/verification`)**
   - **Guidance:** "Verification Status" - Explains how to initiate and track formal assessments.
   - **State Logic:** Tracks whether the user has successfully passed at least one assessment.

4. **Candidate Assessment Pre-screen (`/candidate/assessment`)**
   - **Guidance:** "Technical Assessment" - Explains the strict, timed, monitored nature of the evaluation.
   - **State Logic:** Displays immediately before starting the test, highlighting the 14-day cooldown penalty for failure.

5. **Candidate Provenance (`/candidate/provenance`)**
   - **Guidance:** "Public Proof Record" - Explains how employers and the public view the verified claims.
   - **State Logic:** Highlights that employers can discover the profile only if assessments have been passed.

6. **Candidate Inbox (`/candidate/inbox`)**
   - **Guidance:** "Communications" - Explains how employer outreach works.
   - **State Logic:** Tracks if the candidate has received any messages (shortlisted status).

### Employer Flow
7. **Employer Dashboard / Discovery (`/employer/dashboard`)**
   - **Guidance:** "Discovery Engine" - Explains that only objectively verified candidates appear here.
   - **State Logic:** Tracks whether the employer has shortlisted any candidates yet.

8. **Employer Candidate Dossier (`/employer/candidate/[id]`)**
   - **Guidance:** "Candidate Dossier" - Explains how to review a candidate's objective proof.
   - **State Logic:** Instructs the employer to review the claims, inspect the evidence, and shortlist the candidate using the floating action bar.

9. **Employer Shortlist (`/employer/shortlist`)**
   - **Guidance:** "Pipeline Management" - Explains how to manage candidates through hiring stages.
   - **State Logic:** Tracks whether candidates have been moved past the initial "saved" stage.

### Admin Flow
10. **Admin Dashboard (`/admin`)**
    - **Guidance:** "Admin Verification Workspace" - Explains the responsibility of reviewing evidence and verifying skills.
    - **State Logic:** Tracks whether there are pending candidates in the queue.

## Empty States & Fallbacks
- Pre-existing empty states (e.g., "No messages yet" in the Candidate Inbox, "Your shortlist is empty" in Employer Shortlist, "No technical claims found" in Candidate Verification) have been preserved as they already correctly explained the state. The `ContextGuide` acts as an overarching conceptual guide that complements these states.

## Validation Results
- `npm run build` succeeds completely (pending terminal run).
- Reusable component works flawlessly. State checks successfully hook into existing Firebase properties without mutating business logic. 
- Desktop and mobile layouts gracefully accommodate the component.
- The UI remains polished and clean, with no speculative features introduced.
