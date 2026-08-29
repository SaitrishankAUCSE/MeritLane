# MeritLane Pilot Deployment Readiness

This document assesses the operational readiness of the MeritLane V1 codebase for real-user pilot testing.

## 1. Production Environment Variables
- **Status**: ACTION REQUIRED
- **Details**: The `.env.local` variables used for development must be injected into the production host (e.g., Vercel or AWS). This includes `FIREBASE_SERVICE_ACCOUNT_KEY` (base64 encoded), `NEXT_PUBLIC_FIREBASE_*`, and `NEXT_PUBLIC_POSTHOG_KEY`.

## 2. Firebase Production Configuration
- **Status**: ACTION REQUIRED
- **Details**: A dedicated production Firebase project must be created so pilot data does not mix with development data. The production `appId` and `measurementId` must be provisioned.

## 3. Firebase Auth Configuration
- **Status**: ACTION REQUIRED
- **Details**: Email/Password and Google Authentication providers must be enabled in the production Firebase console. Authorized domains must include the production domain.

## 4. Firestore Configuration
- **Status**: ACTION REQUIRED
- **Details**: Production Firestore must be provisioned in Native mode. Necessary composite indexes (e.g., for querying employers' pipelines or candidates by verification status) must be deployed via `firebase deploy --only firestore:indexes`.

## 5. Firebase Security Rules
- **Status**: PASS
- **Details**: The existing Firestore rules enforce `request.auth != null` and isolate candidate/employer reads and writes. These are ready for pilot. They must be deployed to the production environment (`firebase deploy --only firestore:rules`).

## 6. GitHub OAuth Configuration
- **Status**: OPTIONAL
- **Details**: Current flow prioritizes Email/Google. If GitHub sync is used for repos, OAuth Apps must be created in GitHub and secrets added to the environment variables.

## 7. Godbolt/Compiler Dependency Configuration
- **Status**: OPTIONAL
- **Details**: No external compiler is strictly blocking the initial flow, but if code assessment requires live execution, relevant external endpoints must be added to a `NEXT_PUBLIC_COMPILER_URL`. Currently, mock logic or conceptual local execution dictates success.

## 8. PostHog Configuration
- **Status**: ACTION REQUIRED
- **Details**: A production PostHog project must be created. `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` must be set. The client-side PostHog wrapper is already built to safely ignore missing keys locally, but requires them for actual pilot analytics.

## 9. Admin Account Configuration
- **Status**: ACTION REQUIRED
- **Details**: The default admin fallback `saitrishankb9@gmail.com` must be registered in the production Firebase Auth, and ideally, Firebase Custom Claims should be set for `admin: true` to avoid relying entirely on the email fallback.

## 10. Production Domain Configuration
- **Status**: ACTION REQUIRED
- **Details**: A domain (e.g., app.meritlane.com) must be connected to the host. Firebase Auth authorized domains must be updated to match.

## 11. Email/Contact Information Exposed
- **Status**: PASS
- **Details**: Codebase was audited and fake emails were replaced with `support@meritlane.com`. An actual inbox for this address should be provisioned.

## 12. Third-Party Service Configuration
- **Status**: PASS
- **Details**: None explicitly blocking V1.

## 13. Remaining Development Assumptions
- **Status**: ACTION REQUIRED
- **Details**: Ensure no mock admin scripts are active on the production instance.

## 14. Local-only Fallback Behavior
- **Status**: PASS
- **Details**: The application routes properly dynamically. Telemetry handles missing keys gracefully.

## 15. Console/Runtime Errors
- **Status**: PASS
- **Details**: No crash-inducing console errors exist in the tested critical paths.
