import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { type Participant } from '@/entities/room';
import { type LocalResult, RoomContainer } from '@/features/multiplayer-room';
import { ResultsScreen } from '@/features/results';
import { Header } from '@/widgets/header';
import { MainLayout } from '@/widgets/layout';

export function RoomPage() {
	const { roomId } = useParams<{ roomId: string }>();
	const [result, setResult] = useState<{
		stats: LocalResult;
		text: string;
		participants: Participant[];
	} | null>(null);

	if (!roomId) return <div>Invalid Room ID</div>;

	return (
		<MainLayout header={<Header />}>
			<RoomContainer
				roomId={roomId}
				onFinish={(stats, text, participants) =>
					setResult({ stats, text, participants })
				}
			/>
			{result && (
				<ResultsScreen
					stats={result.stats}
					targetText={result.text}
					participants={result.participants}
					onClose={() => setResult(null)}
				/>
			)}
		</MainLayout>
	);
}
