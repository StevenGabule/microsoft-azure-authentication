'use client';

import { Suspense } from 'react';
import { QueryProvider } from './query-provider';
import { SessionProvider } from '@/components/auth/session-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }>
        <SessionProvider>{children}</SessionProvider>
      </Suspense>
    </QueryProvider>
  );
}
