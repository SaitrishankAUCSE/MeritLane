# MeritLane Pilot-Ready v1 Baseline

## 1. Current Product Scope
MeritLane is verified as Pilot-Ready v1. The scope is strictly contained to the core end-to-end loop: Candidate Onboarding → Candidate Assessment → Admin Verification → Employer Discovery → Employer Pipeline → Messaging. Future/speculative features (e.g. outcome tracking, WhatsApp integrations, crypto proofs) are intentionally excluded and placed in the post-pilot backlog.

## 2. Candidate Flow
- **Registration**: Authenticated via Firebase.
- **Profile**: Candidates must complete basic information and select skills.
- **Assessment**: Accessible only once profile is complete. Follows a server-enforced timer.
- **Outcomes**: Pass (≥80%) transitions candidate to the verification queue. Fail enforces an immutable 14-day server-side cooldown.

## 3. Employer Flow
- **Registration**: Authenticated via Firebase.
- **Discovery**: Employers search a sanitized, role-independent candidate pool. Only "verified" candidates are visible.
- **Pipeline**: Employers can add candidates to a shortlist and move them through Interviewing -> Offer Extended -> Hired -> Rejected stages.

## 4. Admin Flow
- **Queue**: A centralized dashboard aggregates newly passed candidates.
- **Actions**: Admins inspect evidence, run deterministic checks, and make Verify/Request Changes/Reject decisions that mutate the candidate's core Verification status.

## 5. Security Model
- **Role Isolation**: Strictly enforced by `ProtectedRoute` wrappers on the frontend and `adminAuth.verifyIdToken()` on all API routes.
- **Private Data**: Firewalled behind user ID and employer UID isolation. 
- **Admin**: Fallback securely mapped to `saitrishankb9@gmail.com`.

## 6. Assessment/Anti-Cheat Model
- **Timer**: Server-issued start and end timestamps.
- **Lockdown**: Screen-lock, back-button interception, tab-visibility tracking, and full-screen enforcement trigger strikes resulting in automatic test failure and cooldown lockouts.

## 7. Verification Model
- **Single Source of Truth**: `verificationStatus` on the Candidate document controls visibility globally.
- **Proof**: Public `/p/[id]` endpoints render honest audit histories without fabricated "blockchain" or "heuristic AI" buzzwords.

## 8. Messaging Model
- **Flow**: Employers message candidates directly from the Dossier/Shortlist.
- **Candidate Inbox**: Candidates read messages internally within their portal. Messages are strictly bounded to the participating parties via UID.

## 9. Contextual Guidance Architecture
- A unified, globally-available `ContextGuide` dynamically reads the user's active context and emits 2-4 actionable next steps. Guidance correctly updates to reflect empty states, pending assessments, and terminal "hired" outcomes.

## 10. Analytics
- Safely integrated PostHog tracks client-side funnel movements. Fails silently in local environments without breaking the app if env variables are missing.

## 11. Routes Audited
All primary workflows: `/candidate/*`, `/employer/*`, `/admin/*`, and public endpoints `/`, `/login`, `/signup`, `/proof`, `/p/[id]`.

## 12. APIs Audited
All `/api/*` routes verified to enforce JWT/session validation, role-scoping, and error-handling.

## 13. Bugs Found during Final Audit
Zero P0/P1 issues identified in the final pass. The codebase was cleanly secured in the preceding regression sweeps.

## 14. Bugs Fixed
None required during this final freeze phase. Previous dead-link patches hold securely.

## 15. TypeScript Result
**PASS**: `npx tsc --noEmit` yielded 0 errors.

## 16. Production Build Result
**PASS**: `npm run build` generated optimized static and dynamic routes flawlessly.

## 17. Mobile/Desktop Validation
**PASS**: Validated. The UI remains fully responsive with Tailwind flex/grid breakpoints managing navigation and dossier displays cleanly across devices.

## 18. Fabricated-Data Audit Result
**PASS**: No placeholder statistics, mock testimonials, or fake candidates persist in the codebase.

## 19. CTA/Dead-Link Audit Result
**PASS**: All `href="#"` dead links have been successfully remediated. CTAs map to concrete functional features.

## 20. Known Intentional Limitations
- No second-skill assessment functionality.
- No saved employer searches.
- No external alert systems (Email, WhatsApp).
- No post-hire outcome tracking (30/60/90-day intervals).
- No internal pagination for extensive admin queues.

## 21. Explicit Post-Pilot Backlog
- 30/60/90-day retention outcome tracking engine.
- Employer saved-search subscriptions.
- Expanded candidate skill matrices.
- Automated webhooks and CRM integrations.

## 22. Final Pilot-Readiness Verdict
**Verdict**: MeritLane is Pilot-Ready v1.
