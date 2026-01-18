import { env } from '@env';
import {
	calculateResultHash,
	type ParticipantDTO,
	RaceModeEnum,
	type ReplayEvent,
	type RoomConfig,
	type RoomDTO,
	RoomStatusEnum,
	SocketActionEnum,
} from '@qwertix/room-contracts';
import { action, atom, effect, peek, wrap } from '@reatom/core';
import { type Room } from '@/entities/room';
import {
	checkCompletion,
	replayDataAtom,
	resetTyping,
	targetTextAtom,
	userTypedAtom,
	validLengthAtom,
} from '@/entities/typing-text';
import { socketService } from '@/shared/api/socket';
import { connectToRoom } from '../api/room-socket';

export const createMultiplayerModel = () => {
	// --- Room State ---
	const roomAtom = atom<Room | null>(null, 'multiplayer.room');
	const roomErrorAtom = atom<string | null>(null, 'multiplayer.error');
	const isResultSavedAtom = atom(false, 'multiplayer.isResultSaved');

	// --- Game State ---
	const mpIsFocusedAtom = atom(true, 'mpGame.isFocused');
	const mpTimeLeftAtom = atom<number | null>(null, 'mpGame.timeLeft');
	const mpSubmittedAtom = atom(false, 'mpGame.submitted');
	const mpStartTimeLocalAtom = atom<number | null>(
		null,
		'mpGame.startTimeLocal',
	);
	const mpLocalResultAtom = atom<{
		wpm: number;
		raw: number;
		accuracy: number;
		consistency: number;
		afkDuration: number;
		replayData: ReplayEvent[];
	} | null>(null, 'mpGame.localResult');

	const mpLastInputTimeAtom = atom(0, 'mpGame.lastInputTime');
	const mpAfkDurationAtom = atom(0, 'mpGame.afkDuration');
	const mpBlurStartTimeAtom = atom<number | null>(null, 'mpGame.blurStartTime');

	// --- Actions ---
	const clearLocalResult = action(() => {
		mpLocalResultAtom.set(null);
	}, 'mpGame.clearLocalResult');

	const startRace = action(() => {
		socketService.send(SocketActionEnum.START_RACE, {});
	}, 'multiplayer.startRace');

	const updateProgress = action((typedLength: number) => {
		socketService.send(SocketActionEnum.UPDATE_PROGRESS, { typedLength });
	}, 'multiplayer.updateProgress');

	const updateSettings = action((config: RoomConfig) => {
		socketService.send(SocketActionEnum.UPDATE_SETTINGS, config);
	}, 'multiplayer.updateSettings');

	const transferHost = action((targetId: string) => {
		socketService.send(SocketActionEnum.TRANSFER_HOST, { targetId });
	}, 'multiplayer.transferHost');

	const loadMoreWords = action(() => {
		socketService.send(SocketActionEnum.LOAD_MORE_WORDS, {});
	}, 'multiplayer.loadMoreWords');

	const restartGame = action(() => {
		socketService.send(SocketActionEnum.RESTART_GAME, {});
	}, 'multiplayer.restartGame');

	const submitResult = action(
		async (stats: {
			wpm: number;
			raw: number;
			accuracy: number;
			consistency: number;
			afkDuration: number;
			replayData: ReplayEvent[];
		}) => {
			const room = roomAtom();
			if (!room) return;

			const startTime = room.startTime || Date.now();
			const endTime = Date.now();
			const targetText = room.text.join(' ');

			const hash = await wrap(
				calculateResultHash(
					stats.wpm,
					stats.raw,
					stats.accuracy,
					stats.consistency,
					startTime,
					endTime,
					stats.afkDuration,
					targetText,
					env.VITE_RESULT_HASH_SALT,
				),
			);

			socketService.send(SocketActionEnum.SUBMIT_RESULT, {
				...stats,
				startTime,
				endTime,
				afkDuration: stats.afkDuration,
				hash,
			});
		},
		'multiplayer.submitResult',
	);

	const handleMpFinish = action(() => {
		const submitted = mpSubmittedAtom();
		if (submitted) return;

		const replay = replayDataAtom();
		const afk = mpAfkDurationAtom();
		const lastInput = mpLastInputTimeAtom();

		const endTime = Date.now();
		const finalGap = endTime - lastInput;
		const finalAfk = finalGap > 5000 ? afk + finalGap : afk;

		const stats = {
			wpm: 0,
			raw: 0,
			accuracy: 0,
			consistency: 100,
			replayData: replay,
			afkDuration: finalAfk,
		};

		mpLocalResultAtom.set(stats);
		submitResult(stats);
		mpSubmittedAtom.set(true);
	}, 'mpGame.handleFinish');

	const joinRoom = action(
		(roomId: string, username: string, token: string | null = null) => {
			roomErrorAtom.set(null);
			isResultSavedAtom.set(false);

			return connectToRoom(roomId, username, token, {
				onRoomState: (payload: RoomDTO) => {
					roomAtom.set(payload);
					isResultSavedAtom.set(false);
				},
				onPlayerJoined: (payload: ParticipantDTO) => {
					const prev = roomAtom();
					if (!prev) return;
					if (prev.participants.some((p) => p.socketId === payload.socketId))
						return;
					roomAtom.set({
						...prev,
						participants: [...prev.participants, payload],
					});
				},
				onPlayerLeft: (payload: { userId: string }) => {
					const prev = roomAtom();
					if (!prev) return;
					roomAtom.set({
						...prev,
						participants: prev.participants.filter(
							(p) => p.socketId !== payload.userId,
						),
					});
				},
				onCountdown: (payload: { startTime: number }) => {
					const prev = roomAtom();
					if (!prev) return;
					roomAtom.set({
						...prev,
						status: RoomStatusEnum.COUNTDOWN,
						startTime: payload.startTime,
					});
				},
				onRaceStart: () => {
					const prev = roomAtom();
					if (!prev) return;
					roomAtom.set({
						...prev,
						status: RoomStatusEnum.RACING,
					});
				},
				onProgressUpdate: (payload: ParticipantDTO[]) => {
					const prev = roomAtom();
					if (!prev) return;
					roomAtom.set({
						...prev,
						participants: payload,
					});
				},
				onRaceFinished: (payload: { leaderboard: ParticipantDTO[] }) => {
					const prev = roomAtom();
					if (!prev) return;
					roomAtom.set({
						...prev,
						status: RoomStatusEnum.FINISHED,
						participants: payload.leaderboard,
					});
				},
				onWordsAppended: (payload: { words: string[] }) => {
					const prev = roomAtom();
					if (!prev) return;
					roomAtom.set({
						...prev,
						text: [...prev.text, ...payload.words],
					});
				},
				onHostPromoted: () => {},
				onResultSaved: (payload: { success: boolean }) => {
					if (payload.success) isResultSavedAtom.set(true);
				},
				onError: (payload: { message: string }) => {
					roomErrorAtom.set(payload.message);
				},
			});
		},
		'multiplayer.joinRoom',
	);

	// --- Effects ---

	// 1. Sync Text from Room
	effect(() => {
		const room = roomAtom();
		if (room) {
			const newText = room.text.join(' ');
			if (peek(targetTextAtom) !== newText) {
				targetTextAtom.set(newText);
			}
		}
	});

	// 2. React to Room Status
	effect(() => {
		const room = roomAtom();
		if (!room) return;

		const status = room.status;
		const startTimeLocal = mpStartTimeLocalAtom();
		const submitted = mpSubmittedAtom();

		if (status === RoomStatusEnum.RACING && !startTimeLocal) {
			const now = Date.now();
			mpStartTimeLocalAtom.set(now);
			mpLastInputTimeAtom.set(now);
			mpAfkDurationAtom.set(0);
			mpIsFocusedAtom.set(true);
		} else if (status === RoomStatusEnum.FINISHED && !submitted) {
			handleMpFinish();
		} else if (status === RoomStatusEnum.LOBBY) {
			mpSubmittedAtom.set(false);
			mpLocalResultAtom.set(null);
			mpTimeLeftAtom.set(null);
			mpStartTimeLocalAtom.set(null);
			resetTyping();
			mpAfkDurationAtom.set(0);
			mpIsFocusedAtom.set(true);
		}
	});

	// 3. Progress Update (Throttled)
	let lastProgressUpdate = 0;
	effect(() => {
		const validLength = validLengthAtom();
		const userTyped = userTypedAtom();
		const text = targetTextAtom();
		const room = roomAtom();
		const submitted = mpSubmittedAtom();

		if (room?.status === RoomStatusEnum.RACING && !submitted) {
			const now = Date.now();
			const isEnd = text.length > 0 && checkCompletion(userTyped, text);
			const progress = isEnd ? userTyped.length : validLength;

			if (isEnd || now - lastProgressUpdate > 200) {
				updateProgress(progress);
				lastProgressUpdate = now;
			}
		}
	});

	// 4. Load More Words & AFK Tracking on Type
	effect(() => {
		const userTyped = userTypedAtom();
		const text = targetTextAtom();
		const room = roomAtom();
		const submitted = mpSubmittedAtom();

		if (!room || submitted) return;

		const now = Date.now();
		const lastInput = mpLastInputTimeAtom();

		if (room.status === RoomStatusEnum.RACING && lastInput > 0) {
			const gap = now - lastInput;
			if (gap > 5000) {
				mpAfkDurationAtom.set((prev) => prev + gap);
			}
			mpLastInputTimeAtom.set(now);
		}

		if (text.length > 200 && text.length - userTyped.length < 150) {
			loadMoreWords();
		}
	});

	// 5. Timer
	effect(() => {
		const startTimeLocal = mpStartTimeLocalAtom();
		const room = roomAtom();

		if (
			startTimeLocal &&
			room?.config.mode === RaceModeEnum.TIME &&
			'duration' in room.config &&
			room.config.duration
		) {
			const duration = room.config.duration;

			const interval = setInterval(() => {
				const elapsed = (Date.now() - startTimeLocal) / 1000;
				const remaining = Math.max(0, duration - elapsed);
				mpTimeLeftAtom.set(Math.ceil(remaining));
			}, 1000);

			return () => clearInterval(interval);
		}
		return;
	});

	// 6. Focus/Blur
	effect(() => {
		const handleBlur = () => {
			const room = roomAtom();
			if (room?.status === RoomStatusEnum.RACING) {
				mpIsFocusedAtom.set(false);
				mpBlurStartTimeAtom.set(Date.now());
			}
		};

		const handleFocus = () => {
			const room = roomAtom();
			if (room?.status === RoomStatusEnum.RACING) {
				mpIsFocusedAtom.set(true);
				const blurStart = mpBlurStartTimeAtom();
				if (blurStart) {
					const duration = Date.now() - blurStart;
					mpAfkDurationAtom.set((prev) => prev + duration);
					mpBlurStartTimeAtom.set(null);
					mpLastInputTimeAtom.set(Date.now());
				}
			}
		};

		window.addEventListener('blur', handleBlur);
		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('blur', handleBlur);
			window.removeEventListener('focus', handleFocus);
		};
	});

	return {
		// Atoms
		roomAtom,
		roomErrorAtom,
		isResultSavedAtom,
		mpIsFocusedAtom,
		mpTimeLeftAtom,
		mpLocalResultAtom,
		mpSubmittedAtom,
		// Actions
		joinRoom,
		startRace,
		updateProgress,
		updateSettings,
		transferHost,
		restartGame,
		loadMoreWords,
		submitResult,
		clearLocalResult,
		// State from global typing model (shared)
		userTypedAtom,
		validLengthAtom,
	};
};

export type MultiplayerModel = ReturnType<typeof createMultiplayerModel>;
