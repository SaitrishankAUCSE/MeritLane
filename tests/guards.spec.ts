import { test, expect } from '@playwright/test';

test.describe('Route Guards & Authentication', () => {
  test('Unauthenticated user is redirected from Candidate Dashboard', async ({ page }) => {
    await page.goto('/candidate/dashboard');
    // The ProtectedRoute component redirects to /login when not authenticated
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated user is redirected from Candidate Profile', async ({ page }) => {
    await page.goto('/candidate/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated user is redirected from Employer Dashboard', async ({ page }) => {
    await page.goto('/employer/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated user is redirected from Admin Page', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login form handles invalid credentials properly', async ({ page }) => {
    await page.goto('/login');
    
    // Fill out the form with invalid credentials
    await page.getByLabel(/Email address/i).fill('invalid-test-user@meritlane.app');
    await page.getByLabel(/Password/i).fill('wrongpassword123');
    await page.locator('button[type="submit"]').click();

    // Check for an error message toast or inline text
    await expect(page.getByText(/Incorrect email or password|Unable to sign in/i)).toBeVisible({ timeout: 10000 });
  });

  test('Signup form handles weak passwords properly', async ({ page }) => {
    await page.goto('/signup');

    // Fill out form with weak password
    await page.getByLabel(/Email address/i).fill('new-test-user@meritlane.app');
    await page.getByLabel(/Password/i).fill('123'); // Firebase requires >= 6 chars
    
    // Select a role before submitting
    await page.getByRole('button', { name: /^Candidate$/ }).click();

    await page.getByRole('button', { name: /Create account/i }).click();

    // Firebase should throw an error about password length
    await expect(page.getByText(/password should be at least 6 characters/i)).toBeVisible({ timeout: 10000 });
  });
});
