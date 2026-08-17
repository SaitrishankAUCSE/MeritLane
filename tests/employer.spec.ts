import { test, expect } from '@playwright/test';

test.describe('Authenticated Employer Flow', () => {
  test.skip(
    !process.env.TEST_EMPLOYER_EMAIL || !process.env.TEST_EMPLOYER_PASSWORD,
    'TEST_EMPLOYER_EMAIL and TEST_EMPLOYER_PASSWORD environment variables are required.'
  );

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email address/i).fill(process.env.TEST_EMPLOYER_EMAIL!);
    await page.getByLabel(/Password/i).fill(process.env.TEST_EMPLOYER_PASSWORD!);
    await page.getByRole('button', { name: /Sign in/i, exact: true }).click();
    
    // Wait for redirect to employer dashboard
    await expect(page).toHaveURL(/\/employer\/dashboard/);
  });

  test('Employer Dashboard renders correctly', async ({ page }) => {
    // Wait for the Dashboard title
    await expect(page.getByRole('heading', { name: /Employer Dashboard/i })).toBeVisible({ timeout: 15000 });
    
    // Check for some layout elements
    await expect(page.getByRole('heading', { name: /Post a Role/i })).toBeVisible();
  });
});
