import {
	calculateResultHash,
	RaceModeEnum,
	type RoomConfig,
	RoomStatusEnum,
	type SocketAction,
	SocketActionEnum,
	SocketEventEnum,
} from '@qwertix/room-contracts';
import type { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { v4 as uuid } from 'uuid';
import { WebSocket } from 'ws';
import { Room } from '@/domain/room/Room';
import type { Socket } from '@/interfaces/Socket';
import type { SocketServer } from '@/interfaces/SocketServer';
import { AuthService } from '@/services/AuthService';
import { RoomService } from '@/services/RoomService';
import { env } from '../env';
import { ResultService } from '../services/ResultService';
import type { ResultPayload } from './ResultPayload';

/**
 * Manages WebSocket connections and handles real-time game events.
 */
export class SocketManager {
	private roomDeletionTimers = new Map<string, NodeJS.Timeout>();

	constructor(
		private socketServer: SocketServer,
		private roomService: RoomService,
		private logger: FastifyBaseLogger,
		private resultService: ResultService,
		private fastifyApp: FastifyInstance,
		private authService: AuthService,
	) {
		this.setupHeartbeat();
		this.socketServer.on('connection', (ws: Socket) => {
			this.logger.info('New WebSocket connection');
			ws.isAlive = true;
			ws.on('pong', () => {
				ws.isAlive = true;
			});

			ws.on('message', async (data) => {
				try {
					const message = JSON.parse(data.toString()) as SocketAction;
					await this.handleMessage(ws, message);
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

	private async handleMessage(ws: Socket, msg: SocketAction) {
		switch (msg.type) {
			case SocketActionEnum.JOIN_ROOM:
				await this.handleJoinRoom(ws, msg.payload);
				break;
			case SocketActionEnum.START_RACE:
				await this.handleStartRace(ws);
				break;
			case SocketActionEnum.UPDATE_PROGRESS:
				await this.handleUpdateProgress(ws, msg.payload);
				break;
			case SocketActionEnum.UPDATE_SETTINGS:
				await this.handleUpdateSettings(ws, msg.payload);
				break;
			case SocketActionEnum.TRANSFER_HOST:
				await this.handleTransferHost(ws, msg.payload);
				break;
			case SocketActionEnum.LOAD_MORE_WORDS:
				await this.handleLoadMoreWords(ws);
				break;
			case SocketActionEnum.SUBMIT_RESULT:
				await this.handleSubmitResult(ws, msg.payload);
				break;
			case SocketActionEnum.LEAVE_ROOM:
				await this.handleDisconnect(ws);
				break;
			case SocketActionEnum.RESTART_GAME:
				await this.handleRestartGame(ws);
				break;
		}
	}

	/**
	 * Handles the RESTART_GAME action.
	 * Resets the room state and generates new text for the next race.
	 */
	private async handleRestartGame(ws: Socket) {
		if (!ws.roomId || !ws.userId) return;
		const room = await this.roomService.get(ws.roomId);
		if (!room) return;

		const participant = room.participants().get(ws.userId);
		if (!participant?.isHost) {
			this.send(ws, SocketEventEnum.ERROR, {
				message: 'Only host can restart game',
			});
			return;
		}

		// Reset room state
		if (await this.roomService.restartRoom(ws.roomId)) {
			// Get updated room to broadcast new text
			const updatedRoom = await this.roomService.get(ws.roomId);
			if (updatedRoom) {
				this.broadcastToRoom(
					updatedRoom,
					SocketEventEnum.ROOM_UPDATE,
					updatedRoom.toDTO(),
				);
			}
		}
	}

	/**
	 * Handles the UPDATE_SETTINGS action.
	 * Updates the room configuration (only by host).
	 */
	private async handleUpdateSettings(ws: Socket, config: RoomConfig) {
		if (!ws.roomId || !ws.userId) return;
		const room = await this.roomService.get(ws.roomId);
		if (!room) return;

		const participant = room.participants().get(ws.userId);
		if (!participant?.isHost) {
			this.send(ws, SocketEventEnum.ERROR, {
				message: 'Only host can change settings',
			});
			return;
		}

		if (await this.roomService.updateRoomConfig(ws.roomId, config)) {
			this.broadcastToRoom(room, SocketEventEnum.ROOM_UPDATE, room.toDTO());
		}
	}

	/**
	 * Handles the TRANSFER_HOST action.
	 * Transfers host privileges to another user.
	 */
	private async handleTransferHost(ws: Socket, payload: { targetId: string }) {
		if (!ws.roomId || !ws.userId) return;
		const room = await this.roomService.get(ws.roomId);
		if (!room) return;

		const sender = room.participants().get(ws.userId);
		if (!sender?.isHost) {
			this.send(ws, SocketEventEnum.ERROR, {
				message: 'Only host can transfer role',
			});
			return;
		}

		if (room.transferHost(payload.targetId)) {
			this.broadcastToRoom(room, SocketEventEnum.ROOM_UPDATE, room.toDTO());
			// Optionally send individual notification
			const targetWs = Array.from(this.socketServer.clients).find(
				(c) => c.userId === payload.targetId,
			);
			if (targetWs) {
				this.send(targetWs, SocketEventEnum.HOST_PROMOTED, {
					message: 'You are now the host',
				});
			}
		}
	}

	/**
	 * Handles the JOIN_ROOM action.
	 * Adds a user to a room and broadcasts the update.
	 */
	private async handleJoinRoom(
		ws: Socket,
		payload: { roomId: string; username: string; token?: string },
	) {
		const { roomId, username, token } = payload;

		// Cancel deletion timer if it exists
		const existingTimer = this.roomDeletionTimers.get(roomId);
		if (existingTimer) {
			clearTimeout(existingTimer);
			this.roomDeletionTimers.delete(roomId);
		}

		// 1. Check if already in this room
		if (ws.roomId === roomId && ws.userId) {
			const room = await this.roomService.get(roomId);
			if (room) {
				const participant = room.participants().get(ws.userId);
				// If username matches, reuse existing session
				if (participant && participant.username === username) {
					this.send(ws, SocketEventEnum.ROOM_STATE, room.toDTO());
					return;
				}
			}
		}

		// 2. Cleanup previous session if in ANY room
		if (ws.roomId && ws.userId) {
			await this.handleDisconnect(ws);
		}

		const room = await this.roomService.get(roomId);

		if (!room) {
			this.send(ws, SocketEventEnum.ERROR, { message: 'Room not found' });
			return;
		}

		let resolvedUsername = username;

		if (token) {
			try {
				const decoded = this.fastifyApp.jwt.verify<{ id: string }>(token);
				ws.dbUserId = decoded.id;

				const dbUser = await this.authService.getUserById(decoded.id);
				if (dbUser) {
					resolvedUsername = dbUser.username;
				}
			} catch {
				this.logger.warn('Invalid token in JOIN_ROOM');
			}
		}

		const userId = uuid();

		ws.roomId = roomId;
		ws.userId = userId;
		ws.username = resolvedUsername;

		const participant = room.addParticipant(
			userId,
			resolvedUsername,
			ws.dbUserId,
		);

		// Notify user of success and current state
		this.send(ws, SocketEventEnum.ROOM_STATE, room.toDTO());

		// Broadcast to others
		this.broadcastToRoom(
			room,
			SocketEventEnum.PLAYER_JOINED,
			participant.toDTO(),
		);
	}

	/**
	 * Handles the START_RACE action.
	 * Initiates the countdown and then starts the race.
	 */
	private async handleStartRace(ws: Socket) {
		if (!ws.roomId || !ws.userId) return;
		const room = await this.roomService.get(ws.roomId);
		if (!room) return;

		const participant = room.participants().get(ws.userId);
		if (!participant?.isHost) {
			this.send(ws, SocketEventEnum.ERROR, {
				message: 'Only host can start race',
			});
			return;
		}

		room.startRace(); // Sets status to COUNTDOWN
		const countdownStartTime = Date.now(); // Use current time for frontend calculation
		this.broadcastToRoom(room, SocketEventEnum.COUNTDOWN_START, {
			startTime: countdownStartTime,
		});

		// Start timer for actual start (3 seconds later)
		setTimeout(() => {
			room.startRacing();
			this.broadcastToRoom(room, SocketEventEnum.RACE_START, {});

			// Handle automatic termination for TIME mode
			const config = room.config();
			if (config.mode === RaceModeEnum.TIME && config.duration) {
				setTimeout(() => {
					this.terminateRace(room);
				}, config.duration * 1000);
			}
		}, 3000);
	}

	/**
	 * Handles the UPDATE_PROGRESS action.
	 * Updates a participant's progress and checks for race completion.
	 */
	private async handleUpdateProgress(
		ws: Socket,
		payload: { typedLength: number },
	) {
		if (!ws.roomId || !ws.userId) return;
		const room = await this.roomService.get(ws.roomId);
		if (!room || room.status() !== RoomStatusEnum.RACING) return;

		const statusBefore = room.status();
		room.updateParticipantProgress(ws.userId, payload.typedLength);
		const statusAfter = room.status();

		this.broadcastToRoom(
			room,
			SocketEventEnum.PROGRESS_UPDATE,
			Array.from(room.participants().values()).map((p) => p.toDTO()),
		);

		// If Room logic finished the race (e.g. all players finished)
		if (
			statusBefore === RoomStatusEnum.RACING &&
			statusAfter === RoomStatusEnum.FINISHED
		) {
			this.broadcastFinish(room);
			return;
		}

		// If ANY player finishes, end the race for everyone immediately (WORDS mode)
		if (room.participants().get(ws.userId)?.finishedAt) {
			this.terminateRace(room);
		}
	}

	private terminateRace(room: Room) {
		if (room.status() !== RoomStatusEnum.RACING) return;

		room.finishRacing();
		this.broadcastFinish(room);
	}

	private broadcastFinish(room: Room) {
		this.broadcastToRoom(room, SocketEventEnum.RACE_FINISHED, {
			leaderboard: Array.from(room.participants().values())
				.map((p) => p.toDTO())
				.sort((a, b) => (a.rank || 999) - (b.rank || 999)),
		});
	}

	/**
	 * Handles the SUBMIT_RESULT action.
	 * Validates the result authoritatively and saves it to the database.
	 */
	private async handleSubmitResult(ws: Socket, payload: ResultPayload) {
		try {
			const room = ws.roomId ? await this.roomService.get(ws.roomId) : null;
			if (!room || !ws.userId) {
				this.send(ws, SocketEventEnum.ERROR, {
					message: 'Room not found for result submission',
				});
				return;
			}

			// 1. Verify Hash
			const calculatedHash = await calculateResultHash(
				payload.wpm,
				payload.raw,
				payload.accuracy,
				payload.consistency,
				payload.startTime,
				payload.endTime,
				room.text().join(' '),
				env.RESULT_HASH_SALT,
			);

			if (calculatedHash !== payload.hash) {
				this.send(ws, SocketEventEnum.ERROR, {
					message: 'Invalid result hash',
				});
				return;
			}

			// Authoritative calculation on backend
			const stats = room.getParticipantFinalStats(
				ws.userId,
				payload.replayData,
			);

			if (!stats) {
				this.send(ws, SocketEventEnum.ERROR, {
					message: 'Failed to calculate stats',
				});
				return;
			}

			// Update participant in room with authoritative stats
			room.updateParticipantStats(ws.userId, {
				wpm: stats.wpm,
				accuracy: stats.accuracy,
			});

			// Broadcast update to everyone so they see the final authoritative stats
			this.broadcastToRoom(room, SocketEventEnum.ROOM_UPDATE, room.toDTO());

			await this.resultService.saveResult(
				ws.dbUserId || null,
				room.presetId() || null,
				stats.wpm,
				stats.raw,
				stats.accuracy,
				Math.round(payload.consistency),
				payload.replayData,
				room.text().join(' '),
				payload.hash,
			);
			this.send(ws, SocketEventEnum.RESULT_SAVED, {
				success: true,
				stats: {
					wpm: stats.wpm,
					accuracy: stats.accuracy,
					raw: stats.raw,
				},
			});
		} catch (e) {
			this.logger.error(e, 'Failed to save result');
			this.send(ws, SocketEventEnum.ERROR, {
				message: 'Failed to save result',
			});
		}
	}

	/**
	 * Handles the LOAD_MORE_WORDS action.
	 * Appends more words to the room's text buffer.
	 */
	private async handleLoadMoreWords(ws: Socket) {
		if (!ws.roomId || !ws.userId) return;
		const room = await this.roomService.get(ws.roomId);
		if (!room) return;

		const newWords = await this.roomService.appendWordsToRoom(ws.roomId, 20);

		if (newWords) {
			this.broadcastToRoom(room, SocketEventEnum.WORDS_APPENDED, {
				words: newWords,
			});
		}
	}

	/**
	 * Handles client disconnection.
	 * Removes the user from the room and updates the room state.
	 */
	private async handleDisconnect(ws: Socket) {
		const roomId = ws.roomId;
		const userId = ws.userId;

		if (roomId && userId) {
			const room = await this.roomService.get(roomId);
			if (room) {
				const participant = room.participants().get(userId);
				if (participant) {
					const wasHost = participant.isHost;
					room.removeParticipant(userId);
					this.broadcastToRoom(room, SocketEventEnum.PLAYER_LEFT, {
						userId: userId,
					});

					if (room.participants().size === 0) {
						// Schedule deletion with 10s grace period
						const timer = setTimeout(async () => {
							await this.roomService.delete(roomId);
							this.roomDeletionTimers.delete(roomId);
						}, 10000);
						this.roomDeletionTimers.set(roomId, timer);
					} else {
						this.broadcastToRoom(
							room,
							SocketEventEnum.ROOM_UPDATE,
							room.toDTO(),
						);

						// Notify new host if role changed
						if (wasHost) {
							const newHost = Array.from(room.participants().values()).find(
								(p) => p.isHost,
							);
							if (newHost) {
								const hostWs = Array.from(this.socketServer.clients).find(
									(c) => c.userId === newHost.socketId,
								);
								if (hostWs) {
									this.send(hostWs, SocketEventEnum.HOST_PROMOTED, {
										message: 'You are now the host',
									});
								}
							}
						}
					}
				}
			}
			// Clear session data
			ws.roomId = undefined;
			ws.userId = undefined;
			ws.username = undefined;
		}
	}

	private send(ws: Socket, type: SocketEventEnum, payload: unknown) {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type, payload }));
		}
	}

	private broadcastToRoom(room: Room, type: SocketEventEnum, payload: unknown) {
		for (const client of this.socketServer.clients) {
			if (client.roomId === room.id() && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({ type, payload }));
			}
		}
	}

	private setupHeartbeat() {
		const interval = setInterval(() => {
			for (const client of this.socketServer.clients) {
				if (client.isAlive === false) return client.terminate();
				client.isAlive = false;
				client.ping();
			}
		}, 30000);

		this.socketServer.on('close', () => {
			clearInterval(interval);
		});
	}
}
