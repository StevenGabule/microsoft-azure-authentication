'use client';

import { useAuth } from '@/hooks/use-auth';
import { Badge, Card, Grid, Flex, Text, Heading, VStack, Box } from '@chakra-ui/react';
import { Shield, Users, Activity, Key } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <VStack gap="6" align="stretch">
      <Box>
        <Heading size="2xl">Dashboard</Heading>
        <Text color="fg.muted">
          Welcome back, {user?.displayName || user?.email || 'User'}
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="4">
        <Card.Root>
          <Card.Header>
            <Flex align="center" justify="space-between" pb="2">
              <Card.Title fontSize="sm" fontWeight="medium">Account Status</Card.Title>
              <Activity size={16} color="var(--chakra-colors-fg-muted)" />
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <Badge colorPalette="green" variant="subtle">Active</Badge>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Flex align="center" justify="space-between" pb="2">
              <Card.Title fontSize="sm" fontWeight="medium">Role</Card.Title>
              <Users size={16} color="var(--chakra-colors-fg-muted)" />
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <Badge variant="subtle">{user?.role || 'USER'}</Badge>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Flex align="center" justify="space-between" pb="2">
              <Card.Title fontSize="sm" fontWeight="medium">MFA Status</Card.Title>
              <Shield size={16} color="var(--chakra-colors-fg-muted)" />
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <Badge
              colorPalette={user?.mfaEnabled ? 'green' : undefined}
              variant={user?.mfaEnabled ? 'subtle' : 'outline'}
            >
              {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Flex align="center" justify="space-between" pb="2">
              <Card.Title fontSize="sm" fontWeight="medium">Security</Card.Title>
              <Key size={16} color="var(--chakra-colors-fg-muted)" />
            </Flex>
          </Card.Header>
          <Card.Body pt="0">
            <Link href="/settings/security" style={{ fontSize: '0.875rem', color: 'var(--chakra-colors-primary)', textDecoration: 'none' }}>
              Manage Settings
            </Link>
          </Card.Body>
        </Card.Root>
      </Grid>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="6">
        <Card.Root>
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Description>Common tasks and settings</Card.Description>
          </Card.Header>
          <Card.Body>
            <VStack gap="2" align="stretch">
              <Link href="/profile" style={{ display: 'flex', alignItems: 'center', borderRadius: 6, padding: 8, fontSize: '0.875rem', textDecoration: 'none', color: 'inherit' }}>
                View &amp; Edit Profile
              </Link>
              <Link href="/settings/security" style={{ display: 'flex', alignItems: 'center', borderRadius: 6, padding: 8, fontSize: '0.875rem', textDecoration: 'none', color: 'inherit' }}>
                Security Settings
              </Link>
              {!user?.mfaEnabled && (
                <Link href="/mfa-setup" style={{ display: 'flex', alignItems: 'center', borderRadius: 6, padding: 8, fontSize: '0.875rem', textDecoration: 'none', color: 'var(--chakra-colors-primary)' }}>
                  Enable Two-Factor Authentication
                </Link>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title>Account Info</Card.Title>
            <Card.Description>Your Microsoft account details</Card.Description>
          </Card.Header>
          <Card.Body>
            <VStack gap="2" align="stretch" fontSize="sm">
              <Flex justify="space-between">
                <Text color="fg.muted">Email</Text>
                <Text>{user?.email}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="fg.muted">Name</Text>
                <Text>{user?.displayName || 'Not set'}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="fg.muted">Role</Text>
                <Text>{user?.role}</Text>
              </Flex>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>
    </VStack>
  );
}
