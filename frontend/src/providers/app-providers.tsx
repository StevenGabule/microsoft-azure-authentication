'use client';

import { Suspense } from 'react';
import { ChakraProvider, Flex, Spinner } from '@chakra-ui/react';
import { QueryProvider } from './query-provider';
import { SessionProvider } from '@/components/auth/session-provider';
import { system } from '@/theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <QueryProvider>
        <Suspense fallback={
          <Flex minH="100vh" align="center" justify="center">
            <Spinner size="lg" color="primary" />
          </Flex>
        }>
          <SessionProvider>{children}</SessionProvider>
        </Suspense>
      </QueryProvider>
    </ChakraProvider>
  );
}
