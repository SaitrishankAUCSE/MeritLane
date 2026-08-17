import { test, expect } from '@playwright/test';

test.describe('Authenticated Admin Flow', () => {
  test.skip(
    !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
    'TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables are required.'
  );

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/Email address/i).fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel(/Password/i).fill(process.env.TEST_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /Sign in/i, exact: true }).click();
    
    // Wait for redirect, admin gets sent to /admin directly
    await expect(page).toHaveURL(/\/admin/);
  });

  test('Admin Command Center renders correctly', async ({ page }) => {
    // Wait for the Admin title
    await expect(page.getByRole('heading', { name: /Command Center/i })).toBeVisible({ timeout: 15000 });
    
    // Check Tabs
    await expect(page.getByRole('tab', { name: /Verification Queue/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Candidate Directory/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /System Audit/i })).toBeVisible();
  });
});
