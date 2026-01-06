import { UserRoleEnum } from '@qwertix/room-contracts';
import type { User } from '@/db/schema';

export interface UserRepository {
	findByEmail(email: string): Promise<User | undefined>;
	findById(id: string): Promise<User | undefined>;
	create(data: {
		email: string;
		username: string;
		passwordHash: string;
		role?: UserRoleEnum;
	}): Promise<User>;
	count(): Promise<number>;
}
