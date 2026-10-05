import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { worker } from '../../mocks/browser';
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
        expect(screen.getByRole('button', { name: /processing…/i })).toBeDisabled();

        // 4. Assert: Wait for the final HTTP fetch (triggered by the SSE event)
        //    to update the UI. The MSW handler in handlers.ts automatically
        //    pushes a SUCCESS event on the SSE stream.
        await waitFor(() => {
            expect(screen.getByText('Report Ready')).toBeInTheDocument();
        }, { timeout: 4000 });

        // Check that our mock message from handlers.ts is displayed
        expect(screen.getByText('Mock report generated successfully.')).toBeInTheDocument();

        // Check that the "Generate Again" button appeared
        expect(screen.getByRole('button', { name: /generate again/i })).toBeInTheDocument();
    });

    it('handles API failure gracefully', async () => {
        const user = userEvent.setup();

        // Override the default mock to return a 500 Error just for this test
        worker.use(
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

        // Wait for the failure state — POST failed before SSE was even opened
        await waitFor(() => {
            expect(screen.getByText('Generation Failed')).toBeInTheDocument();
        });

        // The error message from our API mock should be displayed
        expect(screen.getByText('Internal Server Error')).toBeInTheDocument();

        // Ensure user can try again
        expect(screen.getByRole('button', { name: /generate again/i })).toBeInTheDocument();
    });

    it('shows timeout error if report generation takes longer than 30s', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const user = userEvent.setup({ delay: null });

        // Override the SSE endpoint to return a stream that never pushes events
        worker.use(
            http.get('http://127.0.0.1:8000/api/reports/:taskId/stream', () => {
                const stream = new ReadableStream({
                    start() {
                        // Keep the stream open but don't send any data
                    }
                });
                return new HttpResponse(stream, {
                    headers: { 'Content-Type': 'text/event-stream' }
                });
            })
        );

        renderWithProviders(<ReportGenerator />);

        const generateBtn = screen.getByRole('button', { name: /generate report/i });
        await user.click(generateBtn);

        // Wait for it to enter the loading state
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /processing…/i })).toBeDisabled();
        });

        // Advance timers by 30 seconds — does NOT push an SSE event, simulating
        // a stuck server. The client-side 35 s timeout in ReportGenerator fires.
        act(() => {
            vi.advanceTimersByTime(35000);
        });

        // Expect the timeout failure state
        await waitFor(() => {
            expect(screen.getByText('Generation Failed')).toBeInTheDocument();
        });

        expect(
            screen.getByText('Request timed out after 35 seconds. Please try again.')
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /generate again/i })).toBeInTheDocument();

        vi.useRealTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
});
