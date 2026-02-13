export const APP_NAME = 'Azure Auth Portal';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    CALLBACK: '/auth/callback',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    MFA_VERIFY: '/auth/mfa/verify',
  },
  USER: {
    PROFILE: '/users/me',
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  MFA: {
    SETUP: '/mfa/setup',
    ENABLE: '/mfa/enable',
    VERIFY: '/mfa/verify',
    STATUS: '/mfa/status',
    DISABLE: '/mfa',
    REGENERATE_CODES: '/mfa/recovery-codes/regenerate',
  },
  SESSION: {
    LIST: '/sessions',
    REVOKE: (id: string) => `/sessions/${id}`,
    REVOKE_ALL: '/sessions',
  },
} as const;

export const QUERY_KEYS = {
  USER_PROFILE: ['user', 'profile'] as const,
  USER_LIST: ['users'] as const,
  MFA_STATUS: ['mfa', 'status'] as const,
  SESSIONS: ['sessions'] as const,
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  MFA_SETUP: '/mfa-setup',
  MFA_VERIFY: '/mfa-verify',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SECURITY: '/settings/security',
} as const;

export const PUBLIC_ROUTES = [
  '/login',
  '/logout',
  '/auth/callback',
  '/',
] as const;
