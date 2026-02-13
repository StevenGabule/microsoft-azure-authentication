import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfidentialClientApplication,
  AuthenticationResult,
} from '@azure/msal-node';
import { MicrosoftGraphProfile } from '../../common/interfaces';

/**
 * Service for interacting with the Microsoft Graph API.
 * Handles token exchange and profile data retrieval.
 */
@Injectable()
export class MicrosoftGraphService {
  private readonly logger = new Logger(MicrosoftGraphService.name);
  private msalClient: ConfidentialClientApplication;

  constructor(private readonly configService: ConfigService) {
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: this.configService.get<string>('azureAd.clientId')!,
        clientSecret: this.configService.get<string>('azureAd.clientSecret')!,
        authority: this.configService.get<string>('azureAd.authority')!,
      },
    });
  }

  /**
   * Exchanges an authorization code for tokens using MSAL.
   */
  async acquireTokenByCode(
    code: string,
    redirectUri: string,
  ): Promise<AuthenticationResult> {
    return this.msalClient.acquireTokenByCode({
      code,
      redirectUri,
      scopes: this.configService.get<string[]>('azureAd.scopes')!,
    });
  }

  /**
   * Fetches the authenticated user's profile from Microsoft Graph API.
   */
  async getUserProfile(accessToken: string): Promise<MicrosoftGraphProfile> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Microsoft Graph API error: ${error}`);
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    return response.json() as Promise<MicrosoftGraphProfile>;
  }

  /**
   * Fetches the user's profile photo from Microsoft Graph API.
   * Returns a base64-encoded data URL or null if not available.
   */
  async getUserPhoto(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/photo/$value',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      return `data:${contentType};base64,${base64}`;
    } catch {
      this.logger.warn('Failed to fetch user photo');
      return null;
    }
  }

  /**
   * Builds the Azure AD authorization URL for the OAuth flow.
   */
  async getAuthCodeUrl(state: string): Promise<string> {
    return this.msalClient.getAuthCodeUrl({
      redirectUri: this.configService.get<string>('azureAd.redirectUri')!,
      scopes: this.configService.get<string[]>('azureAd.scopes')!,
      state,
      prompt: 'select_account',
    });
  }

  /**
   * Builds the Azure AD logout URL.
   */
  getLogoutUrl(postLogoutRedirectUri: string): string {
    const tenantId = this.configService.get<string>('azureAd.tenantId');
    return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
  }
}
