import { SetMetadata } from '@nestjs/common';
import { AUTH_CONSTANTS } from '../constants';

/**
 * Marks a route as publicly accessible, bypassing JWT authentication.
 */
export const Public = () => SetMetadata(AUTH_CONSTANTS.PUBLIC_KEY, true);
