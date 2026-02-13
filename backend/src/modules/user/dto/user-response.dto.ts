import { Role } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  department: string | null;
  role: Role;
  mfaEnabled: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}
