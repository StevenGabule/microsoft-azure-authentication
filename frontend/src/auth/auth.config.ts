import type { NextAuthConfig } from 'next-auth';
import { azureAdProvider } from './providers/azure-ad';
import { jwtCallback } from './callbacks/jwt.callback';
import { sessionCallback } from './callbacks/session.callback';
import { signInCallback } from './callbacks/signin.callback';

export const authConfig: NextAuthConfig = {
  providers: [azureAdProvider as any],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    jwt: jwtCallback as any,
    session: sessionCallback as any,
    signIn: signInCallback as any,
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/profile') ||
        nextUrl.pathname.startsWith('/settings');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      return true;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
