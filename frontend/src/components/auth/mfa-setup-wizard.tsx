'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account using Microsoft Authenticator or any TOTP app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button onClick={handleSetup} className="w-full" disabled={setupMfa.isPending}>
            {setupMfa.isPending ? 'Setting up...' : 'Begin Setup'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'scan') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Scan this QR code with Microsoft Authenticator or your preferred TOTP app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {setupData?.qrCodeDataUrl && (
            <div className="flex justify-center">
              <img
                src={setupData.qrCodeDataUrl}
                alt="MFA QR Code"
                className="h-48 w-48 rounded-lg border"
              />
            </div>
          )}
          <div className="rounded-md bg-muted p-3">
            <p className="mb-1 text-xs text-muted-foreground">Manual entry key:</p>
            <code className="text-xs break-all">{setupData?.secret}</code>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setStep('verify')} className="w-full">
            Next: Verify Code
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verify Setup</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to confirm setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-code">Verification Code</Label>
            <Input
              id="verify-code"
              placeholder="000000"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('scan')} className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleVerify}
            className="flex-1"
            disabled={verifyCode.length !== 6 || enableMfa.isPending}
          >
            {enableMfa.isPending ? 'Verifying...' : 'Verify & Enable'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === 'recovery') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Save Recovery Codes</CardTitle>
          <CardDescription>
            Store these codes in a safe place. Each code can only be used once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted p-4">
            <div className="grid grid-cols-2 gap-2">
              {setupData?.recoveryCodes.map((code, index) => (
                <code key={index} className="text-sm font-mono">
                  {code}
                </code>
              ))}
            </div>
          </div>
          <Button variant="outline" onClick={copyRecoveryCodes} className="w-full">
            {copiedCodes ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Copy Recovery Codes
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setStep('complete')} className="w-full">
            I have saved my codes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>MFA Enabled Successfully</CardTitle>
        <CardDescription>
          Your account is now protected with two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => window.location.href = '/settings/security'} className="w-full">
          Go to Security Settings
        </Button>
      </CardContent>
    </Card>
  );
}
