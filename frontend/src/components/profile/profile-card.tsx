'use client';

import { useUserProfile } from '@/hooks/queries/use-user-profile';
import { Avatar, Badge, Card, Separator, Flex, Text, VStack, Spinner, Box } from '@chakra-ui/react';
import { Mail, Briefcase, Building, Calendar, Shield } from 'lucide-react';

export function ProfileCard() {
  const { data: profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <Card.Root>
        <Card.Body>
          <Flex align="center" justify="center" p="12">
            <Spinner size="lg" color="primary" />
          </Flex>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!profile) return null;

  const initials = `${(profile.firstName || profile.displayName || '')?.[0] || ''}`.toUpperCase();

  return (
    <Card.Root>
      <Card.Header>
        <Flex align="center" gap="4">
          <Avatar.Root size="xl">
            <Avatar.Image src={profile.avatarUrl || undefined} />
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar.Root>
          <Box>
            <Card.Title>{profile.displayName || 'No Name'}</Card.Title>
            <Text fontSize="sm" color="fg.muted">{profile.email}</Text>
            <Flex mt="1" align="center" gap="2">
              <Badge variant="subtle">{profile.role}</Badge>
              {profile.mfaEnabled && (
                <Badge colorPalette="green" variant="subtle">
                  <Shield size={12} /> MFA Enabled
                </Badge>
              )}
            </Flex>
          </Box>
        </Flex>
      </Card.Header>
      <Card.Body>
        <VStack gap="4" align="stretch">
          <Separator />
          <VStack gap="3" align="stretch">
            <Flex align="center" gap="2" fontSize="sm">
              <Mail size={16} color="var(--chakra-colors-fg-muted)" />
              <Text>{profile.email}</Text>
            </Flex>
            {profile.jobTitle && (
              <Flex align="center" gap="2" fontSize="sm">
                <Briefcase size={16} color="var(--chakra-colors-fg-muted)" />
                <Text>{profile.jobTitle}</Text>
              </Flex>
            )}
            {profile.department && (
              <Flex align="center" gap="2" fontSize="sm">
                <Building size={16} color="var(--chakra-colors-fg-muted)" />
                <Text>{profile.department}</Text>
              </Flex>
            )}
            {profile.lastLoginAt && (
              <Flex align="center" gap="2" fontSize="sm">
                <Calendar size={16} color="var(--chakra-colors-fg-muted)" />
                <Text>Last login: {new Date(profile.lastLoginAt).toLocaleString()}</Text>
              </Flex>
            )}
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
