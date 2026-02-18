'use client';

import { useState } from 'react';
import { Button, Badge, Card, Separator, Box, Flex, Text, Heading, VStack } from '@chakra-ui/react';
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
    <VStack gap="6" align="stretch">
      <Box>
        <Heading size="2xl">Security Settings</Heading>
        <Text color="fg.muted">Manage your security preferences</Text>
      </Box>

      {error && (
        <Box borderRadius="md" bg="red.50" p="3">
          <Text fontSize="sm" color="red.600">{error}</Text>
        </Box>
      )}

      {/* MFA Section */}
      <Card.Root>
        <Card.Header>
          <Flex align="center" justify="space-between">
            <Box>
              <Card.Title>
                <Flex align="center" gap="2">
                  <Shield size={20} />
                  Two-Factor Authentication
                </Flex>
              </Card.Title>
              <Card.Description>
                Add an extra layer of security to your account
              </Card.Description>
            </Box>
            <Badge
              colorPalette={mfaStatus?.enabled ? 'green' : undefined}
              variant={mfaStatus?.enabled ? 'subtle' : 'outline'}
            >
              {mfaStatus?.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </Flex>
        </Card.Header>
        <Card.Body>
          <VStack gap="4" align="stretch">
            {mfaStatus?.enabled ? (
              <>
                <Flex align="center" justify="space-between" fontSize="sm">
                  <Text color="fg.muted">Method</Text>
                  <Text>{mfaStatus.method || 'TOTP'}</Text>
                </Flex>
                <Flex align="center" justify="space-between" fontSize="sm">
                  <Text color="fg.muted">Recovery codes remaining</Text>
                  <Text>{mfaStatus.recoveryCodesRemaining}</Text>
                </Flex>
                <Separator />
                <Flex gap="2">
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
                    <RefreshCw size={16} />
                    Regenerate Recovery Codes
                  </Button>
                </Flex>
              </>
            ) : (
              <Link href="/mfa-setup">
                <Button>
                  <Shield size={16} />
                  Enable Two-Factor Authentication
                </Button>
              </Link>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Active Sessions */}
      <Card.Root>
        <Card.Header>
          <Flex align="center" justify="space-between">
            <Box>
              <Card.Title>
                <Flex align="center" gap="2">
                  <Monitor size={20} />
                  Active Sessions
                </Flex>
              </Card.Title>
              <Card.Description>
                Manage your active sessions across devices
              </Card.Description>
            </Box>
            <Button variant="outline" size="sm" onClick={() => refetchSessions()}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          </Flex>
        </Card.Header>
        <Card.Body>
          <VStack gap="3" align="stretch">
            {sessions?.map((session) => (
              <Flex
                key={session.id}
                align="center"
                justify="space-between"
                borderRadius="lg"
                borderWidth="1px"
                p="3"
              >
                <Box>
                  <Flex align="center" gap="2">
                    <Monitor size={16} color="var(--chakra-colors-fg-muted)" />
                    <Text fontSize="sm" fontWeight="medium">
                      {session.userAgent?.split(' ')[0] || 'Unknown Device'}
                    </Text>
                    {session.isCurrent && (
                      <Badge size="sm" variant="subtle">
                        Current
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="xs" color="fg.muted" mt="1">
                    IP: {session.ipAddress || 'Unknown'} | Created:{' '}
                    {new Date(session.createdAt).toLocaleString()}
                  </Text>
                </Box>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    <Trash2 size={16} color="var(--chakra-colors-destructive)" />
                  </Button>
                )}
              </Flex>
            ))}
            {(!sessions || sessions.length === 0) && (
              <Text fontSize="sm" color="fg.muted" textAlign="center" py="4">
                No active sessions found.
              </Text>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
