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
			accuracy: 100,
			finishedAt: Date.now(),
		},
	];

	const ReplayMock = () => <div>Replay Component</div>;

	it('should render stats correctly', () => {
		render(
			<ResultsScreen
				stats={mockStats}
				targetText="abc"
				participants={mockParticipants}
				onClose={() => {
					/* noop */
				}}
				ReplayComponent={ReplayMock}
			/>,
		);

		expect(screen.getByTestId('wpm')).toBeInTheDocument();
		expect(screen.getByTestId('rank')).toBeInTheDocument();
		expect(screen.getByTestId('username')).toBeInTheDocument();
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
				ReplayComponent={ReplayMock}
			/>,
		);

		const button = screen.getByTestId('watch-replay');
		fireEvent.click(button);

		// ReplayVisualizer should be rendered (which renders TextDisplay)
		expect(screen.queryByTestId('watch-replay')).not.toBeInTheDocument();
	});

	it('should call onClose when return button is clicked', () => {
		const onClose = vi.fn();
		render(
			<ResultsScreen
				stats={mockStats}
				targetText="abc"
				participants={mockParticipants}
				onClose={onClose}
				ReplayComponent={ReplayMock}
			/>,
		);

		fireEvent.click(screen.getByTestId('return-to-lobby'));
		expect(onClose).toHaveBeenCalled();
	});
});
