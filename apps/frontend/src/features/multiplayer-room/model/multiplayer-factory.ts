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
import {
	action,
	atom,
	effect,
	peek,
	withConnectHook,
	wrap,
} from '@reatom/core';
import { type Room } from '@/entities/room';
import {
	checkCompletion,
	replayDataAtom,
	resetTyping,
	startTimeAtom,
	targetTextAtom,
	userTypedAtom,
	validLengthAtom,
} from '@/entities/typing-text';
import { socketService } from '@/shared/api/socket';
import { connectToRoom } from '../api/room-socket';

export const createMultiplayerModel = (
	roomId: string,
	username: string,
	token: string | null,
) => {
	// --- Atoms ---
	const roomAtom = atom<Room | null>(null, 'multiplayer.room');
	const roomErrorAtom = atom<string | null>(null, 'multiplayer.error');
	const isResultSavedAtom = atom(false, 'multiplayer.isResultSaved');

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
	const mpIsLoadingWordsAtom = atom(false, 'mpGame.isLoadingWords');

	// --- Actions ---
	const clearLocalResult = action(() => {
		mpLocalResultAtom.set(null);
		socketService.send(SocketActionEnum.RESTART_GAME, {});
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
			const room = peek(roomAtom);
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
		const submitted = peek(mpSubmittedAtom);
		if (submitted) return;

		const replay = peek(replayDataAtom);
		const afk = peek(mpAfkDurationAtom);
		const lastInput = peek(mpLastInputTimeAtom);

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

	// --- Connection & Logic ---
	const connectionAtom = atom(null, 'multiplayer.connection').extend(
		withConnectHook(() => {
			roomErrorAtom.set(null);
			isResultSavedAtom.set(false);

			// 1. Socket Connection
			const disconnect = connectToRoom(roomId, username, token, {
				onRoomState: (payload: RoomDTO) => {
					roomAtom.set(payload);
					isResultSavedAtom.set(false);
				},
				onPlayerJoined: (payload: ParticipantDTO) => {
					roomAtom.set((prev) => {
						if (!prev) return null;
						if (prev.participants.some((p) => p.socketId === payload.socketId))
							return prev;
						return {
							...prev,
							participants: [...prev.participants, payload],
						};
					});
				},
				onPlayerLeft: (payload: { userId: string }) => {
					roomAtom.set((prev) => {
						if (!prev) return null;
						return {
							...prev,
							participants: prev.participants.filter(
								(p) => p.socketId !== payload.userId,
							),
						};
					});
				},
				onCountdown: (payload: { startTime: number }) => {
					roomAtom.set((prev) => {
						if (!prev) return null;
						return {
							...prev,
							status: RoomStatusEnum.COUNTDOWN,
							startTime: payload.startTime,
						};
					});
				},
				onRaceStart: () => {
					roomAtom.set((prev) => {
						if (!prev) return null;
						return { ...prev, status: RoomStatusEnum.RACING };
					});
				},
				onProgressUpdate: (payload: ParticipantDTO[]) => {
					roomAtom.set((prev) => {
						if (!prev) return null;
						return { ...prev, participants: payload };
					});
				},
				onRaceFinished: (payload: { leaderboard: ParticipantDTO[] }) => {
					roomAtom.set((prev) => {
						if (!prev) return null;
						return {
							...prev,
							status: RoomStatusEnum.FINISHED,
							participants: payload.leaderboard,
						};
					});
				},
				onWordsAppended: (payload: { words: string[] }) => {
					roomAtom.set((prev) => {
						if (!prev) return null;
						return { ...prev, text: [...prev.text, ...payload.words] };
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

			// 2. React to Room Changes (Sync Text & Status)
			const unsubRoom = effect(() => {
				const room = roomAtom();
				if (!room) return;

				// Sync Text
				const newText = room.text.join(' ');
				if (peek(targetTextAtom) !== newText) {
					targetTextAtom.set(newText);
				}

				// Status Logic
				const status = room.status;
				const startTimeLocal = peek(mpStartTimeLocalAtom);
				const submitted = peek(mpSubmittedAtom);

				if (status === RoomStatusEnum.RACING && !startTimeLocal) {
					const now = Date.now();
					mpStartTimeLocalAtom.set(now);
					startTimeAtom.set(now);
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
					mpIsLoadingWordsAtom.set(false);
					resetTyping();
					mpAfkDurationAtom.set(0);
					mpIsFocusedAtom.set(true);
				}
			});

			// 3. React to Typing (Progress & AFK)
			let lastProgressUpdate = 0;

			const unsubTyping = effect(() => {
				const userTyped = userTypedAtom();
				const validLength = validLengthAtom();
				const text = targetTextAtom();
				const room = roomAtom();
				const submitted = peek(mpSubmittedAtom);

				if (!room || submitted) return;

				const now = Date.now();

				// AFK Tracking
				const lastInput = peek(mpLastInputTimeAtom);
				if (room.status === RoomStatusEnum.RACING && lastInput > 0) {
					const gap = now - lastInput;
					if (gap > 5000) {
						mpAfkDurationAtom.set((prev) => prev + gap);
					}
					mpLastInputTimeAtom.set(now);
				}

				// Load More Words
				if (
					room.status === RoomStatusEnum.RACING &&
					room.config.mode === RaceModeEnum.TIME &&
					text.length - userTyped.length < 300 &&
					!peek(mpIsLoadingWordsAtom)
				) {
					mpIsLoadingWordsAtom.set(true);
					loadMoreWords();
				}

				// Progress Update (Throttled)
				if (room.status === RoomStatusEnum.RACING) {
					const isEnd = text.length > 0 && checkCompletion(userTyped, text);
					const progress = isEnd ? userTyped.length : validLength;

					if (isEnd || now - lastProgressUpdate > 200) {
						updateProgress(progress);
						lastProgressUpdate = now;
					}
				}
			});

			// 4. Reset loading flag when words are appended
			let lastTextLength = peek(roomAtom)?.text.length ?? 0;
			const unsubWords = effect(() => {
				const room = roomAtom();
				if (room && room.text.length > lastTextLength) {
					mpIsLoadingWordsAtom.set(false);
					lastTextLength = room.text.length;
				}
			});

			// 5. Timer
			const timerInterval = setInterval(() => {
				const room = peek(roomAtom);
				const startTimeLocal = peek(mpStartTimeLocalAtom);

				if (
					startTimeLocal &&
					room?.config.mode === RaceModeEnum.TIME &&
					room.config.duration
				) {
					const duration = room.config.duration;
					const elapsed = (Date.now() - startTimeLocal) / 1000;
					const remaining = Math.max(0, duration - elapsed);
					mpTimeLeftAtom.set(Math.ceil(remaining));
				}
			}, 1000);

			// 6. Focus/Blur
			const handleBlur = () => {
				const room = peek(roomAtom);
				if (room?.status === RoomStatusEnum.RACING) {
					mpIsFocusedAtom.set(false);
					mpBlurStartTimeAtom.set(Date.now());
				}
			};

			const handleFocus = () => {
				const room = peek(roomAtom);
				if (room?.status === RoomStatusEnum.RACING) {
					mpIsFocusedAtom.set(true);
					const blurStart = peek(mpBlurStartTimeAtom);
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

			// Cleanup
			return () => {
				disconnect();
				roomAtom.set(null);
				unsubRoom();
				unsubTyping();
				unsubWords();
				clearInterval(timerInterval);
				window.removeEventListener('blur', handleBlur);
				window.removeEventListener('focus', handleFocus);
			};
		}),
	);

	return {
		// Atoms
		connectionAtom,
		roomAtom,
		roomErrorAtom,
		isResultSavedAtom,
		mpIsFocusedAtom,
		mpTimeLeftAtom,
		mpLocalResultAtom,
		mpSubmittedAtom,
		mpAfkDurationAtom,
		// Actions
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
