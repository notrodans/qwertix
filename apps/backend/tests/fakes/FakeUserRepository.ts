import type { User } from '../../src/db/schema';
import type { UserRepository } from '../../src/repositories/interfaces/UserRepository';

export class FakeUserRepository implements UserRepository {
	private users = new Map<string, User>(); // email -> user

	async findByEmail(email: string): Promise<User | undefined> {
		return this.users.get(email);
	}

	async findById(id: string): Promise<User | undefined> {
		return Array.from(this.users.values()).find((u) => u.id === id);
	}

	async create(data: {
		email: string;
		username: string;
		passwordHash: string;
		role?: 'admin' | 'user';
	}): Promise<User> {
		const user: User = {
			id: crypto.randomUUID(),
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
