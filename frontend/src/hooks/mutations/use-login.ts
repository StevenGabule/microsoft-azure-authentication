import { useCallback } from 'react';
import { authApi } from '@/lib/api/auth.api';

export function useLogin() {
  const login = useCallback(() => {
    authApi.login();
  }, []);

  return { login };
}
