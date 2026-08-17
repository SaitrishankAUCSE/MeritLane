import { test, expect } from '@playwright/test';

test.describe('Public Pages & Navigation', () => {
  test('Landing Page renders correctly', async ({ page, isMobile }) => {
    await page.goto('/');

    // Main header and titles
    await expect(page.getByRole('heading', { name: /MeritLane/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Proof of skill beats/i })).toBeVisible();
    
    // Check CTA buttons
    const proveSkillsBtn = page.getByRole('button', { name: /Prove your skills/i }).first();
    await expect(proveSkillsBtn).toBeVisible();

    // Navigation links
    if (isMobile) {
      await page.getByRole('button', { name: /Toggle navigation menu/i }).click();
    }
    await expect(page.getByRole('link', { name: /Sign in/i }).first()).toBeVisible();
  });

  test('Signup Page renders correctly', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: /Join Meritlane/i })).toBeVisible();

    // Check Role Selection
    await expect(page.getByRole('button', { name: /^Candidate$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Employer$/ })).toBeVisible();

    // Email signup form
    await expect(page.getByLabel(/Email address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible();

    // Google SSO button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('Login Page renders correctly', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /Sign In to Meritlane/i })).toBeVisible();

    // Email login form
    await expect(page.getByLabel(/Email address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Google SSO button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });
});
