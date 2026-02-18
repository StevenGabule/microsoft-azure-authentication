import { ProfileCard } from '@/components/profile/profile-card';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { Box, Grid, Heading, Text, VStack } from '@chakra-ui/react';

export default function ProfilePage() {
  return (
    <VStack gap="6" align="stretch">
      <Box>
        <Heading size="2xl">Profile</Heading>
        <Text color="fg.muted">Manage your account profile</Text>
      </Box>
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="6">
        <ProfileCard />
        <ProfileEditForm />
      </Grid>
    </VStack>
  );
}
