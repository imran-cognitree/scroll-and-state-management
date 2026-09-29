import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
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
});
