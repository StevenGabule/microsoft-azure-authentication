'use client';

import { Button } from '@chakra-ui/react';
import { useLogout } from '@/hooks/mutations/use-logout';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const logoutMutation = useLogout();

  return (
    <Button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      variant="ghost"
      size="sm"
    >
      <LogOut size={16} />
      {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
