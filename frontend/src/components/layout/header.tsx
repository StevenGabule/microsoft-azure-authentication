'use client';

import { useAuth } from '@/hooks/use-auth';
import { LogoutButton } from '@/components/auth/logout-button';
import { Avatar, Badge, Box, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { Shield, Settings } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated } = useAuth();

  const initials = user
    ? `${(user.firstName || user.displayName || user.email)?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      w="full"
      borderBottomWidth="1px"
      bg="bg/95"
      backdropFilter="blur(8px)"
    >
      <Flex
        maxW="7xl"
        mx="auto"
        px="4"
        h="14"
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap="2">
          <Shield size={24} color="var(--chakra-colors-primary)" />
          <Link href="/dashboard" style={{ fontSize: '1.125rem', fontWeight: 600, textDecoration: 'none', color: 'inherit' }}>
            Azure Auth Portal
          </Link>
        </Flex>

        {isAuthenticated && user && (
          <Flex align="center" gap="4">
            <Flex as="nav" align="center" gap="2">
              <Link href="/dashboard" style={{ borderRadius: 6, padding: '6px 12px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--chakra-colors-fg-muted)', textDecoration: 'none' }}>
                Dashboard
              </Link>
              <Link href="/profile" style={{ borderRadius: 6, padding: '6px 12px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--chakra-colors-fg-muted)', textDecoration: 'none' }}>
                Profile
              </Link>
              <Link href="/settings/security" style={{ borderRadius: 6, padding: '6px 12px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--chakra-colors-fg-muted)', textDecoration: 'none' }}>
                <Settings size={16} />
              </Link>
            </Flex>

            <Flex align="center" gap="3" borderLeftWidth="1px" pl="4">
              <Flex align="center" gap="2">
                <Avatar.Root size="sm">
                  <Avatar.Image src={user.avatarUrl || undefined} />
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar.Root>
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontSize="sm" fontWeight="medium">{user.displayName || user.email}</Text>
                  <Badge size="sm" variant="subtle">
                    {user.role}
                  </Badge>
                </Box>
              </Flex>
              <LogoutButton />
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
