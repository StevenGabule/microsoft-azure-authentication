import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

/**
 * Azure AD OAuth strategy placeholder.
 * The actual OAuth flow is handled via MSAL in the auth service,
 * but this strategy is registered for Passport compatibility.
 */
@Injectable()
export class AzureAdStrategy extends PassportStrategy(Strategy, 'azure-ad') {
  private readonly logger = new Logger(AzureAdStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request): string | null => {
        return (req.query?.code as string) || null;
      },
      secretOrKey: configService.get<string>('jwt.accessSecret')!,
      ignoreExpiration: true,
    });
  }

  validate(payload: Record<string, unknown>): Record<string, unknown> {
    return payload;
  }
}
