import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { AzureAdStrategy } from './strategies/azure-ad.strategy';
import { TokenModule } from '../token/token.module';
import { SessionModule } from '../session/session.module';
import { MfaModule } from '../mfa/mfa.module';
import { MicrosoftGraphModule } from '../microsoft-graph/microsoft-graph.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TokenModule,
    SessionModule,
    MfaModule,
    MicrosoftGraphModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, AzureAdStrategy],
  exports: [AuthService],
})
export class AuthModule {}
