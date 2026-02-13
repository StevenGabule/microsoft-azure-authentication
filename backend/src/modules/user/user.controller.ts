import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserService } from './user.service';
import { CurrentUser, MfaRequired, Roles } from '../../common/decorators';
import type { AuthenticatedUser } from '../../common/interfaces';
import { UpdateUserDto, UpdateUserRoleDto } from './dto';

/**
 * Controller for user profile management.
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Gets the current user's profile.
   */
  @Get('me')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getUserById(user.id);
  }

  /**
   * Updates the current user's profile.
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(user.id, dto);
  }

  /**
   * Lists all users (admin only).
   */
  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async listUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: Role,
  ) {
    return this.userService.listUsers(page || 1, limit || 20, role);
  }

  /**
   * Gets a user by ID (admin only).
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  /**
   * Updates a user's role (super admin only).
   */
  @Patch(':id/role')
  @Roles(Role.SUPER_ADMIN)
  @MfaRequired()
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.userService.updateUserRole(id, dto);
  }

  /**
   * Deactivates a user account (super admin only).
   */
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @MfaRequired()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateUser(@Param('id') id: string) {
    await this.userService.deactivateUser(id);
  }
}
