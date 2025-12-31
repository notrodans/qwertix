import { useCallback, useRef } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: generic arguments
export function useThrottledCallback<T extends (...args: any[]) => any>(
	callback: T,
	delay: number,
) {
	const lastRun = useRef(0);
	const callbackRef = useRef(callback);

	// Update ref to latest callback to avoid stale closures without re-creating the throttled function
	callbackRef.current = callback;

	return useCallback(
		(...args: Parameters<T>) => {
			const now = Date.now();
			if (now - lastRun.current >= delay) {
				callbackRef.current(...args);
				lastRun.current = now;
			}
		},
		[delay],
	);
}
