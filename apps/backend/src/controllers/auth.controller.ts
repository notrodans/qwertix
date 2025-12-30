import fastifyPassport from '@fastify/passport';
import type { FastifyInstance } from 'fastify';
import { Strategy as LocalStrategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

export class AuthController {
	constructor(private authService: AuthService) {}

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
			async (user: { id: number }) => user.id,
		);
		fastifyPassport.registerUserDeserializer(async (id: number) => {
			return { id, role: 'admin' };
		});

		app.post(
			'/auth/login',
			{
				preValidation: fastifyPassport.authenticate('local', {
					authInfo: false,
				}),
			},
			async (req) => {
				const token = app.jwt.sign({ id: (req.user as { id: number }).id });
				return { token, user: req.user };
			},
		);

		app.post('/users', async (req, reply) => {
			const {
				email,
				username,
				password,
				role = 'user',
			} = req.body as {
				email: string;
				username: string;
				password: string;
				role?: string;
			};

			const user = await this.authService.createUser(
				email,
				username,
				password,
				role,
			);
			return reply.send(user);
		});
	}
}
