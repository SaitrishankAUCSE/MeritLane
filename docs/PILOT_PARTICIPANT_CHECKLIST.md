# MeritLane Pilot Participant Checklist

This checklist is designed for controlled learning with a small cohort of real users. 

## Initial Cohort Target
- [ ] 5 Candidates
- [ ] 3 Employers

## Phase 1: Onboarding
- [ ] Whitelist the 3 Employer domains (or communicate signup links).
- [ ] Invite 5 Candidates to sign up and instruct them to complete their profile and assessment.
- [ ] Observe any friction during the signup/auth process.

## Phase 2: Observation & Feedback Collection (Candidates)
- [ ] Monitor PostHog for `assessment_started` and `assessment_completed`.
- [ ] If an `assessment_infraction` is triggered, follow up to understand if the anti-cheat was too sensitive.
- [ ] Use `PILOT_FEEDBACK_TEMPLATE.md` to conduct a 5-minute wrap-up with each of the 5 candidates.
- [ ] Expand to 10, then 20 candidates once the first 5 have successfully navigated the flow without P0 blockers.

## Phase 3: Observation & Feedback Collection (Employers)
- [ ] Verify candidates in the Admin queue promptly so employers have a populated discovery pool.
- [ ] Monitor PostHog for `employer_search_performed`.
- [ ] If `employer_shortlist_added` or `employer_pipeline_moved` occurs, note how employers use the stages.
- [ ] Conduct a 15-minute feedback call using `PILOT_FEEDBACK_TEMPLATE.md` with the 3 employers after 7 days.

## Phase 4: Issue Classification
- [ ] Compile all bugs and feature requests.
- [ ] Separate product confusion from actual runtime crashes.
- [ ] Add Feature Requests to the Post-Pilot Backlog (e.g., 30-day tracking, saved searches).
- [ ] Immediately triage any discovered P0/P1 bugs for a hotfix.

## Phase 5: Pilot Completion Criteria
- [ ] 20 candidates have taken the assessment.
- [ ] 3 employers have performed a search and shortlisted at least 1 candidate.
- [ ] 1 message has been successfully sent and received.
- [ ] Feedback templates have been completed for at least 50% of participants.
