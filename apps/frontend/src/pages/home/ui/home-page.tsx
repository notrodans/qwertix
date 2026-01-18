import { reatomComponent } from '@reatom/react';
import { ReplayViewer } from '@/features/replay-viewer';
import { ResultsContent } from '@/features/results';
import { SoloTypingMediator } from '@/features/solo-mode';
import { Button } from '@/shared/ui/button';
import { createRoom } from '../model';

const HomePage = reatomComponent(() => {
	return (
		<div className="w-full space-y-12">
			<div className="flex justify-center w-full">
				<SoloTypingMediator
					renderResults={(results, onRestart) => (
						<div className="w-full max-w-4xl mx-auto">
							<ResultsContent
								stats={results}
								targetText={results.fullText}
								participants={[]}
								onRestart={onRestart}
								isHost={true}
								ReplayComponent={ReplayViewer}
							/>
						</div>
					)}
				>
					<div className="text-center space-y-4 pt-12">
						<h2 className="text-2xl font-bold text-foreground">
							Ready to challenge others?
						</h2>
						<Button
							onClick={() => createRoom()}
							data-testid="create-room-button"
							className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold transition-colors cursor-pointer"
						>
							Create Multiplayer Room
						</Button>
					</div>
				</SoloTypingMediator>
			</div>
		</div>
	);
});

export default HomePage;
