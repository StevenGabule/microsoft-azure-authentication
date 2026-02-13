import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

interface SessionCallbackParams {
  session: Session;
  token: JWT;
}

export async function sessionCallback({
  session,
  token,
}: SessionCallbackParams): Promise<Session> {
  if (session.user) {
    session.user.id = token.userId as string;
    session.user.role = (token.role as string) || 'USER';
    session.user.mfaEnabled = (token.mfaEnabled as boolean) || false;
    session.user.mfaVerified = (token.mfaVerified as boolean) || false;
    session.accessToken = token.accessToken as string;
  }

  return session;
}
