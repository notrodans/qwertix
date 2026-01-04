import { count, eq } from 'drizzle-orm';
import { DataBase } from '@/db';
import { type User, users } from '@/db/schema';
import type { UserRepository } from '../interfaces/UserRepository';

/**
 * Drizzle implementation of UserRepository.
 */
export class DrizzleUserRepository implements UserRepository {
	constructor(private db: DataBase) {}

	/**
	 * Finds a user by their email.
	 * @param email - The email of the user.
	 * @returns The user if found, otherwise undefined.
	 */
	async findByEmail(email: string): Promise<User | undefined> {
		const result = await this.db.source
			.select()
			.from(users)
			.where(eq(users.email, email))
			.execute();
		return result[0];
	}

	/**
	 * Creates a new user in the database.
	 * @param data - The user data.
	 * @returns The created user.
	 */
	async create(data: {
		email: string;
		username: string;
		passwordHash: string;
		role?: string;
	}): Promise<User> {
		const result = await this.db.source
			.insert(users)
			.values({
				email: data.email,
				username: data.username,
				passwordHash: data.passwordHash,
				role: data.role ?? 'user',
			})
			.returning()
			.execute();
		const user = result[0];
		if (!user) {
			throw new Error('Failed to create user');
		}
		return user;
	}

	/**
	 * Counts the total number of users.
	 * @returns The number of users.
	 */
	async count(): Promise<number> {
		const result = await this.db.source.select({ count: count() }).from(users);
		return result[0]?.count ?? 0;
	}
}
