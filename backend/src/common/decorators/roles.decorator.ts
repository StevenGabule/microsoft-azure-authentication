import { SetMetadata } from '@nestjs/common';
import { AUTH_CONSTANTS } from '../constants';
import { Role } from '@prisma/client';

/**
 * Sets required roles for a route.
 * @example
 * @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 * @Get('admin-only')
 */
export const Roles = (...roles: Role[]) =>
  SetMetadata(AUTH_CONSTANTS.ROLES_KEY, roles);
