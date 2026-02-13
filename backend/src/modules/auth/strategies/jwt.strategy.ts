import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../redis/redis.service';
import type { JwtPayload, AuthenticatedUser } from '../../../common/interfaces';
import { AUTH_CONSTANTS, ERROR_MESSAGES } from '../../../common/constants';

/**
 * JWT strategy for validating access tokens.
 * Checks token blacklist, user existence, and session validity.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.accessSecret')!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload): Promise<AuthenticatedUser> {
    // Check if token is blacklisted
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      const isBlacklisted = await this.redis.exists(
        `${AUTH_CONSTANTS.TOKEN_BLACKLIST_PREFIX}${token}`,
      );
      if (isBlacklisted) {
        throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_BLACKLISTED);
      }
    }

    // Verify user exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_INACTIVE);
    }

    // Verify session is still valid
    if (payload.sessionId) {
      const sessionKey = `${AUTH_CONSTANTS.SESSION_PREFIX}${payload.sessionId}`;
      const sessionExists = await this.redis.exists(sessionKey);
      if (!sessionExists) {
        // Fallback to DB check
        const session = await this.prisma.session.findUnique({
          where: { id: payload.sessionId },
        });
        if (!session || session.revokedAt || session.expiresAt < new Date()) {
          throw new UnauthorizedException(ERROR_MESSAGES.SESSION_EXPIRED);
        }
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      mfaVerified: payload.mfaVerified,
      sessionId: payload.sessionId,
    };
  }
}
