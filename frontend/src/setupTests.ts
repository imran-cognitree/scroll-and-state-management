import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Establish API mocking before all tests.
// If the component tries to make a network request to an API endpoint that don't have mock,
// instantly crash the test and throw a error.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
