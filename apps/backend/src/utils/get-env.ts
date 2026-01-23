import fs from 'node:fs';

export function getEnv(key: string, fallback?: string): string | undefined {
	// 1. Try process.env
	if (process.env[key]) {
		return process.env[key];
	}

	// 2. Try Docker Secret
	const secretPath = `/run/secrets/${key.toLowerCase()}`;
	if (fs.existsSync(secretPath)) {
		try {
			// Read file and trim whitespace (newlines often added by editors)
			return fs.readFileSync(secretPath, 'utf8').trim();
		} catch (error) {
			console.error(`Error reading secret ${key}:`, error);
		}
	}

	// 3. Fallback
	return fallback;
}
