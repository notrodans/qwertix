import '../src/app/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeMount } from '@playwright/experimental-ct-react/hooks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

beforeMount(async ({ App }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
});
