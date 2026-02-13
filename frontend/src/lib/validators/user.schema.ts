import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  jobTitle: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
