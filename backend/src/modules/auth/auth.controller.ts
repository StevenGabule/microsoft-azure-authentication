import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser, Public } from '../../common/decorators';
import type { AuthenticatedUser } from '../../common/interfaces';
import { VerifyMfaDto } from '../mfa/dto';
import { ConfigService } from '@nestjs/config';

/**
 * Authentication controller handling OAuth login, callback, token refresh, and logout.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initiates the Azure AD OAuth login flow.
   * Redirects the user to the Microsoft login page.
   */
  @Get('login')
  @Public()
  async login(@Res() res: Response) {
    const { url, state } = await this.authService.getAuthorizationUrl();
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600000, // 10 minutes
    });
    res.redirect(url);
  }

  /**
   * Handles the Azure AD OAuth callback.
   * Exchanges the authorization code for tokens and creates a session.
   */
  @Get('callback')
  @Public()
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const cookies = req.cookies as Record<string, string>;
    const storedState: string | undefined = cookies?.oauth_state;
    if (!storedState || storedState !== state) {
      const frontendUrl = this.configService.get<string>('app.frontendUrl');
      return res.redirect(`${frontendUrl}/login?error=invalid_state`);
    }

    // Clear the state cookie
    res.clearCookie('oauth_state');

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const result = await this.authService.handleCallback(
      code,
      ipAddress,
      userAgent,
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });

    const frontendUrl = this.configService.get<string>('app.frontendUrl');

    if (result.mfaRequired) {
      return res.redirect(
        `${frontendUrl}/mfa-verify?token=${result.accessToken}`,
      );
    }

    return res.redirect(
      `${frontendUrl}/auth/callback?token=${result.accessToken}`,
    );
  }

  /**
   * Refreshes the access token using the refresh token cookie.
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const cookies = req.cookies as Record<string, string>;
    const refreshToken: string | undefined = cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'No refresh token provided',
      });
    }

    // Decode the current access token to get user ID
    const authHeader = req.get('authorization');
    const currentToken = authHeader?.replace('Bearer ', '');

    let userId: string | undefined;
    if (currentToken) {
      try {
        const payload = JSON.parse(
          Buffer.from(currentToken.split('.')[1], 'base64').toString(),
        ) as { sub?: string };
        userId = payload.sub;
      } catch {
        // Token might be expired but we still need user ID
      }
    }

    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unable to identify user',
      });
    }

    const result = await this.authService.refreshTokens(refreshToken, userId);

    // Set new refresh token cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });

    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Token refreshed',
      data: { accessToken: result.accessToken },
    });
  }

  /**
   * Completes MFA verification during login.
   */
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VerifyMfaDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    return this.authService.completeMfaVerification(
      user.id,
      user.sessionId,
      dto.recoveryCode || dto.code,
      !!dto.recoveryCode,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Logs out the user - revokes session and tokens.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const token = req.get('authorization')?.replace('Bearer ', '') || '';
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const result = await this.authService.logout(
      token,
      user.id,
      user.sessionId,
      ipAddress,
      userAgent,
    );

    // Clear refresh token cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    });

    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
      data: { logoutUrl: result.logoutUrl },
    });
  }

  /**
   * Gets the current authenticated user's info.
   */
  @Get('me')
  getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
