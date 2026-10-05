import '@testing-library/jest-dom/vitest';
import { worker } from './mocks/browser';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Establish API mocking before all tests.
beforeAll(async () => {
    await worker.start({ onUnhandledRequest: 'error' });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => worker.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => worker.stop());

