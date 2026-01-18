import { type ComponentType, useState } from 'react';
import { Button } from '@/shared/ui';

interface ReplaySectionProps {
	targetText: string;
	replayData: { key: string; timestamp: number }[];
	ReplayComponent: ComponentType<{
		replay: {
			data: { key: string; timestamp: number }[];
			targetText: string;
		};
	}>;
}

export function ReplaySection({
	targetText,
	replayData,
	ReplayComponent,
}: ReplaySectionProps) {
	const [showReplay, setShowReplay] = useState(false);

	return (
		<div className="flex-1 space-y-4">
			<h3 className="text-xl font-bold text-muted-foreground">Replay</h3>
			{showReplay ? (
				<ReplayComponent replay={{ data: replayData, targetText }} />
			) : (
				<div className="h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
					<Button
						data-testid="watch-replay"
						onClick={() => setShowReplay(true)}
						className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
					>
						Watch Replay
					</Button>
				</div>
			)}
		</div>
	);
}
