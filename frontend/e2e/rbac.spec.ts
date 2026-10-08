import { test, expect } from '@playwright/test';

const MOCK_USER_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiJ1c2VyQGNvZ25pdHJlZS5jb20iLCJyb2xlIjoiVVNFUiIsImV4cCI6OTk5OTk5OTk5OX0' +
    '.mock-user-signature';

const MOCK_ADMIN_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiJhZG1pbkBjb2duaXRyZWUuY29tIiwicm9sZSI6IkFETUlOIiwiZXhwIjo5OTk5OTk5OTk5fQ' +
    '.mock-admin-signature';

async function mockFindingApi(page: any) {
    await page.route('**/api/findings**', (route: any) => {
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
}

async function login(page: any, token: string) {
    await page.route('**/api/auth/login', (route: any) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ access_token: token, token_type: 'bearer' }),
        });
    });

    await page.goto('/');
    await page.getByLabel('Email Address').fill('user@cognitree.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();
}

test.describe('RBAC Enforcement', () => {

    test('standard USER should NOT see the Admin navigation button', async ({ page }) => {
        await mockFindingApi(page);
        await login(page, MOCK_USER_TOKEN);

        // Wait for dashboard to be fully loaded
        await expect(page.getByText('All Findings')).toBeVisible();

        // The Admin button must be completely absent from the DOM
        await expect(page.getByRole('button', { name: /^Admin$/i })).not.toBeVisible();
    });

    test('standard USER should NOT see Admin Control Panel content', async ({ page }) => {
        await mockFindingApi(page);
        await login(page, MOCK_USER_TOKEN);

        await expect(page.getByText('All Findings')).toBeVisible();

        // Admin-only content must never appear
        await expect(page.getByText('Admin Control Panel')).not.toBeVisible();
        await expect(page.getByText('Generate Security Report')).not.toBeVisible();
    });

    test('ADMIN user should see the Admin navigation button', async ({ page }) => {
        await mockFindingApi(page);
        await login(page, MOCK_ADMIN_TOKEN);

        await expect(page.getByText('All Findings')).toBeVisible();

        // Admin nav button MUST be present for an admin user
        await expect(page.getByRole('button', { name: /^Admin$/i })).toBeVisible();
    });

});
