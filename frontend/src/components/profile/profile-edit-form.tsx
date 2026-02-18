'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card, Box, Text, Grid, VStack } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { useUserProfile } from '@/hooks/queries/use-user-profile';
import { useUpdateProfile } from '@/hooks/mutations/use-update-profile';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validators/user.schema';
import { getErrorMessage } from '@/lib/utils/errors';
import { useState } from 'react';
import { Save } from 'lucide-react';

export function ProfileEditForm() {
  const { data: profile } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: profile?.displayName || '',
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      jobTitle: profile?.jobTitle || '',
      department: profile?.department || '',
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setError(null);
    setSuccess(false);
    try {
      await updateProfile.mutateAsync(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Edit Profile</Card.Title>
        <Card.Description>Update your personal information.</Card.Description>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="4" align="stretch">
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap="4">
              <Field.Root invalid={!!errors.firstName}>
                <Field.Label>First Name</Field.Label>
                <Input {...register('firstName')} />
                {errors.firstName && (
                  <Field.ErrorText>{errors.firstName.message}</Field.ErrorText>
                )}
              </Field.Root>
              <Field.Root invalid={!!errors.lastName}>
                <Field.Label>Last Name</Field.Label>
                <Input {...register('lastName')} />
                {errors.lastName && (
                  <Field.ErrorText>{errors.lastName.message}</Field.ErrorText>
                )}
              </Field.Root>
            </Grid>

            <Field.Root>
              <Field.Label>Display Name</Field.Label>
              <Input {...register('displayName')} />
            </Field.Root>

            <Field.Root>
              <Field.Label>Job Title</Field.Label>
              <Input {...register('jobTitle')} />
            </Field.Root>

            <Field.Root>
              <Field.Label>Department</Field.Label>
              <Input {...register('department')} />
            </Field.Root>

            {error && (
              <Box borderRadius="md" bg="red.50" p="3">
                <Text fontSize="sm" color="red.600">{error}</Text>
              </Box>
            )}
            {success && (
              <Box borderRadius="md" bg="green.50" p="3">
                <Text fontSize="sm" color="green.700">Profile updated successfully!</Text>
              </Box>
            )}

            <Button type="submit" disabled={!isDirty || updateProfile.isPending} alignSelf="flex-start">
              <Save size={16} />
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </VStack>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
