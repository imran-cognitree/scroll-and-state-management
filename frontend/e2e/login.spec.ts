import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('should display the login page on first visit', async ({ page }) => {
        // Navigate to the root of your app
        await page.goto('/');

        // Assert the page title in the browser tab
        await expect(page).toHaveTitle(/Cognitree | AppSec Dashboard/i);

        // Assert the login form elements are visible
        // Target the password input by role. The show/hide button also has an
        // accessible name containing "Password", so getByLabel is ambiguous.
        await expect(page.getByLabel('Email Address')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Show password' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    test('should log in and reach the dashboard', async ({ page }) => {
        await page.goto('/');

        await page.getByLabel('Email Address').fill('imran@cognitree.com');
        await page.getByRole('textbox', { name: 'Password' }).fill('abcde12345');

        // Click the sign in button — exact text match avoids false positives
        await page.getByRole('button', { name: 'Sign In' }).click();

        // After login, we should be on the dashboard - wait for something unique to it
        await expect(page.getByText('All Findings')).toBeVisible();
    });

    test('should show error when submitting empty fields', async ({ page }) => {
        await page.goto('/');
        
        // Click sign in without filling anything
        await page.getByRole('button', { name: 'Sign In' }).click();
        
        // Assert client-side validation error appears
        await expect(page.getByText('Please fill in all fields')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/');
        
        // Use a non-existent email so the backend doesn't try to compute the slow bcrypt hash
        await page.getByLabel('Email Address').fill('doesnotexist@cognitree.com');
        await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
        
        await page.getByRole('button', { name: 'Sign In' }).click();
        
        // Assert backend error message appears (should be instant now)
        await expect(page.getByText('Incorrect email or password')).toBeVisible({ timeout: 5000 });
    });
});
