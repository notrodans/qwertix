import { useEffect, useMemo, useRef } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: we can ignore this
type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

// biome-ignore lint/suspicious/noExplicitAny: we can ignore this
export function useEventCallback<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
	const ref = useRef<Fn<A, R>>(fn);
	useEffect(() => {
		ref.current = fn;
	});
	return useMemo(
		() =>
			(...args: A): R => {
				const { current } = ref;
				return current(...args);
			},
		[],
	);
}
