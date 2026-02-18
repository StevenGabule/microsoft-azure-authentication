import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import { MfaService } from '../mfa/mfa.service';
import { MicrosoftGraphService } from '../microsoft-graph/microsoft-graph.service';
import { MicrosoftGraphProfile } from '../../common/interfaces';
import { ERROR_MESSAGES } from '../../common/constants';

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  mfaRequired: boolean;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    role: string;
    mfaEnabled: boolean;
  };
}

/**
 * Core authentication service handling OAuth flow, token management,
 * user provisioning, and logout.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly mfaService: MfaService,
    private readonly microsoftGraphService: MicrosoftGraphService,
  ) {}

  /**
   * Generates the Azure AD authorization URL for initiating the OAuth flow.
   */
  async getAuthorizationUrl(): Promise<{ url: string; state: string }> {
    const state = crypto.randomBytes(32).toString('hex');
    const url = await this.microsoftGraphService.getAuthCodeUrl(state);
    return { url, state };
  }

  /**
   * Handles the Azure AD OAuth callback.
   * Exchanges the authorization code for tokens, fetches the user profile,
   * upserts the user, creates a session, and issues JWTs.
   */
  async handleCallback(
    code: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResult> {
    // Exchange code for tokens via MSAL
    const redirectUri = this.configService.get<string>('azureAd.redirectUri')!;
    const authResult = await this.microsoftGraphService.acquireTokenByCode(
      code,
      redirectUri,
    );

    if (!authResult?.accessToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Fetch full profile from Microsoft Graph
    const profile = await this.microsoftGraphService.getUserProfile(
      authResult.accessToken,
    );

    // Fetch photo (optional, non-blocking)
    let avatarUrl: string | null = null;
    try {
      avatarUrl = await this.microsoftGraphService.getUserPhoto(
        authResult.accessToken,
      );
    } catch {
      // Photo is optional
    }

    // Upsert user in database
    const user = await this.upsertUser(profile, avatarUrl);

    // Update last login info
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Create session
    const sessionId = await this.sessionService.createSession({
      userId: user.id,
      ipAddress,
      userAgent,
      mfaCompleted: !user.mfaEnabled,
    });

    // Create access token
    const accessToken = await this.tokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      mfaVerified: !user.mfaEnabled,
      sessionId,
    });

    // Create refresh token
    const { token: refreshToken } = await this.tokenService.createRefreshToken(
      user.id,
    );

    // Log audit event
    await this.createAuditLog(
      user.id,
      'LOGIN',
      'session',
      ipAddress,
      userAgent,
      true,
    );

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      accessToken,
      refreshToken,
      mfaRequired: user.mfaEnabled,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  /**
   * Refreshes the access token using a valid refresh token.
   */
  async refreshTokens(
    refreshToken: string,
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.tokenService.rotateRefreshToken(refreshToken, userId);
  }

  /**
   * Handles user logout - blacklists token, revokes session, logs event.
   */
  async logout(
    accessToken: string,
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ logoutUrl: string }> {
    // Blacklist the current access token
    await this.tokenService.blacklistAccessToken(accessToken);

    // Revoke the session
    try {
      await this.sessionService.revokeSession(sessionId, userId);
    } catch {
      // Session might already be revoked
    }

    // Revoke all refresh tokens for this user's session
    await this.tokenService.revokeAllUserTokens(userId);

    // Log audit event
    await this.createAuditLog(
      userId,
      'LOGOUT',
      'session',
      ipAddress,
      userAgent,
      true,
    );

    // Get Azure AD logout URL
    const frontendUrl = this.configService.get<string>('app.frontendUrl')!;
    const logoutUrl = this.microsoftGraphService.getLogoutUrl(frontendUrl);

    return { logoutUrl };
  }

  /**
   * Completes MFA verification during login and issues a new full-access token.
   */
  async completeMfaVerification(
    userId: string,
    sessionId: string,
    code: string,
    isRecoveryCode: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string }> {
    // Verify the MFA code
    if (isRecoveryCode) {
      await this.mfaService.verifyRecoveryCode(userId, code);
    } else {
      await this.mfaService.verifyMfaCode(userId, code);
    }

    // Mark session as MFA completed
    await this.sessionService.completeMfa(sessionId);

    // Get user for token creation
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Issue new access token with mfaVerified: true
    const accessToken = await this.tokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      mfaVerified: true,
      sessionId,
    });

    // Log audit event
    await this.createAuditLog(
      userId,
      'MFA_VERIFIED',
      'session',
      ipAddress,
      userAgent,
      true,
    );

    return { accessToken };
  }

  /**
   * Upserts a user based on their Microsoft Graph profile.
   */
  private async upsertUser(
    profile: MicrosoftGraphProfile,
    avatarUrl: string | null,
  ) {
    const email = profile.mail || profile.userPrincipalName;

    return this.prisma.user.upsert({
      where: { microsoftId: profile.id },
      update: {
        email,
        displayName: profile.displayName,
        firstName: profile.givenName,
        lastName: profile.surname,
        jobTitle: profile.jobTitle,
        department: profile.department,
        ...(avatarUrl && { avatarUrl }),
      },
      create: {
        microsoftId: profile.id,
        email,
        displayName: profile.displayName,
        firstName: profile.givenName,
        lastName: profile.surname,
        jobTitle: profile.jobTitle,
        department: profile.department,
        avatarUrl,
      },
    });
  }

  /**
   * Creates an audit log entry.
   */
  private async createAuditLog(
    userId: string,
    action: string,
    resource: string,
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          ipAddress,
          userAgent,
          success,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }
}
