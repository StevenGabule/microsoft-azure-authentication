'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMfaStatus } from '@/hooks/queries/use-mfa-status';
import { useActiveSessions } from '@/hooks/queries/use-session';
import { userApi } from '@/lib/api/user.api';
import { mfaApi } from '@/lib/api/mfa.api';
import { getErrorMessage } from '@/lib/utils/errors';
import { Shield, Monitor, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function SecuritySettingsPage() {
  const { data: mfaStatus, refetch: refetchMfa } = useMfaStatus();
  const { data: sessions, refetch: refetchSessions } = useActiveSessions();
  const [error, setError] = useState<string | null>(null);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await userApi.revokeSession(sessionId);
      refetchSessions();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
      return;
    }
    try {
      await mfaApi.disable();
      refetchMfa();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">Manage your security preferences</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* MFA Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            <Badge variant={mfaStatus?.enabled ? 'success' : 'outline'}>
              {mfaStatus?.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaStatus?.enabled ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span>{mfaStatus.method || 'TOTP'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recovery codes remaining</span>
                <span>{mfaStatus.recoveryCodesRemaining}</span>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDisableMfa}>
                  Disable MFA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await mfaApi.regenerateRecoveryCodes();
                    alert(`New recovery codes:\n\n${result.recoveryCodes.join('\n')}\n\nSave these codes!`);
                    refetchMfa();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Recovery Codes
                </Button>
              </div>
            </>
          ) : (
            <Link href="/mfa-setup">
              <Button>
                <Shield className="mr-2 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchSessions()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions?.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {session.userAgent?.split(' ')[0] || 'Unknown Device'}
                    </span>
                    {session.isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    IP: {session.ipAddress || 'Unknown'} | Created:{' '}
                    {new Date(session.createdAt).toLocaleString()}
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {(!sessions || sessions.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active sessions found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
