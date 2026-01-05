import 'ws';

declare module 'ws' {
	interface WebSocket {
		roomId?: string;
		userId?: string;
		username?: string;
		dbUserId?: string;
		isAlive: boolean;
	}
}
