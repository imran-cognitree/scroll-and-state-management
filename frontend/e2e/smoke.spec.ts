import { test, expect } from '@playwright/test';

test.describe('Live Integration Smoke Test @live', () => {
    test('should successfully sign up, log in, and load dashboard using real backend', async ({ page }) => {
        const username = `test_user_${Date.now()}@cognitree.com`;
        const password = 'LiveTestPassword123!';

        // 1. Go to signup page
        await page.goto('/signup');
        
        // 2. Fill out signup form
        await page.fill('input[type="email"]', username);
        await page.fill('input[type="password"]', password);
        await page.fill('input[placeholder="Confirm Password"]', password);
        
        // 3. Submit and wait for redirect to login
        await Promise.all([
            page.waitForURL('**/login'),
            page.click('button[type="submit"]')
        ]);

        // 4. Fill out login form with the newly created credentials
        await page.fill('input[type="email"]', username);
        await page.fill('input[type="password"]', password);

        // 5. Submit and wait for redirect to dashboard
        await Promise.all([
            page.waitForURL('**/'),
            page.click('button[type="submit"]')
        ]);

        // 6. Verify dashboard loads by checking for core UI elements
        // The real API should return a response (even if findings are empty for a new user)
        await expect(page.getByText('All Findings')).toBeVisible({ timeout: 10000 });
        
        // The dashboard layout should be visible
        await expect(page.locator('.dashboard-layout')).toBeVisible();
    });
});
