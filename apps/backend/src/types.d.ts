import 'ws';

declare module 'ws' {
	interface WebSocket {
		roomId?: string;
		userId?: string;
		username?: string;
		dbUserId?: number;
		isAlive: boolean;
	}
}
