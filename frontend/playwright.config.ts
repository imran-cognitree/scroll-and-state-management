import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    // vite preview (production build) runs on 4173, NOT 5173 (that's dev server)
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    // Capture a screenshot automatically whenever a test fails — invaluable for CI debugging
    screenshot: 'only-on-failure',
  },

  // Automatically build & serve the app before running E2E tests.
  // Playwright will wait until the server is ready, then shut it down when done.
  webServer: {
    command: 'pnpm run build && pnpm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // Give the build up to 2 minutes to complete
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
