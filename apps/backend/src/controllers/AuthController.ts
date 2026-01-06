import { UserRoleEnum } from '@qwertix/room-contracts';
import fastifyPassport from '@fastify/passport';
import type { FastifyInstance } from 'fastify';
import { Strategy as LocalStrategy } from 'passport-local';
import { AuthService } from '../services/AuthService';

/**
 * Controller for handling authentication routes.
 */
export class AuthController {
	constructor(private authService: AuthService) {}

	/**
	 * Registers authentication routes and strategies with the Fastify app.
	 * @param app - The Fastify application instance.
	 */
	async register(app: FastifyInstance) {
		app.register(fastifyPassport.initialize());
		app.register(fastifyPassport.secureSession());

		fastifyPassport.use(
			'local',
			new LocalStrategy(
				{ usernameField: 'email' },
				async (email, password, done) => {
					const user = await this.authService.validateLocalUser(
						email,
						password,
					);
					return done(null, user || false);
				},
			),
		);

		fastifyPassport.registerUserSerializer(
			async (user: { id: string }) => user.id,
		);
		fastifyPassport.registerUserDeserializer(async (id: string) => {
			return { id, role: UserRoleEnum.ADMIN };
		});

		app.post(
			'/auth/login',
			{
				preValidation: fastifyPassport.authenticate('local', {
					authInfo: false,
				}),
			},
			async (req) => {
				const token = app.jwt.sign({ id: (req.user as { id: string }).id });
				return { token, user: req.user };
			},
		);

		app.post('/users', async (req, reply) => {
			const { email, username, password } = req.body as {
				email: string;
				username: string;
				password: string;
			};

			const user = await this.authService.createUser(
				email,
				username,
				password,
				UserRoleEnum.USER,
			);
			return reply.send(user);
		});

		app.post(
			'/admin/users',
			{
				preHandler: async (req, reply) => {
					try {
						await req.jwtVerify();
						const userId = (req as unknown as { jwtUser: { id: string } })
							.jwtUser.id;
						const user = await this.authService.getUserById(userId);
						if (!user || user.role !== UserRoleEnum.ADMIN) {
							return reply.code(403).send({ message: 'Forbidden' });
						}
					} catch (_err) {
						return reply.code(401).send({ message: 'Unauthorized' });
					}
				},
			},
			async (req, reply) => {
				const {
					email,
					username,
					password,
					role = UserRoleEnum.USER,
				} = req.body as {
					email: string;
					username: string;
					password: string;
					role?: UserRoleEnum;
				};

				const user = await this.authService.createUser(
					email,
					username,
					password,
					role,
				);
				return reply.send(user);
			},
		);

		app.get('/auth/setup-status', async () => {
			const isSetupRequired = await this.authService.isSetupRequired();
			return { isSetupRequired };
		});

		app.post('/auth/setup', async (req, reply) => {
			const isSetupRequired = await this.authService.isSetupRequired();
			if (!isSetupRequired) {
				return reply.code(403).send({ message: 'Setup already completed' });
			}

			const { email, username, password } = req.body as {
				email: string;
				username: string;
				password: string;
			};

			const user = await this.authService.createUser(
				email,
				username,
				password,
				UserRoleEnum.ADMIN,
			);

			return reply.send({ user, message: 'Superuser created successfully' });
		});
	}
}
