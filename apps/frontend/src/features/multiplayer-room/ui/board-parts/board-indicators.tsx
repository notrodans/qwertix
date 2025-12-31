import { RaceModeEnum, type RoomConfig } from '@qwertix/room-contracts';

interface BoardIndicatorsProps {
	config: RoomConfig;
	status: string;
	timeLeft: number | null;
	remainingWords: number | null;
}

export function BoardIndicators({
	config,
	status,
	timeLeft,
	remainingWords,
}: BoardIndicatorsProps) {
	return (
		<div className="flex justify-center text-4xl font-black text-yellow-500 font-mono h-12">
			{config.mode === RaceModeEnum.TIME &&
				timeLeft !== null &&
				status === 'RACING' && <div className="animate-pulse">{timeLeft}s</div>}
			{config.mode === RaceModeEnum.WORDS && remainingWords !== null && (
				<div>{remainingWords} words left</div>
			)}
		</div>
	);
}
