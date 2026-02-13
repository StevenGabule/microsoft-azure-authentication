import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import { QUERY_KEYS } from '@/lib/utils/constants';
import { SessionInfo } from '@/types';

export function useActiveSessions() {
  return useQuery<SessionInfo[]>({
    queryKey: QUERY_KEYS.SESSIONS,
    queryFn: userApi.getSessions,
    staleTime: 30 * 1000, // 30 seconds
  });
}
