import {
	action,
	atom,
	computed,
	effect,
	peek,
	withConnectHook,
	wrap,
} from '@reatom/core';
import { type ReplayResponse } from '@/entities/result';
import { calculateCursorIndex } from '@/entities/typing-text';
import { reconstructTextAtTime } from '../domain/text-reconstruction';

export const createReplayModel = (initialData: ReplayResponse) => {
	// Add start delay to make replay feel more natural
	const START_DELAY = 10;
	const adjustedData = {
		...initialData,
		data: initialData.data.map((e) => ({
			...e,
			timestamp: e.timestamp + START_DELAY,
		})),
	};

	// State Atoms
	const replayDataAtom = atom(adjustedData, 'replay.data');
	const progressAtom = atom(0, 'replay.progress'); // 0 to 1
	const isPlayingAtom = atom(false, 'replay.isPlaying');

	// Computed Atoms
	const durationAtom = computed(() => {
		const replay = replayDataAtom();
		if (!replay || replay.data.length === 0) return 1000;

		const events = replay.data;
		// Replay duration is the timestamp of the last event
		// Starting from 0 allows having an empty state at progress 0
		const last = events[events.length - 1]?.timestamp ?? 0;
		return Math.max(last, 1000);
	}, 'replay.duration');

	const typedTextAtom = computed(() => {
		const replay = replayDataAtom();
		const progress = progressAtom();
		if (!replay || replay.data.length === 0) return '';

		const events = replay.data;
		const duration = durationAtom();

		// currentTimestamp starts from 0 to duration
		const currentTimestamp = progress * duration;
		return reconstructTextAtTime(events, currentTimestamp);
	}, 'replay.typedText');

	const cursorIndexAtom = computed(() => {
		const replay = replayDataAtom();
		const typedText = typedTextAtom();
		if (!replay) return 0;
		return calculateCursorIndex(replay.targetText || '', typedText);
	}, 'replay.cursorIndex');

	// Actions
	const setReplayData = action((data: ReplayResponse) => {
		const START_DELAY = 10;
		const adjustedData = {
			...data,
			data: data.data.map((e) => ({
				...e,
				timestamp: e.timestamp + START_DELAY,
			})),
		};
		replayDataAtom.set(adjustedData);
		progressAtom.set(0);
		isPlayingAtom.set(false);
	}, 'replay.setReplayData');

	const togglePlay = action(() => {
		const isPlaying = isPlayingAtom();
		if (!isPlaying && progressAtom() >= 1) {
			progressAtom.set(0);
		}
		isPlayingAtom.set(!isPlaying);
	}, 'replay.togglePlay');

	const setProgressManual = action((value: number) => {
		isPlayingAtom.set(false);
		progressAtom.set(Math.max(0, Math.min(1, value)));
	}, 'replay.setProgressManual');

	// Animation Service (Hooked to connection)
	const animationAtom = atom(null, 'replay.animation').extend(
		withConnectHook(() => {
			return effect(() => {
				if (isPlayingAtom()) {
					let animationFrameId: number;
					const startTime = performance.now();
					const startProgress = peek(progressAtom);
					const duration = peek(durationAtom);

					const animate = wrap((time: number) => {
						const elapsed = time - startTime;
						const currentProgress = Math.min(
							startProgress + elapsed / duration,
							1,
						);

						progressAtom.set(currentProgress);

						if (currentProgress < 1) {
							animationFrameId = requestAnimationFrame(animate);
						} else {
							isPlayingAtom.set(false);
						}
					});

					animationFrameId = requestAnimationFrame(animate);

					return () => {
						if (animationFrameId) cancelAnimationFrame(animationFrameId);
					};
				}
				return;
			});
		}),
	);

	return {
		replayDataAtom,
		progressAtom,
		isPlayingAtom,
		durationAtom,
		typedTextAtom,
		cursorIndexAtom,
		setReplayData,
		togglePlay,
		setProgressManual,
		animationAtom,
	};
};
