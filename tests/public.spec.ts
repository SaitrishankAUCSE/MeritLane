import { test, expect } from '@playwright/test';

test.describe('Public Pages & Navigation', () => {
  test('Landing Page renders correctly', async ({ page }) => {
    await page.goto('/');

    // Main header and titles
    await expect(page.getByRole('heading', { name: /Proof of skill/i }).first()).toBeVisible();
    
    // Check CTA buttons
    const hiringBtn = page.getByRole('button', { name: /Start hiring verified talent/i });
    await expect(hiringBtn).toBeVisible();

    const verifyBtn = page.getByRole('button', { name: /Get verified as an engineer/i });
    await expect(verifyBtn).toBeVisible();
  });

  test('Signup Page renders correctly', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: /Create an account/i })).toBeVisible();

    // Email signup form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign Up/i }).first()).toBeVisible();

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
    await expect(page.getByText(/Verification Methodology/i)).toBeVisible();
    await expect(page.getByText(/45-Minute Server Timer/i)).toBeVisible();
    await expect(page.getByText(/Fullscreen & Tab Monitoring/i)).toBeVisible();
    await expect(page.getByText(/80% Threshold Standard/i)).toBeVisible();
  });
});

