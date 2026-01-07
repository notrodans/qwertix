import { EventEmitter } from 'node:events';
import type { Socket } from '../../src/interfaces/Socket';
import type { SocketServer } from '../../src/interfaces/SocketServer';

export class FakeWebSocket extends EventEmitter implements Socket {
	readyState = 1; // OPEN
	sentMessages: string[] = [];

	roomId?: string;
	userId?: string;
	username?: string;
	dbUserId?: string;
	isAlive = true;

	send(data: string) {
		this.sentMessages.push(data);
	}

	terminate() {
		this.emit('close');
	}

	ping() {
		// no-op
	}
}

export class FakeWebSocketServer extends EventEmitter implements SocketServer {
	constructor() {
		super();
	}

	clients = new Set<FakeWebSocket>();

	handleConnection(ws: FakeWebSocket) {
		this.clients.add(ws);
		this.emit('connection', ws);
	}
}
