import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DataBase } from '@/db';
import { users } from '@/db/schema';

export class AuthService {
	constructor(private db: DataBase) {}

	async validateLocalUser(email: string, password: string) {
		const user = await this.db.source
			.select()
			.from(users)
			.where(eq(users.email, email))
			.execute();
		if (!user[0]) return null;

		const isValid = await bcrypt.compare(password, user[0].passwordHash);
		return isValid ? user[0] : null;
	}

	async createUser(
		email: string,
		username: string,
		password: string,
		role = 'user',
	) {
		const hash = await bcrypt.hash(password, 10);
		const user = await this.db.source
			.insert(users)
			.values({
				email,
				username,
				passwordHash: hash,
				role,
			})
			.returning()
			.execute();
		return user[0];
	}
}
