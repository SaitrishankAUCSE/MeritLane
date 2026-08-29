# MeritLane Pilot Metrics Mapping

This document details the exact PostHog events currently implemented in the V1 codebase for measuring the pilot. 

## 1. Signup
- **Status**: ALREADY TRACKED
- **Details**: Fired via `user_signed_up` custom event in `auth-switch.tsx` and tracked natively by Firebase. 

## 2. Candidate Onboarding
- **Status**: ALREADY TRACKED
- **Details**: Fired via `candidate_profile_completed` and `candidate_skills_selected` events in the respective candidate pages.

## 3. Assessment Start
- **Status**: ALREADY TRACKED
- **Details**: Fired via `assessment_started` when the candidate initiates the assessment logic.

## 4. Assessment Completion
- **Status**: ALREADY TRACKED
- **Details**: Fired via `assessment_completed`.

## 5. Assessment Pass/Fail
- **Status**: ALREADY TRACKED
- **Details**: Implicitly tracked via the payload of the `assessment_completed` event.

## 6. Assessment Infractions
- **Status**: ALREADY TRACKED
- **Details**: Fired via `assessment_infraction` when candidates trigger anti-cheat protections (tab switching, screen resizing).

## 7. Verification
- **Status**: NOT TRACKED
- **Details**: Admin verification actions (Verify, Reject) update Firestore but currently do not emit a PostHog analytics event. 

## 8. Employer Discovery
- **Status**: ALREADY TRACKED
- **Details**: Fired via `employer_search_performed` when employers interact with the discovery dashboard.

## 9. Dossier Views
- **Status**: NOT TRACKED
- **Details**: Navigating to `/employer/candidate/[id]` does not emit a specific PostHog event. Pageviews are tracked natively by PostHog if pageview autocapture is enabled, but no custom event exists.

## 10. Shortlist Actions
- **Status**: ALREADY TRACKED
- **Details**: Fired via `employer_shortlist_added` when a candidate is pushed to a shortlist.

## 11. Pipeline Movement
- **Status**: ALREADY TRACKED
- **Details**: Fired via `employer_pipeline_moved` when employers change a candidate's status (e.g., to Interviewing or Hired).

## 12. Employer Messages
- **Status**: NOT TRACKED
- **Details**: The messaging API (`/api/messages`) does not currently emit a PostHog event.

**Note:** The absence of tracking for certain events (Verification, Dossier Views, Messaging) is an intentional limitation of V1. Do not introduce new telemetry to the frozen codebase. Autocapture can optionally supplement these missing gaps.
