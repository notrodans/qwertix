import { type ParticipantDTO } from '@qwertix/room-contracts';
import { useEffect } from 'react';
import { type MultiplayerModel } from './multiplayer-factory';

export function useMultiplayerRoom(
	model: MultiplayerModel,
	roomId: string,
	username: string,
	token?: string | null,
) {
	useEffect(() => {
		const disconnect = model.joinRoom(roomId, username, token);
		return () => {
			disconnect();
		};
	}, [model, roomId, username, token]);

	const room = model.roomAtom();

	return {
		room,
		error: model.roomErrorAtom(),
		isResultSaved: model.isResultSavedAtom(),
		startRace: model.startRace,
		updateProgress: model.updateProgress,
		updateSettings: model.updateSettings,
		transferHost: model.transferHost,
		loadMoreWords: model.loadMoreWords,
		submitResult: model.submitResult,
		restartGame: model.restartGame,
		currentUser: room?.participants.find(
			(p: ParticipantDTO) => p.username === username,
		),
	};
}
