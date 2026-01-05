import type { User } from '@/db/schema';

export interface UserRepository {
	findById(id: string): Promise<User | undefined>;
	findByEmail(email: string): Promise<User | undefined>;
	create(user: {
		email: string;
		username: string;
		passwordHash: string;
		role?: 'admin' | 'user';
	}): Promise<User>;
	count(): Promise<number>;
}
