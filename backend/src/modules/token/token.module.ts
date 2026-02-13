import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret')!,
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessExpiration') as any,
        },
      }),
    }),
  ],
  providers: [TokenService],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}
