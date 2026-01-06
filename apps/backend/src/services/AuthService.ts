import { UserRoleEnum } from '@qwertix/room-contracts';
import bcrypt from 'bcryptjs';
import { type User } from '@/db/schema';
import type { UserRepository } from '@/repositories/interfaces/UserRepository';

/**
 * Service for handling authentication and user management.
 */
export class AuthService {
	constructor(private userRepo: UserRepository) {}

	/**
	 * Validates a user's credentials against the local database.
	 * @param email - The email of the user.
	 * @param password - The plain text password.
	 * @returns The user object if validation succeeds, null otherwise.
	 */
	async validateLocalUser(
		email: string,
		password: string,
	): Promise<User | null> {
		const user = await this.userRepo.findByEmail(email);
		if (!user) return null;

		const isValid = await bcrypt.compare(password, user.passwordHash);
		return isValid ? user : null;
	}

	/**
	 * Finds a user by ID.
	 * @param id - The ID of the user.
	 * @returns The user object if found.
	 */
	async getUserById(id: string): Promise<User | undefined> {
		return await this.userRepo.findById(id);
	}

	/**
	 * Creates a new user with a hashed password.
	 * @param email - The email address of the new user.
	 * @param username - The username of the new user.
	 * @param password - The plain text password.
	 * @param role - The role of the user (default: UserRoleEnum.USER).
	 * @returns The created user object.
	 */
	async createUser(
		email: string,
		username: string,
		password: string,
		role: UserRoleEnum = UserRoleEnum.USER,
	): Promise<User> {
		const hash = await bcrypt.hash(password, 10);
		return await this.userRepo.create({
			email,
			username,
			passwordHash: hash,
			role,
		});
	}

	/**
	 * Checks if the application requires initial setup (i.e., no users exist).
	 * @returns True if setup is required, false otherwise.
	 */
	async isSetupRequired(): Promise<boolean> {
		const count = await this.userRepo.count();
		return count === 0;
	}
}
