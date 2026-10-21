import { test, expect } from '@playwright/test';

test.describe('Public Pages & Navigation', () => {
  test('Landing Page renders correctly', async ({ page }) => {
    await page.goto('/');

    // Main header and titles
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /Get started/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Hire Verified/i }).first()).toBeVisible();
  });

  test('Signup Page renders correctly', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: /Create an account/i })).toBeVisible();

    // Email signup form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Account/i }).first()).toBeVisible();

    // Google SSO button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('Login Page renders correctly', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();

    // Email login form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i }).first()).toBeVisible();

    // Google SSO button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('How Verification Works Methodology Page renders correctly', async ({ page }) => {
    await page.goto('/how-verification-works');

    await expect(page.getByRole('heading', { name: /How MeritLane Verification Works/i })).toBeVisible();
    await expect(page.getByText(/Verification Methodology/i).first()).toBeVisible();
    await expect(page.getByText(/45-Minute Server Timer/i)).toBeVisible();
    await expect(page.getByText(/Fullscreen & Tab Monitoring/i)).toBeVisible();
    await expect(page.getByText(/Achieve the Component Thresholds/i)).toBeVisible();
  });
});

