import { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/password';
import { parsePagination, createPaginationMeta } from '../../utils/pagination';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors';
import { createAuditLog } from '../../utils/audit';
import { AuthUser } from '../../types/auth';
import { CreateUserInput, UpdateUserInput } from './users.schema';

export class UsersService {
  async listUsers(
    authUser: AuthUser,
    query: {
      page?: string;
      limit?: string;
      search?: string;
      role?: Role;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { page, limit, skip, take } = parsePagination(query.page, query.limit);

    // Build tenant-isolated WHERE clause
    const where: Prisma.UserWhereInput = {
      tenantId: authUser.tenantId,
      ...(query.role && { role: query.role }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Sort order
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy = { [sortBy]: sortOrder };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          tenantId: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              campaignAssignments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      tenantId: u.tenantId,
      name: u.name,
      email: u.email,
      role: u.role,
      assignedCampaignsCount: u._count.campaignAssignments,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return {
      items: formattedUsers,
      pagination: createPaginationMeta(total, page, limit),
    };
  }

  async getUserById(id: string, authUser: AuthUser) {
    // Tenant-isolated findFirst
    const user = await prisma.user.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        campaignAssignments: {
          include: {
            campaign: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return user;
  }

  async createUser(input: CreateUserInput, authUser: AuthUser, ipAddress?: string) {
    // Check if email already exists in this tenant
    const existing = await prisma.user.findFirst({
      where: {
        tenantId: authUser.tenantId,
        email: input.email,
      },
    });

    if (existing) {
      throw new ConflictError('A user with this email address already exists in your organization');
    }

    const passwordHash = await hashPassword(input.password);

    const newUser = await prisma.user.create({
      data: {
        tenantId: authUser.tenantId, // Always use authenticated tenant
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: newUser.id,
      description: `User ${newUser.name} (${newUser.email}) created with role ${newUser.role}.`,
      metadata: { userId: newUser.id, email: newUser.email, role: newUser.role },
      ipAddress,
    });

    return newUser;
  }

  async updateUser(id: string, input: UpdateUserInput, authUser: AuthUser, ipAddress?: string) {
    // Check user exists in tenant
    const existing = await prisma.user.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId,
      },
    });

    if (!existing) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Check email conflict within tenant if email is changing
    if (input.email && input.email !== existing.email) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          tenantId: authUser.tenantId,
          email: input.email,
          NOT: { id },
        },
      });
      if (emailConflict) {
        throw new ConflictError('Another user in your organization is already using this email address');
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (input.name) updateData.name = input.name;
    if (input.email) updateData.email = input.email;
    if (input.role) updateData.role = input.role;
    if (input.password) {
      updateData.passwordHash = await hashPassword(input.password);
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: updateData,
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: updated.id,
      description: `User ${updated.name} (${updated.email}) was updated.`,
      metadata: {
        updatedFields: Object.keys(input).filter((k) => k !== 'password'),
        role: updated.role,
      },
      ipAddress,
    });

    return updated;
  }

  async deleteUser(id: string, authUser: AuthUser, ipAddress?: string) {
    // Prevent self-deletion
    if (id === authUser.userId) {
      throw new BadRequestError('You cannot delete your own user account');
    }

    // Find user in current tenant
    const existing = await prisma.user.findFirst({
      where: {
        id,
        tenantId: authUser.tenantId,
      },
    });

    if (!existing) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    await prisma.user.delete({
      where: { id: existing.id },
    });

    // Audit log
    await createAuditLog({
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: id,
      description: `User ${existing.name} (${existing.email}) was deleted.`,
      metadata: { deletedUserId: id, email: existing.email, role: existing.role },
      ipAddress,
    });

    return { message: 'User deleted successfully' };
  }
}

export const usersService = new UsersService();
