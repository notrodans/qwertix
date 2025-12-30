import { RaceModeEnum, type RoomConfig } from '@qwertix/room-contracts';
import type { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { v4 as uuid } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';
import { Room } from '../domain/room';
import { ResultService } from '../services/result.service';
import { RoomManager } from './room.manager';

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
				this.handleUpdateProgress(ws, msg.payload as { typedLength: number });
				break;
			case 'UPDATE_SETTINGS':
				this.handleUpdateSettings(ws, msg.payload as RoomConfig);
				break;
			case 'TRANSFER_HOST':
				this.handleTransferHost(ws, msg.payload as { targetId: string });
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
			case 'RESTART_GAME':
				this.handleRestartGame(ws);
				break;
		}
	}

	private handleRestartGame(ws: ExtendedWebSocket) {
		if (!ws.roomId || !ws.userId) return;
		const room = this.roomManager.getRoom(ws.roomId);
		if (!room) return;

		const participant = room.participants().get(ws.userId);
		if (!participant?.isHost) {
			this.send(ws, 'ERROR', { message: 'Only host can restart game' });
			return;
		}

		// Reset room state
		room.restart(); // Need to implement this in Room class
		this.broadcastToRoom(room, 'ROOM_UPDATE', room.toDTO());
	}

	private handleUpdateSettings(ws: ExtendedWebSocket, config: RoomConfig) {
		if (!ws.roomId || !ws.userId) return;
		const room = this.roomManager.getRoom(ws.roomId);
		if (!room) return;

		const participant = room.participants().get(ws.userId);
		if (!participant?.isHost) {
			this.send(ws, 'ERROR', { message: 'Only host can change settings' });
			return;
		}

		if (this.roomManager.updateRoomConfig(ws.roomId, config)) {
			this.broadcastToRoom(room, 'ROOM_UPDATE', room.toDTO());
		}
	}

	private handleTransferHost(
		ws: ExtendedWebSocket,
		payload: { targetId: string },
	) {
		if (!ws.roomId || !ws.userId) return;
		const room = this.roomManager.getRoom(ws.roomId);
		if (!room) return;

		const sender = room.participants().get(ws.userId);
		if (!sender?.isHost) {
			this.send(ws, 'ERROR', { message: 'Only host can transfer role' });
			return;
		}

		if (room.transferHost(payload.targetId)) {
			this.broadcastToRoom(room, 'ROOM_UPDATE', room.toDTO());
			// Optionally send individual notification
			const targetWs = Array.from(this.wss.clients).find(
				(c) => (c as ExtendedWebSocket).userId === payload.targetId,
			);
			if (targetWs) {
				this.send(targetWs, 'HOST_PROMOTED', {
					message: 'You are now the host',
				});
			}
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

		const participant = room.participants().get(ws.userId);
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

			// Handle automatic termination for TIME mode
			const config = room.config();
			if (config.mode === RaceModeEnum.TIME && config.duration) {
				setTimeout(() => {
					this.terminateRace(room);
				}, config.duration * 1000);
			}
		}, 5000);
	}

	private terminateRace(room: Room) {
		if (room.status() !== 'RACING') return;

		room.finishRacing();
		this.broadcastToRoom(room, 'RACE_FINISHED', {
			leaderboard: Array.from(room.participants().values()).sort(
				(a, b) => (a.rank || 999) - (b.rank || 999),
			),
		});
	}

	private handleUpdateProgress(
		ws: ExtendedWebSocket,
		payload: { typedLength: number },
	) {
		if (!ws.roomId || !ws.userId) return;
		const room = this.roomManager.getRoom(ws.roomId);
		if (!room || room.status() !== 'RACING') return;

		room.updateProgress(ws.userId, payload.typedLength);

		this.broadcastToRoom(
			room,
			'PROGRESS_UPDATE',
			Array.from(room.participants().values()),
		);

		if (room.participants().get(ws.userId)?.finishedAt) {
			const allFinished = Array.from(room.participants().values()).every(
				(p) => p.finishedAt !== null,
			);
			if (allFinished) {
				room.finishRacing();
				this.broadcastToRoom(room, 'RACE_FINISHED', {
					leaderboard: Array.from(room.participants().values()).sort(
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
			if (!room || !ws.userId) {
				this.send(ws, 'ERROR', {
					message: 'Room not found for result submission',
				});
				return;
			}

			// Authoritative calculation on backend
			const stats = room.getParticipantFinalStats(
				ws.userId,
				payload.replayData,
			);

			if (!stats) {
				this.send(ws, 'ERROR', { message: 'Failed to calculate stats' });
				return;
			}

			await this.resultService.saveResult(
				ws.dbUserId || null,
				room.presetId() || null,
				stats.wpm,
				stats.raw,
				stats.accuracy,
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
				const wasHost = room.participants().get(ws.userId)?.isHost;
				room.removeParticipant(ws.userId);
				this.broadcastToRoom(room, 'PLAYER_LEFT', { userId: ws.userId });

				if (room.participants().size === 0) {
					this.roomManager.deleteRoom(ws.roomId);
				} else {
					this.broadcastToRoom(room, 'ROOM_UPDATE', room.toDTO());

					// Notify new host if role changed
					if (wasHost) {
						const newHost = Array.from(room.participants().values()).find(
							(p) => p.isHost,
						);
						if (newHost) {
							const hostWs = Array.from(this.wss.clients).find(
								(c) => (c as ExtendedWebSocket).userId === newHost.socketId,
							);
							if (hostWs) {
								this.send(hostWs, 'HOST_PROMOTED', {
									message: 'You are now the host',
								});
							}
						}
					}
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
			if (extWs.roomId === room.id() && extWs.readyState === WebSocket.OPEN) {
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
