import { reatomComponent } from '@reatom/react';
import { StrictMode } from 'react';
import { fetchSetupStatus } from '@/features/initial-setup';
import { socketConnectionAtom } from '@/shared/api/socket-model';
import { homeRoute, mainRouter, setupRoute } from './routes';
import './interceptors';

const AppRouter = reatomComponent(() => {
	socketConnectionAtom(); // Subscribe to connection
	const statusData = fetchSetupStatus.data();
	const statusLoading = fetchSetupStatus.pending() > 0 && !statusData;
	const statusError = fetchSetupStatus.error();

	if (statusLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				Loading...
			</div>
		);
	}

	if (statusError) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-red-400">
				<h1 className="text-xl font-bold">Failed to load setup status</h1>
				<p>{String(statusError)}</p>
			</div>
		);
	}

	if (statusData?.isSetupRequired) {
		setupRoute.go();
	}

	const content = mainRouter.render();

	if (!content || (Array.isArray(content) && content.length === 0)) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-zinc-950 text-zinc-200">
				<h1 className="text-4xl font-bold text-emerald-400">404 Not Found</h1>
				<button
					onClick={() => homeRoute.go()}
					className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
				>
					Back to Home
				</button>
			</div>
		);
	}

	return content;
}, 'App');

const App = reatomComponent(() => {
	return (
		<StrictMode>
			<AppRouter />
		</StrictMode>
	);
});

export default App;
