import type { SocketAction, SocketEvent } from '@qwertix/room-contracts';

export type MessageHandler<T> = (payload: T) => void;

type EventType = SocketEvent['type'];
type ActionType = SocketAction['type'];

export class SocketService {
	private socket: WebSocket | null = null;
	// We have to use 'any' internally in the Map because it holds handlers for DIFFERENT types.
	// biome-ignore lint/suspicious/noExplicitAny: internal storage for generic handlers
	private listeners: Map<string, Set<MessageHandler<any>>> = new Map();
	private messageQueue: string[] = [];

	connected() {
		return this.socket?.readyState === WebSocket.OPEN;
	}

	connect(url: string) {
		if (this.socket) {
			this.socket.close();
		}
		this.socket = new WebSocket(url);

		this.socket.onmessage = (event) => {
			try {
				const { type, payload } = JSON.parse(event.data) as SocketEvent;
				this.dispatch(type, payload);
			} catch (e) {
				console.error('WS Parse Error', e);
			}
		};

		this.socket.onopen = () => {
			console.log('WS Connected');
			this.flushQueue();
			this.dispatch('CONNECTED', {});
		};

		this.socket.onclose = () => {
			console.log('WS Disconnected');
			this.dispatch('DISCONNECTED', {});
		};
	}

	private flushQueue() {
		while (this.messageQueue.length > 0 && this.connected()) {
			const msg = this.messageQueue.shift();
			if (msg) this.socket?.send(msg);
		}
	}

	disconnect() {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
	}

	send<T extends ActionType>(
		type: T,
		payload: Extract<SocketAction, { type: T }>['payload'],
	) {
		const msg = JSON.stringify({ type, payload });
		if (this.connected()) {
			this.socket?.send(msg);
		} else {
			this.messageQueue.push(msg);
		}
	}

	on<T extends EventType | 'CONNECTED' | 'DISCONNECTED'>(
		type: T,
		handler: MessageHandler<
			T extends EventType
				? Extract<SocketEvent, { type: T }>['payload']
				: unknown
		>,
	) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type)?.add(handler);

		return () => this.off(type, handler);
	}

	off<T>(type: string, handler: MessageHandler<T>) {
		this.listeners.get(type)?.delete(handler);
	}

	private dispatch(type: string, payload: unknown) {
		this.listeners.get(type)?.forEach((handler) => handler(payload));
	}
}

export const socketService = new SocketService();
