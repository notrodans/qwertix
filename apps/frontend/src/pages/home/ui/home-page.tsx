import { useNavigate } from 'react-router-dom';
import { roomQueries } from '@/entities/room';
import { ResultsScreen } from '@/features/results';
import { SoloTypingMediator } from '@/features/solo-mode';
import { Header } from '@/widgets/header';
import { MainLayout } from '@/widgets/layout';

export function HomePage() {
	const navigate = useNavigate();

	const handleCreateRoom = async () => {
		try {
			const { roomId } = await roomQueries.create();
			navigate(`/room/${roomId}`);
		} catch (e) {
			console.error('Failed to create room', e);
			alert('Failed to create room');
		}
	};

	return (
		<MainLayout header={<Header />}>
			<div className="flex flex-col gap-12 w-full max-w-4xl mx-auto py-12">
				<SoloTypingMediator
					renderResults={(results, onRestart) => (
						<ResultsScreen
							stats={results}
							targetText={results.fullText}
							participants={[
								{
									socketId: 'me',
									username: 'You',
									isHost: true,
									progress: 100,
									wpm: results.wpm,
									accuracy: results.accuracy,
									rank: 1,
									finishedAt: Date.now(),
								},
							]}
							onClose={onRestart}
							onRestart={onRestart}
							isHost={true}
						/>
					)}
				/>

				<div className="flex justify-center mt-12 border-t border-zinc-900 pt-12">
					<button
						onClick={handleCreateRoom}
						className="flex items-center gap-2 text-zinc-500 hover:text-yellow-500 transition-colors font-bold group"
					>
						<span>⚔️</span>
						<span>Create Multiplayer Room</span>
						<span className="group-hover:translate-x-1 transition-all opacity-100">
							→
						</span>
					</button>
				</div>
			</div>
		</MainLayout>
	);
}
