import type { MfaMethod } from '@prisma/client';

export class MfaStatusResponseDto {
  enabled: boolean;
  method: MfaMethod | null;
  recoveryCodesRemaining: number;
  verifiedAt: Date | null;
}
