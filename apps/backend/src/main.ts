import { app } from './app';

const PORT = Number(process.env['PORT']) || 3000;

const start = async () => {
	try {
		await app.listen({ port: PORT, host: '0.0.0.0' });
		console.log(`Server is running on port ${PORT}`);
		console.log(`WebSocket server is ready`);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();