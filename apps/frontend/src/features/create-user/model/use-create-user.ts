import { useMutation } from '@tanstack/react-query';
import { createUserApi } from '../api/create-user.api';

export const useCreateUser = () => {
	return useMutation({
		mutationFn: createUserApi,
	});
};
