import { QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '@/pages/home/pub';
import { queryClient } from '@/shared/api/query/client';

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<HomePage />;
		</QueryClientProvider>
	);
}

export default App;
