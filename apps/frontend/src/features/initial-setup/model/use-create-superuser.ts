import { useMutation } from '@tanstack/react-query';
import { type SetupPayload, setupApi } from '../api/setup.api';

export function useCreateSuperuser() {
	return useMutation({
		mutationFn: (payload: SetupPayload) => setupApi.createSuperuser(payload),
	});
}
