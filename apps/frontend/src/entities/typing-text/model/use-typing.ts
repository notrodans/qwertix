import {
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {
	appendCharacter,
	calculateBackspace,
	calculateCorrectChars,
	calculateCursorIndex,
	checkWordCompletion,
} from '../domain/typing-engine';
import { useCursorPositioning } from './use-cursor-positioning';

interface UseTypingOptions {
	onStart?: () => void;
	onType?: (typed: string, replayData: TypingState['replayData']) => void;
}

interface TypingState {
	userTyped: string;
	confirmedIndex: number;
	startTime: number | null;
	replayData: {
		key: string;
		timestamp: number;
		ctrlKey?: boolean;
		confirmedIndex?: number;
	}[];
}

const INITIAL_STATE: TypingState = {
	userTyped: '',
	confirmedIndex: 0,
	startTime: null,
	replayData: [],
};

export function useTyping(
	targetText: string,
	containerRef: RefObject<HTMLElement | null>,
	options: UseTypingOptions = {},
) {
	const [state, setState] = useState<TypingState>(INITIAL_STATE);
	const stateRef = useRef<TypingState>(INITIAL_STATE);
	const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });

	const targetTextRef = useRef(targetText);
	useLayoutEffect(() => {
		targetTextRef.current = targetText;
	}, [targetText]);

	const optionsRef = useRef(options);
	useLayoutEffect(() => {
		optionsRef.current = options;
	}, [options]);

	const updateCursor = useCursorPositioning(containerRef, setCaretPos);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.altKey) return;
			if ((event.ctrlKey || event.metaKey) && event.key !== 'Backspace') return;

			const prev = stateRef.current;
			const currentTargetText = targetTextRef.current;
			const currentOptions = optionsRef.current;
			const now = Date.now();

			const nextState = { ...prev };
			let shouldUpdate = false;
			let typeEventTriggered = false;

			const timestamp = prev.startTime ? now - prev.startTime : 0;

			// Backspace Logic
			if (event.key === 'Backspace') {
				const isCtrl = event.ctrlKey || event.metaKey;

				nextState.replayData = [
					...prev.replayData,
					{
						key: 'Backspace',
						timestamp,
						ctrlKey: isCtrl,
						confirmedIndex: prev.confirmedIndex,
					},
				];

				const nextTyped = calculateBackspace(
					prev.userTyped,
					prev.confirmedIndex,
					isCtrl,
				);

				if (nextTyped !== prev.userTyped) {
					nextState.userTyped = nextTyped;
					typeEventTriggered = true;
					shouldUpdate = true;
				} else {
					// Even if typed text didn't change (empty), replay data did.
					shouldUpdate = true;
				}
			}
			// Typing Logic
			else if (event.key.length === 1) {
				if (event.key === ' ') {
					event.preventDefault();
				}

				const nextTyped = appendCharacter(
					prev.userTyped,
					event.key,
					currentTargetText,
				);

				if (nextTyped !== prev.userTyped) {
					nextState.replayData = [
						...prev.replayData,
						{
							key: event.key,
							timestamp,
						},
					];

					nextState.userTyped = nextTyped;
					typeEventTriggered = true;
					shouldUpdate = true;

					// Word Completion Check
					if (event.key === ' ') {
						const newConfirmedIndex = checkWordCompletion(
							nextTyped,
							currentTargetText,
						);
						if (newConfirmedIndex !== -1) {
							nextState.confirmedIndex = newConfirmedIndex;
						}
					}
				} else {
					// Replay data NOT changed because input was ignored
					shouldUpdate = false;
				}
			}

			if (shouldUpdate) {
				// Start Timer Logic
				if (!prev.startTime) {
					nextState.startTime = now;
					currentOptions.onStart?.();
				}

				stateRef.current = nextState;
				setState(nextState);

				if (typeEventTriggered) {
					currentOptions.onType?.(nextState.userTyped, nextState.replayData);

					// Schedule cursor update
					requestAnimationFrame(() => {
						const nextIndex = calculateCursorIndex(
							currentTargetText,
							nextState.userTyped,
						);
						updateCursor(nextIndex);
					});
				}
			}
		},
		[updateCursor],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const reset = useCallback(() => {
		stateRef.current = INITIAL_STATE;
		setState(INITIAL_STATE);
		requestAnimationFrame(() => updateCursor(0));
	}, [updateCursor]);

	const validLength = calculateCorrectChars(
		targetTextRef.current,
		state.userTyped,
		state.confirmedIndex,
	);

	return {
		userTyped: state.userTyped,
		validLength,
		caretPos,
		reset,
		replayData: state.replayData,
		setUserTyped: (val: string) => {
			const nextState = { ...stateRef.current, userTyped: val };
			stateRef.current = nextState;
			setState(nextState);
		},
		setReplayData: (
			fn: (prev: TypingState['replayData']) => TypingState['replayData'],
		) => {
			const nextState = {
				...stateRef.current,
				replayData: fn(stateRef.current.replayData),
			};
			stateRef.current = nextState;
			setState(nextState);
		},
		startTime: state.startTime,
	};
}
