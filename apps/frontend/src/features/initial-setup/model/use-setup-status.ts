import { useQuery } from '@tanstack/react-query';
import { setupApi } from '../api/setup.api';

export function useSetupStatus() {
	return useQuery({
		queryKey: ['setup-status'],
		queryFn: setupApi.checkStatus,
		retry: false,
		refetchOnWindowFocus: false,
	});
}
