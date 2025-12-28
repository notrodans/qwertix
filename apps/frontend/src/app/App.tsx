import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { HomePage } from '@/pages/home/pub';
import { queryClient } from '@/shared/api/query/client';

function App() {
	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<HomePage />;
			</QueryClientProvider>
		</StrictMode>
	);
}

export default App;
