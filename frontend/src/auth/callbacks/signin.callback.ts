import type { Account, Profile, User } from 'next-auth';

interface SignInCallbackParams {
  user: User;
  account: Account | null;
  profile?: Profile;
}

export async function signInCallback({
  account,
}: SignInCallbackParams): Promise<boolean> {
  if (account?.provider === 'azure-ad') {
    return true;
  }
  return false;
}
