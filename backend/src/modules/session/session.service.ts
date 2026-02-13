import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { AUTH_CONSTANTS, ERROR_MESSAGES } from '../../common/constants';

interface CreateSessionData {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  mfaCompleted?: boolean;
}

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  mfaCompleted: boolean;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

/**
 * Manages user sessions with PostgreSQL persistence and Redis caching.
 * Supports session creation, listing, revocation, and timeout enforcement.
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creates a new session for the user.
   */
  async createSession(data: CreateSessionData): Promise<string> {
    const absoluteTimeout = this.configService.get<number>(
      'security.sessionAbsoluteTimeout',
    ) || 86400;

    const expiresAt = new Date(Date.now() + absoluteTimeout * 1000);

    const session = await this.prisma.session.create({
      data: {
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceInfo: data.deviceInfo,
        mfaCompleted: data.mfaCompleted ?? false,
        expiresAt,
      },
    });

    // Cache session in Redis for fast lookups
    await this.redis.set(
      `${AUTH_CONSTANTS.SESSION_PREFIX}${session.id}`,
      JSON.stringify({
        userId: data.userId,
        mfaCompleted: data.mfaCompleted ?? false,
        createdAt: session.createdAt.toISOString(),
      }),
      absoluteTimeout,
    );

    this.logger.log(`Session created for user ${data.userId}: ${session.id}`);
    return session.id;
  }

  /**
   * Validates that a session exists and is not expired/revoked.
   */
  async validateSession(sessionId: string): Promise<boolean> {
    // Check Redis cache first
    const cached = await this.redis.get(
      `${AUTH_CONSTANTS.SESSION_PREFIX}${sessionId}`,
    );
    if (cached) return true;

    // Fallback to database
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Marks MFA as completed for a session.
   */
  async completeMfa(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { mfaCompleted: true },
    });

    // Update Redis cache
    const cached = await this.redis.get(
      `${AUTH_CONSTANTS.SESSION_PREFIX}${sessionId}`,
    );
    if (cached) {
      const data = JSON.parse(cached);
      data.mfaCompleted = true;
      const ttl = await this.redis.ttl(
        `${AUTH_CONSTANTS.SESSION_PREFIX}${sessionId}`,
      );
      if (ttl > 0) {
        await this.redis.set(
          `${AUTH_CONSTANTS.SESSION_PREFIX}${sessionId}`,
          JSON.stringify(data),
          ttl,
        );
      }
    }
  }

  /**
   * Lists all active sessions for a user.
   */
  async getUserSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<SessionInfo[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceInfo: session.deviceInfo,
      mfaCompleted: session.mfaCompleted,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * Revokes a specific session.
   */
  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException(ERROR_MESSAGES.SESSION_NOT_FOUND);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await this.redis.del(`${AUTH_CONSTANTS.SESSION_PREFIX}${sessionId}`);
    this.logger.log(`Session ${sessionId} revoked for user ${userId}`);
  }

  /**
   * Revokes all sessions for a user.
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      select: { id: true },
    });

    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Clean up Redis cache
    for (const session of sessions) {
      await this.redis.del(`${AUTH_CONSTANTS.SESSION_PREFIX}${session.id}`);
    }

    this.logger.log(`All sessions revoked for user ${userId}`);
  }

  /**
   * Cleans up expired sessions from the database.
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  }
}
