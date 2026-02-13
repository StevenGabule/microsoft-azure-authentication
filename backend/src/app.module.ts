import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import {
  appConfig,
  azureAdConfig,
  jwtConfig,
  databaseConfig,
  redisConfig,
  securityConfig,
} from './config';
import { PrismaModule } from './prisma';
import { RedisModule } from './redis';
import { AuthModule } from './modules/auth';
import { UserModule } from './modules/user';
import { MfaModule } from './modules/mfa';
import { SessionModule } from './modules/session';
import { TokenModule } from './modules/token';
import { MicrosoftGraphModule } from './modules/microsoft-graph';
import { JwtAuthGuard } from './common/guards';
import { RolesGuard } from './common/guards';
import { MfaGuard } from './common/guards';
import { HttpExceptionFilter, PrismaExceptionFilter } from './common/filters';
import {
  TransformInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
} from './common/interceptors';
import { ValidationPipe } from './common/pipes';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        azureAdConfig,
        jwtConfig,
        databaseConfig,
        redisConfig,
        securityConfig,
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(4000),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().default('redis://localhost:6379'),
        AZURE_AD_CLIENT_ID: Joi.string().required(),
        AZURE_AD_CLIENT_SECRET: Joi.string().required(),
        AZURE_AD_TENANT_ID: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 30,
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 100,
      },
    ]),

    // Infrastructure
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UserModule,
    MfaModule,
    SessionModule,
    TokenModule,
    MicrosoftGraphModule,
  ],
  providers: [
    // Global guards (order matters: auth -> roles -> mfa)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: MfaGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // Global pipes
    { provide: APP_PIPE, useClass: ValidationPipe },

    // Global filters
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },

    // Global interceptors
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  ],
})
export class AppModule {}
