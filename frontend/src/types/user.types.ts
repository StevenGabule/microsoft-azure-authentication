import { UserRole } from './auth.types';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  department: string | null;
  role: UserRole;
  mfaEnabled: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  department?: string;
}

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  mfaCompleted: boolean;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}
