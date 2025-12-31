import { RaceModeEnum } from '@qwertix/room-contracts';
import { useState } from 'react';
import type { RefObject } from 'react';
import type { Participant, RoomConfig } from '@/entities/room';
import { TextDisplay } from '@/entities/typing-text';
import { useInterval } from '@/shared/lib';
import { calculateRemainingWords } from '../domain/game-logic';
import { BoardIndicators } from './board-parts/board-indicators';
import { CountdownOverlay } from './board-parts/countdown-overlay';
import { OpponentsProgress } from './board-parts/opponents-progress';

interface MultiplayerBoardProps {
	text: string;
	config: RoomConfig;
	status: 'COUNTDOWN' | 'RACING' | 'FINISHED';
	startTime?: number; // Server's race start time
	participants: Participant[];
	currentUser: Participant | undefined;

	// Game State from Hook
	userTyped: string;
	caretPos: { left: number; top: number };
	timeLeft: number | null;
	containerRef: RefObject<HTMLDivElement | null>;
}

export function MultiplayerBoard({
	text,
	config,
	status,
	startTime,
	participants,
	currentUser,
	userTyped,
	caretPos,
	timeLeft,
	containerRef,
}: MultiplayerBoardProps) {
	const remainingWords =
		config.mode === RaceModeEnum.WORDS
			? calculateRemainingWords(text, userTyped)
			: null;

	// Countdown logic for the overlay
	const [countdown, setCountdown] = useState<number | null>(null);
	useInterval(
		() => {
			if (status === 'COUNTDOWN' && startTime) {
				const elapsed = (Date.now() - startTime) / 1000;
				const remaining = Math.max(0, 3 - elapsed);
				setCountdown(Math.ceil(remaining));
			}
		},
		status === 'COUNTDOWN' ? 100 : null,
	);

	return (
		<div className="w-full max-w-4xl mx-auto space-y-8 relative">
			<BoardIndicators
				config={config}
				status={status}
				timeLeft={timeLeft}
				remainingWords={remainingWords}
			/>

			<OpponentsProgress
				participants={participants}
				currentUser={currentUser}
			/>

			<div
				className={`transition-opacity duration-300 ${status === 'COUNTDOWN' ? 'opacity-50 blur-sm' : 'opacity-100'}`}
			>
				<TextDisplay
					targetText={text}
					userTyped={userTyped}
					caretPos={caretPos}
					containerRef={containerRef}
					className="text-2xl leading-relaxed"
				/>
			</div>

			<CountdownOverlay status={status} countdown={countdown} />
		</div>
	);
}
