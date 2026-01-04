import type { User } from '../../src/db/schema';
import type { UserRepository } from '../../src/repositories/interfaces/UserRepository';

export class FakeUserRepository implements UserRepository {
	private users = new Map<string, User>(); // email -> user
	private nextId = 1;

	async findByEmail(email: string): Promise<User | undefined> {
		return this.users.get(email);
	}

	async create(data: {
		email: string;
		username: string;
		passwordHash: string;
		role?: string;
	}): Promise<User> {
		const user: User = {
			id: this.nextId++,
			email: data.email,
			username: data.username,
			passwordHash: data.passwordHash,
			role: data.role ?? 'user',
			createdAt: new Date(),
		};
		this.users.set(data.email, user);
		return user;
	}

	async count(): Promise<number> {
		return this.users.size;
	}
}
