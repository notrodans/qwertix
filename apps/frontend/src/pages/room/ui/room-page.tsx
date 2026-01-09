import { reatomComponent } from '@reatom/react';
import { MultiplayerRoomMediator } from '@/features/multiplayer-room';
import { ReplayViewer } from '@/features/replay-viewer';
import { ResultsScreen } from '@/features/results';

const RoomPage = reatomComponent(({ roomId }: { roomId: string }) => {
	return (
		<MultiplayerRoomMediator
			roomId={roomId}
			renderResults={(props) => (
				<ResultsScreen
					{...props}
					targetText={props.text}
					ReplayComponent={ReplayViewer}
				/>
			)}
		/>
	);
});

const Component = RoomPage;
export default Component;
