'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" {...register('displayName')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" {...register('jobTitle')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...register('department')} />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              Profile updated successfully!
            </div>
          )}

          <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
