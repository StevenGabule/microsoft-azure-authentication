'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyMfa } from '@/hooks/mutations/use-verify-mfa';
import { mfaCodeSchema, type MfaCodeInput } from '@/lib/validators/auth.schema';
import { getErrorMessage } from '@/lib/utils/errors';
import { AUTH_ROUTES } from '@/lib/utils/constants';
import { Shield, Key } from 'lucide-react';

export function MfaVerifyForm() {
  const router = useRouter();
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyMfa = useVerifyMfa();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MfaCodeInput>({
    resolver: zodResolver(mfaCodeSchema),
  });

  const onSubmit = async (data: MfaCodeInput) => {
    setError(null);
    try {
      await verifyMfa.mutateAsync({
        code: data.code,
        isRecoveryCode: useRecoveryCode,
      });
      router.push(AUTH_ROUTES.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {useRecoveryCode
            ? 'Enter one of your recovery codes'
            : 'Enter the 6-digit code from your authenticator app'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              {useRecoveryCode ? 'Recovery Code' : 'Verification Code'}
            </Label>
            <Input
              id="code"
              placeholder={useRecoveryCode ? 'XXXX-XXXX' : '000000'}
              maxLength={useRecoveryCode ? 9 : 6}
              autoComplete="one-time-code"
              autoFocus
              {...register('code')}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={verifyMfa.isPending}
          >
            {verifyMfa.isPending ? 'Verifying...' : 'Verify'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setUseRecoveryCode(!useRecoveryCode);
              setError(null);
              reset();
            }}
          >
            <Key className="mr-2 h-4 w-4" />
            {useRecoveryCode
              ? 'Use authenticator code instead'
              : 'Use a recovery code instead'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
