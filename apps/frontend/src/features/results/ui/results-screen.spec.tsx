import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResultsScreen } from './results-screen';

describe('ResultsScreen', () => {
	const mockStats = {
		wpm: 100,
		raw: 110,
		accuracy: 98,
		consistency: 95,
		replayData: [{ key: 'a', timestamp: 100 }],
	};

	const mockParticipants = [
		{
			socketId: '1',
			username: 'You',
			wpm: 100,
			rank: 1,
			isHost: true,
			progress: 100,
			finishedAt: Date.now(),
		},
	];

	it('should render stats correctly', () => {
		render(
			<ResultsScreen
				stats={mockStats}
				targetText="abc"
				participants={mockParticipants}
				onClose={() => {
					/* noop */
				}}
			/>,
		);

		expect(screen.getByText('100')).toBeInTheDocument(); // WPM
		expect(screen.getByText('98%')).toBeInTheDocument(); // ACC
		expect(screen.getByText('You')).toBeInTheDocument(); // Leaderboard
	});

	it('should show replay when button is clicked', () => {
		render(
			<ResultsScreen
				stats={mockStats}
				targetText="abc"
				participants={mockParticipants}
				onClose={() => {
					/* noop */
				}}
			/>,
		);

		const button = screen.getByText('Watch Replay');
		fireEvent.click(button);

		// ReplayVisualizer should be rendered (which renders TextDisplay)
		expect(screen.queryByText('Watch Replay')).not.toBeInTheDocument();
	});

	it('should call onClose when return button is clicked', () => {
		const onClose = vi.fn();
		render(
			<ResultsScreen
				stats={mockStats}
				targetText="abc"
				participants={mockParticipants}
				onClose={onClose}
			/>,
		);

		fireEvent.click(screen.getByText('Return to Lobby'));
		expect(onClose).toHaveBeenCalled();
	});
});
