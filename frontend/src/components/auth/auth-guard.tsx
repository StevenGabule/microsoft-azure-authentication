'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flex, Spinner } from '@chakra-ui/react';
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
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="lg" color="primary" />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
