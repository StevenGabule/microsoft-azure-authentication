import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MfaService } from './mfa.service';
import { CurrentUser, MfaRequired } from '../../common/decorators';
import type { AuthenticatedUser } from '../../common/interfaces';
import { EnableMfaDto, VerifyMfaDto } from './dto';

/**
 * Controller for MFA setup, verification, and management.
 */
@Controller('mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  /**
   * Initiates MFA setup - generates TOTP secret and QR code.
   */
  @Post('setup')
  async setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.mfaService.setupMfa(user.id, user.email);
  }

  /**
   * Verifies a TOTP code to complete MFA setup.
   */
  @Post('enable')
  @HttpCode(HttpStatus.OK)
  async enableMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EnableMfaDto,
  ) {
    await this.mfaService.verifyAndEnableMfa(user.id, dto.code);
    return { message: 'MFA enabled successfully' };
  }

  /**
   * Verifies a TOTP code during login.
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VerifyMfaDto,
  ) {
    if (dto.recoveryCode) {
      await this.mfaService.verifyRecoveryCode(user.id, dto.recoveryCode);
    } else {
      await this.mfaService.verifyMfaCode(user.id, dto.code);
    }
    return { message: 'MFA verification successful', mfaVerified: true };
  }

  /**
   * Gets MFA status for the current user.
   */
  @Get('status')
  async getMfaStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.mfaService.getMfaStatus(user.id);
  }

  /**
   * Disables MFA for the current user. Requires completed MFA verification.
   */
  @Delete()
  @MfaRequired()
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableMfa(@CurrentUser() user: AuthenticatedUser) {
    await this.mfaService.disableMfa(user.id);
  }

  /**
   * Regenerates recovery codes. Requires completed MFA verification.
   */
  @Post('recovery-codes/regenerate')
  @MfaRequired()
  async regenerateRecoveryCodes(@CurrentUser() user: AuthenticatedUser) {
    const codes = await this.mfaService.regenerateRecoveryCodes(user.id);
    return { recoveryCodes: codes };
  }
}
