import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';

export function useVerifyMfa() {
  const completeMfa = useAuthStore((state) => state.completeMfa);

  return useMutation({
    mutationFn: ({
      code,
      isRecoveryCode,
    }: {
      code: string;
      isRecoveryCode?: boolean;
    }) => authApi.verifyMfa(code, isRecoveryCode),
    onSuccess: (data) => {
      if (data?.accessToken) {
        completeMfa(data.accessToken);
      }
    },
  });
}
