'use client';

import { useAuth } from '@/hooks/use-auth';
import { LogoutButton } from '@/components/auth/logout-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Shield, Settings, User } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated } = useAuth();

  const initials = user
    ? `${(user.firstName || user.displayName || user.email)?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <Link href="/dashboard" className="text-lg font-semibold">
            Azure Auth Portal
          </Link>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/settings/security"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </nav>

            <div className="flex items-center gap-3 border-l pl-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || ''} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.displayName || user.email}</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
