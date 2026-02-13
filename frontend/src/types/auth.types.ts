export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  mfaEnabled: boolean;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
}

export interface LoginResponse {
  accessToken: string;
  mfaRequired: boolean;
  user: AuthUser;
}

export interface TokenRefreshResponse {
  accessToken: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}

export interface MfaVerifyRequest {
  code: string;
  recoveryCode?: string;
}

export interface MfaStatusResponse {
  enabled: boolean;
  method: string | null;
  recoveryCodesRemaining: number;
  verifiedAt: string | null;
}
