import type { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { v4 as uuid } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';
import { Room } from '../domain/room';
import { ResultService } from '../services/result.service';
import { RoomManager } from './room-manager';

interface ExtendedWebSocket extends WebSocket {
	roomId?: string;
	userId?: string;
	username?: string;
	dbUserId?: number; // Authenticated User ID
	isAlive: boolean;
}

interface ResultPayload {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: { key: string; timestamp: number }[]; // Data structure for replay events
}

export class SocketManager {
	constructor(
		private wss: WebSocketServer,
		private roomManager: RoomManager,
		private logger: FastifyBaseLogger,
		private resultService: ResultService,
		private app: FastifyInstance,
	) {
		this.setupHeartbeat();
		this.wss.on('connection', (ws: ExtendedWebSocket) => {
			this.logger.info('New WebSocket connection');
			ws.isAlive = true;
			ws.on('pong', () => {
				ws.isAlive = true;
			});

			ws.on('message', (data) => {
				try {
					const message = JSON.parse(data.toString());
					this.handleMessage(ws, message);
				} catch (e) {
					this.logger.error(e, 'Failed to parse message');
				}
			});

			ws.on('close', () => {
				this.logger.info('Client disconnected');
				this.handleDisconnect(ws);
			});
		});
	}

	private handleMessage(ws: ExtendedWebSocket, message: unknown) {
		const msg = message as { type: string; payload: unknown };
		switch (msg.type) {
			case 'JOIN_ROOM':
				this.handleJoinRoom(
					ws,
					msg.payload as { roomId: string; username: string; token?: string },
				);
				break;
			case 'START_RACE':
				this.handleStartRace(ws);
				break;
			case 'UPDATE_PROGRESS':
				this.handleUpdateProgress(
					ws,
					msg.payload as { progress: number; wpm: number },
				);
				break;
			case 'LOAD_MORE_WORDS':
				this.handleLoadMoreWords(ws);
				break;
			case 'SUBMIT_RESULT':
				this.handleSubmitResult(ws, msg.payload as ResultPayload);
				break;
			case 'LEAVE_ROOM':
				this.handleDisconnect(ws);
				break;
		}
	}

	private handleJoinRoom(
		ws: ExtendedWebSocket,
		payload: { roomId: string; username: string; token?: string },
	) {
		const { roomId, username, token } = payload;
		const room = this.roomManager.getRoom(roomId);

		if (!room) {
			this.send(ws, 'ERROR', { message: 'Room not found' });
			return;
		}

		// Verify Token
		if (token) {
			try {
				const decoded = this.app.jwt.verify<{ id: number }>(token);
				ws.dbUserId = decoded.id;
			} catch {
				this.logger.warn('Invalid token in JOIN_ROOM');
			}
		}

		// Generate a user ID (Session ID)
		const userId = uuid();

		ws.roomId = roomId;
		ws.userId = userId;
		ws.username = username;

		const participant = room.addParticipant(userId, username);

		// Notify user of success and current state
		this.send(ws, 'ROOM_STATE', room.toDTO());

		// Broadcast to others
		this.broadcastToRoom(room, 'PLAYER_JOINED', participant);
	}

	private handleStartRace(ws: ExtendedWebSocket) {
		if (!ws.roomId || !ws.userId) return;
		const room = this.roomManager.getRoom(ws.roomId);
		if (!room) return;

		const participant = room.participants.get(ws.userId);
		if (!participant?.isHost) {
			this.send(ws, 'ERROR', { message: 'Only host can start race' });
			return;
		}

		room.startRace(); // Sets status to COUNTDOWN
		this.broadcastToRoom(room, 'COUNTDOWN_START', {
			startTime: Date.now() + 5000,
		}); // 5s countdown

		// Start timer for actual start
		setTimeout(() => {
			room.startRacing();
			this.broadcastToRoom(room, 'RACE_START', {});
		}, 5000);
	}

	private handleUpdateProgress(
		ws: ExtendedWebSocket,
		payload: { progress: number; wpm: number },
	) {
		if (!ws.roomId || !ws.userId) return;
		const room = this.roomManager.getRoom(ws.roomId);
		if (!room || room.status !== 'RACING') return;

		room.updateProgress(ws.userId, payload.progress, payload.wpm);

		this.broadcastToRoom(
			room,
			'PROGRESS_UPDATE',
			Array.from(room.participants.values()),
		);

		if (room.participants.get(ws.userId)?.finishedAt) {
			const allFinished = Array.from(room.participants.values()).every(
				(p) => p.finishedAt !== null,
			);
			if (allFinished) {
				room.status = 'FINISHED';
				this.broadcastToRoom(room, 'RACE_FINISHED', {
					leaderboard: Array.from(room.participants.values()).sort(
						(a, b) => (a.rank || 999) - (b.rank || 999),
					),
				});
			}
		}
	}

	private async handleSubmitResult(
		ws: ExtendedWebSocket,
		payload: ResultPayload,
	) {
		try {
			const room = ws.roomId ? this.roomManager.getRoom(ws.roomId) : null;
			await this.resultService.saveResult(
				ws.dbUserId || null,
				room?.presetId || null,
				payload.wpm,
				payload.raw,
				payload.accuracy,
				payload.consistency,
				payload.replayData,
			);
			this.send(ws, 'RESULT_SAVED', { success: true });
		} catch (e) {
			this.logger.error(e, 'Failed to save result');
			this.send(ws, 'ERROR', { message: 'Failed to save result' });
		}
	}

	private handleLoadMoreWords(ws: ExtendedWebSocket) {
		if (!ws.roomId || !ws.userId) return;
		const room = this.roomManager.getRoom(ws.roomId);
		if (!room) return;

		const newWords = this.roomManager.appendWordsToRoom(ws.roomId, 20);

		if (newWords) {
			this.broadcastToRoom(room, 'WORDS_APPENDED', { words: newWords });
		}
	}

	private handleDisconnect(ws: ExtendedWebSocket) {
		if (ws.roomId && ws.userId) {
			const room = this.roomManager.getRoom(ws.roomId);
			if (room) {
				room.removeParticipant(ws.userId);
				this.broadcastToRoom(room, 'PLAYER_LEFT', { userId: ws.userId });

				if (room.participants.size === 0) {
					this.roomManager.deleteRoom(ws.roomId);
				} else {
					this.broadcastToRoom(room, 'ROOM_UPDATE', room.toDTO());
				}
			}
		}
	}

	private send(ws: WebSocket, type: string, payload: unknown) {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type, payload }));
		}
	}

	private broadcastToRoom(room: Room, type: string, payload: unknown) {
		for (const client of this.wss.clients) {
			const extWs = client as ExtendedWebSocket;
			if (extWs.roomId === room.id && extWs.readyState === WebSocket.OPEN) {
				extWs.send(JSON.stringify({ type, payload }));
			}
		}
	}

	private setupHeartbeat() {
		const interval = setInterval(() => {
			for (const client of this.wss.clients) {
				const extWs = client as ExtendedWebSocket;
				if (extWs.isAlive === false) return client.terminate();
				extWs.isAlive = false;
				client.ping();
			}
		}, 30000);

		this.wss.on('close', () => {
			clearInterval(interval);
		});
	}
}
