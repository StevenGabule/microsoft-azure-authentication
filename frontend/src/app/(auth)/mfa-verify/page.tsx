'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

    // Store the MFA-pending token so API calls include it in Authorization header
    setAccessToken(token);
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <MfaVerifyForm />
    </div>
  );
}
