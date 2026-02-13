'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { setAccessToken } from '@/lib/utils/tokens';
import { useSearchParams } from 'next/navigation';

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { setLoading, login, setMfaRequired } = useAuthStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAccessToken(token);
      // Remove token from URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.pathname);
    }
    setLoading(false);
  }, [searchParams, setLoading, login, setMfaRequired]);

  return <>{children}</>;
}
