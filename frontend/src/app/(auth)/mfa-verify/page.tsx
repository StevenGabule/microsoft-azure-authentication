'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Flex } from '@chakra-ui/react';
import { setAccessToken } from '@/lib/utils/tokens';
import { MfaVerifyForm } from '@/components/auth/mfa-verify-form';

export default function MfaVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  }, [searchParams, router]);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg" p="4">
      <MfaVerifyForm />
    </Flex>
  );
}
