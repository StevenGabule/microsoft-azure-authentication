import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import { QUERY_KEYS } from '@/lib/utils/constants';
import { UserProfile } from '@/types';

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
