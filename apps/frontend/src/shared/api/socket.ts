export type SocketPayload = unknown;
export type MessageHandler<T = SocketPayload> = (payload: T) => void;

export class SocketService {
	private socket: WebSocket | null = null;
	// We have to use 'any' internally in the Map because it holds handlers for DIFFERENT types.
	// This is a necessary "container of unknowns".
	// biome-ignore lint/suspicious/noExplicitAny: internal storage for generic handlers
	private listeners: Map<string, Set<MessageHandler<any>>> = new Map();

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
				const { type, payload } = JSON.parse(event.data);
				this.dispatch(type, payload);
			} catch (e) {
				console.error('WS Parse Error', e);
			}
		};

		this.socket.onopen = () => {
			console.log('WS Connected');
			this.dispatch('CONNECTED', {});
		};

		this.socket.onclose = () => {
			console.log('WS Disconnected');
			this.dispatch('DISCONNECTED', {});
		};
	}

	disconnect() {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
	}

	send<T>(type: string, payload: T) {
		if (this.connected()) {
			this.socket?.send(JSON.stringify({ type, payload }));
		} else {
			console.warn('Socket not open, cannot send', type);
		}
	}

	on<T>(type: string, handler: MessageHandler<T>) {
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
