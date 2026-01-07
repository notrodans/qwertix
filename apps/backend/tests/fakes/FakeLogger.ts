import type { FastifyBaseLogger } from 'fastify';

export class FakeLogger implements FastifyBaseLogger {
	level: string = 'info';
	silent = () => {};
	info = (..._args: unknown[]) => {};
	warn = (..._args: unknown[]) => {};
	error = (..._args: unknown[]) => {};
	fatal = (..._args: unknown[]) => {};
	trace = (..._args: unknown[]) => {};
	debug = (..._args: unknown[]) => {};
	child = () => this;
}
