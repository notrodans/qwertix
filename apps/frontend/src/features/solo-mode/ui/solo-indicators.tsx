import { RaceModeEnum } from '@qwertix/room-contracts';

interface SoloIndicatorsProps {
	mode: RaceModeEnum;
	timeLeft: number | null;
	wordCount: number;
	typedWordsCount: number;
}

export function SoloIndicators({
	mode,
	timeLeft,
	wordCount,
	typedWordsCount,
}: SoloIndicatorsProps) {
	return (
		<div className="flex flex-col items-center gap-2">
			<div className="text-2xl font-black text-primary font-mono h-8">
				{mode === RaceModeEnum.TIME && timeLeft !== null && (
					<div className="animate-pulse">{timeLeft}</div>
				)}
				{mode === RaceModeEnum.WORDS && (
					<div className="text-sm text-muted-foreground">
						{typedWordsCount} / {wordCount}
					</div>
				)}
			</div>
		</div>
	);
}
