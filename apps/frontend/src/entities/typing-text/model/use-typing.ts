import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import {
	appendCharacter,
	calculateBackspace,
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
	const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });

	// Keep latest props in refs to avoid recreating the event listener on every render.
	// Updating them during render is safe and eliminates the need for useEffect.
	const targetTextRef = useRef(targetText);
	targetTextRef.current = targetText;

	const optionsRef = useRef(options);
	optionsRef.current = options;

	const updateCursor = useCursorPositioning(containerRef, setCaretPos);

	// Stable event handler using functional state updates
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.altKey) return;
			if ((event.ctrlKey || event.metaKey) && event.key !== 'Backspace') return;

			setState((prev) => {
				const currentTargetText = targetTextRef.current;
				const currentOptions = optionsRef.current;
				const nextState = { ...prev };
				let shouldUpdate = false;

				// Start Timer Logic
				if (!prev.startTime) {
					const now = Date.now();
					nextState.startTime = now;
					currentOptions.onStart?.();
					shouldUpdate = true;
				}

				const timestamp = Date.now() - (nextState.startTime || Date.now());

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
						currentOptions.onType?.(nextTyped, nextState.replayData);

						// Schedule cursor update (side effect outside of render cycle)
						requestAnimationFrame(() => {
							const nextIndex = calculateCursorIndex(
								currentTargetText,
								nextTyped,
							);
							updateCursor(nextIndex);
						});

						return nextState;
					}
					// If nothing changed (e.g. at start), we might still want to record replay data?
					// Original logic implied yes. But if we return same object, React bails out.
					// Let's force update if replay data changed.
					return nextState;
				}

				// Typing Logic
				if (event.key.length === 1) {
					if (event.key === ' ') {
						event.preventDefault();
					}

					nextState.replayData = [
						...prev.replayData,
						{
							key: event.key,
							timestamp,
						},
					];

					const nextTyped = appendCharacter(prev.userTyped, event.key);

					if (nextTyped !== prev.userTyped) {
						nextState.userTyped = nextTyped;
						currentOptions.onType?.(nextTyped, nextState.replayData);

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

						// Schedule cursor update
						requestAnimationFrame(() => {
							const nextIndex = calculateCursorIndex(
								currentTargetText,
								nextTyped,
							);
							updateCursor(nextIndex);
						});

						return nextState;
					}
				}

				// Return previous state if no changes to avoid rerender
				return shouldUpdate ? nextState : prev;
			});
		},
		[updateCursor],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const reset = useCallback(() => {
		setState(INITIAL_STATE);
		requestAnimationFrame(() => updateCursor(0));
	}, [updateCursor]);

	return {
		userTyped: state.userTyped,
		caretPos,
		reset,
		replayData: state.replayData,
		setUserTyped: (val: string) => setState((s) => ({ ...s, userTyped: val })),
		setReplayData: (
			fn: (prev: TypingState['replayData']) => TypingState['replayData'],
		) => setState((s) => ({ ...s, replayData: fn(s.replayData) })),
		startTime: state.startTime,
	};
}
