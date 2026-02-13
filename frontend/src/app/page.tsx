import { LoginButton } from '@/components/auth/login-button';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Azure Auth Portal</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Microsoft Azure AD
            <br />
            Authentication System
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Enterprise-grade authentication with OAuth 2.0, two-factor authentication,
            and role-based access control.
          </p>
          <div className="flex justify-center gap-4">
            <LoginButton />
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          Secured with Microsoft Entra ID
        </div>
      </footer>
    </div>
  );
}
