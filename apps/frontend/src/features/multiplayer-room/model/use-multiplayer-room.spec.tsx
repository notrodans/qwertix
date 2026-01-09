import { SocketEventEnum } from '@qwertix/room-contracts';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { socketService } from '@/shared/api/socket';
import { roomAtom } from './multiplayer-model';
import { useMultiplayerRoom } from './use-multiplayer-room';

// Mock socket service
vi.mock('@/shared/api/socket', () => ({
	socketService: {
		connect: vi.fn(),
		disconnect: vi.fn(),
		send: vi.fn(),
		on: vi.fn(),
		connected: vi.fn(() => true),
	},
}));

describe('useMultiplayerRoom', () => {
	// biome-ignore lint/suspicious/noExplicitAny: mock handlers need to accept various payloads
	let handlers: Record<string, (payload: any) => void> = {};

	beforeEach(() => {
		handlers = {};
		roomAtom.set(null); // Reset global state
		vi.mocked(socketService.on).mockImplementation(
			// biome-ignore lint/suspicious/noExplicitAny: mock handlers need to accept various payloads
			(type: string, handler: (payload: any) => void) => {
				handlers[type] = handler;
				return () => {
					delete handlers[type];
				};
			},
		);
	});

	it('should correctly handle PLAYER_JOINED and NOT duplicate players', () => {
		renderHook(() => useMultiplayerRoom('room1', 'user1'));

		// Initial state from socket (ROOM_STATE)
		act(() => {
			if (handlers[SocketEventEnum.ROOM_STATE]) {
				handlers[SocketEventEnum.ROOM_STATE]({
					id: 'room1',
					participants: [{ socketId: 'id1', username: 'user1', isHost: true }],
					text: ['hello'],
					config: { wordCount: 1 },
				});
			}
		});

		// New player joins (backend sends socketId)
		act(() => {
			if (handlers[SocketEventEnum.PLAYER_JOINED]) {
				handlers[SocketEventEnum.PLAYER_JOINED]({
					socketId: 'id2',
					username: 'user2',
					isHost: false,
					progress: 0,
					wpm: 0,
				});
			}
		});

		expect(roomAtom()?.participants).toHaveLength(2);

		// Same player joins again (e.g. re-dispatch or logic error)
		act(() => {
			if (handlers[SocketEventEnum.PLAYER_JOINED]) {
				handlers[SocketEventEnum.PLAYER_JOINED]({
					socketId: 'id2',
					username: 'user2',
					isHost: false,
					progress: 0,
					wpm: 0,
				});
			}
		});

		expect(roomAtom()?.participants).toHaveLength(2);
	});

	it('should append words on WORDS_APPENDED event', () => {
		renderHook(() => useMultiplayerRoom('room1', 'user1'));

		act(() => {
			if (handlers[SocketEventEnum.ROOM_STATE]) {
				handlers[SocketEventEnum.ROOM_STATE]({
					id: 'room1',
					participants: [],
					text: ['word1'],
					config: { mode: 0, duration: 30 }, // RaceModeEnum.TIME
				});
			}
		});

		expect(roomAtom()?.text).toEqual(['word1']);

		act(() => {
			if (handlers[SocketEventEnum.WORDS_APPENDED]) {
				handlers[SocketEventEnum.WORDS_APPENDED]({ words: ['word2', 'word3'] });
			}
		});

		expect(roomAtom()?.text).toEqual(['word1', 'word2', 'word3']);
	});
});
