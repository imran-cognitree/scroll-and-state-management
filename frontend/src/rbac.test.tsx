import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as api from './lib/api';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Mock the API module
vi.mock('./lib/api', async () => {
    const actual = await vi.importActual('./lib/api');
    return {
        ...actual as any,
        isLoggedIn: vi.fn(),
        isAdmin: vi.fn(),
    };
});

// We need a fresh query client for each test
const createTestQueryClient = () => new QueryClient({
    defaultOptions: { queries: { retry: false } }
});

describe('Frontend RBAC Enforcement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should NOT show Admin Control Panel or Admin navigation for standard users', () => {
        // Mock a standard user login
        vi.mocked(api.isLoggedIn).mockReturnValue(true);
        vi.mocked(api.isAdmin).mockReturnValue(false);

        render(
            <QueryClientProvider client={createTestQueryClient()}>
                <App />
            </QueryClientProvider>
        );

        // Standard user should see Dashboard
        expect(screen.getByText('Vulnerability Overview')).toBeInTheDocument();

        // 1. Admin nav button should be entirely missing from the DOM
        const adminNavButton = screen.queryByRole('button', { name: /admin/i });
        expect(adminNavButton).not.toBeInTheDocument();

        // 2. The Admin view should not be accessible/rendered
        expect(screen.queryByText('Admin Control Panel')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /generate report/i })).not.toBeInTheDocument();
    });

    it('SHOULD show Admin Control Panel for admin users', () => {
        // Mock an ADMIN user login
        vi.mocked(api.isLoggedIn).mockReturnValue(true);
        vi.mocked(api.isAdmin).mockReturnValue(true);

        render(
            <QueryClientProvider client={createTestQueryClient()}>
                <App />
            </QueryClientProvider>
        );

        // Admin nav button should be visible
        const adminNavButton = screen.getByRole('button', { name: /admin/i });
        expect(adminNavButton).toBeInTheDocument();
    });
});
