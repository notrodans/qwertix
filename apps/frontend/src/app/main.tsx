import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { queryClient } from '@/shared/api/query/client';
import './index.css';
import App from './App';

async function enableMocking() {
	if (
		import.meta.env.DEV &&
		!(window as unknown as { __SKIP_MSW__: boolean }).__SKIP_MSW__
	) {
		const { worker } = await import('@/shared/api/mocks/browser');
		return worker.start();
	}
}

enableMocking().then(() => {
	createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</StrictMode>,
	);
});
