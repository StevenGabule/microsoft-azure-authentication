'use client';

import { Button } from '@/components/ui/button';
import { useLogin } from '@/hooks/mutations/use-login';

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className }: LoginButtonProps) {
  const { login } = useLogin();

  return (
    <Button onClick={login} size="lg" className={className}>
      <svg
        className="mr-2 h-5 w-5"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="1" y="1" width="9" height="9" fill="#F25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
        <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
      </svg>
      Sign in with Microsoft
    </Button>
  );
}
