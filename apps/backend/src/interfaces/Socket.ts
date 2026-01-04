export interface Socket {
	roomId?: string;
	userId?: string;
	username?: string;
	dbUserId?: number;
	isAlive: boolean;
	readyState: number;

	send(data: string): void;
	terminate(): void;
	ping(): void;

	// biome-ignore lint/suspicious/noExplicitAny: critically needed
	on(event: string, listener: (...args: any[]) => void): this;
}
