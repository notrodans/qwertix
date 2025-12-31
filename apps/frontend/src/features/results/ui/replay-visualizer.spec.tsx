import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReplayVisualizer } from './replay-visualizer';

// Mock TextDisplay to avoid complex rendering logic
vi.mock('@/entities/typing-text', () => ({
	TextDisplay: ({ userTyped }: { userTyped: string }) => (
		<div data-testid="user-typed">{userTyped}</div>
	),
	calculateCursorIndex: vi.fn(),
	calculateBackspace: vi.fn((curr) => curr.slice(0, -1)), // Simple mock
	useCursorPositioning: vi.fn(() => vi.fn()),
}));

describe('ReplayVisualizer', () => {
	const targetText = 'hello world';
	const replayData = [
		{ key: 'h', timestamp: 100 },
		{ key: 'e', timestamp: 200 },
		{ key: 'l', timestamp: 300 },
	];

	it('should replay keystrokes over time', async () => {
		vi.useFakeTimers();

		const { getByTestId } = render(
			<ReplayVisualizer targetText={targetText} replayData={replayData} />,
		);

		// Initial empty
		expect(getByTestId('user-typed').textContent).toBe('');

		// Click Play
		await act(async () => {
			fireEvent.click(screen.getByText('▶'));
		});

		// Move to first char (100ms timestamp) - advance slightly past it
		await act(async () => {
			vi.advanceTimersByTime(150);
		});
		expect(getByTestId('user-typed').textContent).toBe('h');

		// Move to second char (200ms timestamp) - advance another 100ms -> 250ms total
		await act(async () => {
			vi.advanceTimersByTime(100);
		});
		expect(getByTestId('user-typed').textContent).toBe('he');

		// Move to third char (300ms timestamp) - advance another 100ms -> 350ms total
		await act(async () => {
			vi.advanceTimersByTime(100);
		});
		expect(getByTestId('user-typed').textContent).toBe('hel');

		vi.useRealTimers();
	});

	it('should call onComplete when finished', async () => {
		vi.useFakeTimers();
		const onComplete = vi.fn();

		render(
			<ReplayVisualizer
				targetText={targetText}
				replayData={replayData}
				onComplete={onComplete}
			/>,
		);

		// Click Play
		await act(async () => {
			fireEvent.click(screen.getByText('▶'));
		});

		// Advance past end
		await act(async () => {
			vi.advanceTimersByTime(1000);
		});

		expect(onComplete).toHaveBeenCalled();
		vi.useRealTimers();
	});
});
