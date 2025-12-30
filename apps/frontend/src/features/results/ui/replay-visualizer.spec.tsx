import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReplayVisualizer } from './replay-visualizer';

// Mock TextDisplay to avoid complex rendering logic
vi.mock('@/entities/typing-text', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('@/entities/typing-text')>();
	return {
		...actual,
		TextDisplay: ({ userTyped }: { userTyped: string }) => (
			<div data-testid="user-typed">{userTyped}</div>
		),
	};
});

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

		// Move to first char (100ms)
		await act(async () => {
			vi.advanceTimersByTime(100);
		});
		expect(getByTestId('user-typed').textContent).toBe('h');

		// Move to second char (200ms)
		await act(async () => {
			vi.advanceTimersByTime(100);
		});
		expect(getByTestId('user-typed').textContent).toBe('he');

		// Move to third char (300ms)
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

		// We have 3 events. Need to advance 3 times to trigger all effects.
		for (let i = 0; i < replayData.length + 1; i++) {
			await act(async () => {
				vi.advanceTimersByTime(500);
			});
		}

		expect(onComplete).toHaveBeenCalled();
		vi.useRealTimers();
	});
});
