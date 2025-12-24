import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { v4 as uuid } from 'uuid';
import { WebSocketServer } from 'ws';
import db from '@/db';
import { users } from '@/db/schema';

config();

export const app = express();
export const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/users', async (_req, res) => {
	const user = await db
		.insert(users)
		.values({
			email: `notrodans-${uuid()}-@gmail.com`,
			username: 'notrodans',
		})
		.returning();
	console.log('Successfully created');
	res.json({ success: true, data: user });
});

wss.on('connection', (ws) => {
	console.log('New WebSocket connection');

	ws.on('message', (message) => {
		console.log('Received:', message.toString());
		ws.send(`Echo: ${message}`);
	});

	ws.on('close', () => {
		console.log('Client disconnected');
	});
});
