import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Health check for the database connection.
 */
@Injectable()
export class PrismaHealthIndicator {
  private readonly logger = new Logger(PrismaHealthIndicator.name);

  constructor(private readonly prisma: PrismaService) {}

  async isHealthy(): Promise<{ database: { status: string } }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return { database: { status: 'down' } };
    }
  }
}
