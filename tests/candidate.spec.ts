import { test, expect } from '@playwright/test';

test.describe('Authenticated Candidate Flow', () => {
  // We skip these tests if credentials are not provided via environment variables
  // to avoid polluting the production database with dummy accounts.
  test.skip(
    !process.env.TEST_CANDIDATE_EMAIL || !process.env.TEST_CANDIDATE_PASSWORD,
    'TEST_CANDIDATE_EMAIL and TEST_CANDIDATE_PASSWORD environment variables are required.'
  );

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email address/i).fill(process.env.TEST_CANDIDATE_EMAIL!);
    await page.getByLabel(/Password/i).fill(process.env.TEST_CANDIDATE_PASSWORD!);
    await page.getByRole('button', { name: /Sign in/i, exact: true }).click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/candidate\/dashboard/);
  });

  test('Candidate Dashboard renders correctly', async ({ page }) => {
    // Wait for the Dashboard title
    await expect(page.getByRole('heading', { name: /Candidate Dashboard/i })).toBeVisible({ timeout: 15000 });
    
    // Check for the Verification Status card
    await expect(page.getByText(/Verification/i)).toBeVisible();
    
    // Check Navigation
    await expect(page.getByRole('link', { name: /Profile/i })).toBeVisible();
  });

  test('Candidate Profile renders correctly', async ({ page }) => {
    await page.goto('/candidate/profile');
    
    // Verify Profile header
    await expect(page.getByRole('heading', { name: /Candidate Profile/i })).toBeVisible({ timeout: 15000 });
    
    // Verify Academic section
    await expect(page.getByRole('heading', { name: /Academic & Identity/i })).toBeVisible();
    
    // Verify Projects section
    await expect(page.getByRole('heading', { name: /Verified Project Submissions/i })).toBeVisible();
  });
});
