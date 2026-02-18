import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { AUTH_CONSTANTS, ERROR_MESSAGES } from '../../common/constants';
import { MfaMethod } from '@prisma/client';

export interface MfaSetupResult {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}

/**
 * Handles TOTP-based MFA setup, verification, and recovery code management.
 * Uses AES-256-GCM for encrypting TOTP secrets at rest.
 */
@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly appName = 'AzureAuthApp';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a new TOTP secret and QR code for MFA enrollment.
   */
  async setupMfa(userId: string, email: string): Promise<MfaSetupResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user?.mfaEnabled) {
      throw new BadRequestException(ERROR_MESSAGES.MFA_ALREADY_ENABLED);
    }

    // Generate TOTP secret
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: this.appName,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    });

    const otpauthUrl = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate recovery codes
    const recoveryCodes = this.generateRecoveryCodes();
    const hashedCodes = await Promise.all(
      recoveryCodes.map((code) => bcrypt.hash(code, 10)),
    );

    // Encrypt secret for storage
    const encryptedSecret = this.encryptSecret(secret.base32);

    // Store temporarily (not enabled yet until user verifies)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: encryptedSecret,
        mfaRecoveryCodes: hashedCodes,
        mfaMethod: MfaMethod.TOTP,
      },
    });

    return {
      secret: secret.base32,
      qrCodeDataUrl,
      otpauthUrl,
      recoveryCodes,
    };
  }

  /**
   * Verifies a TOTP code and enables MFA for the user.
   * Called during initial MFA setup to confirm the user has configured their authenticator.
   */
  async verifyAndEnableMfa(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.mfaSecret) {
      throw new BadRequestException(ERROR_MESSAGES.MFA_SETUP_REQUIRED);
    }

    if (user.mfaEnabled) {
      throw new BadRequestException(ERROR_MESSAGES.MFA_ALREADY_ENABLED);
    }

    const secret = this.decryptSecret(user.mfaSecret);
    const isValid = this.verifyTotpCode(secret, code);

    if (!isValid) {
      throw new BadRequestException(ERROR_MESSAGES.MFA_INVALID_CODE);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaVerifiedAt: new Date(),
      },
    });

    this.logger.log(`MFA enabled for user ${userId}`);
    return true;
  }

  /**
   * Verifies a TOTP code during login.
   * Implements rate limiting to prevent brute-force attacks.
   */
  async verifyMfaCode(userId: string, code: string): Promise<boolean> {
    await this.checkMfaRateLimit(userId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestException(ERROR_MESSAGES.MFA_NOT_ENABLED);
    }

    const secret = this.decryptSecret(user.mfaSecret);
    const isValid = this.verifyTotpCode(secret, code);

    if (!isValid) {
      await this.incrementMfaAttempts(userId);
      throw new BadRequestException(ERROR_MESSAGES.MFA_INVALID_CODE);
    }

    // Reset attempt counter on success
    await this.redis.del(`${AUTH_CONSTANTS.MFA_ATTEMPT_PREFIX}${userId}`);
    return true;
  }

  /**
   * Verifies a recovery code and invalidates it after use.
   */
  async verifyRecoveryCode(userId: string, code: string): Promise<boolean> {
    await this.checkMfaRateLimit(userId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.mfaEnabled) {
      throw new BadRequestException(ERROR_MESSAGES.MFA_NOT_ENABLED);
    }

    // Check each hashed recovery code
    let matchIndex = -1;
    for (let i = 0; i < user.mfaRecoveryCodes.length; i++) {
      const isMatch = await bcrypt.compare(code, user.mfaRecoveryCodes[i]);
      if (isMatch) {
        matchIndex = i;
        break;
      }
    }

    if (matchIndex === -1) {
      await this.incrementMfaAttempts(userId);
      throw new BadRequestException(ERROR_MESSAGES.RECOVERY_CODE_INVALID);
    }

    // Remove used recovery code
    const updatedCodes = [...user.mfaRecoveryCodes];
    updatedCodes.splice(matchIndex, 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaRecoveryCodes: updatedCodes },
    });

    await this.redis.del(`${AUTH_CONSTANTS.MFA_ATTEMPT_PREFIX}${userId}`);
    this.logger.log(
      `Recovery code used for user ${userId}. ${updatedCodes.length} codes remaining.`,
    );
    return true;
  }

  /**
   * Disables MFA for a user. Requires current MFA verification first.
   */
  async disableMfa(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaRecoveryCodes: [],
        mfaMethod: null,
        mfaVerifiedAt: null,
      },
    });

    this.logger.log(`MFA disabled for user ${userId}`);
  }

  /**
   * Gets MFA status for a user.
   */
  async getMfaStatus(userId: string): Promise<{
    enabled: boolean;
    method: MfaMethod | null;
    recoveryCodesRemaining: number;
    verifiedAt: Date | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaEnabled: true,
        mfaMethod: true,
        mfaRecoveryCodes: true,
        mfaVerifiedAt: true,
      },
    });

    return {
      enabled: user?.mfaEnabled ?? false,
      method: user?.mfaMethod ?? null,
      recoveryCodesRemaining: user?.mfaRecoveryCodes?.length ?? 0,
      verifiedAt: user?.mfaVerifiedAt ?? null,
    };
  }

  /**
   * Regenerates recovery codes for a user.
   */
  async regenerateRecoveryCodes(userId: string): Promise<string[]> {
    const recoveryCodes = this.generateRecoveryCodes();
    const hashedCodes = await Promise.all(
      recoveryCodes.map((code) => bcrypt.hash(code, 10)),
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaRecoveryCodes: hashedCodes },
    });

    return recoveryCodes;
  }

  private verifyTotpCode(secret: string, code: string): boolean {
    const totp = new OTPAuth.TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  }

  private generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < AUTH_CONSTANTS.RECOVERY_CODE_COUNT; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  private encryptSecret(secret: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  private decryptSecret(encryptedSecret: string): string {
    const key = this.getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = encryptedSecret.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private getEncryptionKey(): Buffer {
    const keyString =
      this.configService.get<string>('security.mfaEncryptionKey') ||
      this.configService.get<string>('jwt.accessSecret')!;
    return crypto.scryptSync(keyString, 'mfa-salt', 32);
  }

  private async checkMfaRateLimit(userId: string): Promise<void> {
    const key = `${AUTH_CONSTANTS.MFA_ATTEMPT_PREFIX}${userId}`;
    const attempts = await this.redis.get(key);

    if (attempts && parseInt(attempts, 10) >= AUTH_CONSTANTS.MFA_MAX_ATTEMPTS) {
      throw new ForbiddenException(ERROR_MESSAGES.MFA_LOCKED_OUT);
    }
  }

  private async incrementMfaAttempts(userId: string): Promise<void> {
    const key = `${AUTH_CONSTANTS.MFA_ATTEMPT_PREFIX}${userId}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, AUTH_CONSTANTS.MFA_LOCKOUT_DURATION);
    }
  }
}
