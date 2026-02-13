import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mfaApi } from '@/lib/api/mfa.api';
import { QUERY_KEYS } from '@/lib/utils/constants';

export function useSetupMfa() {
  return useMutation({
    mutationFn: mfaApi.setup,
  });
}

export function useEnableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => mfaApi.enable(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MFA_STATUS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
  });
}
