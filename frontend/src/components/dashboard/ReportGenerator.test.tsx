import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ReportGenerator } from './ReportGenerator';
import { renderWithProviders } from '../../utils/test';

describe('ReportGenerator Integration', () => {
    it('runs the full report generation flow successfully', async () => {
        const user = userEvent.setup();

        // 1. Arrange: Render using our custom provider wrapper
        renderWithProviders(<ReportGenerator />);

        // Initial state check
        expect(screen.getByRole('heading', { name: /generate security report/i })).toBeInTheDocument();

        // 2. Act: Click the generate button
        const generateBtn = screen.getByRole('button', { name: /generate report/i });
        await user.click(generateBtn);

        // 3. Assert: Verify it goes into a loading state
        // We expect the button to change to "Processing…"
        expect(screen.getByRole('button', { name: /processing…/i })).toBeDisabled();

        // 4. Assert: Wait for the mock API to return SUCCESS and the UI to update
        // waitFor() repeatedly checks the DOM until the assertion passes or it times out
        await waitFor(() => {
            expect(screen.getByText('Report Ready')).toBeInTheDocument();
        });

        // Check that our mock message from handlers.ts is displayed
        expect(screen.getByText('Mock report generated successfully.')).toBeInTheDocument();

        // Check that the "Generate Again" button appeared
        expect(screen.getByRole('button', { name: /generate again/i })).toBeInTheDocument();
    });

    it('handles API failure gracefully', async () => {
        const user = userEvent.setup();

        // Override the default mock to return a 500 Error just for this test
        server.use(
            http.post('http://127.0.0.1:8000/api/reports', () => {
                return HttpResponse.json(
                    { detail: 'Internal Server Error' },
                    { status: 500 }
                );
            })
        );

        renderWithProviders(<ReportGenerator />);

        // Click generate
        const generateBtn = screen.getByRole('button', { name: /generate report/i });
        await user.click(generateBtn);

        // Wait for the failure state
        await waitFor(() => {
            expect(screen.getByText('Generation Failed')).toBeInTheDocument();
        });

        // The error message from our API mock should be displayed
        expect(screen.getByText('Internal Server Error')).toBeInTheDocument();

        // Ensure user can try again
        expect(screen.getByRole('button', { name: /generate again/i })).toBeInTheDocument();
    });

    it('shows timeout error if polling takes longer than 30s', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const user = userEvent.setup({ delay: null });

        // Override to always return PENDING so it times out
        server.use(
            http.get('http://127.0.0.1:8000/api/reports/:taskId', () => {
                return HttpResponse.json({
                    task_id: 'mock-task-123',
                    status: 'PENDING',
                    created_at: new Date().toISOString(),
                });
            })
        );

        renderWithProviders(<ReportGenerator />);

        const generateBtn = screen.getByRole('button', { name: /generate report/i });
        await user.click(generateBtn);

        // Wait for it to become loading
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /processing…/i })).toBeDisabled();
        });

        // Advance timers by 30s
        act(() => {
            vi.advanceTimersByTime(30000);
        });

        // Expect timeout failure state
        await waitFor(() => {
            expect(screen.getByText('Generation Failed')).toBeInTheDocument();
        });

        expect(screen.getByText('Request timed out after 30 seconds. Please try again.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /generate again/i })).toBeInTheDocument();

        vi.useRealTimers();
    });
});
