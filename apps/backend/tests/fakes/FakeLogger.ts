import type { FastifyBaseLogger } from 'fastify';

export class FakeLogger implements FastifyBaseLogger {
	level: string = 'info';
	silent = () => {};
	info = () => {};
	warn = () => {};
	error = () => {};
	fatal = () => {};
	trace = () => {};
	debug = () => {};
	child = () => this;
}
