'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Box, Text, Flex, VStack } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { useVerifyMfa } from '@/hooks/mutations/use-verify-mfa';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { getAccessToken } from '@/lib/utils/tokens';
import { mfaCodeSchema, type MfaCodeInput } from '@/lib/validators/auth.schema';
import { getErrorMessage } from '@/lib/utils/errors';
import { AUTH_ROUTES } from '@/lib/utils/constants';
import { Shield, Key } from 'lucide-react';

export function MfaVerifyForm() {
  const router = useRouter();
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyMfa = useVerifyMfa();
  const { login } = useAuthStore();

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

      document.cookie = 'auth_session=1; path=/; max-age=86400; SameSite=Lax';

      const user = await authApi.getCurrentUser();
      login(user, getAccessToken()!);

      router.push(AUTH_ROUTES.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card.Root w="full" maxW="md">
      <Card.Header textAlign="center">
        <Flex mx="auto" mb="4" h="12" w="12" align="center" justify="center" borderRadius="full" bg="primary/10">
          <Shield size={24} color="var(--chakra-colors-primary)" />
        </Flex>
        <Card.Title>Two-Factor Authentication</Card.Title>
        <Card.Description>
          {useRecoveryCode
            ? 'Enter one of your recovery codes'
            : 'Enter the 6-digit code from your authenticator app'}
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="4">
            <Field.Root invalid={!!errors.code} w="full">
              <Field.Label>
                {useRecoveryCode ? 'Recovery Code' : 'Verification Code'}
              </Field.Label>
              <Input
                placeholder={useRecoveryCode ? 'XXXX-XXXX' : '000000'}
                maxLength={useRecoveryCode ? 9 : 6}
                autoComplete="one-time-code"
                autoFocus
                {...register('code')}
              />
              {errors.code && (
                <Field.ErrorText>{errors.code.message}</Field.ErrorText>
              )}
            </Field.Root>

            {error && (
              <Box borderRadius="md" bg="red.50" p="3" w="full">
                <Text fontSize="sm" color="red.600">{error}</Text>
              </Box>
            )}

            <Button
              type="submit"
              w="full"
              disabled={verifyMfa.isPending}
            >
              {verifyMfa.isPending ? 'Verifying...' : 'Verify'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              w="full"
              onClick={() => {
                setUseRecoveryCode(!useRecoveryCode);
                setError(null);
                reset();
              }}
            >
              <Key size={16} />
              {useRecoveryCode
                ? 'Use authenticator code instead'
                : 'Use a recovery code instead'}
            </Button>
          </VStack>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
