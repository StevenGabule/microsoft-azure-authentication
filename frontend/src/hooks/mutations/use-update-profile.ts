import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import { QUERY_KEYS } from '@/lib/utils/constants';
import { UpdateProfileRequest, UserProfile } from '@/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userApi.updateProfile(data),
    onSuccess: (updatedProfile: UserProfile) => {
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE, updatedProfile);
    },
  });
}
