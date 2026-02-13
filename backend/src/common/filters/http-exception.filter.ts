import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter that formats error responses consistently.
 * Never exposes stack traces or sensitive details in production.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message || 'Error',
      error: HttpStatus[status] || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV === 'development' && {
        details: typeof exceptionResponse === 'object' ? exceptionResponse : undefined,
      }),
    };

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${request.ip}`,
    );

    response.status(status).json(errorResponse);
  }
}
