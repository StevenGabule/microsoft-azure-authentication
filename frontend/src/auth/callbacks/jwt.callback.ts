import type { JWT } from 'next-auth/jwt';
import type { Account, User } from 'next-auth';

interface JwtCallbackParams {
  token: JWT;
  user?: User;
  account?: Account | null;
  trigger?: 'signIn' | 'signUp' | 'update';
}

export async function jwtCallback({
  token,
  user,
  account,
}: JwtCallbackParams): Promise<JWT> {
  // Initial sign-in
  if (account && user) {
    token.accessToken = account.access_token;
    token.userId = user.id;
    token.role = (user as any).role || 'USER';
    token.mfaEnabled = (user as any).mfaEnabled || false;
    token.mfaVerified = false;
  }

  return token;
}
