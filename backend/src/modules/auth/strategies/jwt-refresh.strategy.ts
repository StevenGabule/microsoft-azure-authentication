import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtRefreshPayload } from '../../../common/interfaces';
import { ERROR_MESSAGES } from '../../../common/constants';
import { Request } from 'express';

/**
 * Strategy for validating refresh tokens from HTTP-only cookies.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return (req?.cookies?.refresh_token as string) || null;
        },
      ]),
      secretOrKey: configService.get<string>('jwt.refreshSecret')!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtRefreshPayload) {
    const refreshToken = req?.cookies?.refresh_token as string;
    if (!refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
