import { z } from 'zod';

export const mfaCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
});

export const recoveryCodeSchema = z.object({
  recoveryCode: z
    .string()
    .min(1, 'Recovery code is required')
    .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid recovery code format'),
});

export const mfaVerifySchema = z.union([mfaCodeSchema, recoveryCodeSchema]);

export type MfaCodeInput = z.infer<typeof mfaCodeSchema>;
export type RecoveryCodeInput = z.infer<typeof recoveryCodeSchema>;
