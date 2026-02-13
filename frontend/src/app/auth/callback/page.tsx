'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { setAccessToken } from '@/lib/utils/tokens';
import { authApi } from '@/lib/api/auth.api';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuthStore();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    if (!token) {
      router.push('/login?error=no_token');
      return;
    }

    setAccessToken(token);

    // Set a session indicator cookie so the middleware allows protected routes
    document.cookie = 'auth_session=1; path=/; max-age=86400; SameSite=Lax';

    authApi
      .getCurrentUser()
      .then((user) => {
        login(user, token);
        router.push('/dashboard');
      })
      .catch(() => {
        // Clear cookie on failure
        document.cookie = 'auth_session=; path=/; max-age=0';
        router.push('/login?error=callback_failed');
      });
  }, [searchParams, router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
