import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricStat } from './MetricStat';
import { describe, expect, it, vi } from 'vitest';

describe('MetricStat Component', () => {

    it('renders the label and value correctly', () => {
        // 1. Arrange: Render the component with some props
        render(<MetricStat label="Total Bugs" value={42} />);

        // 2. Assert: Check if the text is in the DOM
        expect(screen.getByText('Total Bugs')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('calls the onClick handler when clicked', async () => {
        // 1. Arrange: Create a mock function (a spy) to track clicks
        const handleClick = vi.fn();

        render(<MetricStat label="Click Me" value={10} onClick={handleClick} />);

        // 2. Act: Simulate a user clicking the component
        const user = userEvent.setup();
        const statElement = screen.getByText('Click Me');
        await user.click(statElement);

        // 3. Assert: Verify our mock function was called exactly 1 time
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
