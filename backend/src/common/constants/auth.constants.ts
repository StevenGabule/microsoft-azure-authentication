export const AUTH_CONSTANTS = {
  JWT_ACCESS_TOKEN: 'jwt-access',
  JWT_REFRESH_TOKEN: 'jwt-refresh',
  AZURE_AD_STRATEGY: 'azure-ad',
  PUBLIC_KEY: 'isPublic',
  ROLES_KEY: 'roles',
  MFA_REQUIRED_KEY: 'mfaRequired',
  TOKEN_BLACKLIST_PREFIX: 'bl:',
  SESSION_PREFIX: 'sess:',
  MFA_ATTEMPT_PREFIX: 'mfa_attempt:',
  MFA_MAX_ATTEMPTS: 5,
  MFA_LOCKOUT_DURATION: 900, // 15 minutes in seconds
  RECOVERY_CODE_COUNT: 8,
} as const;
