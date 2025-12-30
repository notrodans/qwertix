import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { type Participant } from '@/entities/room';
import {
	type LocalResult,
	MultiplayerRoomMediator,
} from '@/features/multiplayer-room';
import { ResultsScreen } from '@/features/results';
import { Header } from '@/widgets/header';
import { MainLayout } from '@/widgets/layout';

export function RoomPage() {
	const { roomId } = useParams<{ roomId: string }>();

	if (!roomId) return <div>Invalid Room ID</div>;

	return (
		<MainLayout header={<Header />}>
			<MultiplayerRoomMediator
				roomId={roomId}
				renderResults={(props) => (
					<ResultsScreen
						stats={props.stats}
						targetText={props.text}
						participants={props.participants}
						isHost={props.isHost}
						onRestart={props.onRestart}
						onClose={props.onClose}
					/>
				)}
			/>
		</MainLayout>
	);
}
