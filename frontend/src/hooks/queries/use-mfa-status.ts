import { useQuery } from '@tanstack/react-query';
import { mfaApi } from '@/lib/api/mfa.api';
import { QUERY_KEYS } from '@/lib/utils/constants';
import { MfaStatusResponse } from '@/types';

export function useMfaStatus() {
  return useQuery<MfaStatusResponse>({
    queryKey: QUERY_KEYS.MFA_STATUS,
    queryFn: mfaApi.getStatus,
    staleTime: 60 * 1000, // 1 minute
  });
}
