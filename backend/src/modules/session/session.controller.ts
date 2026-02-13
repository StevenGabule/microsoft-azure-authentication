import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CurrentUser } from '../../common/decorators';
import type { AuthenticatedUser } from '../../common/interfaces';
import { MfaRequired } from '../../common/decorators';

/**
 * Controller for managing user sessions.
 */
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Lists all active sessions for the current user.
   */
  @Get()
  async getActiveSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.sessionService.getUserSessions(user.id, user.sessionId);
  }

  /**
   * Revokes a specific session.
   */
  @Delete(':sessionId')
  @MfaRequired()
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.sessionService.revokeSession(sessionId, user.id);
  }

  /**
   * Revokes all other sessions for the current user.
   */
  @Delete()
  @MfaRequired()
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllSessions(@CurrentUser() user: AuthenticatedUser) {
    await this.sessionService.revokeAllUserSessions(user.id);
  }
}
