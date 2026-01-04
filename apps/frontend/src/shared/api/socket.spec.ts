import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SocketService } from './socket';

describe('SocketService', () => {
	let service: SocketService;

	beforeEach(() => {
		service = new SocketService();
		// @ts-ignore - access private for testing dispatch
		service.listeners = new Map();
	});

	it('should NOT duplicate message dispatches', () => {
		const handler = vi.fn();
		// biome-ignore lint/suspicious/noExplicitAny: Needed for testing internal event dispatch
		service.on('TEST' as any, handler);

		// @ts-ignore - trigger private dispatch
		// biome-ignore lint/suspicious/noExplicitAny: Needed for testing internal event dispatch
		service.dispatch('TEST' as any, { data: 1 });

		expect(handler).toHaveBeenCalledTimes(1);
	});
});
