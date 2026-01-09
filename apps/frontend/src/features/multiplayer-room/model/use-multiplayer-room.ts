import { type ParticipantDTO } from '@qwertix/room-contracts';
import { useEffect } from 'react';
import {
	isResultSavedAtom,
	joinRoom,
	leaveRoom,
	loadMoreWords,
	restartGame,
	roomAtom,
	roomErrorAtom,
	startRace,
	submitResult,
	transferHost,
	updateProgress,
	updateSettings,
} from './multiplayer-model';

export function useMultiplayerRoom(
	roomId: string,
	username: string,
	token?: string | null,
) {
	useEffect(() => {
		joinRoom(roomId, username, token);
		return () => {
			leaveRoom();
		};
	}, [roomId, username, token]);

	const room = roomAtom();

	return {
		room,
		error: roomErrorAtom(),
		isResultSaved: isResultSavedAtom(),
		startRace,
		updateProgress,
		updateSettings,
		transferHost,
		loadMoreWords,
		submitResult,
		restartGame,
		currentUser: room?.participants.find(
			(p: ParticipantDTO) => p.username === username,
		),
	};
}
