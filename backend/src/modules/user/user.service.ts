import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_MESSAGES } from '../../common/constants';
import { UpdateUserDto, UpdateUserRoleDto, UserResponseDto } from './dto';
import { Role } from '@prisma/client';

/**
 * Service for user profile management and CRUD operations.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves a user's profile by ID.
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        jobTitle: true,
        department: true,
        role: true,
        mfaEnabled: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Retrieves a user's profile by email.
   */
  async getUserByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        jobTitle: true,
        department: true,
        role: true,
        mfaEnabled: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Updates a user's profile information.
   */
  async updateUser(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        jobTitle: true,
        department: true,
        role: true,
        mfaEnabled: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    this.logger.log(`User ${userId} profile updated`);
    return updated;
  }

  /**
   * Updates a user's role (admin only).
   */
  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        jobTitle: true,
        department: true,
        role: true,
        mfaEnabled: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    this.logger.log(`User ${userId} role updated to ${dto.role}`);
    return updated;
  }

  /**
   * Deactivates a user account.
   */
  async deactivateUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    this.logger.log(`User ${userId} deactivated`);
  }

  /**
   * Lists all users with pagination (admin only).
   */
  async listUsers(
    page: number = 1,
    limit: number = 20,
    role?: Role,
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          jobTitle: true,
          department: true,
          role: true,
          mfaEnabled: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
