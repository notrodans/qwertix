import cors from '@fastify/cors';
import { config } from 'dotenv';
import Fastify from 'fastify';
import { v4 as uuid } from 'uuid';
import { WebSocketServer } from 'ws';
import db from '@/db';
import { users } from '@/db/schema';

config();

export const app = Fastify();

app.register(cors);

app.get('/health', async (_req, _reply) => {
	return { status: 'ok', timestamp: new Date().toISOString() };
});

const WORDS = [
	'the',
	'be',
	'of',
	'and',
	'a',
	'to',
	'in',
	'he',
	'have',
	'it',
	'that',
	'for',
	'they',
	'i',
	'with',
	'as',
	'not',
	'on',
	'she',
	'at',
	'by',
	'this',
	'we',
	'you',
	'do',
	'but',
	'from',
	'or',
	'which',
	'one',
	'would',
	'all',
	'will',
	'there',
	'say',
	'who',
	'make',
	'when',
	'can',
	'more',
	'if',
	'no',
	'man',
	'out',
	'other',
	'so',
	'what',
	'time',
	'up',
	'go',
	'about',
	'than',
	'into',
	'could',
	'state',
	'only',
	'new',
	'year',
	'some',
	'take',
	'come',
	'these',
	'know',
	'see',
	'use',
	'get',
	'like',
	'then',
	'first',
	'any',
	'work',
	'now',
	'may',
	'such',
	'give',
	'over',
	'think',
	'most',
	'even',
	'find',
	'day',
	'also',
	'after',
	'way',
	'many',
	'must',
	'look',
	'before',
	'great',
	'back',
	'through',
	'long',
	'where',
	'much',
	'should',
	'well',
	'people',
	'down',
	'own',
	'just',
	'because',
	'good',
	'each',
	'those',
	'feel',
	'seem',
	'how',
	'high',
	'too',
	'place',
	'little',
	'world',
	'very',
	'still',
	'nation',
	'hand',
	'old',
	'life',
	'tell',
	'write',
	'become',
	'here',
	'show',
	'house',
	'both',
	'between',
	'need',
	'mean',
	'call',
	'develop',
	'under',
	'last',
	'right',
	'move',
	'thing',
	'general',
	'school',
	'never',
	'same',
	'another',
	'begin',
	'while',
	'number',
	'part',
	'turn',
	'real',
	'leave',
	'might',
	'want',
	'point',
];

app.get('/words', async (_req, _reply) => {
	const shuffled = [...WORDS].sort(() => 0.5 - Math.random());
	const selected = shuffled.slice(0, 30);
	return selected;
});

app.post('/users', async (_req, _reply) => {
	const user = await db
		.insert(users)
		.values({
			email: `notrodans-${uuid()}-@gmail.com`,
			username: 'notrodans',
		})
		.returning();
	console.log('Successfully created');
	return { success: true, data: user };
});

const wss = new WebSocketServer({ server: app.server });

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