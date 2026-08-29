# Architecture Alignment & Pre-Release Hardening Report

## 1. Employer Discovery Decision
**Decision**: Employer discovery is explicitly verified to be **Role-Independent**.
**Details**: 
The source code inside `app/api/employer/discover/route.ts` supports taking a `roleId` and mapping it to a subset of required skills, however `app/employer/dashboard/page.tsx` deliberately forces `selectedRoleId = null` and sends a general skills-based search payload (`{ skills: skillsToSearch, roleId: selectedRoleId, searchQuery }`). There is no UI implemented for employers to create, manage, or select roles. Thus, "Post a Role" is NOT load-bearing, and the product flow strictly uses a general verified-candidate discovery model. This architecture is intentional and has been preserved without fabricating fake role-posting UI.

## 2. Pipeline Stage Decision & Hired Implementation
**Decision**: Added `hired` as a terminal pipeline stage alongside `rejected`.
**Implementation Status**:
- `lib/firebase/employer.ts`: Updated `pipeline` type definition to include `"hired"`.
- `app/api/employer/pipeline/route.ts`: Added `"hired"` to the `validStages` validation list.
- `app/api/employer/shortlist/list/route.ts`: Ensured the `/list` endpoint recognizes the new stage.
- `app/employer/shortlist/page.tsx`: Injected `hired` into the `PipelineStage` type and visual state map (`STAGE_LABELS`, `PIPELINE_STAGES`, and `bg-green-100 text-green-800` styling).
- The existing pipeline flow (`Shortlisted` → `Interviewing` → `Offer Extended` → `Hired` | `Rejected`) is fully functional.

## 3. Fabricated-Data Audit
**Action**: Swept the codebase for hardcoded example data, fake statistics, or fake identities.
**Findings & Fixes**:
- Found fabricated testimonials in `app/page.tsx` for "Sarah J. (VP Engineering)" and "David M. (Frontend Engineer)" which falsely implied real user experiences and verified skills.
- **Removed** the entire fabricated testimonial section from the public landing page.
- Replaced the placeholder `email@example.com` with a professional `support@meritlane.com` fallback.
- **Rule Instituted**: Added `docs/NO_FABRICATED_DATA_RULE.md` to formally ban fabricated production data across MeritLane.

## 4. Security & Telemetry Verification
**Security Verification**: Pipeline mutations via `/api/employer/pipeline` rely on `adminAuth.verifyIdToken(token)`. Only authorized employers can change pipeline stages, and they can only update pipelines belonging to their own employer document. This ensures that Candidate A cannot mark themselves as hired, and Employer A cannot move candidates in Employer B's pipeline.
**Telemetry Verification**: PostHog telemetry hooks into pipeline changes client-side on button clicks. The state transitions correctly propagate the new `"hired"` stage without exposing sensitive candidate PII (it only logs `candidateId` and `stage`).

## 5. Contextual Guidance Verification
**Action**: Ensured contextual guidance accommodates the new `hired` stage.
**Fix**: `components/ui/ContextGuide.tsx` now correctly identifies `hired` status and instructs the employer that the "Candidate marked as hired.", without hallucinating future tracking capabilities.

## 6. Future Outcome Tracking Decision
**Decision**: Outcome Tracking (30/60/90-day checks) is explicitly scoped OUT of current development to avoid hallucinated infrastructure.
**Status**: Documented the intended architectural path in `docs/FUTURE_OUTCOME_TRACKING.md`. No collections, routes, or mock components were created for this.

## 7. Build and Validation Results
- **TypeScript (`npx tsc --noEmit`)**: `0` errors. Passes clean.
- **Build (`npm run build`)**: `0` errors. Generates optimized production build with all static/dynamic routes mapped correctly.
- **Tests**: (No automated test suite currently installed).

## Remaining Limitations
- While "Hired" is implemented as a pipeline state, the employer still sees the candidate in the shortlist under the terminal tag. Eventually, a "Past Hires" tab or archiver may be needed for scale.
- Admin review queue relies on deterministic code checks and manual verification. If applicant volume scales, additional triage tooling will be needed to handle the workload reliably.
