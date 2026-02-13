'use client';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/mutations/use-logout';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function LogoutButton({ className, variant = 'ghost' }: LogoutButtonProps) {
  const logoutMutation = useLogout();

  return (
    <Button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      variant={variant}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
