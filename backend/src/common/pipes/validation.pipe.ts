import {
  BadRequestException,
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants';

/**
 * Global validation pipe that validates incoming DTOs
 * using class-validator decorators.
 */
@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints
            ? Object.values(error.constraints)
            : ['Invalid value'];
          return {
            field: error.property,
            errors: constraints,
          };
        });

        return new BadRequestException({
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          details: messages,
        });
      },
    });
  }
}
