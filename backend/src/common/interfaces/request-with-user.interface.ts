import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  mfaVerified: boolean;
  sessionId: string;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
