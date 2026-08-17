import { test, expect } from '@playwright/test';

test('meritlane homepage loads correctly', async ({ page }) => {
  await page.goto('https://merit-lane.vercel.app/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/MeritLane/i);

  // Check for some main elements that should be visible on the landing page
  await expect(page.getByRole('heading', { name: /MeritLane/i }).first()).toBeVisible();
});

test('meritlane login page is accessible', async ({ page }) => {
  await page.goto('https://merit-lane.vercel.app/login');

  // Verify login page elements
  await expect(page.getByRole('button', { name: /Sign in/i }).first()).toBeVisible();
});
