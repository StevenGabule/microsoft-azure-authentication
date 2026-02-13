'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useUserProfile } from './queries/use-user-profile';
import { useLogin } from './mutations/use-login';
import { useLogout } from './mutations/use-logout';

/**
 * Composite auth hook that combines auth state, profile data,
 * and auth actions into a single interface.
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, mfaRequired } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { login } = useLogin();
  const logoutMutation = useLogout();

  return {
    user: profile || user,
    isAuthenticated,
    isLoading: isLoading || profileLoading,
    mfaRequired,
    login,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
