import { SetMetadata } from '@nestjs/common';
import { AUTH_CONSTANTS } from '../constants';

/**
 * Marks a route as requiring completed MFA verification.
 */
export const MfaRequired = () =>
  SetMetadata(AUTH_CONSTANTS.MFA_REQUIRED_KEY, true);
