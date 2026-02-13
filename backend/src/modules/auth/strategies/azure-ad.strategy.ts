import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
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
      jwtFromRequest: (req: any) => {
        return req?.query?.code || null;
      },
      secretOrKey: configService.get<string>('jwt.accessSecret')!,
      ignoreExpiration: true,
    });
  }

  async validate(payload: any): Promise<any> {
    return payload;
  }
}
