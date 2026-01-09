import { app } from './app';
import { env } from './env';

const start = async () => {
	try {
		await app.listen({ port: env.PORT, host: '0.0.0.0' });
		console.log(
			`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`,
		);
		console.log(`WebSocket server is ready`);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();
