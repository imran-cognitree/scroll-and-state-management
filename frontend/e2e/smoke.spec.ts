import { test, expect } from '@playwright/test';

test.describe('Live Integration Smoke Test @live', () => {
    test('should successfully log in and load dashboard using real backend', async ({ page, request }) => {
        const username = `test_user_${Date.now()}@cognitree.com`;
        const password = 'LiveTestPassword123!';

        // 1. Programmatically seed the database with a user by calling the backend API directly.
        // We do this because the frontend application does not currently have a Sign Up page.
        const response = await request.post('http://localhost:8000/api/auth/signup', {
            data: {
                email: username,
                password: password,
                role: 'USER'
            }
        });

        // Ensure the backend successfully created the user before continuing
        expect(response.status()).toBe(201);

        // 2. Navigate to the frontend login page
        await page.goto('/');

        // 3. Fill out login form with the newly created credentials
        await page.getByLabel('Email Address').fill(username);
        await page.getByRole('textbox', { name: 'Password' }).fill(password);

        // 4. Click Sign In
        await page.getByRole('button', { name: 'Sign In' }).click();

        // 5. Verify dashboard loads by checking for core UI elements
        // The real API should return a response (even if findings are empty for a new user)
        await expect(page.getByText('All Findings')).toBeVisible({ timeout: 10000 });

        // The dashboard layout should be visible
        await expect(page.locator('.dashboard-layout')).toBeVisible();
    });
});
