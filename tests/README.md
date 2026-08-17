# Meritlane Playwright E2E Tests

This directory contains the Playwright End-to-End test suite for Meritlane. The tests are configured to run against the live site (`https://merit-lane.vercel.app`) by default.

## Test Suites

1. **`meritlane.spec.ts`**: Basic smoke tests to verify the live site is accessible.
2. **`public.spec.ts`**: Verifies all public-facing pages (Landing, Login, Signup).
3. **`guards.spec.ts`**: Verifies that protected routes redirect unauthenticated users to `/login`.
4. **`candidate.spec.ts`**: Authenticated flow for candidates (Dashboard, Profile).
5. **`employer.spec.ts`**: Authenticated flow for employers (Dashboard).
6. **`admin.spec.ts`**: Authenticated flow for administrators (Command Center).

## Running the Tests

To run the full suite locally:

```bash
npx playwright test
```

To run with the UI (recommended for debugging):

```bash
npx playwright test --ui
```

### Authenticated Tests
To protect the production database from dummy data, the authenticated tests (`candidate.spec.ts`, `employer.spec.ts`, `admin.spec.ts`) are **skipped** by default unless specific environment variables are provided.

To run them, you need to set up test accounts in your Firebase Authentication and provide their credentials:

```bash
# Windows PowerShell
$env:TEST_CANDIDATE_EMAIL="candidate@example.com"
$env:TEST_CANDIDATE_PASSWORD="password123"
$env:TEST_EMPLOYER_EMAIL="employer@example.com"
$env:TEST_EMPLOYER_PASSWORD="password123"
$env:TEST_ADMIN_EMAIL="saitrishankb9@gmail.com"
$env:TEST_ADMIN_PASSWORD="your-admin-password"

npx playwright test
```

> **Note:** Do NOT run authenticated tests against production with real data unless you are okay with automated bots logging in. It is highly recommended to point `playwright.config.ts` to `http://localhost:3000` and use a local Firebase Emulator for CI/CD testing.
