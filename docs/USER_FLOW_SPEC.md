# MERITLANE — FULL USER FLOW SPEC

*CORE PRINCIPLE (do not lose sight of this on any future task)*
Meritlane replaces "which college did you attend" with "here is verified proof of what you can build." Every screen must reinforce that this is a serious, trustworthy platform — never fake data, never decorative content, never anything that isn't real.

---

## CANDIDATE FLOW

1. **Discovery (/)** — [BUILT]
   Candidate lands on the homepage, reads the trust-gap problem/solution, clicks "I'm a candidate."

2. **Signup (/signup)** — [BUILT]
   Creates account via email/password or Google. Selects "Candidate" role. A `users/{uid}` Firestore doc is created with role: "candidate".

3. **Profile creation (/candidate/profile)** — [BUILT, persistence in progress]
   Fills in: name, college, branch, graduation year, GitHub URL, resume URL (optional), skill tags, and one or more real projects (title, repo URL, live demo URL optional, architecture summary). Can "Save Draft" (stays on page) or "Submit for Verification" (redirects to dashboard).

4. **Candidate dashboard (/candidate/dashboard)** — [PARTIALLY BUILT — placeholder]
   Shows verification status: "Verification Pending" (yellow) initially. This is where the candidate returns to check status and edit their profile/projects at any time before or after verification.

5. **Skill verification** — [NOT YET BUILT — next major feature]
   Candidate completes ONE graded coding assessment task (via Judge0 CE API) matched to their primary skill domain (e.g. Python/full-stack/ML to start). This is separate from the project portfolio — the project portfolio is manually-submitted evidence; the assessment is an objectively graded skill check. A passing score:
   - Sets `verifiedBadge: true` on their candidate doc
   - Unlocks the "Verified" badge (currently a locked grey placeholder)
   - Makes them visible/rankable in employer search

6. **Discovery by employers** — [NOT YET BUILT]
   Once verified, the candidate's profile becomes visible to employers browsing candidates for a posted role. Ranking should prioritize verified skill score + relevant project evidence, NOT college name — this ranking logic is the whole point of the product.

7. **Getting hired** — [NOT YET BUILT]
   An employer reaches out / expresses interest through the platform (exact mechanism TBD — could be a "shortlist" action + contact reveal, or a simple interest/application flow). Candidate's `placementStatus` updates accordingly (e.g. "shortlisted" → "interviewing" → "hired").

8. **Post-hire outcome loop** — [NOT YET BUILT, THIS IS THE MOAT]
   Once hired, the employer is later prompted (30/60/90 days in) to rate how the candidate is actually performing. This outcome data feeds back into Meritlane's trust signal over time — no competitor tracks this. This is what point 9 of the original plan calls "the actual long-term asset." Do not treat this as a nice-to-have — it's the core differentiator.

---

## EMPLOYER FLOW

1. **Discovery (/)** — [BUILT]
   Employer lands on homepage, clicks "I'm hiring."

2. **Signup (/signup)** — [BUILT]
   Same as candidate signup, role: "employer".

3. **Employer dashboard (/employer/dashboard)** — [BUILT AS UI SHELL — persistence in progress]
   Two views: browse verified candidates (currently empty state, no real matching yet) and post a role (title, department, skills needed, experience level). Posted roles need to actually persist to Firestore under `roles/{roleId}` with `employerId`, not just live in component state.

4. **Browsing verified candidates** — [NOT YET BUILT]
   Once candidates exist with `verifiedBadge: true`, employer should be able to filter/browse them against a posted role's required skills. This is the core value delivery moment for the employer side — it must feel like "proof-based shortlisting," not a generic candidate list.

5. **Shortlisting / contacting a candidate** — [NOT YET BUILT]
   Some mechanism to express interest and get in touch with a candidate. Exact UX TBD, but should update `placementStatus` on the candidate's side.

6. **Hiring** — [NOT YET BUILT]
   Employer confirms a hire (this could be manual, self-reported for MVP — no need for a complex applicant-tracking system yet).

7. **30/60/90-day check-ins** — [NOT YET BUILT, SAME MOAT AS CANDIDATE SIDE]
   Employer periodically prompted to rate hire performance. This writes to `outcomes/{outcomeId}`: candidateId, employerId, hireDate, day30/60/90 scores, retained (bool). This collection is the actual long-term product asset, per the original plan — everything else is table stakes.

---

## WHAT THIS MEANS FOR PRIORITIZATION

Steps 1-4 on both sides are built or nearly built. The single most important unbuilt piece, ranked by how core it is to the product's actual differentiation, is:

1. **The skill verification/assessment engine (candidate step 5)** — nothing else can work without this, since "verified" is currently just an inert badge with nothing behind it.
2. **Candidate browsing/matching for employers (employer step 4)** — the other half of making verification actually mean something.
3. **The outcome-tracking loop (both sides' final steps)** — this is the moat, but it can't exist until there are real hires to track, so it's correctly last, not unimportant.
