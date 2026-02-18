import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_CONSTANTS, ERROR_MESSAGES } from '../constants';
import { AuthenticatedUser } from '../interfaces';

/**
 * Guard that ensures MFA verification is completed.
 * Applied to routes decorated with @MfaRequired().
 */
@Injectable()
export class MfaGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const mfaRequired = this.reflector.getAllAndOverride<boolean>(
      AUTH_CONSTANTS.MFA_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!mfaRequired) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;

    if (!user?.mfaVerified) {
      throw new ForbiddenException(ERROR_MESSAGES.MFA_REQUIRED);
    }

    return true;
  }
}
