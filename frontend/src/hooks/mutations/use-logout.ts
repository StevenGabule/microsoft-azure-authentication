import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { clearAccessToken } from '@/lib/utils/tokens';

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: (data) => {
      clearAccessToken();
      logout();
      queryClient.clear();
      document.cookie = 'auth_session=; path=/; max-age=0';

      if (data?.logoutUrl) {
        window.location.href = data.logoutUrl;
      } else {
        window.location.href = '/login';
      }
    },
    onError: () => {
      // Even on error, clear local state
      clearAccessToken();
      logout();
      queryClient.clear();
      document.cookie = 'auth_session=; path=/; max-age=0';
      window.location.href = '/login';
    },
  });
}
