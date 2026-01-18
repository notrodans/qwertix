import { connectLogger, log } from '@reatom/core';

declare global {
	var LOG: typeof log;
}

export const setup = () => {
	if (import.meta.env.DEV) {
		connectLogger();
	}

	globalThis.LOG = log;
};
