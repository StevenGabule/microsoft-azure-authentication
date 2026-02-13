export const ERROR_MESSAGES = {
  // Auth
  UNAUTHORIZED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_BLACKLISTED: 'Token has been revoked',
  REFRESH_TOKEN_REUSE:
    'Refresh token reuse detected. All sessions revoked for security.',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',

  // User
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is deactivated',
  USER_EXISTS: 'User already exists',

  // MFA
  MFA_ALREADY_ENABLED: 'MFA is already enabled',
  MFA_NOT_ENABLED: 'MFA is not enabled',
  MFA_INVALID_CODE: 'Invalid MFA verification code',
  MFA_REQUIRED: 'MFA verification required',
  MFA_LOCKED_OUT: 'Too many failed MFA attempts. Please try again later.',
  MFA_SETUP_REQUIRED: 'MFA setup must be completed',
  RECOVERY_CODE_INVALID: 'Invalid recovery code',

  // Session
  SESSION_NOT_FOUND: 'Session not found',
  SESSION_EXPIRED: 'Session has expired',
  SESSION_REVOKED: 'Session has been revoked',

  // General
  FORBIDDEN: 'Insufficient permissions',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  INTERNAL_ERROR: 'An internal error occurred',
  VALIDATION_ERROR: 'Validation failed',
} as const;
