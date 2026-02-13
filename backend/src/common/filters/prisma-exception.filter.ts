import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

/**
 * Catches Prisma-specific errors and returns appropriate HTTP responses.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('PrismaException');

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed';
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database error';
    }

    this.logger.error(
      `Prisma Error ${exception.code}: ${exception.message} - ${request.method} ${request.url}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
