import { useEffect, useRef } from 'react';

/**
 * Custom hook for setInterval that keeps the callback fresh.
 * @param callback The function to be called on every interval
 * @param delay The delay in milliseconds. Use 0 or null to pause.
 */
export function useInterval(callback: () => void, delay: number | null) {
	const savedCallback = useRef(callback);

	// Update ref synchronously during render to avoid stale closures in effects/intervals
	savedCallback.current = callback;

	useEffect(() => {
		if (delay === null || delay === 0) return;

		const id = setInterval(() => {
			savedCallback.current();
		}, delay);

		return () => clearInterval(id);
	}, [delay]);
}