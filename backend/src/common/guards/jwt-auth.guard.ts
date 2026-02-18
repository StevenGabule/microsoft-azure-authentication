import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_CONSTANTS, ERROR_MESSAGES } from '../constants';

/**
 * Global JWT authentication guard.
 * Skips authentication for routes decorated with @Public().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      AUTH_CONSTANTS.PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest<T>(err: Error | null, user: T, info: Error | undefined): T {
    if (err || !user) {
      throw err || new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
    }
    return user;
  }
}
