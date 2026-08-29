# MeritLane Pilot Operations Guide

## 1. What MeritLane V1 Currently Does
MeritLane connects verified candidates with employers. 
Candidates onboard, take a strict 45-minute server-enforced assessment, and if they pass, enter an Admin verification queue. Admins manually review the evidence and approve candidates. Verified candidates become visible to employers, who can discover them, shortlist them, track them via a pipeline (Shortlisted -> Interviewing -> Offer -> Hired -> Rejected), and message them directly. 

## 2. Candidate Pilot Flow
- Candidates sign up using Google/Email.
- They complete a profile (Name, Role, Experience, Skills).
- They take the Assessment. Any tab-switching or window changes trigger strikes (3 strikes = fail and 14-day lockout).
- They await Admin verification.
- Once verified, they receive an immutable public Proof link and Employer Inbox access.

## 3. Employer Pilot Flow
- Employers sign up and complete a company profile.
- They access the Discovery dashboard to see only Verified candidates.
- They view Dossiers, Shortlist candidates, and advance them via the Pipeline.
- They initiate Messages to candidates.

## 4. Admin Pilot Flow
- Admins log in (must use authorized email).
- Review the Queue for candidates who recently passed assessments.
- Check evidence (GitHub/LinkedIn/Score).
- Click Verify (or Reject/Request Changes). This immediately updates Candidate visibility.

## 5. What the Admin Should Monitor
- **Assessment Drop-offs**: Are candidates hitting the 14-day cooldown accidentally due to extreme tab-switching rules?
- **Verification Queue Volume**: Ensure candidates aren't stuck pending for days.
- **Pipeline Usage**: Are employers actually moving candidates, or just shortlisting and stopping?

## 6. What Constitutes a Genuine Bug
- A 500 Server Error upon clicking a button.
- Employer seeing unverified candidates.
- Candidates able to bypass the 14-day cooldown.
- A user able to view another user's inbox.

## 7. What Constitutes Normal User Confusion
- "I want to add a second skill." (Intentional limitation of V1)
- "I can't see analytics on my hires." (Intentional limitation of V1)
- "I got locked out of my assessment because I checked my email." (Strict anti-cheat operating as designed).

## 8. What Should NOT Be Changed During the Pilot
- Do not alter the 14-day cooldown logic on the fly.
- Do not alter the Assessment anti-cheat strictness during the cohort.
- Do not change Firestore schemas while real data is inflight.

## 9. How to Record Candidate Feedback
- Prompt candidates post-assessment via email or direct interview. Use the structured `PILOT_FEEDBACK_TEMPLATE.md`.

## 10. How to Record Employer Feedback
- Conduct a wrap-up call with pilot employers after 2 weeks. Document their discovery and pipeline experience.

## 11. How to Record Assessment Failures
- Automatically tracked via PostHog (`assessment_infraction` and `assessment_completed` with fail status).

## 12. How to Record Employer Shortlist Behavior
- Automatically tracked via PostHog (`employer_shortlist_added`).

## 13. How to Record Messaging/Interview Progression
- Automatically tracked via PostHog (`employer_pipeline_moved`).

## 14. Distinguishing Product Bugs from Feature Requests
- **Bug**: "Clicking 'Verify' crashed my browser." -> Fix immediately.
- **Feature Request**: "I wish I could filter candidates by timezone." -> Log in post-pilot backlog.

## 15. Emergency Procedure
If a production-critical security or data-leak issue appears:
1. Revoke production Firebase API keys.
2. Suspend Employer Discovery access.
3. Diagnose the leak.
4. Deploy the minimal possible hotfix.
