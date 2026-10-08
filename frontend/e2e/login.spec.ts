import { test, expect } from '@playwright/test';

const MOCK_USER_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiJ1c2VyQGNvZ25pdHJlZS5jb20iLCJyb2xlIjoiVVNFUiIsImV4cCI6OTk5OTk5OTk5OX0' +
    '.mock-user-signature';

test.describe('Authentication Flow', () => {

    test('should display the login page on first visit', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Cognitree | AppSec Dashboard/i);
        await expect(page.getByLabel('Email Address')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    test('should show error when submitting empty fields', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page.getByText('Please fill in all fields')).toBeVisible();
    });

    test('should show error with invalid credentials (mocked backend)', async ({ page }) => {
        // Mock the login endpoint to return a 401
        await page.route('**/api/auth/login', (route) => {
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ detail: 'Incorrect email or password' }),
            });
        });

        await page.goto('/');
        await page.getByLabel('Email Address').fill('wrong@test.com');
        await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page.getByText('Incorrect email or password')).toBeVisible({ timeout: 5000 });
    });

    test('standard user should log in and see Dashboard — no Admin button', async ({ page }) => {
        // Mock login to return a USER token
        await page.route('**/api/auth/login', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: MOCK_USER_TOKEN, token_type: 'bearer' }),
            });
        });

        // Mock the findings API so the dashboard can render
        await page.route('**/api/findings**', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    metadata: {
                        generated_for: "Cognitree",
                        generated_at: "2026-10-06T00:00:00Z",
                        projects: ["TestProject"],
                        total_findings: 0,
                        findings_by_type: { SCA: 0, SAST: 0, DAST: 0 }
                    },
                    findings: [],
                    total: 0,
                    page: 1,
                    limit: 1000
                }),
            });
        });

        await page.goto('/');
        await page.getByLabel('Email Address').fill('user@cognitree.com');
        await page.getByRole('textbox', { name: 'Password' }).fill('password');
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Dashboard should be visible
        await expect(page.getByText('All Findings')).toBeVisible();

        // Admin nav button must NOT exist in the DOM for a standard user
        await expect(page.getByRole('button', { name: /^Admin$/i })).not.toBeVisible();
    });
});
