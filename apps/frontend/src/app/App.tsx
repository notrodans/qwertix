import { reatomComponent } from '@reatom/react';
import { socketConnectionAtom } from '@/shared/api/socket-model';
import {
	fetchSetupStatus,
	homeRoute,
	mainRouter,
	setupRequired,
	setupRoute,
} from '@/shared/model';
import './interceptors';
import { Button } from '@/shared/ui';
import { Header } from '@/widgets/header';
import { MainLayout } from '@/widgets/layout';

const AppRouter = reatomComponent(() => {
	socketConnectionAtom(); // Subscribe to connection
	const statusData = fetchSetupStatus.data();
	const statusLoading = fetchSetupStatus.pending() > 0 && !statusData;
	const statusError = fetchSetupStatus.error();

	if (statusLoading) {
		return (
			<div className="flex items-center justify-center h-full">Loading...</div>
		);
	}

	if (statusError) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-red-400">
				<h1 className="text-xl font-bold">Failed to load setup status</h1>
				<p>{String(statusError)}</p>
			</div>
		);
	}

	if (setupRequired()) {
		setupRoute.go();
	}

	const content = mainRouter.render();

	if (!content || (Array.isArray(content) && content.length === 0)) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-4 text-foreground">
				<h1 className="text-4xl font-bold text-primary">404 Not Found</h1>
				<Button onClick={() => homeRoute.go()} className="mt-4">
					Back to Home
				</Button>
			</div>
		);
	}

	return content;
}, 'App');

const App = reatomComponent(() => {
	return (
		<MainLayout header={<Header />}>
			<AppRouter />
		</MainLayout>
	);
});

export { App };
