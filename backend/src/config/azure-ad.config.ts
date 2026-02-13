import { registerAs } from '@nestjs/config';

export default registerAs('azureAd', () => ({
  clientId: process.env.AZURE_AD_CLIENT_ID,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
  tenantId: process.env.AZURE_AD_TENANT_ID,
  redirectUri:
    process.env.AZURE_AD_REDIRECT_URI ||
    'http://localhost:4000/api/v1/auth/callback',
  authority:
    process.env.AZURE_AD_AUTHORITY ||
    `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`,
  scopes: ['openid', 'profile', 'email', 'User.Read', 'offline_access'],
}));
