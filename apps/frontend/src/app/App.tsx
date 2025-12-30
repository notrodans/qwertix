import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/home/pub';
import { LoginPage } from '@/pages/login';
import { RoomPage } from '@/pages/room/pub';
import { SandboxPage } from '@/pages/sandbox';
import { queryClient } from '@/shared/api/query/client';

function App() {
	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/room/:roomId" element={<RoomPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/sandbox/:component" element={<SandboxPage />} />
					</Routes>
				</BrowserRouter>
			</QueryClientProvider>
		</StrictMode>
	);
}

export default App;
