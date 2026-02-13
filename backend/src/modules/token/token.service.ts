import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { AUTH_CONSTANTS, ERROR_MESSAGES } from '../../common/constants';
import type { JwtPayload, JwtRefreshPayload } from '../../common/interfaces';

/**
 * Manages JWT access/refresh token lifecycle including creation,
 * validation, rotation, and blacklisting.
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Creates a short-lived JWT access token.
   */
  async createAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    return this.jwtService.signAsync(payload as any, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiration') as any,
    });
  }

  /**
   * Creates a refresh token and stores its hash in the database.
   * Implements token family tracking for rotation detection.
   */
  async createRefreshToken(
    userId: string,
    family?: string,
  ): Promise<{ token: string; family: string }> {
    const tokenFamily = family || crypto.randomUUID();
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(token);

    const expiresAt = new Date();
    const refreshExpiration = this.configService.get<string>('jwt.refreshExpiration') || '7d';
    const days = parseInt(refreshExpiration.replace('d', ''), 10) || 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        family: tokenFamily,
        expiresAt,
      },
    });

    return { token, family: tokenFamily };
  }

  /**
   * Validates and rotates a refresh token.
   * Detects token reuse attacks via family tracking.
   */
  async rotateRefreshToken(
    oldToken: string,
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const oldTokenHash = this.hashToken(oldToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: oldTokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
    }

    // Token reuse detection: if token is already revoked, revoke entire family
    if (storedToken.revokedAt) {
      this.logger.warn(
        `Refresh token reuse detected for user ${storedToken.userId}, family ${storedToken.family}`,
      );
      await this.revokeTokenFamily(storedToken.family);
      throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_REUSE);
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED);
    }

    if (storedToken.userId !== userId) {
      throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_INACTIVE);
    }

    // Create new refresh token in the same family
    const { token: newRefreshToken } = await this.createRefreshToken(
      userId,
      storedToken.family,
    );
    const newTokenHash = this.hashToken(newRefreshToken);

    // Mark old token as replaced
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
        replacedByHash: newTokenHash,
      },
    });

    // Create new access token
    const accessToken = await this.createAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
      mfaVerified: storedToken.user.mfaEnabled ? false : true,
      sessionId: '',
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Blacklists an access token in Redis for its remaining TTL.
   */
  async blacklistAccessToken(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token) as JwtPayload;
      if (!decoded?.exp) return;

      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redis.set(
          `${AUTH_CONSTANTS.TOKEN_BLACKLIST_PREFIX}${token}`,
          '1',
          ttl,
        );
      }
    } catch (error) {
      this.logger.error('Failed to blacklist token', error);
    }
  }

  /**
   * Checks if an access token has been blacklisted.
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.redis.exists(
      `${AUTH_CONSTANTS.TOKEN_BLACKLIST_PREFIX}${token}`,
    );
  }

  /**
   * Revokes all refresh tokens in a token family (breach response).
   */
  async revokeTokenFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    this.logger.warn(`All tokens in family ${family} have been revoked`);
  }

  /**
   * Revokes all refresh tokens for a user.
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Hashes a token using SHA-256 for secure storage.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
