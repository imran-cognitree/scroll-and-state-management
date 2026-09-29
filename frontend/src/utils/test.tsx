import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';

// Create a custom render function that wraps components in a QueryClient
export function renderWithProviders(ui: ReactElement) {
    // We create a NEW QueryClient for every test so they don't share cache state
    const testQueryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Turn off retries for tests so they fail fast
            },
        },
    });

    return render(
        <QueryClientProvider client={testQueryClient}>
            {ui}
        </QueryClientProvider>
    );
}
