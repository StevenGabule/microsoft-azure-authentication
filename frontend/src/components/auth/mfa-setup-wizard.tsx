'use client';

import { useState } from 'react';
import {
  Button, Input, Card, Box, Text, Grid, Flex, VStack,
} from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { useSetupMfa, useEnableMfa } from '@/hooks/mutations/use-enable-mfa';
import { getErrorMessage } from '@/lib/utils/errors';
import { MfaSetupResponse } from '@/types';
import { Shield, Copy, Check } from 'lucide-react';

export function MfaSetupWizard() {
  const [step, setStep] = useState<'init' | 'scan' | 'verify' | 'recovery' | 'complete'>('init');
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const setupMfa = useSetupMfa();
  const enableMfa = useEnableMfa();

  const handleSetup = async () => {
    setError(null);
    try {
      const data = await setupMfa.mutateAsync();
      setSetupData(data);
      setStep('scan');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleVerify = async () => {
    setError(null);
    try {
      await enableMfa.mutateAsync(verifyCode);
      setStep('recovery');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const copyRecoveryCodes = () => {
    if (setupData?.recoveryCodes) {
      navigator.clipboard.writeText(setupData.recoveryCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  if (step === 'init') {
    return (
      <Card.Root w="full" maxW="md">
        <Card.Header textAlign="center">
          <Flex mx="auto" mb="4" h="12" w="12" align="center" justify="center" borderRadius="full" bg="primary/10">
            <Shield size={24} color="var(--chakra-colors-primary)" />
          </Flex>
          <Card.Title>Set Up Two-Factor Authentication</Card.Title>
          <Card.Description>
            Add an extra layer of security to your account using Microsoft Authenticator or any TOTP app.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          {error && (
            <Box mb="4" borderRadius="md" bg="red.50" p="3">
              <Text fontSize="sm" color="red.600">{error}</Text>
            </Box>
          )}
          <Button onClick={handleSetup} w="full" disabled={setupMfa.isPending}>
            {setupMfa.isPending ? 'Setting up...' : 'Begin Setup'}
          </Button>
        </Card.Body>
      </Card.Root>
    );
  }

  if (step === 'scan') {
    return (
      <Card.Root w="full" maxW="md">
        <Card.Header textAlign="center">
          <Card.Title>Scan QR Code</Card.Title>
          <Card.Description>
            Scan this QR code with Microsoft Authenticator or your preferred TOTP app.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <VStack gap="4">
            {setupData?.qrCodeDataUrl && (
              <Flex justify="center">
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="MFA QR Code"
                  style={{ height: 192, width: 192, borderRadius: 8, border: '1px solid var(--chakra-colors-border)' }}
                />
              </Flex>
            )}
            <Box borderRadius="md" bg="muted" p="3">
              <Text mb="1" fontSize="xs" color="fg.muted">Manual entry key:</Text>
              <Text as="code" fontSize="xs" wordBreak="break-all">{setupData?.secret}</Text>
            </Box>
          </VStack>
        </Card.Body>
        <Card.Footer>
          <Button onClick={() => setStep('verify')} w="full">
            Next: Verify Code
          </Button>
        </Card.Footer>
      </Card.Root>
    );
  }

  if (step === 'verify') {
    return (
      <Card.Root w="full" maxW="md">
        <Card.Header textAlign="center">
          <Card.Title>Verify Setup</Card.Title>
          <Card.Description>
            Enter the 6-digit code from your authenticator app to confirm setup.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <VStack gap="4">
            <Field.Root>
              <Field.Label>Verification Code</Field.Label>
              <Input
                placeholder="000000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                autoFocus
              />
            </Field.Root>
            {error && (
              <Box borderRadius="md" bg="red.50" p="3" w="full">
                <Text fontSize="sm" color="red.600">{error}</Text>
              </Box>
            )}
          </VStack>
        </Card.Body>
        <Card.Footer>
          <Flex gap="2" w="full">
            <Button variant="outline" onClick={() => setStep('scan')} flex="1">
              Back
            </Button>
            <Button
              onClick={handleVerify}
              flex="1"
              disabled={verifyCode.length !== 6 || enableMfa.isPending}
            >
              {enableMfa.isPending ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </Flex>
        </Card.Footer>
      </Card.Root>
    );
  }

  if (step === 'recovery') {
    return (
      <Card.Root w="full" maxW="md">
        <Card.Header textAlign="center">
          <Card.Title>Save Recovery Codes</Card.Title>
          <Card.Description>
            Store these codes in a safe place. Each code can only be used once.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <VStack gap="4">
            <Box borderRadius="md" borderWidth="1px" bg="muted" p="4" w="full">
              <Grid templateColumns="repeat(2, 1fr)" gap="2">
                {setupData?.recoveryCodes.map((code, index) => (
                  <Text as="code" key={index} fontSize="sm" fontFamily="mono">
                    {code}
                  </Text>
                ))}
              </Grid>
            </Box>
            <Button variant="outline" onClick={copyRecoveryCodes} w="full">
              {copiedCodes ? (
                <>
                  <Check size={16} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy Recovery Codes
                </>
              )}
            </Button>
          </VStack>
        </Card.Body>
        <Card.Footer>
          <Button onClick={() => setStep('complete')} w="full">
            I have saved my codes
          </Button>
        </Card.Footer>
      </Card.Root>
    );
  }

  return (
    <Card.Root w="full" maxW="md">
      <Card.Header textAlign="center">
        <Flex mx="auto" mb="4" h="12" w="12" align="center" justify="center" borderRadius="full" bg="green.100">
          <Check size={24} color="green" />
        </Flex>
        <Card.Title>MFA Enabled Successfully</Card.Title>
        <Card.Description>
          Your account is now protected with two-factor authentication.
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <Button onClick={() => window.location.href = '/settings/security'} w="full">
          Go to Security Settings
        </Button>
      </Card.Body>
    </Card.Root>
  );
}
