import type { Socket } from './Socket';

export interface SocketServer {
	clients: Iterable<Socket>;
	on(event: 'connection', listener: (socket: Socket) => void): this;
	on(event: 'close', listener: () => void): this;
}
