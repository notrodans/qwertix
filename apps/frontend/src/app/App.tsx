import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useSetupStatus } from '@/features/initial-setup';
import { HomePage } from '@/pages/home/pub';
import { LoginPage } from '@/pages/login';
import { ProfilePage } from '@/pages/profile';
import { ResultPage } from '@/pages/result';
import { RoomPage } from '@/pages/room/pub';
import { SandboxPage } from '@/pages/sandbox';
import { SetupPage } from '@/pages/setup';
import { queryClient } from '@/shared/api/query/client';

function AppRouter() {
	const { data: setupStatus, isLoading } = useSetupStatus();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				Loading...
			</div>
		);
	}

	if (setupStatus?.isSetupRequired) {
		return (
			<Routes>
				<Route path="*" element={<SetupPage />} />
			</Routes>
		);
	}

	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/profile" element={<ProfilePage />} />
			<Route path="/result/:resultId" element={<ResultPage />} />
			<Route path="/room/:roomId" element={<RoomPage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/sandbox/:component" element={<SandboxPage />} />
		</Routes>
	);
}

function App() {
	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					<AppRouter />
				</BrowserRouter>
			</QueryClientProvider>
		</StrictMode>
	);
}

export default App;
