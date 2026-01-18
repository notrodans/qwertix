import { type ComponentType } from 'react';
import type { Participant } from '@/entities/room';
import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui';
import { LeaderboardSection } from './parts/leaderboard-section';
import { ReplaySection } from './parts/replay-section';
import { StatsGrid } from './parts/stats-grid';

export interface ResultsContentProps {
	stats: {
		wpm: number;
		raw: number;
		accuracy: number;
		consistency: number;
		replayData: { key: string; timestamp: number }[];
		afkDuration?: number;
	};
	targetText: string;
	participants: Participant[];
	isHost?: boolean;
	onRestart?: () => void;
	ReplayComponent: ComponentType<{
		replay: {
			data: { key: string; timestamp: number }[];
			targetText: string;
		};
	}>;
}

export function ResultsContent({
	stats,
	targetText,
	participants,
	isHost,
	onRestart,
	ReplayComponent,
}: ResultsContentProps) {
	return (
		<div className="space-y-8">
			<StatsGrid stats={stats} />

			<div className="flex flex-col gap-8">
				{participants.length > 0 && (
					<LeaderboardSection participants={participants} />
				)}
				<ReplaySection
					targetText={targetText}
					replayData={stats.replayData}
					ReplayComponent={ReplayComponent}
				/>
			</div>

			{isHost && onRestart && (
				<div className="flex justify-center pt-4">
					<Button
						onClick={onRestart}
						size="lg"
						className="px-12 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
					>
						Play Again
					</Button>
				</div>
			)}
		</div>
	);
}

interface ResultsScreenProps extends ResultsContentProps {
	onClose: () => void;
}

export function ResultsScreen({ onClose, ...props }: ResultsScreenProps) {
	return (
		<Dialog open={true} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-bold">
						Race Results
					</DialogTitle>
				</DialogHeader>
				<ResultsContent {...props} />
			</DialogContent>
		</Dialog>
	);
}
