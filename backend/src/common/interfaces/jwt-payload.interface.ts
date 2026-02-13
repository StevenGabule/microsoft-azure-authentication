export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  mfaVerified: boolean;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenFamily: string;
  iat?: number;
  exp?: number;
}
