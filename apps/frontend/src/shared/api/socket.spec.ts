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
		service.on('TEST', handler);

		// @ts-ignore - trigger private dispatch
		service.dispatch('TEST', { data: 1 });

		expect(handler).toHaveBeenCalledTimes(1);
	});
});
