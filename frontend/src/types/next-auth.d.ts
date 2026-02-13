import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      mfaEnabled: boolean;
      mfaVerified: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: string;
    mfaEnabled?: boolean;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    role?: string;
    mfaEnabled?: boolean;
    mfaVerified?: boolean;
    userId?: string;
  }
}
