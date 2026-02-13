import type { OIDCConfig } from 'next-auth/providers';

interface AzureAdProfile {
  sub: string;
  name: string;
  email: string;
  preferred_username: string;
  oid: string;
}

export const azureAdProvider: OIDCConfig<AzureAdProfile> = {
  id: 'azure-ad',
  name: 'Microsoft',
  type: 'oidc',
  issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
  clientId: process.env.AZURE_AD_CLIENT_ID!,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'openid profile email User.Read offline_access',
      prompt: 'select_account',
    },
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email || profile.preferred_username,
      image: null,
    };
  },
};
