'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { AUTH_ROUTES } from '@/lib/utils/constants';

interface AuthGuardProps {
  children: React.ReactNode;
  requireMfa?: boolean;
}

export function AuthGuard({ children, requireMfa = false }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, mfaRequired } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(AUTH_ROUTES.LOGIN);
      return;
    }

    if (!isLoading && requireMfa && mfaRequired) {
      router.push(AUTH_ROUTES.MFA_VERIFY);
      return;
    }
  }, [isAuthenticated, isLoading, mfaRequired, requireMfa, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
