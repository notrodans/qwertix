import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { ReplayViewer } from '@/features/replay-viewer';
import { ResultsScreen } from '@/features/results';
import { SoloTypingMediator } from '@/features/solo-mode';
import { navigate } from '@/shared/model';
import { Button } from '@/shared/ui/button';

const HomePage = reatomComponent(() => {
	const handleCreateRoom = async () => {
		try {
			const res = await wrap(fetch('/api/rooms', { method: 'POST' }));
			if (res.ok) {
				const { roomId } = await wrap(res.json());
				navigate(`/room/${roomId}`);
			}
		} catch (e) {
			console.error('Failed to create room', e);
		}
	};

	return (
		<>
			<div className="container mx-auto py-10 px-4 space-y-12">
				<div className="flex justify-center">
					<SoloTypingMediator
						renderResults={(results, onRestart) => (
							<ResultsScreen
								stats={results}
								targetText={results.fullText}
								participants={[]}
								onRestart={onRestart}
								onClose={onRestart}
								ReplayComponent={ReplayViewer}
							/>
						)}
					/>
				</div>

				<div className="text-center space-y-4">
					<h2 className="text-2xl font-bold text-zinc-200">
						Ready to challenge others?
					</h2>
					<Button
						onClick={handleCreateRoom}
						className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors cursor-pointer"
					>
						Create Multiplayer Room
					</Button>
				</div>
			</div>
		</>
	);
});

const Component = HomePage;
export default Component;
